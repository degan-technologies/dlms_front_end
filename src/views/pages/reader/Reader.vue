<template>
    <div class="reader-container h-full w-full">
        <Toast />

        <!-- Loading state -->
        <div v-if="loading" class="w-full h-full flex justify-content-center align-items-center">
            <ProgressSpinner />
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="w-full h-full flex flex-column justify-content-center align-items-center p-4">
            <i class="pi pi-exclamation-circle text-6xl text-yellow-500 mb-4"></i>
            <h2 class="text-xl font-bold mb-2">Failed to load resource</h2>
            <p class="text-color-secondary mb-4">{{ error }}</p>
            <Button @click="goBack" label="Go Back" icon="pi pi-arrow-left" />
        </div>

        <!-- Resource not found -->
        <div v-else-if="!resource" class="w-full h-full flex flex-column justify-content-center align-items-center p-4">
            <i class="pi pi-question-circle text-6xl text-blue-500 mb-4"></i>
            <h2 class="text-xl font-bold mb-2">Resource Not Found</h2>
            <p class="text-color-secondary mb-4">The requested resource could not be found or you don't have permission to access it.</p>
            <Button @click="goBack" label="Go Back" icon="pi pi-arrow-left" />
        </div>

        <!-- Content based on resource type -->
        <div v-else class="reader-content w-full h-full">
            <!-- Header bar with resource info and actions -->
            <header class="reader-header border-bottom-1 surface-border bg-white p-3 flex align-items-center justify-content-between sticky top-0 z-5 shadow-1">
                <div class="flex align-items-center">
                    <Button icon="pi pi-arrow-left" text rounded class="mr-2" @click="goBack" />
                    <div class="resource-info">
                        <h2 class="text-lg font-medium m-0">{{ resource.title }}</h2>
                        <p class="text-sm text-color-secondary m-0">{{ resource.author }}</p>
                    </div>
                </div>

                <div class="reader-actions flex gap-2">
                    <Button icon="pi pi-bookmark" :class="{ 'p-button-outlined': resource.bookmarked }" text rounded @click="toggleBookmark" tooltip="Bookmark" tooltipOptions="{ position: 'bottom' }" />
                    <Button icon="pi pi-pencil" text rounded @click="addNote" tooltip="Add Note" tooltipOptions="{ position: 'bottom' }" />
                    <Button icon="pi pi-download" text rounded @click="downloadResource" tooltip="Download" tooltipOptions="{ position: 'bottom' }" />
                    <Button :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" text rounded @click="toggleDarkMode" :tooltip="isDarkMode ? 'Light Mode' : 'Dark Mode'" tooltipOptions="{ position: 'bottom' }" />
                </div>
            </header>

            <!-- PDF Viewer -->
            <div v-if="isPdfResource" :class="['pdf-viewer-container', { 'dark-mode': isDarkMode }]" ref="pdfContainer">
                <PDFReader :resourceUrl="resource.url" :darkMode="isDarkMode" @page-change="handlePageChange" @loading-error="handleLoadingError" @document-loaded="handleDocumentLoaded" />
            </div>

            <!-- Video Player -->
            <div v-else-if="isVideoResource" class="video-player-container p-3">
                <div class="video-container border-round overflow-hidden shadow-2 w-full">
                    <VideoPlayer :resourceUrl="resource.url" :resourceType="resource.type" @loading-error="handleLoadingError" @video-loaded="handleVideoLoaded" />
                </div>
            </div>

            <!-- Ebook Reader -->
            <div v-else-if="isEbookResource" :class="['ebook-reader-container', { 'dark-mode': isDarkMode }]">
                <EbookReader :resourceUrl="resource.url" :darkMode="isDarkMode" @page-change="handlePageChange" @loading-error="handleLoadingError" @book-loaded="handleBookLoaded" />
            </div>

            <!-- Audio Player -->
            <div v-else-if="isAudioResource" class="audio-player-container p-3 flex flex-column align-items-center">
                <div class="audio-cover-art mb-4 mt-4">
                    <img :src="resource.coverUrl || getDefaultCoverForType('audio')" :alt="resource.title" class="w-full shadow-2 border-round" style="max-width: 300px; height: auto" />
                </div>
                <div class="audio-container w-full max-w-30rem">
                    <AudioPlayer :resourceUrl="resource.url" @loading-error="handleLoadingError" @audio-loaded="handleAudioLoaded" />
                </div>
            </div>

            <!-- Unsupported resource type -->
            <div v-else class="unsupported-container p-5 flex flex-column align-items-center justify-content-center">
                <i class="pi pi-file text-6xl text-color-secondary mb-3"></i>
                <h3 class="text-xl mb-3">Unsupported Resource Type</h3>
                <p class="text-color-secondary text-center mb-3">This resource type ({{ resource.type }}) cannot be viewed directly in the browser.</p>
                <Button label="Download Instead" icon="pi pi-download" @click="downloadResource" />
            </div>
        </div>

        <!-- Add Note Dialog -->
        <Dialog v-model:visible="showNoteDialog" :header="`Add Note${currentPage ? ' - Page ' + currentPage : ''}`" :style="{ width: '450px' }" modal>
            <div class="p-fluid">
                <div class="field">
                    <Textarea v-model="noteText" rows="5" placeholder="Add your notes here..." autoResize />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="cancelNote" text />
                <Button label="Save" icon="pi pi-check" @click="saveNote" :disabled="!noteText.trim()" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// These components would be created as separate files
