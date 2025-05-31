<script setup>
import { useReaderStore } from '@/stores/readerStore';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import VuePdfEmbed, { useVuePdfEmbed } from 'vue-pdf-embed';
import 'vue-pdf-embed/dist/styles/annotationLayer.css';
import 'vue-pdf-embed/dist/styles/textLayer.css';
import { useRouter } from 'vue-router';
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
const router = useRouter();
const readerStore = useReaderStore();
const pdfEmbedRef = ref();
const pdfContainerRef = ref();
const componentKey = ref(0);

// Vue PDF Embed composable for all pages view
const { doc } = useVuePdfEmbed({
    source: computed(() => props.pdfSource)
});

// Page visibility tracking for performance
const pageRefs = ref([]);
const pageVisibility = ref({});
let pageIntersectionObserver;

// PDF state
const currentPage = ref(1);
const pdfLoading = ref(true);
const error = ref(null);
const pdfLoaded = ref(false);
const progress = reactive({ loaded: 0, total: 0 });
const isRendering = ref(false);

// PDF document properties
const totalPages = ref(0);
const currentScale = ref(1.2);
const pdfDocument = ref(null);

// View mode - single page or all pages
const viewMode = ref('all'); // Start with 'all' pages view

// Performance tracking
const renderedPagesCount = computed(() => Object.keys(pageVisibility.value).filter((key) => pageVisibility.value[key]).length);

// Computed page numbers for all pages view
const pageNums = computed(() => (doc.value ? [...Array(doc.value.numPages + 1).keys()].slice(1) : []));

// Vue PDF Embed event handlers
function onPdfLoaded(pdfProxy) {
    pdfDocument.value = pdfProxy;
    totalPages.value = pdfProxy.numPages;
    pdfLoaded.value = true;
    pdfLoading.value = false;
    error.value = null;

    // Initialize virtual scrolling
    if (viewMode.value === 'all') {
        nextTick(() => {
            updateVisibleRange();
        });
    }

    console.log('PDF loaded successfully:', totalPages.value, 'pages');
}

// Intersection Observer setup for performance optimization
const resetPageIntersectionObserver = () => {
    pageIntersectionObserver?.disconnect();
    pageIntersectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = pageRefs.value.indexOf(entry.target);
                    const pageNum = pageNums.value[index];
                    if (pageNum) {
                        pageVisibility.value[pageNum] = true;
                        currentPage.value = pageNum; // Update current page based on visibility
                        console.log(`Page ${pageNum} became visible and will be rendered`);
                    }
                }
            });
        },
        {
            root: null,
            rootMargin: '100px', // Start loading 100px before page becomes visible
            threshold: 0.1 // Page is considered visible when 10% is in view
        }
    );

    // Observe all page wrapper elements
    pageRefs.value.forEach((element) => {
        if (element) {
            pageIntersectionObserver.observe(element);
        }
    });
};

// Watch for the doc changes from useVuePdfEmbed to get totalPages
watch(doc, (newDoc) => {
    if (newDoc && newDoc.numPages) {
        // This handles the all pages view totalPages
        totalPages.value = newDoc.numPages;
        pdfLoaded.value = true;
        pdfLoading.value = false;
        error.value = null;

        console.log('PDF document loaded for all pages view:', totalPages.value, 'pages');

        // Initialize intersection observer for all pages view
        if (viewMode.value === 'all') {
            nextTick(() => {
                const firstPageNums = Array.from({ length: Math.min(3, totalPages.value) }, (_, i) => i + 1);
                pageVisibility.value = Object.fromEntries(firstPageNums.map((num) => [num, true]));
                nextTick(resetPageIntersectionObserver);
            });
        }
    }
});

// Watch for page numbers changes to reset observer
watch(pageNums, (newPageNums) => {
    if (newPageNums.length > 0) {
        // Initialize with first 3 pages visible for immediate loading
        pageVisibility.value = {
            [newPageNums[0]]: true,
            [newPageNums[1]]: newPageNums[1] ? true : false,
            [newPageNums[2]]: newPageNums[2] ? true : false
        };
        nextTick(resetPageIntersectionObserver);
    }
});

// Toggle between single page and all pages view
function toggleViewMode() {
    viewMode.value = viewMode.value === 'single' ? 'all' : 'single';
}

