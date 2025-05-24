<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import VuePdfEmbed, { useVuePdfEmbed } from 'vue-pdf-embed';
import 'vue-pdf-embed/dist/styles/annotationLayer.css';
import 'vue-pdf-embed/dist/styles/textLayer.css';
import ChatSidebar from './ChatSidebar.vue';
import NoteSidebar from './NoteSidebar.vue';

const props = defineProps({
    pdfSource: {
        type: String,
        required: true
    },
    bookItemId: {
        type: [Number, String],
        default: null
    },
    ebookId: {
        type: [Number, String],
        default: null
    },
    notes: {
        type: Array,
        default: () => []
    },
    chatMessages: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['add-note', 'delete-note', 'add-chat-message', 'delete-chat-message', 'retry']);

// Core refs
const toast = useToast();
const pdfRef = ref();
const componentKey = ref(0); // Force re-render when needed

// PDF state
const page = ref(1);
const scale = ref(1.2);
const rotation = ref(0);
const annotationLayer = ref(true);
const textLayer = ref(true);
const numPages = ref(0);
const pdfLoading = ref(true); // Internal PDF loading state
const error = ref(null);
const progress = reactive({ loaded: 0, total: 0 });
const isRendering = ref(false);

// View mode and display
const viewMode = ref('single'); // 'single' or 'continuous'
const pageLoading = ref(new Set()); // Track which pages are loading
const visiblePages = ref(new Set()); // Track visible pages for optimization

// Optimized PDF loading with composable
const { doc } = useVuePdfEmbed({
    source: {
        url: props.pdfSource,
        cMapUrl: 'https://unpkg.com/pdfjs-dist/cmaps/',
        imageResourcesPath: 'https://unpkg.com/pdfjs-dist/web/images/'
    }
});

// Search functionality
const searchQuery = ref('');
const searchResults = ref([]);
const currentSearchIndex = ref(0);
const showSearch = ref(false);
const searchCache = ref(new Map()); // Cache search results

// Text selection
const selectedText = ref('');
const selectionPosition = ref({ x: 0, y: 0 });
const showTextActions = ref(false);
const selectedPageNumber = ref(1);

// Sidebars
const noteSidebar = ref(false);
const chatSidebar = ref(false);

// Add mobile menu state
const showMobileMenu = ref(false);

// Filters
const filterByCurrentPage = ref(true);
const filterChatsByCurrentPage = ref(true);

// Optimized search with caching
async function startSearch() {
    if (!searchQuery.value.trim()) {
        searchResults.value = [];
        return;
    }

    // Check cache first
    const cacheKey = searchQuery.value.toLowerCase();
    if (searchCache.value.has(cacheKey)) {
        searchResults.value = searchCache.value.get(cacheKey);
        currentSearchIndex.value = 0;
        if (searchResults.value.length > 0) {
            page.value = searchResults.value[0];
        }
        return;
    }

    if (!pdfRef.value) return;

    const pdfDoc = pdfRef.value.getDocument && pdfRef.value.getDocument();
    if (!pdfDoc) return;

    const matches = [];
    for (let i = 1; i <= numPages.value; i++) {
        try {
            const pageObj = await pdfDoc.getPage(i);
            const textContent = await pageObj.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(' ');
            if (pageText.toLowerCase().includes(cacheKey)) {
                matches.push(i);
            }
        } catch (err) {
            console.warn(`Failed to search page ${i}:`, err);
        }
    }

    // Cache the results
    searchCache.value.set(cacheKey, matches);

    searchResults.value = matches;
    currentSearchIndex.value = 0;
    if (searchResults.value.length > 0) {
        page.value = searchResults.value[0];
    }
}

function nextSearchResult() {
    if (searchResults.value.length === 0) return;
    currentSearchIndex.value = (currentSearchIndex.value + 1) % searchResults.value.length;
    page.value = searchResults.value[currentSearchIndex.value];
}

function prevSearchResult() {
    if (searchResults.value.length === 0) return;
    currentSearchIndex.value = (currentSearchIndex.value - 1 + searchResults.value.length) % searchResults.value.length;
    page.value = searchResults.value[currentSearchIndex.value];
}

function clearSearch() {
    searchQuery.value = '';
    searchResults.value = [];
    currentSearchIndex.value = 0;
}

// Mouse tracking for text selection
let isMouseOverActions = false;

// Text selection handling
function handleTextSelection() {
    const selection = window.getSelection();

    if (selection && selection.toString().trim().length > 0) {
        const selectedTextValue = selection.toString().trim();

        // Only process if text is actually selected and it's from the PDF viewer
        const selectionContainer = selection.getRangeAt(0).commonAncestorContainer;
        const pdfContainer = document.querySelector('.pdf-viewer-content');

        if (!pdfContainer || !pdfContainer.contains(selectionContainer)) {
            return; // Ignore selections outside PDF
        }

        selectedText.value = selectedTextValue;
        selectedPageNumber.value = page.value;

        // Get selection position for popup
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Position popup above the selection, centered
        selectionPosition.value = {
            x: Math.max(10, Math.min(window.innerWidth - 200, rect.left + rect.width / 2 - 100)),
            y: Math.max(10, rect.top - 50)
        };

        // Add visual highlight to selected text
        addHighlightToSelection(range);
        showTextActions.value = true;

        console.log('Text selected:', selectedTextValue, 'on page:', page.value);
    } else {
        // Clear selection after a delay if mouse is not over actions
        setTimeout(() => {
            if (!isMouseOverActions) {
                clearTextSelection();
            }
        }, 200);
    }
}

// Add visual highlight to selected text
function addHighlightToSelection(range) {
    try {
        // Remove existing highlights first
        removeExistingHighlights();

        // Create highlight span
        const highlight = document.createElement('span');
        highlight.className = 'pdf-text-highlight';
        highlight.style.backgroundColor = 'rgba(255, 235, 59, 0.4)';
        highlight.style.borderRadius = '2px';
        highlight.style.padding = '1px 2px';
        highlight.style.transition = 'all 0.2s ease';

        // Wrap the selected content
        try {
            range.surroundContents(highlight);
        } catch (e) {
            // If surroundContents fails, use a different approach
            const contents = range.extractContents();
            highlight.appendChild(contents);
            range.insertNode(highlight);
        }
    } catch (error) {
        console.warn('Could not add highlight:', error);
    }
}

// Remove existing highlights
function removeExistingHighlights() {
    const highlights = document.querySelectorAll('.pdf-text-highlight');
    highlights.forEach((highlight) => {
        const parent = highlight.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize(); // Merge adjacent text nodes
        }
    });
}

