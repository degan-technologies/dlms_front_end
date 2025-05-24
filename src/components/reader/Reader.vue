<template>
    <div class="reader-container w-full h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <!-- Fixed Page header - streamlined -->
        <div class="flex-shrink-0 bg-white shadow-sm z-50 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div class="px-4 py-2 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <button @click="goBack" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <i class="pi pi-arrow-left text-gray-700 dark:text-gray-300 text-lg"></i>
                    </button>
                    <div class="flex flex-col">
                        <h1 class="text-lg font-bold text-gray-900 dark:text-gray-100 truncate max-w-lg leading-tight">
                            {{ bookItem ? bookItem.title : 'Digital Resource Reader' }}
                        </h1>
                        <span v-if="bookItem && bookItem.author" class="text-sm text-gray-600 dark:text-gray-400">
                            {{ bookItem.author }}
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
                :description="bookItem ? `Preparing ${bookItem.title}...` : 'Loading digital content...'"
                :subtitle="bookItem?.author"
            />

            <!-- Global error state -->
            <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 z-50">
                <div class="text-center max-w-md p-6">
                    <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to Load Resource</h3>
                    <p class="text-gray-700 dark:text-gray-300 mb-4">{{ error }}</p>
                    <button @click="goBack" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">Go Back</button>
                </div>
            </div>

            <!-- Content area - only show when not loading and no error -->
            <div v-else class="w-full h-full">
                <PDFReader
                    v-if="isPdf"
                    :pdfSource="isPdf && route.query.source ? decodeURIComponent(decodeURIComponent(route.query.source)) : resourceUrl"
                    :bookItemId="bookItemId"
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
                    :bookItemId="bookItemId"
                    :ebookId="ebookId"
                    :notes="notes"
                    :chatMessages="chatMessages"
                    :darkMode="true"
                    :loading="false"
                    @add-note="addNote"
                    @delete-note="deleteNote"
                    @go-back="goBack"
                    @ask-ai-about-timestamp="askAiAboutTimestamp"
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
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoadingState from './LoadingState.vue';
import PDFReader from './PDFReader.vue';
import YouTubePlayer from './YouTubePlayer.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// State
const loading = ref(true);
const error = ref(null);
const bookItem = ref(null);
const ebook = ref(null);
const notes = ref([]);
const chatMessages = ref([]);

// Get book item ID from route params
const bookItemId = computed(() => route.params.id);
const ebookId = computed(() => ebook.value?.id);

// Determine if the resource is a PDF, AUDIO, or VIDEO (YouTube)
const isPdf = computed(() => {
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
    const type = ebook.value.ebook_type?.name?.toLowerCase();

    return (format && format === 'pdf') || (type && type === 'pdf') || (url && (url.endsWith('.pdf') || url.includes('.pdf')));
});