function onPdfLoadingFailed(err) {
    console.error('Error loading PDF:', err);
    pdfLoaded.value = false;
    pdfDocument.value = null;
    pdfLoading.value = false;

    if (props.pdfSource && (props.pdfSource.includes('youtube.com') || props.pdfSource.includes('youtu.be'))) {
        error.value = 'Invalid PDF source: YouTube URL detected. This URL cannot be loaded as a PDF.';
    } else {
        error.value = `Failed to load PDF: ${err.message}`;
    }
}

function onPdfProgress(progressData) {
    if (progressData.loaded && progressData.total) {
        progress.loaded = progressData.loaded;
        progress.total = progressData.total;
    }
}

function onPdfRendered() {
    isRendering.value = false;
    console.log(`Page ${currentPage.value} rendered successfully`);
}

function onPdfRenderingFailed(err) {
    console.error('Error rendering page:', err);
    isRendering.value = false;
    error.value = `Failed to render page: ${err.message}`;
}

// Search functionality - simplified for browser PDF

// Text selection
const selectedText = ref('');
const selectionPosition = ref({ x: 0, y: 0 });
const showTextActions = ref(false);
const selectedPageNumber = ref(1);

// Sidebars
const noteSidebar = ref(false);
const chatSidebar = ref(false);

// Always update store context when sidebars open
watch(noteSidebar, (val) => {
    if (val) {
        // Ensure context is updated when sidebar opens
        readerStore.updateContext({
            page: currentPage.value,
            selectedText: selectedText.value || ''
        });
    }
});
watch(chatSidebar, (val) => {
    if (val) {
        // Ensure context is updated when sidebar opens
        readerStore.updateContext({
            page: currentPage.value,
            selectedText: selectedText.value || ''
        });
    }
});

// Add mobile menu state
const showMobileMenu = ref(false);

// Search functionality with PDF.js
const searchQuery = ref('');
const showSearch = ref(false);
const searchResults = ref([]);
const currentSearchIndex = ref(-1);

async function startSearch() {
    if (!searchQuery.value.trim() || !pdfDocument.value) {
        searchResults.value = [];
        return;
    }

    try {
        searchResults.value = [];

        // Search through all pages
        for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
            const pageObj = await pdfDocument.value.getPage(pageNum);
            const textContent = await pageObj.getTextContent();

            // Build text string from text items
            const pageText = textContent.items.map((item) => item.str).join(' ');
            const searchTerm = searchQuery.value.toLowerCase();

            if (pageText.toLowerCase().includes(searchTerm)) {
                searchResults.value.push({
                    pageNumber: pageNum,
                    text: pageText
                });
            }
        }

        if (searchResults.value.length > 0) {
            currentSearchIndex.value = 0;
            const firstResult = searchResults.value[0];
            currentPage.value = firstResult.pageNumber;

            toast.add({
                severity: 'success',
                summary: 'Search Results',
                detail: `Found ${searchResults.value.length} result(s)`,
                life: 3000
            });
        } else {
            toast.add({
                severity: 'warn',
                summary: 'No Results',
                detail: 'No matches found for your search',
                life: 3000
            });
        }
    } catch (err) {
        console.error('Search error:', err);
        toast.add({
            severity: 'error',
            summary: 'Search Error',
            detail: 'Failed to search the PDF',
            life: 3000
        });
    }
}

function nextSearchResult() {
    if (searchResults.value.length === 0) return;

    currentSearchIndex.value = (currentSearchIndex.value + 1) % searchResults.value.length;
    const result = searchResults.value[currentSearchIndex.value];
    currentPage.value = result.pageNumber;
}

function prevSearchResult() {
    if (searchResults.value.length === 0) return;

    currentSearchIndex.value = currentSearchIndex.value - 1;
    if (currentSearchIndex.value < 0) {
        currentSearchIndex.value = searchResults.value.length - 1;
    }
    const result = searchResults.value[currentSearchIndex.value];
    currentPage.value = result.pageNumber;
}

// Mouse tracking for text selection
let isMouseOverActions = false;