// Clear text selection and highlights
function clearTextSelection() {
    showTextActions.value = false;
    selectedText.value = '';
    removeExistingHighlights();

    // Clear browser selection
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}

function onMouseOverActions() {
    isMouseOverActions = true;
}

function onMouseLeaveActions() {
    isMouseOverActions = false;
    setTimeout(() => {
        if (!isMouseOverActions) {
            showTextActions.value = false;
        }
    }, 300);
}

// Dialog management
function openNoteDialog() {
    noteSidebar.value = true;
    showTextActions.value = false;
    clearTextSelection();
}

function openChatDialog() {
    chatSidebar.value = true;
    showTextActions.value = false;
    clearTextSelection();
}

// Copy text functionality
function copySelectedText() {
    if (selectedText.value) {
        navigator.clipboard
            .writeText(selectedText.value)
            .then(() => {
                toast.add({ severity: 'success', summary: 'Copied', detail: 'Text copied to clipboard', life: 2000 });
                clearTextSelection();
            })
            .catch((err) => {
                console.error('Could not copy text: ', err);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy text', life: 3000 });
            });
    }
}

// Save operations
function saveNote(noteData) {
    if (!noteData.content || !noteData.content.trim()) {
        toast.add({ severity: 'warn', summary: 'Empty Note', detail: 'Please enter some text for your note', life: 3000 });
        return;
    }

    emit('add-note', {
        content: noteData.content,
        highlight_text: noteData.highlight_text || selectedText.value,
        page_number: noteData.page_number || page.value
    });

    selectedText.value = '';
    toast.add({ severity: 'success', summary: 'Note Saved', detail: 'Your note has been saved successfully', life: 3000 });
}