const PDFReader = defineAsyncComponent(() => import('@/components/reader/PDFReader.vue'));
const VideoPlayer = defineAsyncComponent(() => import('@/components/reader/VideoPlayer.vue'));
const EbookReader = defineAsyncComponent(() => import('@/components/reader/EbookReader.vue'));
const AudioPlayer = defineAsyncComponent(() => import('@/components/reader/AudioPlayer.vue'));

const route = useRoute();
const router = useRouter();
const toast = useToast();

// State
const resource = ref(null);
const loading = ref(true);
const error = ref(null);
const isDarkMode = ref(false);
const showNoteDialog = ref(false);
const noteText = ref('');
const currentPage = ref(null);

// Computed properties to determine resource type
const isPdfResource = computed(() => resource.value?.type === 'pdf' || resource.value?.fileExtension?.toLowerCase() === 'pdf');

const isVideoResource = computed(() => resource.value?.type === 'video' || ['mp4', 'webm', 'ogg'].includes(resource.value?.fileExtension?.toLowerCase()));

const isEbookResource = computed(() => resource.value?.type === 'ebook' || ['epub', 'mobi'].includes(resource.value?.fileExtension?.toLowerCase()));

const isAudioResource = computed(() => resource.value?.type === 'audio' || ['mp3', 'wav', 'ogg', 'aac'].includes(resource.value?.fileExtension?.toLowerCase()));

// Fetch resource data
onMounted(async () => {
    try {
        loading.value = true;
        const resourceId = route.params.id;

        // In a real application, fetch data from API
        // For now, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API delay

        // Mock data based on resource type in the route
        const resourceType = route.query.type || 'pdf';

        resource.value = {
            id: resourceId,
            title: `Sample ${resourceType.toUpperCase()} Resource`,
            author: 'Author Name',
            type: resourceType,
            url: getMockUrlForType(resourceType, resourceId),
            coverUrl: null,
            bookmarked: false,
            fileExtension: resourceType
        };

        // Check for dark mode preference
        const savedDarkMode = localStorage.getItem('reader-dark-mode');
        if (savedDarkMode) {
            isDarkMode.value = savedDarkMode === 'true';
        }

        loading.value = false;
    } catch (err) {
        console.error('Failed to load resource:', err);
        error.value = 'Failed to load the requested resource. Please try again later.';
        loading.value = false;
    }
});

// Helper function to get mock URLs based on resource type
const getMockUrlForType = (type, id) => {
    switch (type) {
        case 'pdf':
            // Using a sample PDF URL
            return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        case 'video':
            // Sample video URL
            return 'https://www.w3schools.com/html/mov_bbb.mp4';
        case 'ebook':
            // Sample EPUB URL (in a real app you'd have an actual EPUB file)
            return `/api/resources/ebook/${id}`;
        case 'audio':
            // Sample audio URL
            return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        default:
            return '#';
    }
};

// Helper to get default cover image
const getDefaultCoverForType = (type) => {
    switch (type) {
        case 'pdf':
            return 'https://via.placeholder.com/300x400?text=PDF+Document';
        case 'video':
            return 'https://via.placeholder.com/300x200?text=Video';
        case 'audio':
            return 'https://via.placeholder.com/300x300?text=Audio';
        case 'ebook':
            return 'https://via.placeholder.com/300x450?text=E-Book';
        default:
            return 'https://via.placeholder.com/300x300?text=Resource';
    }
};