// Text selection handling with vue-pdf-embed
async function handleTextSelection() {
    try {
        const selection = window.getSelection();

        if (selection && selection.toString().trim().length > 0) {
            const selectedTextValue = selection.toString().trim();
            selectedText.value = selectedTextValue;
            selectedPageNumber.value = currentPage.value;

            // Update store context with selected text
            readerStore.updateContext({
                page: currentPage.value,
                selectedText: selectedTextValue
            });

            // Get selection position for popup
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Position popup above the selection, centered
            selectionPosition.value = {
                x: Math.max(10, Math.min(window.innerWidth - 200, rect.left + rect.width / 2 - 100)),
                y: Math.max(10, rect.top - 50)
            };

            showTextActions.value = true;
            console.log('Text selected:', selectedTextValue, 'on page:', currentPage.value);
        } else {
            // Clear selection after a delay if mouse is not over actions
            setTimeout(() => {
                if (!isMouseOverActions) {
                    clearTextSelection();
                }
            }, 200);
        }
    } catch (error) {
        console.warn('Text selection error:', error);
        // Clear selection in case of error
        setTimeout(() => {
            if (!isMouseOverActions) {
                clearTextSelection();
            }
        }, 200);
    }
}

// Clear text selection and highlights
function clearTextSelection() {
    showTextActions.value = false;
    selectedText.value = '';

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
    // Ensure selectedText is passed to the note input field
    if (selectedText.value) {
        console.log('Opening Note Sidebar with selected text:', selectedText.value);
    }
    showTextActions.value = false;
}

function openChatDialog() {
    chatSidebar.value = true;
    // Ensure selectedText is passed to the chat input field
    if (selectedText.value) {
        console.log('Opening Chat Sidebar with selected text:', selectedText.value);
    }
    showTextActions.value = false;
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
            .catch(() => {
                toast.add({ severity: 'error', summary: 'Copy Failed', detail: 'Failed to copy text to clipboard', life: 3000 });
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
        highlight_text: noteData.highlight_text !== undefined ? noteData.highlight_text : selectedText.value || null,
        page_number: noteData.page_number !== undefined ? noteData.page_number : currentPage.value
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
        highlight_text: chatData.highlight_text !== undefined ? chatData.highlight_text : selectedText.value || null,
        page_number: chatData.page_number !== undefined ? chatData.page_number : currentPage.value,
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
        currentPage.value = note.page_number;
    }
}

function jumpToChat(chat) {
    if (chat && chat.page_number) {
        currentPage.value = chat.page_number;
    }
}

// Navigation functions with vue-pdf-embed
function prevPage() {
    if (currentPage.value > 1) {
        currentPage.value--;
        // Update store context
        readerStore.updateContext({ page: currentPage.value, selectedText: selectedText.value });
    }
}

function nextPage() {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
        // Update store context
        readerStore.updateContext({ page: currentPage.value, selectedText: selectedText.value });
    }
}

// Zoom functions
function zoomIn() {
    currentScale.value = Math.min(currentScale.value + 0.2, 3);
}

function zoomOut() {
    currentScale.value = Math.max(currentScale.value - 0.2, 0.5);
}

function resetZoom() {
    currentScale.value = 1.2;
}

// Utility functions
function downloadPdf() {
    if (props.pdfSource) {
        const link = document.createElement('a');
        link.href = props.pdfSource;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function printPdf() {
    if (pdfEmbedRef.value) {
        pdfEmbedRef.value.print();
    }
}

const goBack = () => {
    router.back();
};

// Handle window resize to re-render PDF
let resizeTimeout;
function handleResize() {
    // Debounce resize events to avoid too many re-renders
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('Window resized, forcing PDF re-render');

        // Force re-render of all visible pages by updating component key
        componentKey.value++;

        // For all pages view, force all previously visible pages to re-render
        if (viewMode.value === 'all' && pageVisibility.value) {
            const allVisiblePages = Object.keys(pageVisibility.value).filter((key) => pageVisibility.value[key]);

            // Reset all page visibility
            pageVisibility.value = {};

            // Re-enable visibility for all previously visible pages after a short delay
            nextTick(() => {
                allVisiblePages.forEach((pageNum) => {
                    pageVisibility.value[parseInt(pageNum)] = true;
                });

                // Also ensure the first few pages are visible
                const initialPages = Array.from({ length: Math.min(3, totalPages.value) }, (_, i) => i + 1);
                initialPages.forEach((pageNum) => {
                    pageVisibility.value[pageNum] = true;
                });

                // Reset intersection observer to handle new page elements
                nextTick(() => {
                    resetPageIntersectionObserver();
                });
            });
        }
    }, 300); // 300ms debounce
}

// Watch for prop changes
watch(
    () => props.pdfSource,
    (newSource) => {
        if (newSource) {
            // Reset state when source changes
            pdfLoaded.value = false;
            pdfLoading.value = true;
            error.value = null;
            currentPage.value = 1;
            componentKey.value++;
        }
    }
);