const isYouTube = computed(() => {
    if (!ebook.value) return false;

    // First check for explicit video type in URL parameters
    if (route.query.type === 'video') return true;

    // Then check for video ID in URL parameters
    if (route.query.videoId) return true;

    // Then check if it's a YouTube URL
    const url = ebook.value.file_path || ebook.value.file_url;
    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        return true;
    }

    // Fallback to content detection from metadata
    const format = ebook.value.file_format?.toLowerCase();
    const type = ebook.value.ebook_type?.name?.toLowerCase();

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

// Track recently viewed item
const trackRecentlyViewed = async (ebookId) => {
    try {
        await axiosInstance.post('/recently-viewed', {
            e_book_id: ebookId
        });
        console.log('Successfully tracked recently viewed item');
    } catch (err) {
        console.error('Failed to track recently viewed item:', err);
        // Don't show error to user as this is background functionality
    }
};

// Fetch book item data by ID
const fetchBookItem = async () => {
    loading.value = true;
    error.value = null;
    try {
        // Use the book items endpoint with the format=ebook parameter which includes notes, chat messages, and bookmarks
        const response = await axiosInstance.get(`/book-items/${bookItemId.value}`, {
            params: { format: 'ebook' }
        });
        bookItem.value = response.data.data;
        if (bookItem.value?.ebooks?.length > 0) {
            ebook.value = bookItem.value.ebooks[0]; // Initialize with data from the response
            const initialNotes = ebook.value.notes || [];
            const initialChatMessages = ebook.value.chatMessages || [];

            // Set the initial values
            notes.value = initialNotes;
            chatMessages.value = initialChatMessages;

            // Track this as a recently viewed item
            await trackRecentlyViewed(ebook.value.id);

            // Then fetch complete data separately to ensure we have all items
            await Promise.all([fetchNotes(), fetchChatMessages()]);

            console.log('Loaded data from book item and separate fetches:', {
                notes: notes.value.length,
                chatMessages: chatMessages.value.length
            });
        } else {
            throw new Error('No e-book found for this resource');
        }
    } catch (err) {
        console.error('Failed to fetch book item:', err);
        error.value = err.response?.data?.message || 'Failed to load resource. Please try again later.';
    } finally {
        loading.value = false;
    }
};

const fetchNotes = async () => {
    if (!ebook.value) return;
    try {
        // Use larger per_page value to ensure we get all notes
        const res = await axiosInstance.get('/notes', {
            params: {
                e_book_id: ebook.value.id,
                per_page: 500,
                sort: 'created_at',
                direction: 'asc' // Ensure consistent sorting from API
            }
        });

        if (res.data.data && res.data.data.length > 0) {
            // Only replace the current notes if we got a non-empty response
            notes.value = res.data.data;
            console.log(`Fetched ${notes.value.length} notes`);
        }
    } catch (err) {
        console.error('Error fetching notes:', err);
        // Don't clear existing notes on error
    }
};
const fetchChatMessages = async () => {
    if (!ebook.value) return;
    try {
        // Use larger per_page value to ensure we get all messages
        const res = await axiosInstance.get('/chat-messages', {
            params: {
                e_book_id: ebook.value.id,
                per_page: 500,
                sort: 'created_at',
                direction: 'asc' // Ensure consistent sorting from API
            }
        });

        if (res.data.data && res.data.data.length > 0) {
            // Only replace the current messages if we got a non-empty response
            chatMessages.value = res.data.data;
            console.log(`Fetched ${chatMessages.value.length} chat messages`);
        }
    } catch (err) {
        console.error('Error fetching chat messages:', err);
        // Don't clear existing messages on error
    }
};

// Note functions (PDF: allow highlight, YouTube: timestamp only)
const addNote = async (noteData) => {
    try {
        let payload;
        if (isPdf.value) {
            payload = {
                e_book_id: ebook.value.id,
                content: noteData.content,
                page_number: noteData.page_number,
                highlight_text: noteData.highlight_text || ''
                // Removed metadata field as it doesn't exist in database
            };
        } else if (isYouTube.value) {
            payload = {
                e_book_id: ebook.value.id,
                content: noteData.content,
                timestamp: noteData.timestamp
            };
        }

        const response = await axiosInstance.post('/notes', payload);

        // Add the new note to local state instead of fetching all notes again
        if (response.data.data) {
            notes.value.push(response.data.data);
            console.log('Note added to local state');
        }

        toast.add({ severity: 'success', summary: 'Note Added', detail: 'Your note has been saved successfully', life: 3000 });
    } catch (err) {
        console.error('Failed to add note:', err);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save note. Please try again.', life: 3000 });
    }
};
const deleteNote = async (noteId) => {
    try {
        await axiosInstance.delete(`/notes/${noteId}`);

        // Remove the deleted note from local state
        const index = notes.value.findIndex((note) => note.id === noteId);
        if (index !== -1) {
            notes.value.splice(index, 1);
            console.log('Note removed from local state');
        }

        toast.add({ severity: 'success', summary: 'Note Deleted', detail: 'Note deleted successfully', life: 3000 });
    } catch (err) {
        console.error('Failed to delete note:', err);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete note.', life: 3000 });
    }
};

// Chat message functions
const addChatMessage = async (chatData) => {
    try {
        let payload;
        if (isPdf.value) {
            payload = {
                e_book_id: ebook.value.id,
                question: chatData.question,
                is_anonymous: false, // Always set to false to fix validation errors
                page_number: chatData.page_number,
                highlight_text: chatData.highlight_text || ''
            };
        } else if (isYouTube.value) {
            payload = {
                e_book_id: ebook.value.id,
                question: chatData.question,
                is_anonymous: false, // Always set to false to fix validation errors
                timestamp: chatData.timestamp
            };
        }

        const response = await axiosInstance.post('/chat-messages', payload);

        // Add the new chat message to local state instead of fetching all messages again
        if (response.data.data) {
            // Format the newly created message consistently
            const newMessage = {
                ...response.data.data,
                creation_date: new Date().toLocaleString()
            };
            chatMessages.value.push(newMessage);
            console.log('Chat message added to local state');
        }

        toast.add({ severity: 'success', summary: 'Message Sent', detail: 'Your question has been sent successfully', life: 3000 });
    } catch (err) {
        console.error('Failed to send chat message:', err);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to send message. Please try again.', life: 3000 });
    }
};
const deleteChatMessage = async (messageId) => {
    try {
        await axiosInstance.delete(`/chat-messages/${messageId}`);

        // Remove the deleted message from local state
        const index = chatMessages.value.findIndex((message) => message.id === messageId);
        if (index !== -1) {
            chatMessages.value.splice(index, 1);
            console.log('Chat message removed from local state');
        }

        toast.add({ severity: 'success', summary: 'Message Deleted', detail: 'Message deleted successfully', life: 3000 });
    } catch (err) {
        console.error('Failed to delete message:', err);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete message.', life: 3000 });
    }
};

// AI chat for YouTube timestamps
const askAiAboutTimestamp = async (data) => {
    // Ensure consistent format between PDF and YouTube interfaces
    return await addChatMessage({
        question: data.question,
        timestamp: data.timestamp,
        is_anonymous: false
    });
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

// Watch for route param changes to reload content
watch(
    () => route.params.id,
    (newId, oldId) => {
        if (newId && newId !== oldId) {
            fetchBookItem();
        }
    }
);

// Function to refresh all chat messages
const refreshChatMessages = async () => {
    console.log('Refreshing chat messages');
    await fetchChatMessages();
};

// Fetch data on component mount
onMounted(() => {
    fetchBookItem();

    // Set up a periodic refresh for chat messages (every 30 seconds)
    const refreshInterval = setInterval(refreshChatMessages, 30000);

    // Clean up interval on unmount
    onBeforeUnmount(() => {
        clearInterval(refreshInterval);
    });
});
</script>

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
