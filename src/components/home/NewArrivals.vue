<template>
    <section class="bg-white py-16 px-4">
        <div class="max-w-7xl mx-auto">
            <!-- Header Section -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
                        <span class="text-purple-600 font-semibold text-sm tracking-wider uppercase">New Releases</span>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">What to learn next</h2>
                    <p class="text-gray-600 text-lg max-w-2xl">New courses picked just for you</p>
                </div>
                <button class="mt-4 sm:mt-0 text-purple-600 hover:text-purple-700 font-semibold text-sm border border-purple-200 hover:border-purple-300 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-purple-50">View all new</button>
            </div>
            <!-- Loading state -->
            <div v-if="loading" class="flex justify-center items-center py-16">
                <div class="flex flex-col items-center">
                    <i class="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4"></i>
                    <span class="text-gray-600 text-lg">Loading library shelves...</span>
                </div>
            </div>

            <!-- No data state -->
            <div v-else-if="!newArrivalsData.length" class="bg-white p-12 rounded-2xl text-center shadow-lg border border-blue-100">
                <div class="flex flex-col items-center">
                    <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <i class="pi pi-info-circle text-4xl text-blue-600"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-3 text-gray-900">Empty Shelves</h3>
                    <p class="text-gray-500 max-w-md mx-auto text-lg">Our shelves are being restocked. Check back soon for new arrivals!</p>
                </div>
            </div>
            <!-- Enhanced grid layout -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div v-for="(item, index) in newArrivalsData" :key="item.id" class="group cursor-pointer" @click="openInReader(item)">
                    <!-- Course Card Container -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                        <!-- Thumbnail Section -->
                        <div class="relative aspect-video bg-gray-100 overflow-hidden">
                            <!-- Video Resources (YouTube) -->
                            <div v-if="isYoutubeVideo(item)" class="w-full h-full">
                                <iframe :src="`https://www.youtube.com/embed/${getYoutubeVideoId(item.file_path)}?modestbranding=1&rel=0&showinfo=0`" frameborder="0" allowfullscreen class="w-full h-full" :title="item.file_name"></iframe>
                                <div class="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors pointer-events-none"></div>
                            </div>

                            <!-- PDF/eBook Resources -->
                            <div v-else-if="isPdfFile(item)" class="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                                <div class="text-center">
                                    <i class="pi pi-file-pdf text-4xl text-red-500 mb-2"></i>
                                    <p class="text-sm font-medium text-red-600">PDF Document</p>
                                </div>
                            </div>

                            <!-- Other file types -->
                            <div v-else class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                                <div class="text-center">
                                    <i class="pi pi-file text-4xl text-indigo-600 mb-2"></i>
                                    <p class="text-sm font-medium text-gray-700">Document</p>
                                </div>
                            </div>

                            <!-- Resource Type Badge -->
                            <div class="absolute top-3 left-3">
                                <span class="bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold">
                                    {{ item.e_book_type ? item.e_book_type.name : 'RESOURCE' }}
                                </span>
                            </div>

                            <!-- Duration/Pages Badge (if applicable) -->
                            <div class="absolute bottom-3 right-3">
                                <span v-if="item.pages" class="bg-black/80 text-white px-2 py-1 rounded text-xs"> {{ item.pages }} pages </span>
                            </div>
                        </div>

                        <!-- Content Section -->
                        <div class="p-4 flex-1 flex flex-col">
                            <h3 class="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                {{ item.file_name || 'Untitled Resource' }}
                            </h3>

                            <!-- File size and type info -->
                            <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <span>{{ formatFileSize(item.file_size_mb * 1024 * 1024) }}</span>
                                <span v-if="item.is_downloadable" class="text-green-600 font-medium">Downloadable</span>
                                <span v-else class="text-orange-600 font-medium">View Only</span>
                            </div>

                            <!-- Action Button -->
                            <button class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-auto">
                                <i class="pi pi-play"></i>
                                <span>{{ isYoutubeVideo(item) ? 'Watch Now' : 'Read Now' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resource Preview Modal -->
            <Dialog v-model:visible="previewModalVisible" :modal="true" :breakpoints="{ '960px': '75vw', '640px': '90vw' }" class="p-fluid resource-modal" :style="{ width: '60rem' }" :showHeader="false" :dismissableMask="true">
                <div v-if="selectedResource" class="relative">
                    <!-- Close button -->
                    <button
                        @click="previewModalVisible = false"
                        class="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white hover:text-white transition-all duration-300 border border-white/20"
                    >
                        <i class="pi pi-times"></i>
                    </button>

                    <!-- Resource cover image -->
                    <div class="relative h-64 bg-gradient-to-r from-indigo-900 to-blue-900 overflow-hidden">
                        <img :src="selectedResource.cover_image || 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'" alt="" class="w-full h-full object-cover opacity-60" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div class="absolute bottom-5 left-5 right-5 text-white">
                            <span class="px-3 py-1 bg-indigo-600 rounded-md text-xs font-semibold tracking-wider">
                                {{ selectedResource.item_type }}
                            </span>
                            <h3 class="text-2xl font-bold mt-3 text-shadow-sm line-clamp-2">{{ selectedResource.title }}</h3>
                        </div>
                    </div>

                    <!-- Resource content -->
                    <div class="p-5">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="md:col-span-2">
                                <h4 class="text-lg font-semibold mb-2">About this resource</h4>
                                <p class="text-gray-600 mb-4">{{ selectedResource.description || 'No description available for this resource.' }}</p>

                                <!-- Video preview (YouTube) -->
                                <div v-if="isVideoResource && youtubeEmbedUrl" class="mt-4">
                                    <h4 class="text-lg font-semibold mb-2">Video Preview</h4>
                                    <div class="relative h-[400px] overflow-hidden rounded-lg shadow-lg">
                                        <YouTubePlayer :videoId="extractYoutubeId(youtubeEmbedUrl)" />
                                    </div>
                                    <div class="mt-3">
                                        <button @click="goToDetailsPage(selectedResource)" class="flex items-center gap-1.5 text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors">
                                            <i class="pi pi-info-circle"></i>
                                            <span>View Details</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- PDF preview -->
                                <div v-else-if="isPdfResource" class="mt-4">
                                    <h4 class="text-lg font-semibold mb-2">Document Preview</h4>
                                    <div class="relative h-[500px] overflow-hidden rounded-lg shadow-lg">
                                        <ModernPDFReader :resourceUrl="selectedResource.file_url" :darkMode="false" />
                                    </div>
                                    <div class="mt-3">
                                        <button @click="goToDetailsPage(selectedResource)" class="flex items-center gap-1.5 text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors">
                                            <i class="pi pi-info-circle"></i>
                                            <span>View Details</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Physical book preview -->
                                <div v-else-if="isPhysicalBook" class="mt-4">
                                    <h4 class="text-lg font-semibold mb-2">Physical Book</h4>
                                    <div class="flex flex-col gap-4">
                                        <div class="bg-gray-50 p-4 rounded-lg">
                                            <p class="text-gray-600">This is a physical book that requires a visit to the library.</p>
                                        </div>
                                        <div class="flex gap-3">
                                            <button @click="goToDetailsPage(selectedResource)" class="flex items-center gap-1.5 text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors">
                                                <i class="pi pi-info-circle"></i>
                                                <span>View Details</span>
                                            </button>
                                            <button class="flex items-center gap-1.5 text-sm px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors">
                                                <i class="pi pi-calendar"></i>
                                                <span>Request Book</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Default for other resource types -->
                                <div v-else class="mt-4">
                                    <button @click="goToDetailsPage(selectedResource)" class="flex items-center gap-1.5 text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors">
                                        <i class="pi pi-info-circle"></i>
                                        <span>View Details</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Resource details sidebar -->
                            <div class="bg-gray-50 p-4 rounded-md">
                                <h4 class="text-lg font-semibold mb-3">Resource Details</h4>
                                <div class="space-y-3">
                                    <div v-if="selectedResource.author" class="flex items-start gap-2">
                                        <i class="pi pi-user text-indigo-600 mt-1"></i>
                                        <div>
                                            <div class="text-sm text-gray-500">Author</div>
                                            <div>{{ selectedResource.author }}</div>
                                        </div>
                                    </div>
                                    <div v-if="selectedResource.isbn" class="flex items-start gap-2">
                                        <i class="pi pi-id-card text-indigo-600 mt-1"></i>
                                        <div>
                                            <div class="text-sm text-gray-500">ISBN</div>
                                            <div>{{ selectedResource.isbn }}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-start gap-2">
                                        <i class="pi pi-check-circle text-indigo-600 mt-1"></i>
                                        <div>
                                            <div class="text-sm text-gray-500">Status</div>
                                            <div :class="{ 'text-green-600': selectedResource.availability_status === 'available', 'text-red-600': selectedResource.availability_status !== 'available' }">
                                                {{ capitalizeFirstLetter(selectedResource.availability_status || 'Unknown') }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-6">
                                    <button @click="goToDetailsPage(selectedResource)" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all">
                                        <i class="pi pi-info-circle"></i>
                                        <span>View Full Details</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    </section>
</template>

<script setup>
import YouTubePlayer from '@/components/reader/YouTubePlayer.vue';
import axiosInstance from '@/util/axios-config';
import Dialog from 'primevue/dialog';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const previewModalVisible = ref(false);
const selectedResource = ref(null);

// Data from API
const newArrivalsData = ref([]);

// Responsive options for the carousel
const responsiveOptions = ref([
    {
        breakpoint: '1400px',
        numVisible: 4,
        numScroll: 1
    },
    {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
]);

// Fetch new arrivals when component is mounted
onMounted(() => {
    fetchNewArrivals();
});

// Fetch learning recommendations from API
const fetchNewArrivals = async () => {
    loading.value = true;
    try {
        const response = await axiosInstance.get('/learning-recommendations');
        if (response.data && response.data.recommendations) {
            newArrivalsData.value = response.data.recommendations;
        }
    } catch (error) {
        console.error('Error fetching learning recommendations:', error);
        // Keep empty array if API fails
        newArrivalsData.value = [];
    } finally {
        loading.value = false;
    }
};

// Show resource preview
const showResourcePreview = (resource) => {
    selectedResource.value = resource;

    // Handle PDF resources - add file URL if needed
    if (isPdfResource.value && !resource.file_url) {
        // For eBooks, get the file path
        if (resource.ebook && resource.ebook.file_path) {
            resource.file_url = resource.ebook.file_path;
        } else if (resource.other_asset && resource.other_asset.file_path) {
            resource.file_url = resource.other_asset.file_path;
        } else {
            // Add a demo PDF URL for eBooks and PDFs
            resource.file_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        }
    }

    // Handle video embedding if needed
    if (isVideoResource.value && youtubeEmbedUrl.value && !extractYoutubeId(youtubeEmbedUrl.value)) {
        // Fallback to a generic educational video if no YouTube ID can be extracted
        resource.video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    }

    previewModalVisible.value = true;
};

// Helper methods
const isYoutubeVideo = (item) => {
    if (!item) return false;
    const type = item.e_book_type?.name?.toLowerCase() || '';
    return type.includes('video') || type.includes('youtube');
};

const isPdfFile = (item) => {
    if (!item) return false;
    const type = item.e_book_type?.name?.toLowerCase() || '';
    return type.includes('pdf');
};

const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
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

const openInReader = (item) => {
    if (!item.book_item_id) {
        console.error('No book_item_id found for item:', item);
        return;
    }

    // Get the video ID for YouTube videos
    if (isYoutubeVideo(item)) {
        const videoId = getYoutubeVideoId(item.file_path);
        if (videoId) {
            // Navigate to the reader with the videoId parameter
            router.push({
                path: `/reader/${item.book_item_id}`,
                query: {
                    type: 'video',
                    ebookId: item.id,
                    videoId: videoId
                }
            });
        } else {
            // Fallback to opening in a new tab if we can't extract a video ID
            window.open(item.file_path, '_blank');
        }
        return;
    }

    // Navigate to reader view for PDFs
    router.push({
        path: `/reader/${item.book_item_id}`,
        query: {
            type: 'pdf',
            ebookId: item.id,
            source: encodeURIComponent(item.file_path.replace(/\\\//g, '/'))
        }
    });
};

// Helper methods for masonry layout
const getCardSizeClass = (index) => {
    // Create varied card sizes for visual interest
    const patterns = ['col-span-1', 'col-span-1', 'col-span-2 row-span-2', 'col-span-1', 'col-span-1', 'col-span-1'];
    return patterns[index % patterns.length];
};

const getImageHeightClass = (index) => {
    // Varied image heights for masonry effect
    const heights = ['h-48', 'h-64', 'h-56', 'h-52', 'h-60', 'h-44'];
    return heights[index % heights.length];
};

const isLargeCard = (index) => {
    // Show more content for larger cards
    return index % 6 === 2; // Every 3rd card is large
};

const formatRelativeDate = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'today';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return 'recently';
};

const getAvailabilityColor = (status) => {
    switch (status) {
        case 'available':
            return 'bg-green-500';
        case 'checked_out':
            return 'bg-yellow-500';
        case 'reserved':
            return 'bg-blue-500';
        default:
            return 'bg-gray-500';
    }
};

const getAvailabilityStatus = (status) => {
    switch (status) {
        case 'available':
            return 'available';
        case 'checked_out':
            return 'checked-out';
        case 'reserved':
            return 'reserved';
        default:
            return 'unavailable';
    }
};
</script>

<style scoped>
/* Library Shelf Container */
.library-shelf-container {
    position: relative;
    margin: 2rem 0;
}

/* Wooden Shelf Design */
.shelf-wood {
    height: 12px;
    background: linear-gradient(180deg, #8b4513 0%, #a0522d 50%, #8b4513 100%);
    border-radius: 6px;
    margin: 0 2rem 2rem 2rem;
    box-shadow:
        0 3px 8px rgba(139, 69, 19, 0.3),
        inset 0 1px 3px rgba(255, 255, 255, 0.1);
    position: relative;
}

.shelf-wood::before {
    content: '';
    position: absolute;
    top: -3px;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(180deg, #654321 0%, #8b4513 100%);
    border-radius: 6px 6px 0 0;
}

.shelf-wood::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 8px;
    right: 8px;
    height: 3px;
    background: rgba(139, 69, 19, 0.4);
    border-radius: 50%;
    filter: blur(2px);
}

/* YouTube-Style Equal Grid */
.shelf-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    padding: 0 2rem;
}

/* Base Card Styling */
.shelf-item {
    opacity: 0;
    transform: translateY(20px);
    animation: slideInUp 0.6s ease-out forwards;
    cursor: pointer;
}

@keyframes slideInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.resource-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.resource-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Video Card Styling */
.video-card .video-thumbnail {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;
    background: #000;
}

.video-embed {
    width: 100%;
    height: 100%;
    border: none;
}

.video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.video-card:hover .video-overlay {
    opacity: 1;
}

.play-indicator {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
}

/* PDF Card Styling */
.pdf-card .pdf-thumbnail {
    width: 100%;
    height: 180px;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.pdf-icon-container {
    text-align: center;
    padding: 2rem;
}

.pdf-icon {
    font-size: 4rem;
    color: #dc2626;
    margin-bottom: 0.5rem;
    display: block;
}

.pdf-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.format-text {
    font-weight: bold;
    font-size: 0.875rem;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.pages-text {
    font-size: 0.75rem;
    color: #6b7280;
}

/* Physical Book Card Styling */
.book-card .book-thumbnail {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;
}

.book-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.book-card:hover .book-cover {
    transform: scale(1.05);
}

.availability-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.availability-indicator.available {
    color: #10b981;
}

.availability-indicator.checked-out {
    color: #f59e0b;
}

.availability-indicator.reserved {
    color: #3b82f6;
}

.availability-indicator.unavailable {
    color: #6b7280;
}

/* Card Content */
.card-content {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.5rem 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-author {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0 0 0.75rem 0;
}

.card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
}

.resource-type {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
}

.video-type {
    background: #fef2f2;
    color: #dc2626;
}

.pdf-type {
    background: #fef2f2;
    color: #dc2626;
}

.book-type {
    background: #eff6ff;
    color: #2563eb;
}

.publish-year {
    font-size: 0.75rem;
    color: #9ca3af;
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
}

/* Responsive Design */
@media (max-width: 1200px) {
    .shelf-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.25rem;
    }
}

@media (max-width: 768px) {
    .shelf-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        padding: 0 1rem;
    }

    .shelf-wood {
        margin: 0 1rem 1.5rem 1rem;
    }

    .video-thumbnail,
    .pdf-thumbnail,
    .book-thumbnail {
        height: 160px;
    }
}

@media (max-width: 640px) {
    .shelf-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .video-thumbnail,
    .pdf-thumbnail,
    .book-thumbnail {
        height: 140px;
    }
}

/* Enhanced Modal Styles */
:deep(.p-dialog .p-dialog-content) {
    padding: 0;
}

:deep(.p-dialog) {
    border-radius: 1rem;
    overflow: hidden;
}

/* Line clamp utilities */
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