// Watch for scale changes to force re-render of visible pages
watch(currentScale, () => {
    if (viewMode.value === 'all' && pageVisibility.value) {
        // Force re-render by updating component key
        componentKey.value++;

        // For all pages view, re-render all visible pages
        const visiblePages = Object.keys(pageVisibility.value).filter((key) => pageVisibility.value[key]);
        pageVisibility.value = {};

        nextTick(() => {
            visiblePages.forEach((pageNum) => {
                pageVisibility.value[parseInt(pageNum)] = true;
            });
        });
    }
});

// Lifecycle hooks
onMounted(() => {
    document.addEventListener('mouseup', handleTextSelection);
    window.addEventListener('resize', handleResize);

    // Initialize context for PDF with page 1 and empty selected text
    readerStore.updateContext({ page: 1, selectedText: '' });

    console.log('PDFReader mounted with source:', props.pdfSource);
});

onBeforeUnmount(() => {
    document.removeEventListener('mouseup', handleTextSelection);
    window.removeEventListener('resize', handleResize);

    // Clear resize timeout
    clearTimeout(resizeTimeout);

    // Disconnect intersection observer
    pageIntersectionObserver?.disconnect();

    // Reset component state
    showTextActions.value = false;
    noteSidebar.value = false;
    chatSidebar.value = false;

    console.log('PDFReader component unmounted and cleaned up');
});

// Computed properties
const canPrev = computed(() => currentPage.value > 1);
const canNext = computed(() => currentPage.value < totalPages.value);
const pageInfo = computed(() => `${currentPage.value} / ${totalPages.value}`);

// Show all notes and chats, no filtering by page
const filteredNotes = computed(() => {
    return props.notes.slice().sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
});

const filteredChats = computed(() => {
    return props.chatMessages.slice().sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
});
</script>

