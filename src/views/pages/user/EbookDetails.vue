<template>
    <div class="bg-white">
        <!-- Fixed Page header -->
        <div class="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-gray-200">
            <div class="container mx-auto py-3 px-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <button @click="$router.back()" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <i class="pi pi-arrow-left text-gray-700 text-lg"></i>
                    </button>
                    <h1 class="text-xl font-bold text-gray-900 truncate max-w-lg">{{ bookItem ? bookItem.title : 'Digital Resource Details' }}</h1>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-base text-gray-600">{{ bookItem ? bookItem.author : '' }}</span>
                </div>
            </div>
        </div>
        <div class="container mx-auto pt-28 pb-6 px-4">
            <!-- Loading state -->
            <div v-if="loading" class="flex justify-center items-center py-16">
                <div class="flex flex-col items-center">
                    <i class="pi pi-spin pi-spinner text-3xl text-indigo-600 mb-4"></i>
                    <span class="text-gray-600">Loading resource details...</span>
                </div>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="flex justify-center items-center py-16">
                <div class="flex flex-col items-center">
                    <i class="pi pi-exclamation-circle text-3xl text-red-500 mb-4"></i>
                    <span class="text-gray-700 font-medium">{{ error }}</span>
                    <button @click="fetchEbooks" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Try Again</button>
                </div>
            </div>

            <!-- Content when loaded -->
            <div v-else-if="bookItem && ebooks.length > 0" class="mb-8">
                <!-- Book Item Details Card - YouTube-style -->
                <div class="mb-8 flex flex-col md:flex-row gap-6 items-start">
                    <!-- Book Cover Image -->
                    <div class="w-full md:w-56 flex-shrink-0">
                        <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                :src="bookItem.cover_image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'"
                                :alt="bookItem.title"
                                class="w-full h-full object-cover"
                                @error="(e) => (e.target.src = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')"
                            />
                        </div>
                    </div>

                    <!-- Book Details -->
                    <div class="flex-grow">
                        <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ bookItem.title }}</h2>
                        <div class="flex items-center gap-3 text-base text-gray-500 mb-3">
                            <span v-if="bookItem.author" class="flex items-center gap-1">
                                <i class="pi pi-user text-sm"></i>
                                {{ bookItem.author }}
                            </span>
                            <span class="flex items-center gap-1">
                                <i class="pi pi-calendar text-sm"></i>
                                {{ formatDate(bookItem.created_at || new Date()) }}
                            </span>
                        </div>

                        <p class="text-base text-gray-700 mb-4 line-clamp-2">{{ bookItem.description || 'No description available for this resource.' }}</p>

                        <!-- Resource metadata as chips -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            <span v-if="bookItem.category" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"> <i class="pi pi-folder mr-1 text-gray-500"></i>{{ bookItem.category.name }} </span>
                            <span v-if="bookItem.subject" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"> <i class="pi pi-book mr-1 text-gray-500"></i>{{ bookItem.subject.name }} </span>
                            <span v-if="bookItem.grade" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"> <i class="pi pi-chart-bar mr-1 text-gray-500"></i>Grade {{ bookItem.grade.name }} </span>
                        </div>

                        <!-- Stats counters in YouTube style -->
                        <div class="flex items-center gap-6 text-base text-gray-700">
                            <div class="flex items-center gap-1.5">
                                <i class="pi pi-file text-gray-500"></i>
                                <span>{{ ebooks.length }} files</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <i class="pi pi-download text-gray-500"></i>
                                <span>{{ downloadableCount }} downloadable</span>
                            </div>
                            <div v-if="bookItem.language" class="flex items-center gap-1.5">
                                <i class="pi pi-globe text-gray-500"></i>
                                <span>{{ bookItem.language.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filter section -->
                <div class="flex flex-wrap gap-4 mb-6 items-center justify-between bg-gray-50 p-3 rounded-lg sticky top-16 z-10">
                    <div class="flex-1">
                        <h3 class="text-lg font-medium text-gray-900">Available Digital Resources</h3>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        <div class="flex items-center gap-2">
                            <label for="typeFilter" class="text-base text-gray-600">Type:</label>
                            <select id="typeFilter" v-model="filters.type" class="border border-gray-300 rounded-md text-base px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" @change="applyFilters">
                                <option value="all">All Types</option>
                                <option value="pdf">PDF</option>
                                <option value="video">Video</option>
                                <option value="audio">Audio</option>
                            </select>
                        </div>
                        <div class="flex items-center gap-2">
                            <label for="downloadableFilter" class="text-base text-gray-600">Downloadable:</label>
                            <select id="downloadableFilter" v-model="filters.downloadable" class="border border-gray-300 rounded-md text-base px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" @change="applyFilters">
                                <option value="all">All</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <button @click="resetFilters" class="px-3 py-1.5 text-base bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-1">
                            <i class="pi pi-refresh"></i>
                            <span>Reset</span>
                        </button>
                    </div>
                </div>

                <!-- Ebooks Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                    <div v-for="ebook in filteredEbooks" :key="ebook.id" class="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ebook-card">
                        <!-- Media content (Video or PDF) at the top with no padding -->
                        <div v-if="isYoutubeVideo(ebook)" class="aspect-video bg-gray-100 video-thumbnail">
                            <iframe
                                width="100%"
                                height="100%"
                                :src="getYoutubeEmbedUrl(ebook) || 'https://www.youtube.com/embed/dQw4w9WgXcQ'"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                class="rounded-t"
                            ></iframe>
                        </div>

                        <div v-else-if="isPdfFile(ebook)" class="aspect-video bg-gray-50 border-b border-gray-200 overflow-hidden">
                            <div class="flex items-center justify-center h-full">
                                <img src="https://www.iconpacks.net/icons/2/free-pdf-icon-2608-thumb.png" :alt="ebook.file_name" class="h-full object-contain" />
                            </div>
                        </div>

                        <!-- Content section below the media -->
                        <div class="p-3">
                            <!-- Type badge and downloadable badge -->
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs font-medium text-gray-500 flex items-center gap-1">
                                    <i :class="getEbookTypeIcon(ebook)" class="text-gray-700"></i>
                                    {{ ebook.e_book_type ? ebook.e_book_type.name : 'File' }}
                                </span>
                                <span v-if="ebook.is_downloadable" class="text-xs text-green-600 font-medium">Downloadable</span>
                                <span v-else class="text-xs text-red-600 font-medium">View Only</span>
                            </div>

                            <!-- Title - larger and truncated -->
                            <h4 class="font-medium text-gray-900 text-base mb-1 line-clamp-1">{{ ebook.file_name || 'Untitled File' }}</h4>

                            <!-- Metadata with larger text -->
                            <div class="flex justify-between items-center text-sm text-gray-500 mb-2">
                                <span>{{ formatFileSize(ebook.file_size_mb * 1024 * 1024) }}</span>
                                <span v-if="ebook.pages" class="flex items-center">
                                    <i class="pi pi-file-o mr-1"></i>
                                    {{ ebook.pages }} pages
                                </span>
                            </div>

                            <!-- Action buttons with larger text -->
                            <div class="flex items-center gap-2">
                                <button
                                    v-if="ebook.is_downloadable && ebook.file_path && !isYoutubeVideo(ebook)"
                                    @click="downloadFile(ebook)"
                                    class="flex-1 py-2 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full flex items-center justify-center gap-1 transition-all text-sm"
                                >
                                    <i class="pi pi-download"></i>
                                    <span>Download</span>
                                </button>

                                <button
                                    v-if="canViewInReader(ebook) || isYoutubeVideo(ebook)"
                                    @click="openInReader(ebook)"
                                    class="flex-1 py-2 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full flex items-center justify-center gap-1 transition-all text-sm"
                                >
                                    <i class="pi pi-eye"></i>
                                    <span>{{ isYoutubeVideo(ebook) ? 'View' : 'Read' }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="mt-8 flex justify-center paginator-container">
                    <Paginator
                        :rows="resourcesPerPage"
                        :totalRecords="totalRecords"
                        v-model:first="first"
                        :rowsPerPageOptions="[9, 15, 24, 30]"
                        @page="onPageChange($event)"
                        class="border-none"
                        :loading="loading"
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
            <div v-else-if="bookItem && !loading" class="flex justify-center items-center py-16">
                <div class="flex flex-col items-center">
                    <i class="pi pi-info-circle text-3xl text-blue-500 mb-4"></i>
                    <span class="text-gray-700 font-medium">No digital resources found for this item</span>
                    <p class="text-gray-600 text-sm mt-2">This book may not have any associated digital files.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// State
const loading = ref(true);
const error = ref(null);
const bookItem = ref(null);
const ebooks = ref([]);
const totalRecords = ref(0);
const first = ref(0);
const resourcesPerPage = ref(15);

// Filtering options
const filters = ref({
    type: 'all', // 'all', 'pdf', 'video', or 'audio'
    downloadable: 'all' // 'all', 'yes', 'no'
});

// Get the book item ID from the route params
const bookItemId = computed(() => route.params.id);

// Filtered ebooks
const filteredEbooks = computed(() => {
    let result = [...ebooks.value];

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

// Computed properties
const downloadableCount = computed(() => {
    return ebooks.value.filter((ebook) => ebook.is_downloadable).length;
});

// Fetch ebooks on component mount
onMounted(() => {
    if (bookItemId.value) {
        fetchEbooks();
    } else {
        error.value = 'No resource ID provided';
        loading.value = false;
    }
});

// Fetch ebooks from API
const fetchEbooks = async () => {
    loading.value = true;
    error.value = null;

    try {
        // Calculate current page from first and rows per page
        const currentPage = Math.floor(first.value / resourcesPerPage.value) + 1;

        const response = await axiosInstance.get(`/ebooks`, {
            params: {
                book_item_id: bookItemId.value,
                with: 'bookItem,ebookType',
                page: currentPage,
                per_page: resourcesPerPage.value
            }
        });

        if (response.data && response.data.data) {
            ebooks.value = response.data.data;

            // Update pagination information
            if (response.data.pagination) {
                totalRecords.value = response.data.pagination.total;
            }

            // Get book item details from the first ebook if available
            if (ebooks.value.length > 0 && ebooks.value[0].book_item) {
                bookItem.value = ebooks.value[0].book_item;
            } else {
                // Fetch book item details separately if not included in ebooks
                await fetchBookItemDetails();
            }
        } else {
            // Fetch book item details even if no ebooks found
            await fetchBookItemDetails();
        }
    } catch (err) {
        console.error('Error fetching ebooks:', err);
        error.value = 'Failed to load digital resources. Please try again.';
    } finally {
        loading.value = false;
    }
};

// Fetch book item details separately if needed
const fetchBookItemDetails = async () => {
    try {
        const response = await axiosInstance.get(`/book-items/${bookItemId.value}`);
        if (response.data && response.data.data) {
            bookItem.value = response.data.data;
        } else {
            error.value = 'Book information not found';
        }
    } catch (err) {
        console.error('Error fetching book item details:', err);
        error.value = 'Failed to load book information';
    }
};

// Helper functions for ebook display
const getEbookTypeColors = (ebook) => {
    const type = ebook.e_book_type?.name?.toLowerCase() || '';

    if (type.includes('pdf')) {
        return 'from-orange-50 to-orange-100 border-l-4 border-orange-400';
    } else if (type.includes('video')) {
        return 'from-blue-50 to-blue-100 border-l-4 border-blue-400';
    } else if (type.includes('audio')) {
        return 'from-emerald-50 to-emerald-100 border-l-4 border-emerald-400';
    } else {
        return 'from-gray-50 to-gray-100 border-l-4 border-gray-400';
    }
};

const getEbookTypeIcon = (ebook) => {
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

const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString();
};

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

const canViewInReader = (ebook) => {
    const type = ebook.e_book_type?.name?.toLowerCase() || '';
    // Only PDFs can be viewed in the reader, videos are displayed inline
    return type.includes('pdf');
};

const isYoutubeVideo = (ebook) => {
    const type = ebook.e_book_type?.name?.toLowerCase() || '';
    return type.includes('video');
};

// Check if an ebook is a PDF file
const isPdfFile = (ebook) => {
    const type = ebook.e_book_type?.name?.toLowerCase() || '';
    return type.includes('pdf');
};

// Get PDF thumbnail URL (first page of PDF)
const getPdfThumbnailUrl = (ebook) => {
    // If there's a thumbnail URL in the API response, use it
    if (ebook.thumbnail_url) return ebook.thumbnail_url;

    // Otherwise use the PDF itself (some browsers can show first page)
    // Or use a generic PDF icon for the type
    if (ebook.file_path) {
        return ebook.file_path;
    }

    // Fallback to a generic PDF icon
    return 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
};

// Extract YouTube video ID from a URL
const getYoutubeVideoId = (url) => {
    if (!url) return null;

    // Try to extract the video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
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
    if (isYoutubeVideo(ebook)) {
        return ebook.file_path;
    }

    return null;
};

const openInReader = (ebook) => {
    // Get the video ID for YouTube videos
    if (isYoutubeVideo(ebook)) {
        const videoId = getYoutubeVideoId(ebook.file_path);
        if (videoId) {
            // Navigate to the reader with the videoId parameter
            router.push({
                path: `/reader/${bookItemId.value}`,
                query: {
                    type: 'video',
                    ebookId: ebook.id,
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
    } // Navigate to reader view for PDFs
    router.push({
        path: `/reader/${bookItemId.value}`,
        query: {
            type: 'pdf',
            ebookId: ebook.id,
            source: encodeURIComponent(ebook.file_path.replace(/\\\//g, '/'))
        }
    });
};

// Handle page change events from the paginator
const onPageChange = (event) => {
    first.value = event.first;
    resourcesPerPage.value = event.rows;
    fetchEbooks();
};

// Reset filters and fetch all ebooks
const resetFilters = () => {
    filters.value = {
        type: 'all',
        downloadable: 'all'
    };
    fetchEbooks();
};

// Apply filter changes
const applyFilters = () => {
    first.value = 0; // Reset to first page when filtering
    fetchEbooks();
};
</script>

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
