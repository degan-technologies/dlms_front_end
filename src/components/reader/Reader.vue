<script setup>
import { useReaderStore } from '@/stores/readerStore';
import axiosInstance from '@/util/axios-config';
import Header from '@/views/pages/home/Header.vue';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoadingState from './LoadingState.vue';
import PDFReader from './PDFReader.vue';
import YouTubePlayer from './YouTubePlayer.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const readerStore = useReaderStore();

// State
const loading = ref(true);
const error = ref(null);
const ebook = ref(null);

// Get ebook id from route params
const ebookId = computed(() => route.params.id);

// Get notes and chat messages from store
const notes = computed(() => readerStore.sortedNotes);
const chatMessages = computed(() => readerStore.sortedChatMessages);

// Determine if the resource is a PDF, AUDIO, or VIDEO (YouTube)
const isPdf = computed(() => {
    if (route.query.type === 'pdf') return true;
    if (route.query.type === 'video') return false;
    if (!ebook.value) return false;

    // Check URL query parameters first (most reliable)
    if (route.query.type === 'pdf') return true;

    // Make sure it's not a YouTube URL
    const url = ebook.value.file_path || ebook.value.file_url;
    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        return false;
    }

    // Fallback to content detection
    const format = ebook.value.file_format?.toLowerCase();
    const type = ebook.value.e_book_type?.name?.toLowerCase();

    return (format && format === 'pdf') || (type && type === 'pdf') || (url && (url.endsWith('.pdf') || url.includes('.pdf')));
});

const isYouTube = computed(() => {
    if (route.query.type === 'video') return true;
    if (route.query.type === 'pdf') return false;
    if (!ebook.value) return false;

    // First check for explicit video type in URL parameters
    if (route.query.videoId) return true;

    // Then check if it's a YouTube URL
    const url = ebook.value.file_path || ebook.value.file_url;
    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        return true;
    }

    // Fallback to content detection from metadata
    const format = ebook.value.file_format?.toLowerCase();
    const type = ebook.value.e_book_type?.name?.toLowerCase();

    return (format && (format === 'audio' || format === 'video')) || (type && (type === 'audio' || type === 'video'));
});
const resourceUrl = computed(() => {
    if (!ebook.value) return null;

    // Get the file path
    let url = ebook.value.file_path || ebook.value.file_url;

    // Make sure we don't pass YouTube URLs to PDFReader
    if (isPdf.value && url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        console.error('Invalid PDF source: YouTube URL detected', url);
        return null;
    }

    // Check if this is a PDF file and if it contains escaped slashes
    if (isPdf.value && typeof url === 'string' && url.includes('\\/')) {
        // Replace escaped slashes with regular slashes
        url = url.replace(/\\\//g, '/');
    }

    return url;
});
const youtubeVideoId = computed(() => {
    // First check if there's a video ID in the route query params (from EbookDetails.vue)
    if (route.query.videoId) {
        console.log('Using videoId from route query:', route.query.videoId);
        return route.query.videoId;
    }

    // Otherwise try to extract from the resource URL
    if (!isYouTube.value || !resourceUrl.value) return null;

    console.log('Extracting videoId from URL:', resourceUrl.value);
    let id = null;
    try {
        if (resourceUrl.value.includes('youtube.com/watch?v=')) {
            const urlParams = new URLSearchParams(new URL(resourceUrl.value).search);
            id = urlParams.get('v');
        } else if (resourceUrl.value.includes('youtube.com/embed/')) {
            id = resourceUrl.value.split('/embed/')[1].split('?')[0];
        } else if (resourceUrl.value.includes('youtu.be/')) {
            id = resourceUrl.value.split('youtu.be/')[1].split('?')[0];
        }
        console.log('Extracted videoId:', id);
        return id;
    } catch (error) {
        console.error('Error extracting YouTube video ID:', error);
        return null;
    }
});

// Note and chat message handlers using the store
const addNote = async (noteData) => {
    try {
        await readerStore.addNote(noteData);
        toast.add({
            severity: 'success',
            summary: 'Note Added',
            detail: 'Your note has been saved successfully',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: readerStore.notesError || 'Failed to save note. Please try again.',
            life: 3000
        });
    }
};

const deleteNote = async (noteId) => {
    try {
        await readerStore.deleteNote(noteId);
        toast.add({
            severity: 'success',
            summary: 'Note Deleted',
            detail: 'Note deleted successfully',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: readerStore.notesError || 'Failed to delete note.',
            life: 3000
        });
    }
};

const addChatMessage = async (chatData) => {
    try {
        await readerStore.addChatMessage(chatData);
        toast.add({
            severity: 'success',
            summary: 'Message Sent',
            detail: 'Your question has been sent successfully',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: readerStore.chatsError || 'Failed to send message. Please try again.',
            life: 3000
        });
    }
};

const deleteChatMessage = async (messageId) => {
    try {
        await readerStore.deleteChatMessage(messageId);
        toast.add({
            severity: 'success',
            summary: 'Message Deleted',
            detail: 'Message deleted successfully',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: readerStore.chatsError || 'Failed to delete message.',
            life: 3000
        });
    }
};

// Navigation
const goBack = () => {
    router.back();
};

// Reload PDF
const reloadPdf = () => {
    console.log('Reloading PDF...');

    // Get the source URL from either the query or resource
    const sourceUrl = route.query.source ? decodeURIComponent(decodeURIComponent(route.query.source)) : resourceUrl.value;

    console.log('PDF source URL:', sourceUrl);

    // Validate source
    if (!sourceUrl || sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be')) {
        error.value = 'Invalid PDF source URL';
        console.error('Invalid PDF source URL:', sourceUrl);
        return;
    }

    // Force reload by recreating the component
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 500);
};