<template>
    <div class="relative w-full h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
        <!-- Fixed Toolbar at Top -->
        <div class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 z-50">
            <div class="toolbar px-2 py-1 flex items-center justify-between gap-2 flex-wrap">
                <!-- Left Section: Go Back + Navigation Controls -->
                <div class="flex items-center gap-2 order-1">
                    <button @click="goBack" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <i class="pi pi-arrow-left text-gray-700 dark:text-gray-300 text-lg"></i>
                    </button>

                    <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                    <button
                        @click="prevPage"
                        :disabled="!canPrev || isRendering"
                        class="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                        <i class="pi pi-chevron-left text-xs"></i>
                        <span>Prev</span>
                    </button>
                    <div class="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
                        {{ pageInfo }}
                    </div>
                    <button
                        @click="nextPage"
                        :disabled="!canNext || isRendering"
                        class="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                        <span>Next</span>
                        <i class="pi pi-chevron-right text-xs"></i>
                    </button>

                    <!-- Performance Indicator for All Pages View -->
                    <div v-if="viewMode === 'all' && pdfLoaded" class="px-2 py-1 bg-green-50 dark:bg-green-900 rounded text-xs font-medium text-green-700 dark:text-green-300">{{ renderedPagesCount }}/{{ totalPages }} loaded</div>
                </div>

                <!-- Center Section: Search Controls -->
                <div class="flex items-center gap-2 order-2">
                    <div class="relative">
                        <input
                            v-model="searchQuery"
                            @keyup.enter="startSearch"
                            placeholder="Search..."
                            class="pl-6 pr-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-indigo-500 focus:border-transparent w-32"
                        />
                        <i class="pi pi-search absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                    </div>
                    <button @click="startSearch" :disabled="!searchQuery.trim() || !pdfLoaded" class="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-medium">Search</button>
                    <div v-if="searchResults.length > 0" class="flex items-center gap-1">
                        <button @click="prevSearchResult" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Previous Result">
                            <i class="pi pi-chevron-up text-xs"></i>
                        </button>
                        <span class="text-xs text-gray-600 dark:text-gray-400 px-1">{{ currentSearchIndex + 1 }}/{{ searchResults.length }}</span>
                        <button @click="nextSearchResult" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Next Result">
                            <i class="pi pi-chevron-down text-xs"></i>
                        </button>
                    </div>
                </div>

                <!-- Right Section: Zoom, View Mode, and Actions -->
                <div class="flex items-center gap-2 order-last sm:order-3">
                    <button @click="zoomOut" :disabled="currentScale <= 0.5 || isRendering" class="p-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded" title="Zoom Out">
                        <i class="pi pi-minus text-xs"></i>
                    </button>

                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[45px] text-center"> {{ Math.round(currentScale * 100) }}% </span>

                    <button @click="zoomIn" :disabled="currentScale >= 3 || isRendering" class="p-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded" title="Zoom In">
                        <i class="pi pi-plus text-xs"></i>
                    </button>

                    <button
                        @click="resetZoom"
                        :disabled="isRendering"
                        class="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-medium text-gray-700 dark:text-gray-300"
                        title="Reset Zoom"
                    >
                        Reset
                    </button>

                    <!-- View Mode Toggle -->
                    <button
                        @click="toggleViewMode"
                        :disabled="!pdfLoaded"
                        class="px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-medium"
                        :title="viewMode === 'single' ? 'Show All Pages' : 'Show Single Page'"
                    >
                        <i :class="viewMode === 'single' ? 'pi pi-list' : 'pi pi-file'" class="text-xs mr-1"></i>
                        {{ viewMode === 'single' ? 'All' : 'Single' }}
                    </button>

                    <!-- Utility Actions -->
                    <div class="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>

                    <button @click="downloadPdf" class="p-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Download PDF">
                        <i class="pi pi-download text-xs"></i>
                    </button>

                    <button @click="printPdf" :disabled="!pdfLoaded" class="p-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded" title="Print PDF">
                        <i class="pi pi-print text-xs"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Content Area with top padding to account for fixed toolbar -->
        <div class="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 relative pt-12">
            <!-- PDF viewer container with auto-adjusting width -->
            <div ref="pdfContainerRef" class="pdf-container w-full max-w-full px-2 md:px-4 lg:px-8 xl:px-16 2xl:px-24 py-4">
                <!-- Loading indicator -->
                <div v-if="pdfLoading && !pdfLoaded" class="absolute top-16 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg z-10">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 border-2 border-t-red-500 border-gray-200 rounded-full animate-spin"></div>
                        <span class="text-sm text-gray-700 dark:text-gray-300">Loading PDF...</span>
                        <span v-if="progress.total" class="text-xs text-gray-500 dark:text-gray-400"> {{ Math.round((progress.loaded / progress.total) * 100) }}% </span>
                    </div>
                </div>

                <!-- Rendering indicator -->
                <div v-if="isRendering && pdfLoaded" class="absolute top-16 right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg z-15">
                    <div class="flex items-center gap-2">
                        <div class="w-4 h-4 border-2 border-t-indigo-500 border-gray-200 rounded-full animate-spin"></div>
                        <span class="text-sm text-gray-700 dark:text-gray-300">Rendering...</span>
                    </div>
                </div>

                <!-- PDF Content -->
                <div class="pdf-viewer-wrapper bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 sm:p-4">
                    <!-- Single Page View -->
                    <VuePdfEmbed
                        v-if="viewMode === 'single'"
                        ref="pdfEmbedRef"
                        :key="`single-${componentKey}`"
                        :source="props.pdfSource"
                        :page="currentPage"
                        :scale="currentScale"
                        :text-layer="true"
                        :annotation-layer="true"
                        image-resources-path="https://unpkg.com/pdfjs-dist/web/images/"
                        class="vue-pdf-embed w-full max-w-none"
                        @loaded="onPdfLoaded"
                        @loading-failed="onPdfLoadingFailed"
                        @progress="onPdfProgress"
                        @rendered="onPdfRendered"
                        @rendering-failed="onPdfRenderingFailed"
                    />
                    <!-- All Pages View with Lazy Loading -->
                    <div v-else-if="viewMode === 'all'" class="all-pages-container w-full">
                        <div v-for="pageNum in pageNums" :key="pageNum" ref="pageRefs" class="page-wrapper">
                            <VuePdfEmbed
                                v-if="pageVisibility[pageNum]"
                                :source="doc"
                                :page="pageNum"
                                :scale="currentScale"
                                :text-layer="true"
                                :annotation-layer="true"
                                image-resources-path="https://unpkg.com/pdfjs-dist/web/images/"
                                class="vue-pdf-embed__page mb-4 w-full shadow-lg rounded-lg"
                                @rendered="onPdfRendered"
                                @rendering-failed="onPdfRenderingFailed"
                            />
                        </div>
                    </div>
                </div>
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
        <NoteSidebar
            v-model:visible="noteSidebar"
            :notes="filteredNotes"
            :selected-text="selectedText"
            :page-number="currentPage"
            :current-time="0"
            timer-label="Page"
            :timer-value="`Page ${currentPage}`"
            @save-note="saveNote"
            @delete="deleteNote"
            @jump-to="jumpToNote"
        />

        <!-- Chat Sidebar -->
        <ChatSidebar
            v-model:visible="chatSidebar"
            :chat-messages="filteredChats"
            :selected-text="selectedText"
            :page-number="currentPage"
            :current-time="0"
            timer-label="Page"
            :timer-value="`Page ${currentPage}`"
            @save-chat="saveChatMessage"
            @delete="deleteChatMessage"
            @jump-to="jumpToChat"
        />
    </div>
