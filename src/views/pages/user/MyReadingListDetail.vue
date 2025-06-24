<script setup>
import CollectionModal from '@/components/modals/CollectionModal.vue';
import axiosInstance from '@/util/axios-config';
import Header from '@/views/pages/home/Header.vue';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const collection = ref(null);
const ebooksFirst = ref(0);
const ebooksPerPage = ref(9);

// Filtering options to match ReadingListDetail.vue
const filters = ref({
    type: 'all', // 'all', 'pdf', 'video', or 'audio'
    downloadable: 'all' // 'all', 'yes', 'no'
});

// Filtered ebooks
const filteredEbooks = computed(() => {
    if (!collection.value || !collection.value.ebooks) return [];

    let result = [...collection.value.ebooks];

    // Filter by type
    if (filters.value.type !== 'all') {
        result = result.filter((ebook) => ebook.e_book_type?.name?.toLowerCase() === filters.value.type.toLowerCase());
    }

    // Filter by downloadable status
    if (filters.value.downloadable !== 'all') {
        const isDownloadable = filters.value.downloadable === 'yes';
        result = result.filter((ebook) => ebook.is_downloadable === isDownloadable);
    }

    return result;
});

const paginatedEbooks = computed(() => {
    return filteredEbooks.value.slice(ebooksFirst.value, ebooksFirst.value + ebooksPerPage.value);
});

const fetchCollection = async () => {
    loading.value = true;
    try {
        const response = await axiosInstance.get(`/my-collections/${route.params.id}`, {
            params: {
                with: 'user,ebooks,ebooks.e_book_type'
            }
        });
        collection.value = response.data.data;
    } catch (error) {
        console.error('Error fetching collection:', error);
        collection.value = null;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchCollection();
});

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const goBack = () => {
    router.back();
};

const onEbooksPageChange = (event) => {
    ebooksFirst.value = event.first;
    ebooksPerPage.value = event.rows;
};

// Helper functions to match ReadingListDetail.vue pattern
const isVideoType = (ebook) => {
    const type = ebook.e_book_type?.name?.toLowerCase() || '';
    return type.includes('video');
};

const isPdfType = (ebook) => {
    const type = ebook.e_book_type?.name?.toLowerCase() || '';
    return type.includes('pdf');
};

const getResourceTypeIcon = (ebook) => {
    const type = ebook.e_book_type?.name?.toLowerCase() || '';
    if (type.includes('pdf')) {
        return 'pi pi-file-pdf';
    } else if (type.includes('video')) {
        return 'pi pi-video';
    } else if (type.includes('audio')) {
        return 'pi pi-volume-up';
    } else {
        return 'pi pi-file';
    }
};

const getResourceTitle = (ebook) => {
    return ebook.file_name || ebook.title || 'Untitled Resource';
};

const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return 'Unknown size';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Get collection gradient based on content types (from ReadingLists.vue)
const getCollectionGradient = (collection) => {
    const hasPdf = collection.ebooks_count?.by_type?.pdf > 0;
    const hasVideo = collection.ebooks_count?.by_type?.video > 0;

    if (hasPdf && hasVideo) {
        return 'bg-gradient-to-br from-red-100 via-purple-100 to-blue-100';
    } else if (hasPdf) {
        return 'bg-gradient-to-br from-red-100 to-orange-100';
    } else if (hasVideo) {
        return 'bg-gradient-to-br from-blue-100 to-indigo-100';
    } else {
        return 'bg-gradient-to-br from-purple-100 to-blue-100';
    }
};

// Get category icon (from ReadingLists.vue)
const getCategoryIcon = (listName) => {
    const name = listName.toLowerCase();
    if (name.includes('science')) return 'pi pi-star';
    if (name.includes('math')) return 'pi pi-calculator';
    if (name.includes('literature') || name.includes('english')) return 'pi pi-book';
    if (name.includes('history')) return 'pi pi-clock';
    if (name.includes('programming') || name.includes('code')) return 'pi pi-code';
    if (name.includes('art')) return 'pi pi-palette';
    if (name.includes('music')) return 'pi pi-volume-up';
    return 'pi pi-bookmark';
};