function saveChatMessage(chatData) {
    if (!chatData.question || !chatData.question.trim()) {
        toast.add({ severity: 'warn', summary: 'Empty Message', detail: 'Please enter your question', life: 3000 });
        return;
    }

    emit('add-chat-message', {
        question: chatData.question,
        highlight_text: chatData.highlight_text || selectedText.value,
        page_number: chatData.page_number || page.value,
        is_anonymous: false
    });

    selectedText.value = '';
    toast.add({ severity: 'success', summary: 'Question Sent', detail: 'Your question has been sent successfully', life: 3000 });
}

// Delete operations
function deleteNote(noteId) {
    emit('delete-note', noteId);
}

function deleteChatMessage(messageId) {
    emit('delete-chat-message', messageId);
}

// Jump operations for clicking on notes/chats
function jumpToNote(note) {
    if (note && note.page_number) {
        page.value = note.page_number;
    }
}

function jumpToChat(chat) {
    if (chat && chat.page_number) {
        page.value = chat.page_number;
    }
}

// Watch for mouse events to detect text selection
onMounted(() => {
    document.addEventListener('mouseup', handleTextSelection);
    console.log('PDFReader mounted with source:', props.pdfSource);
});

onBeforeUnmount(() => {
    document.removeEventListener('mouseup', handleTextSelection);

    // Safely destroy the PDF document if it exists
    if (doc.value && typeof doc.value.destroy === 'function') {
        try {
            doc.value.destroy();
        } catch (err) {
            console.error('Error destroying PDF document:', err);
        }
    }

    // Clear all references that might cause memory leaks
    searchResults.value = [];
    searchCache.value.clear();

    // Reset component state
    showTextActions.value = false;
    noteSidebar.value = false;
    chatSidebar.value = false;

    console.log('PDFReader component unmounted and cleaned up');
});

// Computed properties - optimized with memoization
const canPrev = computed(() => page.value > 1);
const canNext = computed(() => page.value < numPages.value);

// Optimized filtered notes and chats - prevent unnecessary recalculations
const filteredNotes = computed(() => {
    if (!props.notes.length) return [];
    return filterByCurrentPage.value ? props.notes.filter((note) => note.page_number === page.value) : props.notes;
});

const filteredChats = computed(() => {
    if (!props.chatMessages.length) return [];
    let result = filterChatsByCurrentPage.value ? props.chatMessages.filter((chat) => chat.page_number === page.value) : props.chatMessages;

    // Sort by creation date, newest messages at the bottom
    return result.slice().sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateA - dateB;
    });
});

// PDF event handlers
function onLoaded(pdf) {
    numPages.value = pdf.numPages;
    pdfLoading.value = false;
    error.value = null;
    isRendering.value = false;
    console.log('PDF loaded successfully with', pdf.numPages, 'pages');
}

function onLoadingFailed(e) {
    console.error('PDF loading failed:', e);
    if (props.pdfSource && (props.pdfSource.includes('youtube.com') || props.pdfSource.includes('youtu.be'))) {
        error.value = 'Invalid PDF source: YouTube URL detected. This URL cannot be loaded as a PDF.';
    } else {
        error.value = e.message || 'Failed to load PDF. Check the URL format.';
    }
    pdfLoading.value = false;
    isRendering.value = false;
}

function onProgress(evt) {
    progress.loaded = evt.loaded;
    progress.total = evt.total;
}

function onRendered() {
    isRendering.value = false;
    console.log('Page rendered successfully');
}

function onRenderingFailed(e) {
    console.error('PDF rendering failed:', e);
    error.value = e.message || 'Failed to render PDF.';
    isRendering.value = false;
    // Force component re-render to clear canvas issues
    componentKey.value++;
}

function onInternalLink(pageNum) {
    page.value = pageNum;
}

// Navigation functions
function prevPage() {
    if (canPrev.value) page.value--;
}

function nextPage() {
    if (canNext.value) page.value++;
}

// Zoom functions with canvas refresh
function zoomIn() {
    scale.value = Math.min(scale.value + 0.1, 3);
    // Force re-render to prevent canvas issues
    nextTick(() => {
        componentKey.value++;
    });
}

function zoomOut() {
    scale.value = Math.max(scale.value - 0.1, 0.5);
    // Force re-render to prevent canvas issues
    nextTick(() => {
        componentKey.value++;
    });
}

