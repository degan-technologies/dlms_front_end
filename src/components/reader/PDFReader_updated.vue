<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
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
const pdfIframeRef = ref();
const componentKey = ref(0);

// PDF state - simplified for browser viewer
const page = ref(1);
const pdfLoading = ref(true);
const error = ref(null);
const pdfLoaded = ref(false);
const progress = reactive({ loaded: 0, total: 0 });
const isRendering = ref(false);

// Browser PDF URL with page navigation
const pdfUrl = computed(() => {
    if (!props.pdfSource) return '';
    // For browser's native PDF viewer, we can append #page=X to navigate to specific page
    return `${props.pdfSource}#page=${page.value}&toolbar=1&navpanes=0&scrollbar=1&view=FitH`;
});

// Search functionality - simplified for browser PDF
const searchQuery = ref('');
const showSearch = ref(false);

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

// Browser-based search functionality
function startSearch() {
    if (!searchQuery.value.trim()) {
        return;
    }

    try {
        const iframe = pdfIframeRef.value;
        if (iframe && iframe.contentWindow) {
            // Focus the iframe and trigger browser search (Ctrl+F)
            iframe.contentWindow.focus();

            // We can try to programmatically trigger the browser's find functionality
            if (iframe.contentDocument) {
                const searchEvent = new KeyboardEvent('keydown', {
                    key: 'f',
                    code: 'KeyF',
                    ctrlKey: true,
                    bubbles: true
                });
                iframe.contentDocument.dispatchEvent(searchEvent);
            }
        }

        toast.add({
            severity: 'info',
            summary: 'Search Tip',
            detail: 'Use Ctrl+F (or Cmd+F on Mac) to search within the PDF',
            life: 4000
        });
    } catch (err) {
        console.warn('Could not trigger search:', err);
        toast.add({
            severity: 'warn',
            summary: 'Search',
            detail: "Use your browser's search function (Ctrl+F) to search the PDF",
            life: 4000
        });
    }
}

function nextSearchResult() {
    // For browser PDF, this will be handled by the browser's native search
    toast.add({
        severity: 'info',
        summary: 'Navigation',
        detail: 'Use F3 or Enter to find next result in browser search',
        life: 3000
    });
}

function prevSearchResult() {
    // For browser PDF, this will be handled by the browser's native search
    toast.add({
        severity: 'info',
        summary: 'Navigation',
        detail: 'Use Shift+F3 to find previous result in browser search',
        life: 3000
    });
}

// Mouse tracking for text selection
let isMouseOverActions = false;

// Text selection handling - adapted for iframe PDF viewer
function handleTextSelection() {
    // For iframe PDF viewer, text selection is handled by the browser
    // We'll provide alternative ways to create notes and chats
    try {
        // Try to get selection from iframe if possible
        const iframe = pdfIframeRef.value;
        let selection = null;

        if (iframe && iframe.contentWindow && iframe.contentDocument) {
            selection = iframe.contentWindow.getSelection();
        }

        // Fallback to main window selection
        if (!selection || selection.toString().trim().length === 0) {
            selection = window.getSelection();
        }

        if (selection && selection.toString().trim().length > 0) {
            const selectedTextValue = selection.toString().trim();
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

    // Clear browser selection in main window
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }

    // Try to clear selection in iframe
    try {
        const iframe = pdfIframeRef.value;
        if (iframe && iframe.contentWindow && iframe.contentWindow.getSelection) {
            iframe.contentWindow.getSelection().removeAllRanges();
        }
    } catch (error) {
        console.warn('Could not clear iframe selection:', error);
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
        updatePdfUrl();
    }
}

function jumpToChat(chat) {
    if (chat && chat.page_number) {
        page.value = chat.page_number;
        updatePdfUrl();
    }
}

// Update PDF URL when page changes
function updatePdfUrl() {
    if (pdfIframeRef.value && props.pdfSource) {
        const newUrl = `${props.pdfSource}#page=${page.value}&toolbar=1&navpanes=0&scrollbar=1&view=FitH`;
        if (pdfIframeRef.value.src !== newUrl) {
            pdfIframeRef.value.src = newUrl;
        }
    }
}

// Navigation functions - simplified for browser PDF
function prevPage() {
    if (page.value > 1) {
        page.value--;
        updatePdfUrl();
    }
}

function nextPage() {
    page.value++;
    updatePdfUrl();
}

// Utility functions for browser PDF
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
    try {
        const iframe = pdfIframeRef.value;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
    } catch (err) {
        console.warn('Could not print PDF:', err);
        toast.add({
            severity: 'warn',
            summary: 'Print',
            detail: "Use your browser's print function (Ctrl+P) to print the PDF",
            life: 4000
        });
    }
}