// Get collection description (from ReadingLists.vue)
const getCollectionDescription = (collection) => {
    if (collection.description) {
        return collection.description;
    }

    const itemCount = collection.ebooks?.length || collection.ebooks_count?.total || 0;
    const descriptions = [
        `A curated collection of ${itemCount} educational resources designed to enhance your learning experience.`,
        `Discover ${itemCount} carefully selected learning materials organized for optimal educational outcomes.`,
        `Explore ${itemCount} handpicked educational content tailored to provide comprehensive learning.`,
        `Access ${itemCount} premium learning resources compiled to support your academic journey.`
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// Get YouTube embed URL from file_path
const getYoutubeEmbedUrl = (ebook) => {
    if (!ebook || !ebook.file_path) return null;

    const videoId = getYoutubeVideoId(ebook.file_path);
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }

    // If we couldn't extract a video ID but it's still a video type,
    // try to use the URL directly as it might be an embed URL already
    if (isVideoType(ebook)) {
        return ebook.file_path;
    }

    return null;
};

// Extract YouTube video ID from a URL
const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

// Open in Reader function - exactly like ReadingListDetail.vue
const openInReader = (ebook) => {
    // Get the video ID for YouTube videos
    if (isVideoType(ebook)) {
        const videoId = getYoutubeVideoId(ebook.file_path);
        if (videoId) {
            // Navigate to the reader with the ebook ID as the main path parameter
            router.push({
                path: `/reader/${ebook.id}`,
                query: {
                    type: 'video',
                    videoId: videoId
                }
            });
        } else {
            // Fallback to opening in a new tab if we can't extract a video ID
            window.open(ebook.file_path, '_blank');
            toast.add({
                severity: 'info',
                summary: 'External Link',
                detail: 'Opening video in a new tab',
                life: 3000
            });
        }
        return;
    }
    // Navigate to reader view for PDFs
    router.push({
        path: `/reader/${ebook.id}`,
        query: {
            type: 'pdf',
            source: encodeURIComponent(ebook.file_path.replace(/\\\//g, '/'))
        }
    });
};

// Download file function - similar to ReadingListDetail.vue
const downloadFile = (ebook) => {
    if (!ebook.file_path || !ebook.is_downloadable) {
        toast.add({
            severity: 'error',
            summary: 'Download Failed',
            detail: 'This file is not available for download',
            life: 3000
        });
        return;
    }

    // Create a file name for download
    const fileName = ebook.file_name || ebook.title || `file-${ebook.id}`;

    // Create a temporary anchor element to trigger download
    const a = document.createElement('a');
    a.href = ebook.file_path;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.add({
        severity: 'success',
        summary: 'Download Started',
        detail: 'Your file download has started',
        life: 3000
    });
};

// Reset filters
const resetFilters = () => {
    filters.value = {
        type: 'all',
        downloadable: 'all'
    };
    ebooksFirst.value = 0; // Reset to first page when filtering
};

// Apply filter changes
const applyFilters = () => {
    ebooksFirst.value = 0; // Reset to first page when filtering
};

// Inline bookmark logic
const bookmarkEbook = async (ebook) => {
    if (!ebook || !ebook.id) return;
    // If already bookmarked, remove bookmark
    if (isEbookBookmarked(ebook)) {
        try {
            await axiosInstance.delete(`/bookmarks/by-ebook/${ebook.id}`);
            toast.add({
                severity: 'success',
                summary: 'Bookmark Removed',
                detail: 'Bookmark removed successfully',
                life: 3000
            });
            ebook.bookmarks = null;
        } catch (err) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err.response?.data?.message || 'Failed to remove bookmark',
                life: 4000
            });
        }
    } else {
        // Not bookmarked, so add bookmark
        try {
            const response = await axiosInstance.post('/bookmarks', { e_book_id: ebook.id });
            toast.add({
                severity: 'success',
                summary: 'Bookmarked',
                detail: 'Ebook bookmarked successfully',
                life: 3000
            });
            // Set bookmark on ebook object (use response if available)
            if (response.data && response.data.bookmark && response.data.bookmark.id) {
                ebook.bookmarks = response.data.bookmark;
            } else {
                ebook.bookmarks = null;
            }
        } catch (err) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: err.response?.data?.message || 'Failed to bookmark',
                life: 4000
            });
        }
    }
};