// Rotation functions with canvas refresh
function rotateLeft() {
    rotation.value = (rotation.value + 270) % 360;
    // Force re-render to prevent canvas issues
    nextTick(() => {
        componentKey.value++;
    });
}

function rotateRight() {
    rotation.value = (rotation.value + 90) % 360;
    // Force re-render to prevent canvas issues
    nextTick(() => {
        componentKey.value++;
    });
}

// Layer toggles
function toggleAnnotationLayer() {
    annotationLayer.value = !annotationLayer.value;
}

function toggleTextLayer() {
    textLayer.value = !textLayer.value;
}

// Utility functions
function downloadPdf() {
    pdfRef.value?.download('document.pdf');
}

function printPdf() {
    pdfRef.value?.print(1.5, 'document.pdf', true);
}

function toggleViewMode() {
    viewMode.value = viewMode.value === 'single' ? 'continuous' : 'single';
    // Force component re-render to prevent canvas conflicts
    componentKey.value++;
}

// Watch for source changes and force re-render
watch(
    () => props.pdfSource,
    () => {
        componentKey.value++;
        pdfLoading.value = true;
        error.value = null;
    },
    { immediate: false }
);

// Watch for scale/rotation changes that might cause canvas issues
watch([scale, rotation], () => {
    if (isRendering.value) {
        // If currently rendering, force a re-render after a short delay
        setTimeout(() => {
            componentKey.value++;
        }, 100);
    }
});

// Handle page changes smoothly
watch(page, (newPage) => {
    if (newPage < 1) {
        page.value = 1;
    } else if (newPage > numPages.value && numPages.value > 0) {
        page.value = numPages.value;
    }
});
</script>