// Fetch ebook by id (with notes and chatMessages)
const fetchEbook = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await axiosInstance.get(`/read/${ebookId.value}`, {
            params: { with: 'notes,chatMessages,ebookType' }
        });
        ebook.value = response.data.data; // Initialize the store with the ebook data
        const resourceType = isPdf.value ? 'pdf' : 'video';
        await readerStore.initializeReader(ebook.value, resourceType);

        // Set initial context for PDF
        if (isPdf.value) {
            readerStore.updateContext({ page: 1, selectedText: '' });
        } else if (isYouTube.value) {
            readerStore.updateContext({ timestamp: 0 });
        }
    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load resource. Please try again later.';
    } finally {
        loading.value = false;
    }
};

// Watch for route param changes to reload content
watch(
    () => route.params.id,
    (newId, oldId) => {
        if (newId && newId !== oldId) {
            fetchEbook();
        }
    }
);

// Fetch data on component mount
onMounted(() => {
    fetchEbook();
});
</script>
<template>
    <div class="layout-content">
        <Header />
        <div class="reader-container w-full bg-gray-50 dark:bg-gray-900 flex flex-col">
            <!-- Fixed Page header - streamlined -->
            <div class="flex-shrink-0 bg-white mt-6 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div class="px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <button @click="goBack" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <i class="pi pi-arrow-left text-gray-700 dark:text-gray-300 text-lg"></i>
                        </button>
                        <div class="flex flex-col">
                            <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100 truncate max-w-lg leading-tight">
                                {{ ebook ? ebook.file_name : 'Digital Resource Reader' }}
                            </h1>
                            <span v-if="ebook && ebook.author" class="text-sm text-gray-600 dark:text-gray-400">
                                {{ ebook.author }}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <div v-if="loading" class="flex items-center gap-2">
                            <div class="w-4 h-4 border-2 border-t-indigo-600 border-gray-200 rounded-full animate-spin"></div>
                            <span class="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main content area with proper flex layout -->
            <div class="flex-1 min-h-0 relative">
                <!-- Global loading overlay -->
                <LoadingState
                    v-if="loading"
                    :type="isPdf ? 'pdf' : isYouTube ? 'youtube' : 'default'"
                    :title="loading ? 'Loading Resource' : ''"
                    :description="ebook ? `Preparing ${ebook.file_name}...` : 'Loading digital content...'"
                    :subtitle="ebook?.author"
                />

                <!-- Global error state -->
                <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 z-50">
                    <div class="text-center max-w-md p-6">
                        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to Load Resource</h3>
                        <p class="text-gray-700 dark:text-gray-300 mb-4">{{ error }}</p>
                    </div>
                </div>

                <!-- Content area - only show when not loading and no error -->
                <div v-else class="w-full h-full">
                    <PDFReader
                        v-if="isPdf"
                        :pdfSource="isPdf && route.query.source ? decodeURIComponent(decodeURIComponent(route.query.source)) : resourceUrl"
                        :ebookId="ebookId"
                        :notes="notes"
                        :chatMessages="chatMessages"
                        :loading="false"
                        @add-note="addNote"
                        @delete-note="deleteNote"
                        @add-chat-message="addChatMessage"
                        @delete-chat-message="deleteChatMessage"
                        @retry="reloadPdf"
                    />
                    <YouTubePlayer
                        v-else-if="isYouTube && (youtubeVideoId || route.query.videoId)"
                        :videoId="youtubeVideoId || route.query.videoId"
                        :ebookId="ebookId"
                        :notes="notes"
                        :chatMessages="chatMessages"
                        :darkMode="true"
                        :loading="false"
                        @add-note="addNote"
                        @delete-note="deleteNote"
                        @go-back="goBack"
                        @ask-ai-about-timestamp="addChatMessage"
                        @add-chat-message="addChatMessage"
                        @delete-chat-message="deleteChatMessage"
                    />
                    <div v-else-if="isYouTube && !youtubeVideoId && !route.query.videoId" class="flex flex-col items-center justify-center h-full">
                        <i class="pi pi-video text-4xl text-gray-400 mb-4"></i>
                        <p class="text-lg text-gray-500">No valid YouTube video ID found.</p>
                        <button @click="goBack" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Go Back</button>
                    </div>
                    <div v-else-if="!isPdf && !isYouTube" class="flex flex-col items-center justify-center h-full">
                        <i class="pi pi-file text-4xl text-gray-400 mb-4"></i>
                        <p class="text-lg text-gray-500">Unsupported file format or missing content.</p>
                        <button @click="goBack" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Go Back</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.reader-container {
    height: 100vh;
    overflow: hidden;
}

/* Prevent any scrollbars in reader */
:deep(.overflow-auto) {
    scrollbar-width: thin;
    scrollbar-color: #d1d5db transparent;
}

:deep(.overflow-auto::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
}

:deep(.overflow-auto::-webkit-scrollbar-track) {
    background: transparent;
}

:deep(.overflow-auto::-webkit-scrollbar-thumb) {
    background-color: #d1d5db;
    border-radius: 4px;
}

:deep(.overflow-auto::-webkit-scrollbar-thumb:hover) {
    background-color: #9ca3af;
}

/* Dark mode scrollbar */
.dark :deep(.overflow-auto) {
    scrollbar-color: #4b5563 transparent;
}

.dark :deep(.overflow-auto::-webkit-scrollbar-thumb) {
    background-color: #4b5563;
}

.dark :deep(.overflow-auto::-webkit-scrollbar-thumb:hover) {
    background-color: #6b7280;
}

/* Enhanced loading animation */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

/* Smooth transitions */
.transition-colors {
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}
</style>