</template>

<style scoped>
/* Vue PDF Embed styling - Optimized for all devices */
.vue-pdf-embed {
    width: 100%;
    height: auto;
    max-width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    display: block;
    margin: 0 auto;
}

.vue-pdf-embed:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* All Pages View Styling */
.vue-pdf-embed__page {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    display: block;
}

.vue-pdf-embed__page:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Dark mode PDF styling */
.dark .vue-pdf-embed {
    border-color: #374151;
    background-color: white;
}

.dark .vue-pdf-embed:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark .vue-pdf-embed__page {
    border-color: #374151;
    background-color: white;
}

.dark .vue-pdf-embed__page:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

/* Enhanced text selection styling */
:deep(.textLayer ::selection) {
    background: rgba(255, 215, 0, 0.8) !important; /* Bright gold highlight */
    color: rgba(30, 30, 30, 0.9) !important; /* Dark text for visibility */
}

:deep(.textLayer ::-moz-selection) {
    background: rgba(255, 215, 0, 0.8) !important; /* Bright gold highlight */
    color: rgba(30, 30, 30, 0.9) !important; /* Dark text for visibility */
}

/* Ensure text layer works with vue-pdf-embed */
:deep(.textLayer) {
    user-select: text !important;
    cursor: text !important;
    pointer-events: auto !important;
}

:deep(.textLayer > span),
:deep(.textLayer > div) {
    user-select: text !important;
    pointer-events: auto !important;
}

.pdf-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: none; /* No max-width restrictions for full utilization */
    margin: 0 auto;
    contain: layout style;
}

.pdf-viewer-wrapper {
    min-height: 400px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: auto;
}

/* Page wrapper and placeholder styling for lazy loading */
.page-wrapper {
    margin-bottom: 16px;
    width: 100%;
    display: flex;
    justify-content: center;
}

.page-placeholder {
    width: 100%;
    min-height: 400px;
    background-color: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.page-placeholder:hover {
    background-color: #e9ecef;
    border-color: #adb5bd;
}

.page-placeholder-content {
    text-align: center;
    color: #6c757d;
}

.page-label {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
}

.loading-text {
    font-size: 14px;
    opacity: 0.8;
}

.dark .page-placeholder {
    background-color: #374151;
    border-color: #4b5563;
}

.dark .page-placeholder:hover {
    background-color: #4b5563;
    border-color: #6b7280;
}

.dark .page-placeholder-content {
    color: #9ca3af;
}

/* Perfect responsive wrapper for all screen sizes */
@media (max-width: 640px) {
    .pdf-viewer-wrapper {
        min-height: 300px;
        padding: 8px !important;
    }

    .pdf-container {
        padding-left: 4px !important;
        padding-right: 4px !important;
    }

    .vue-pdf-embed__page {
        margin-bottom: 12px;
    }
}

@media (min-width: 641px) and (max-width: 1024px) {
    .pdf-viewer-wrapper {
        min-height: 500px;
    }
}

@media (min-width: 1025px) {
    .pdf-viewer-wrapper {
        min-height: 600px;
    }
}

/* Toolbar styling */
.toolbar {
    backdrop-filter: blur(8px);
    border: 1px solid rgba(229, 231, 235, 0.8);
    position: relative;
    z-index: 20;
    pointer-events: auto;
}

.toolbar button {
    pointer-events: auto;
    z-index: 21;
    position: relative;
}

.dark .toolbar {
    border-color: rgba(55, 65, 81, 0.8);
    backdrop-filter: blur(8px);
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
</style>