<template>
    <div class="relative w-full h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
        <!-- Unified Minimal Toolbar -->
        <div class="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <!-- Main Toolbar -->
            <div class="flex flex-wrap items-center justify-between gap-1 px-2 py-1.5 md:px-4 md:py-2">
                <!-- Left controls - Navigation -->
                <div class="flex items-center gap-1">
                    <button @click="prevPage" :disabled="!canPrev" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" title="Previous Page">
                        <i class="pi pi-chevron-left text-gray-700 dark:text-gray-300"></i>
                    </button>
                    <div class="flex items-center gap-1 px-2">
                        <input v-model.number="page" type="number" :min="1" :max="numPages" class="w-12 text-center text-sm border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        <span class="text-sm text-gray-600 dark:text-gray-400">/ {{ numPages }}</span>
                    </div>
                    <button @click="nextPage" :disabled="!canNext" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" title="Next Page">
                        <i class="pi pi-chevron-right text-gray-700 dark:text-gray-300"></i>
                    </button>
                </div>

                <!-- Center controls - Zoom and view -->
                <div class="flex items-center gap-1">
                    <button @click="zoomOut" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Zoom Out">
                        <i class="pi pi-minus text-gray-700 dark:text-gray-300"></i>
                    </button>
                    <span class="text-sm text-gray-600 dark:text-gray-400 px-2 min-w-16 text-center">{{ Math.round(scale * 100) }}%</span>
                    <button @click="zoomIn" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Zoom In">
                        <i class="pi pi-plus text-gray-700 dark:text-gray-300"></i>
                    </button>

                    <button @click="toggleViewMode" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 hidden sm:block" title="Toggle View Mode">
                        <i class="pi" :class="viewMode === 'single' ? 'pi-th-large' : 'pi-stop'"></i>
                    </button>
                </div>

                <!-- Right controls - Tools and actions -->
                <div class="flex items-center gap-1">
                    <button @click="showSearch = !showSearch" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" :class="showSearch ? 'bg-indigo-100 dark:bg-indigo-900' : ''" title="Search">
                        <i class="pi pi-search text-gray-700 dark:text-gray-300"></i>
                    </button>

                    <button @click="downloadPdf" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 hidden lg:block" title="Download">
                        <i class="pi pi-download text-gray-700 dark:text-gray-300"></i>
                    </button>

                    <!-- Mobile menu -->
                    <div class="relative md:hidden">
                        <button @click="showMobileMenu = !showMobileMenu" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <i class="pi pi-ellipsis-v text-gray-700 dark:text-gray-300"></i>
                        </button>
                        <div v-if="showMobileMenu" class="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-32 z-30">
                            <button @click="toggleViewMode" class="flex w-full items-center px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                <i class="pi mr-2 text-gray-600 dark:text-gray-400" :class="viewMode === 'single' ? 'pi-th-large' : 'pi-stop'"></i> View Mode
                            </button>
                            <button @click="rotateLeft" class="flex w-full items-center px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><i class="pi pi-undo mr-2 text-gray-600 dark:text-gray-400"></i> Rotate Left</button>
                            <button @click="rotateRight" class="flex w-full items-center px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><i class="pi pi-redo mr-2 text-gray-600 dark:text-gray-400"></i> Rotate Right</button>
                            <button @click="downloadPdf" class="flex w-full items-center px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><i class="pi pi-download mr-2 text-gray-600 dark:text-gray-400"></i> Download</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search Bar (Conditional) -->
            <div v-if="showSearch" class="flex items-center gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <div class="relative flex-1">
                    <input v-model="searchQuery" type="text" placeholder="Search..." class="w-full pl-2 pr-8 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white" @keyup.enter="startSearch" />
                    <button @click="startSearch" class="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-500 dark:text-gray-400">
                        <i class="pi pi-search text-xs"></i>
                    </button>
                </div>

                <div class="flex items-center">
                    <button @click="prevSearchResult" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-l border border-gray-300 dark:border-gray-500" :disabled="!searchResults.length" title="Previous Result">
                        <i class="pi pi-chevron-up text-xs"></i>
                    </button>
                    <button @click="nextSearchResult" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-r border border-l-0 border-gray-300 dark:border-gray-500" :disabled="!searchResults.length" title="Next Result">
                        <i class="pi pi-chevron-down text-xs"></i>
                    </button>
                </div>

                <span v-if="searchResults.length" class="text-xs text-gray-500 dark:text-gray-300 hidden sm:inline-block whitespace-nowrap"> {{ currentSearchIndex + 1 }} / {{ searchResults.length }} </span>
                <button @click="clearSearch" class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Clear Search">
                    <i class="pi pi-times text-xs"></i>
                </button>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 relative">
            <!-- PDF viewer container with auto-adjusting width -->
            <div class="pdf-container w-full max-w-full px-2 md:px-4 lg:px-8 xl:px-16 2xl:px-24 py-4">
                <!-- Loading indicator - only show PDF specific loading when parent is not loading -->
                <div v-if="!props.loading && pdfLoading" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
                    <div class="text-center">
                        <div class="w-12 h-12 border-4 border-t-red-500 border-gray-200 rounded-full animate-spin mb-4 mx-auto"></div>
                        <p class="text-gray-700 dark:text-gray-300">Loading PDF...</p>
                        <p v-if="progress.total" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {{ Math.round((progress.loaded / progress.total) * 100) }}% ({{ Math.round(progress.loaded / 1024) }} KB / {{ Math.round(progress.total / 1024) }} KB)
                        </p>
                    </div>
                </div>

                <!-- Error message -->
                <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
                    <div class="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load PDF</h3>
                        <p class="text-gray-700 dark:text-gray-300 mb-4">{{ error }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Source: {{ props.pdfSource }}</p>
                        <button @click="$emit('retry')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Try Again</button>
                    </div>
                </div>

                <!-- PDF Content -->
                <VuePdfEmbed
                    :key="componentKey"
                    ref="pdfRef"
                    :source="doc || props.pdfSource"
                    v-bind="viewMode === 'single' ? { page } : {}"
                    :scale="scale"
                    :rotation="rotation"
                    :annotation-layer="annotationLayer"
                    :text-layer="textLayer"
                    :image-resources-path="'https://unpkg.com/pdfjs-dist/web/images/'"
                    class="pdf-viewer-content"
                    @loaded="onLoaded"
                    @loading-failed="onLoadingFailed"
                    @progress="onProgress"
                    @rendered="onRendered"
                    @rendering-failed="onRenderingFailed"
                    @internal-link-clicked="onInternalLink"
                />
            </div>

            <!-- Floating Action Buttons - Right Side Panel -->
            <div class="fixed right-4 bottom-4 z-30 flex flex-col gap-3 sm:top-1/2 sm:transform sm:-translate-y-1/2 sm:bottom-auto">
                <!-- Notes Button -->
                <div class="relative group">
                    <button
                        @click="noteSidebar = true"
                        class="w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110"
                        title="View Notes"
                    >
                        <i class="pi pi-book text-lg"></i>
                        <span v-if="props.notes.length" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {{ props.notes.length > 99 ? '99+' : props.notes.length }}
                        </span>
                    </button>
                    <!-- Tooltip -->
                    <div class="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Notes ({{ props.notes.length }})
                        <div class="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-y-4 border-y-transparent"></div>
                    </div>
                </div>

                <!-- Chat Button -->
                <div class="relative group">
                    <button
                        @click="chatSidebar = true"
                        class="w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110"
                        title="View Chat Messages"
                    >
                        <i class="pi pi-comments text-lg"></i>
                        <span v-if="props.chatMessages.length" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {{ props.chatMessages.length > 99 ? '99+' : props.chatMessages.length }}
                        </span>
                    </button>
                    <!-- Tooltip -->
                    <div class="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Chat Messages ({{ props.chatMessages.length }})
                        <div class="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-y-4 border-y-transparent"></div>
                    </div>
                </div>

                <!-- Quick Add Note Button -->
                <div class="relative group" v-if="selectedText">
                    <button
                        @click="openNoteDialog"
                        class="w-12 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110 animate-pulse"
                        title="Add Note for Selected Text"
                    >
                        <i class="pi pi-plus text-sm"></i>
                    </button>
                    <!-- Tooltip -->
                    <div class="absolute right-14 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Quick Note
                        <div class="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-2 border-l-gray-800 border-y-2 border-y-transparent"></div>
                    </div>
                </div>
            </div>
            <!-- Text selection popup -->
            <div
                v-if="showTextActions"
                :style="{ left: selectionPosition.x + 'px', top: selectionPosition.y + 'px' }"
                class="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 flex gap-2 animate-fade-in backdrop-blur-sm"
                @mouseenter="onMouseOverActions"
                @mouseleave="onMouseLeaveActions"
            >
                <button
                    @click="copySelectedText"
                    class="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 flex items-center gap-1"
                >
                    <i class="pi pi-copy text-xs"></i>
                    <span>Copy</span>
                </button>
                <button
                    @click="openNoteDialog"
                    class="px-3 py-2 bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800 rounded text-sm font-medium text-amber-700 dark:text-amber-300 transition-all duration-200 flex items-center gap-1"
                >
                    <i class="pi pi-book text-xs"></i>
                    <span>Note</span>
                </button>
                <button
                    @click="openChatDialog"
                    class="px-3 py-2 bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded text-sm font-medium text-indigo-700 dark:text-indigo-300 transition-all duration-200 flex items-center gap-1"
                >
                    <i class="pi pi-comments text-xs"></i>
                    <span>Chat</span>
                </button>
            </div>
        </div>
        <!-- Note Sidebar -->
        <NoteSidebar v-model:visible="noteSidebar" :notes="filteredNotes" :selected-text="selectedText" :page-number="page" timer-label="Page" :timer-value="`${page} of ${numPages}`" @save-note="saveNote" @delete="deleteNote" @jump-to="jumpToNote" />

        <!-- Chat Sidebar -->
        <ChatSidebar
            v-model:visible="chatSidebar"
            :chat-messages="filteredChats"
            :selected-text="selectedText"
            :page-number="page"
            timer-label="Page"
            :timer-value="`${page} of ${numPages}`"
            @save-chat="saveChatMessage"
            @delete="deleteChatMessage"
            @jump-to="jumpToChat"
        />
    </div>
</template>

<style scoped>
/* PDF Viewer styles - Optimized for performance and canvas stability */
.pdf-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    contain: layout style;
}