// Check if an ebook is bookmarked by the user
const isEbookBookmarked = (ebook) => {
    return !!ebook.bookmarks;
};

// Check if an ebook is in any collection for the user
const isEbookInCollection = (ebook) => {
    return Array.isArray(ebook.collections) && ebook.collections.length > 0;
};

// Collection modal state
const collectionModalVisible = ref(false);
const selectedEbook = ref(null);

// Open collection modal for the selected ebook
const openCollectionModal = (ebook) => {
    selectedEbook.value = ebook;
    collectionModalVisible.value = true;
};
</script>
<template>
    <div class="card">
        <Header />
        <div class="bg-white">
            <!-- Fixed Page header with Udemy-style navigation -->
            <div class="fixed top-0 left-0 right-0 bg-gray-50 shadow-sm z-50 border-b border-gray-200">
                <div class="container mx-auto py-4 px-6 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <button @click="goBack" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <i class="pi pi-arrow-left text-gray-700 text-lg"></i>
                        </button>
                        <div class="flex items-center gap-3">
                            <h1 class="text-xl font-bold text-gray-900 truncate max-w-lg">{{ collection ? collection.name : 'Collection Details' }}</h1>
                            <span v-if="collection && collection.ebooks_count" class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium"> {{ collection.ebooks_count.total || collection.ebooks?.length || 0 }} resources </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <span v-if="collection && collection.user" class="text-gray-600 hidden md:block">by {{ collection.user.username }}</span>
                    </div>
                </div>
            </div>
            <div class="container mx-auto pt-28 pb-6 px-4">
                <!-- Loading state -->
                <div v-if="loading" class="flex justify-center items-center py-16">
                    <div class="flex flex-col items-center">
                        <i class="pi pi-spin pi-spinner text-3xl text-indigo-600 mb-4"></i>
                        <span class="text-gray-600">Loading collection details...</span>
                    </div>
                </div>
                <!-- Error state -->
                <div v-else-if="!collection && !loading" class="flex justify-center items-center py-16">
                    <div class="flex flex-col items-center">
                        <i class="pi pi-exclamation-circle text-3xl text-red-500 mb-4"></i>
                        <span class="text-gray-700 font-medium">Collection not found</span>
                        <button @click="fetchCollection" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Try Again</button>
                    </div>
                </div>
                <!-- Content when loaded -->
                <div v-else-if="collection" class="mb-8">
                    <!-- Collection Details Card - Udemy-style -->
                    <div class="mb-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 text-gray-800 rounded-xl p-8 shadow-lg border border-gray-200">
                        <div class="flex flex-col lg:flex-row gap-8 items-start">
                            <!-- Collection Cover/Icon -->
                            <div class="w-full lg:w-64 flex-shrink-0">
                                <div class="aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 flex items-center justify-center" :class="getCollectionGradient(collection)">
                                    <div class="flex flex-col items-center gap-4">
                                        <!-- Content type icons display -->
                                        <div class="flex items-center gap-3">
                                            <!-- PDF Icon -->
                                            <div v-if="collection.ebooks_count?.by_type?.pdf > 0" class="w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                                                <i class="pi pi-file-pdf text-xl text-red-500"></i>
                                            </div>
                                            <!-- Video Icon -->
                                            <div v-if="collection.ebooks_count?.by_type?.video > 0" class="w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                                                <i class="pi pi-video text-xl text-blue-500"></i>
                                            </div>
                                            <!-- Fallback category icon if no specific types -->
                                            <div
                                                v-if="!collection.ebooks_count?.by_type?.pdf && !collection.ebooks_count?.by_type?.video"
                                                class="w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg"
                                            >
                                                <i :class="getCategoryIcon(collection.name)" class="text-xl text-purple-600"></i>
                                            </div>
                                        </div>
                                        <!-- Content type breakdown badges -->
                                        <div class="flex flex-wrap gap-1.5 justify-center">
                                            <div v-if="collection.ebooks_count?.by_type?.pdf > 0" class="bg-red-500 bg-opacity-90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                                                <i class="pi pi-file-pdf text-xs"></i>
                                                <span>{{ collection.ebooks_count.by_type.pdf }}</span>
                                            </div>
                                            <div v-if="collection.ebooks_count?.by_type?.video > 0" class="bg-blue-500 bg-opacity-90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                                                <i class="pi pi-video text-xs"></i>
                                                <span>{{ collection.ebooks_count.by_type.video }}</span>
                                            </div>
                                            <div v-if="collection.ebooks_count?.downloadable > 0" class="bg-green-500 bg-opacity-90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                                                <i class="pi pi-download text-xs"></i>
                                                <span>{{ collection.ebooks_count.downloadable }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Collection Details -->
                            <div class="flex-grow">
                                <div class="mb-4">
                                    <span class="text-purple-600 text-sm font-medium bg-purple-100 px-3 py-1 rounded-full">Learning Collection</span>
                                </div>
                                <h2 class="text-3xl lg:text-4xl font-bold mb-4 leading-tight text-gray-900">{{ collection.name }}</h2>
                                <div class="flex items-center gap-6 text-lg mb-6">
                                    <span v-if="collection.user" class="flex items-center gap-2">
                                        <i class="pi pi-user text-gray-500"></i>
                                        <span class="text-gray-700">{{ collection.user.username }}</span>
                                    </span>
                                    <span class="flex items-center gap-2">
                                        <i class="pi pi-calendar text-gray-500"></i>
                                        <span class="text-gray-700">{{ formatDate(collection.created_at || new Date()) }}</span>
                                    </span>
                                </div>
                                <p class="text-lg text-gray-600 mb-6 leading-relaxed">
                                    {{ getCollectionDescription(collection) }}
                                </p>
                                <!-- Resource metadata as enhanced chips -->
                                <div class="flex flex-wrap gap-3 mb-6">
                                    <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200"> <i class="pi pi-folder mr-2 text-blue-600"></i>{{ collection.name }} </span>
                                    <span v-if="collection.ebooks_count?.total" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                                        <i class="pi pi-book mr-2 text-green-600"></i>{{ collection.ebooks_count.total }} Resources
                                    </span>
                                    <span v-if="collection.ebooks_count?.by_type?.pdf" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                                        <i class="pi pi-file-pdf mr-2 text-red-600"></i>{{ collection.ebooks_count.by_type.pdf }} PDFs
                                    </span>
                                    <span v-if="collection.ebooks_count?.by_type?.video" class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                        <i class="pi pi-video mr-2 text-purple-600"></i>{{ collection.ebooks_count.by_type.video }} Videos
                                    </span>
                                </div>
                                <!-- Stats counters in Udemy style -->
                                <div class="flex items-center gap-8 text-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-file text-gray-500"></i>
                                        <span class="font-semibold text-gray-800">{{ collection.ebooks?.length || 0 }}</span>
                                        <span class="text-gray-600">lessons</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-download text-gray-500"></i>
                                        <span class="font-semibold text-gray-800">{{ collection.ebooks_count?.downloadable || 0 }}</span>
                                        <span class="text-gray-600">downloadable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Filter section - Udemy-style -->
                    <div class="flex flex-wrap gap-4 mb-8 items-center justify-between bg-white p-4 rounded-lg border border-gray-200 sticky top-20 z-10 shadow-sm">
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-gray-900">Collection Content</h3>
                            <p class="text-gray-600 text-sm">{{ collection.ebooks?.length || 0 }} resources • {{ collection.ebooks_count?.downloadable || 0 }} downloadable</p>
                        </div>
                        <div class="flex flex-wrap gap-3">
                            <div class="flex items-center gap-2">
                                <label for="typeFilter" class="text-sm font-medium text-gray-700">Filter by type:</label>
                                <select id="typeFilter" v-model="filters.type" class="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" @change="applyFilters">
                                    <option value="all">All Types</option>
                                    <option value="pdf">PDF Documents</option>
                                    <option value="video">Video Lessons</option>
                                    <option value="audio">Audio Files</option>
                                </select>
                            </div>
                            <div class="flex items-center gap-2">
                                <label for="downloadableFilter" class="text-sm font-medium text-gray-700">Downloads:</label>
                                <select
                                    id="downloadableFilter"
                                    v-model="filters.downloadable"
                                    class="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    @change="applyFilters"
                                >
                                    <option value="all">All</option>
                                    <option value="yes">Downloadable</option>
                                    <option value="no">View Only</option>
                                </select>
                            </div>
                            <button @click="resetFilters" class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                                <i class="pi pi-refresh"></i>
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                    <!-- Resources Grid - Enhanced Udemy-style -->
                    <div v-if="filteredEbooks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div v-for="ebook in paginatedEbooks" :key="ebook.id" class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ebook-card border border-gray-200">
                            <!-- Media content (Video or PDF) at the top with no padding -->
                            <div v-if="isVideoType(ebook)" class="aspect-video bg-gray-100 video-thumbnail relative">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    :src="getYoutubeEmbedUrl(ebook) || 'https://www.youtube.com/embed/dQw4w9WgXcQ'"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen
                                    class="rounded-t-xl"
                                ></iframe>
                            </div>
                            <div v-else-if="isPdfType(ebook)" class="aspect-video bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200 overflow-hidden relative">
                                <div class="flex items-center justify-center h-full">
                                    <div class="text-center">
                                        <i class="pi pi-file-pdf text-red-500 text-4xl mb-2"></i>
                                        <p class="text-red-600 font-medium text-sm">PDF Document</p>
                                    </div>
                                </div>
                                <!-- PDF overlay -->
                                <div class="absolute top-3 left-3">
                                    <span class="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">PDF</span>
                                </div>
                            </div>
                            <!-- Content section below the media -->
                            <div class="p-4">
                                <!-- Header with type badge and action buttons -->
                                <div class="flex justify-between items-start mb-3">
                                    <div class="flex flex-wrap gap-2">
                                        <span class="text-xs font-semibold text-gray-500 flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
                                            <i :class="getResourceTypeIcon(ebook)" class="text-gray-600"></i>
                                            {{ ebook.e_book_type ? ebook.e_book_type.name : 'File' }}
                                        </span>
                                        <span v-if="ebook.is_downloadable" class="text-xs text-white font-semibold bg-green-500 px-2 py-1 rounded-full">Downloadable</span>
                                        <span v-else class="text-xs text-white font-semibold bg-orange-500 px-2 py-1 rounded-full">View Only</span>
                                    </div>

                                    <!-- Collection Action Buttons -->
                                    <div class="flex items-center gap-1 ml-2">
                                        <!-- Bookmark Button -->
                                        <button
                                            @click="bookmarkEbook(ebook)"
                                            :class="[
                                                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                                                isEbookBookmarked(ebook) ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-yellow-600'
                                            ]"
                                            :title="isEbookBookmarked(ebook) ? 'Remove bookmark' : 'Add bookmark'"
                                        >
                                            <i :class="['text-sm', isEbookBookmarked(ebook) ? 'pi pi-bookmark-fill' : 'pi pi-bookmark']"></i>
                                        </button>
                                        <!-- Collection Button -->
                                        <button
                                            @click="openCollectionModal(ebook)"
                                            :class="[
                                                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                                                isEbookInCollection(ebook) ? 'bg-purple-100 hover:bg-purple-200 text-purple-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-purple-600'
                                            ]"
                                            :title="isEbookInCollection(ebook) ? 'In collection' : 'Add to collection'"
                                        >
                                            <i :class="['text-sm', isEbookInCollection(ebook) ? 'pi pi-folder-open' : 'pi pi-folder']"></i>
                                        </button>
                                    </div>
                                </div>
                                <!-- Title - larger and truncated -->
                                <h4 class="font-semibold text-gray-900 text-base mb-2 line-clamp-2 leading-tight">{{ getResourceTitle(ebook) }}</h4>
                                <!-- Metadata with larger text -->
                                <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                                    <span class="font-medium">{{ formatFileSize(ebook.file_size_mb * 1024 * 1024) }}</span>
                                    <span v-if="ebook.pages" class="flex items-center font-medium">
                                        <i class="pi pi-file-o mr-1"></i>
                                        {{ ebook.pages }} pages
                                    </span>
                                </div>
                                <!-- Action buttons with larger text -->
                                <div class="space-y-2">
                                    <button @click="openInReader(ebook)" class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-semibold">
                                        <i class="pi pi-play-circle"></i>
                                        <span>{{ isVideoType(ebook) ? 'Watch Now' : 'Read Now' }}</span>
                                    </button>
                                    <button
                                        v-if="ebook.is_downloadable && ebook.file_path && !isVideoType(ebook)"
                                        @click="downloadFile(ebook)"
                                        class="w-full py-2 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium"
                                    >
                                        <i class="pi pi-download"></i>
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Empty filtered state -->
                    <div v-else-if="collection.ebooks && collection.ebooks.length > 0" class="flex justify-center items-center py-16">
                        <div class="flex flex-col items-center">
                            <i class="pi pi-filter text-3xl text-gray-400 mb-4"></i>
                            <span class="text-gray-700 font-medium">No resources match your filters</span>
                            <button @click="resetFilters" class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Clear Filters</button>
                        </div>
                    </div>
                    <!-- Pagination -->
                    <div v-if="filteredEbooks.length > ebooksPerPage" class="mt-8 flex justify-center paginator-container">
                        <Paginator
                            :rows="ebooksPerPage"
                            :totalRecords="filteredEbooks.length"
                            v-model:first="ebooksFirst"
                            :rowsPerPageOptions="[9, 15, 24, 30]"
                            @page="onEbooksPageChange($event)"
                            class="border-none"
                            :template="{
                                '640px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown',
                                '960px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
                                '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport'
                            }"
                            currentPageReportTemplate="{first} to {last} of {totalRecords}"
                            alwaysShow="true"
                        />
                    </div>
                </div>
                <!-- No ebooks found state -->
                <div v-else-if="collection && collection.ebooks && collection.ebooks.length === 0" class="flex justify-center items-center py-16">
                    <div class="flex flex-col items-center">
                        <i class="pi pi-info-circle text-3xl text-blue-500 mb-4"></i>
                        <span class="text-gray-700 font-medium">No resources found in this collection</span>
                        <p class="text-gray-600 text-sm mt-2">This collection is currently empty.</p>
                    </div>
                </div>
            </div>

            <!-- Modals -->
            <CollectionModal v-model:visible="collectionModalVisible" :ebook="selectedEbook" />
        </div>
    </div>
</template>
<style scoped>
.text-shadow-sm {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* YouTube-inspired styling */
.ebook-card {
    transition: all 0.2s ease;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.ebook-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ebook-card h4 {
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.4;
    margin-bottom: 4px;
    color: #0f0f0f;
}

.video-thumbnail {
    position: relative;
    background-color: #0f0f0f;
    display: block;
    cursor: pointer;
}

.video-thumbnail::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.05);
    pointer-events: none;
}

.paginator-container :deep(.p-paginator) {
    background-color: transparent;
    border: none;
}

.paginator-container :deep(.p-paginator-page.p-highlight) {
    background-color: #f3f4f6;
    color: #4f46e5;
}

.paginator-container :deep(.p-paginator-page) {
    min-width: 2.5rem;
    height: 2.5rem;
}

/* YouTube-specific header and details styling */
.fixed {
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.98);
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
}
</style>