// Handle iframe messages (if needed for advanced features)
function handleIframeMessage(event) {
    // Handle any messages from the PDF iframe if needed
    if (event.source === pdfIframeRef.value?.contentWindow) {
        console.log('Message from PDF iframe:', event.data);
        // Handle specific messages if needed
    }
}

// Handle iframe load events
function onIframeLoad() {
    pdfLoading.value = false;
    pdfLoaded.value = true;
    error.value = null;
    console.log('PDF loaded successfully in iframe');
}

function onIframeError() {
    pdfLoading.value = false;
    pdfLoaded.value = false;
    if (props.pdfSource && (props.pdfSource.includes('youtube.com') || props.pdfSource.includes('youtu.be'))) {
        error.value = 'Invalid PDF source: YouTube URL detected. This URL cannot be loaded as a PDF.';
    } else {
        error.value = 'Failed to load PDF. Please check the URL or try again.';
    }
    console.error('PDF loading failed in iframe');
}

// Watch for mouse events to detect text selection
onMounted(() => {
    document.addEventListener('mouseup', handleTextSelection);
    window.addEventListener('message', handleIframeMessage);
    console.log('PDFReader mounted with source:', props.pdfSource);
});

onBeforeUnmount(() => {
    document.removeEventListener('mouseup', handleTextSelection);
    window.removeEventListener('message', handleIframeMessage);

    // Reset component state
    showTextActions.value = false;
    noteSidebar.value = false;
    chatSidebar.value = false;

    console.log('PDFReader component unmounted and cleaned up');
});

// Computed properties - simplified for browser PDF viewer
const canPrev = computed(() => page.value > 1);
const canNext = computed(() => true); // We don't know exact page count, so allow next

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
                        <input v-model.number="page" type="number" :min="1" class="w-12 text-center text-sm border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        <span class="text-sm text-gray-600 dark:text-gray-400">/ Page</span>
                    </div>
                    <button @click="nextPage" :disabled="!canNext" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" title="Next Page">
                        <i class="pi pi-chevron-right text-gray-700 dark:text-gray-300"></i>
                    </button>
                </div>

                <!-- Center controls - Browser PDF controls -->
                <div class="flex items-center gap-1">
                    <button @click="printPdf" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Print PDF">
                        <i class="pi pi-print text-gray-700 dark:text-gray-300"></i>
                    </button>
                    <span class="text-sm text-gray-600 dark:text-gray-400 px-2 min-w-16 text-center">Browser PDF</span>
                    <button @click="downloadPdf" class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Download PDF">
                        <i class="pi pi-download text-gray-700 dark:text-gray-300"></i>
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
                            <button @click="printPdf" class="flex w-full items-center px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"><i class="pi pi-print mr-2 text-gray-600 dark:text-gray-400"></i> Print</button>
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
                    <button @click="prevSearchResult" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-l border border-gray-300 dark:border-gray-500" title="Previous Result">
                        <i class="pi pi-chevron-up text-xs"></i>
                    </button>
                    <button @click="nextSearchResult" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-r border border-l-0 border-gray-300 dark:border-gray-500" title="Next Result">
                        <i class="pi pi-chevron-down text-xs"></i>
                    </button>
                </div>

                <button @click="showSearch = false" class="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" title="Close Search">
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
                <iframe ref="pdfIframeRef" :src="pdfUrl" class="pdf-viewer-content w-full h-screen border-0 rounded-lg shadow-lg" frameborder="0" @load="onIframeLoad" @error="onIframeError" title="PDF Viewer"></iframe>
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
        <NoteSidebar v-model:visible="noteSidebar" :notes="filteredNotes" :selected-text="selectedText" :page-number="page" timer-label="Page" :timer-value="`Page ${page}`" @save-note="saveNote" @delete="deleteNote" @jump-to="jumpToNote" />

        <!-- Chat Sidebar -->
        <ChatSidebar
            v-model:visible="chatSidebar"
            :chat-messages="filteredChats"
            :selected-text="selectedText"
            :page-number="page"
            timer-label="Page"
            :timer-value="`Page ${page}`"
            @save-chat="saveChatMessage"
            @delete="deleteChatMessage"
            @jump-to="jumpToChat"
        />
    </div>
</template>

<style scoped>
/* PDF Viewer styles - Optimized for iframe-based browser PDF viewer */
.pdf-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    contain: layout style;
}

.pdf-viewer-content {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
    width: 100%;
    height: calc(100vh - 120px); /* Adjust height to account for toolbar */
    min-height: 600px;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.pdf-viewer-content:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Dark mode iframe styling */
.dark .pdf-viewer-content {
    background-color: #1f2937;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark .pdf-viewer-content:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
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