:deep(.vue-pdf-embed) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    contain: layout style;
    /* Prevent canvas rendering conflicts */
    isolation: isolate;
}

/* Single page mode - optimized display */
:deep(.vue-pdf-embed__page) {
    box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
    margin: 0 auto 16px;
    max-width: 100%;
    height: auto;
    transition: all 0.3s ease;
    border-radius: 8px;
    overflow: hidden;
    contain: layout style paint;
    will-change: transform;
    /* Ensure canvas doesn't interfere with other elements */
    position: relative;
    z-index: 1;
}

/* Canvas specific fixes */
:deep(.vue-pdf-embed canvas) {
    display: block;
    max-width: 100%;
    height: auto;
    /* Prevent canvas scaling issues */
    image-rendering: auto;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
}

/* Continuous mode - all pages visible */
:deep(.vue-pdf-embed[data-view-mode='continuous'] .vue-pdf-embed__page) {
    margin-bottom: 24px;
    opacity: 1;
    transform: none;
}

/* Progressive loading optimization */
:deep(.vue-pdf-embed__page:not(.loaded)) {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    min-height: 400px; /* Prevent layout shift */
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* Responsive page width optimization */
@media (min-width: 768px) {
    :deep(.vue-pdf-embed__page) {
        max-width: 90%;
    }
}

@media (min-width: 1024px) {
    :deep(.vue-pdf-embed__page) {
        max-width: 85%;
    }
}

@media (min-width: 1280px) {
    :deep(.vue-pdf-embed__page) {
        max-width: 80%;
    }
}

/* Enhance text selection in the PDF viewer */
:deep(.textLayer) {
    opacity: 1;
    z-index: 2;
    mix-blend-mode: multiply;
}

:deep(.textLayer ::selection) {
    background-color: #b4d5fe;
}

:deep(.dark .textLayer ::selection) {
    background-color: #3366cc;
}

/* Floating action buttons mobile responsiveness */
@media (max-width: 768px) {
    .fixed.right-4 {
        right: 1rem;
        bottom: 1rem;
    }

    /* Stack buttons horizontally on mobile */
    .fixed.right-4.flex-col {
        flex-direction: row-reverse;
        left: 50%;
        transform: translateX(-50%);
        right: auto;
        bottom: 1rem;
        top: auto;
    }
}

@media (max-width: 640px) {
    .fixed.right-4 {
        right: 0.5rem;
    }

    /* Smaller buttons on very small screens */
    .fixed .w-14 {
        width: 3rem;
        height: 3rem;
    }

    .fixed .w-12 {
        width: 2.5rem;
        height: 2.5rem;
    }
}

/* Toolbar responsiveness */
@media (max-width: 640px) {
    .toolbar {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    /* Stack zoom controls below on very small screens */
    .order-last {
        order: 3;
        width: 100%;
        justify-content: center;
        margin-top: 0.5rem;
    }
}

/* Animation for text selection popup */
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.2s ease-out;
}

/* Pulse animation for quick note button */
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.8;
        transform: scale(1.05);
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth transitions for buttons */
.transition-all {
    transition: all 0.3s ease;
}

/* Loading animation enhancement */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

/* Enhanced PDF page shadows and hover effects */
:deep(.vue-pdf-embed__page) {
    transition: all 0.3s ease;
    border-radius: 8px;
    overflow: hidden;
}

:deep(.vue-pdf-embed__page:hover) {
    box-shadow: 0 4px 12px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

/* Perfect text highlighting */
:deep(.pdf-text-highlight) {
    background-color: rgba(255, 235, 59, 0.4) !important;
    border-radius: 2px !important;
    padding: 1px 2px !important;
    transition: all 0.2s ease !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

:deep(.pdf-text-highlight:hover) {
    background-color: rgba(255, 235, 59, 0.6) !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
}

/* Dark mode enhancements */
.dark :deep(.vue-pdf-embed) {
    background-color: #1f2937;
}

.dark :deep(.vue-pdf-embed__page) {
    box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.3);
}

.dark :deep(.vue-pdf-embed__page:hover) {
    box-shadow: 0 4px 12px 8px rgba(0, 0, 0, 0.4);
}

/* ChatGPT-like styling */
.chat-messages .chat-message {
    position: relative;
}

.chat-messages .chat-message:not(:last-child)::after {
    content: '';
    position: absolute;
    bottom: -1.5rem;
    left: 1.25rem;
    height: 1rem;
    border-left: 2px dashed rgba(156, 163, 175, 0.2);
}
</style>