// Actions
const goBack = () => {
    router.back();
};

const toggleBookmark = () => {
    if (resource.value) {
        resource.value.bookmarked = !resource.value.bookmarked;

        // Show appropriate toast notification
        if (resource.value.bookmarked) {
            toast.add({
                severity: 'success',
                summary: 'Bookmark Added',
                detail: 'This resource has been added to your bookmarks',
                life: 3000
            });
        } else {
            toast.add({
                severity: 'info',
                summary: 'Bookmark Removed',
                detail: 'This resource has been removed from your bookmarks',
                life: 3000
            });
        }

        // In a real app, save this to user preferences/API
        // saveBookmarkToAPI(resource.value.id, resource.value.bookmarked);
    }
};

const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem('reader-dark-mode', isDarkMode.value);
};

const downloadResource = () => {
    // In a real app, start the download
    console.log(`Downloading resource: ${resource.value?.title}`);

    // For demonstration, let's just show a toast
    // Assume you have a toast service or component
    // toast.add({ severity: 'info', summary: 'Download Started', detail: 'Your download will begin shortly', life: 3000 });
};

const addNote = () => {
    noteText.value = '';
    showNoteDialog.value = true;
};

const saveNote = () => {
    if (!noteText.value.trim()) return;

    // Create the note object
    const noteData = {
        resourceId: resource.value?.id,
        resourceTitle: resource.value?.title,
        resourceAuthor: resource.value?.author,
        resourceType: resource.value?.type,
        content: noteText.value,
        dateCreated: new Date(),
        location: getLocationData(),
        tags: []
    };

    // In a real app, save the note to the backend
    console.log('Saving note:', noteData);

    // Reset and close dialog
    showNoteDialog.value = false;
    noteText.value = '';

    // Show confirmation toast
    toast.add({
        severity: 'success',
        summary: 'Note Saved',
        detail: 'Your note has been saved and can be viewed in My Notes',
        life: 3000
    });
};

// Helper function to get location data based on resource type
const getLocationData = () => {
    if (isPdfResource.value && currentPage.value) {
        return { page: currentPage.value };
    } else if (isVideoResource.value) {
        // Assuming we have a videoTime ref that tracks current video position
        // return { timestamp: formatTime(videoTime.value) };
        return { timestamp: '00:00' };
    } else if (isEbookResource.value) {
        // Assuming we track chapter and position
        // return { chapter: currentChapter.value, position: currentPosition.value };
        return { chapter: 1, position: 0 };
    } else if (isAudioResource.value) {
        // Assuming we have an audioTime ref that tracks current audio position
        // return { timestamp: formatTime(audioTime.value) };
        return { timestamp: '00:00' };
    }
    return null;
};

const cancelNote = () => {
    showNoteDialog.value = false;
    noteText.value = '';
};

// Event handlers from the child components
const handlePageChange = (page) => {
    currentPage.value = page;
    // Could track reading progress here
};

const handleLoadingError = (errorMessage) => {
    error.value = errorMessage || 'Failed to load resource';
};

const handleDocumentLoaded = (documentInfo) => {
    console.log('PDF document loaded:', documentInfo);
    // Could update resource metadata here
};

const handleVideoLoaded = (videoInfo) => {
    console.log('Video loaded:', videoInfo);
};

const handleBookLoaded = (bookInfo) => {
    console.log('Ebook loaded:', bookInfo);
};

const handleAudioLoaded = (audioInfo) => {
    console.log('Audio loaded:', audioInfo);
};
</script>

<style scoped>
.reader-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.reader-header {
    height: 60px;
    min-height: 60px;
}

.reader-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
}

.pdf-viewer-container,
.ebook-reader-container,
.video-player-container,
.audio-player-container,
.unsupported-container {
    flex: 1;
    overflow: auto;
}

.dark-mode {
    background-color: #262626;
    color: #f0f0f0;
}

/* Handle small screens */
@media (max-width: 640px) {
    .reader-header {
        padding: 0.5rem;
    }

    .resource-info {
        max-width: 180px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .reader-actions {
        gap: 0.25rem;
    }
}
</style>
