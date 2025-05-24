<template>
    <section class="bg-white py-16 px-5">
        <div class="max-w-7xl mx-auto">
            <!-- Header Section -->
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Recently Viewed</h2>
                    <p class="text-gray-600">Pick up where you left off</p>
                </div>
                <button @click="viewAllRecentlyViewed" class="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2 transition-colors">
                    <span>View all</span>
                    <i class="pi pi-arrow-right text-sm"></i>
                </button>
            </div>
            <!-- Loading indicator -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                    <span class="text-gray-600">Loading recent activity...</span>
                </div>
            </div>

            <!-- No recent items message -->
            <div v-else-if="recentlyViewedResources.length === 0" class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-clock text-2xl text-gray-400"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
                <p class="text-gray-600 mb-4">Start exploring resources. Your recently viewed items will appear here for quick access.</p>
                <button @click="browseFeaturedResources" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">Browse Resources</button>
            </div>
            <!-- PrimeVue Carousel with circular scrolling -->
            <div v-else class="relative">
                <!-- Timeline header -->
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <i class="pi pi-clock text-white text-sm"></i>
                    </div>
                    <div class="flex-1 h-px bg-gray-200"></div>
                    <span class="text-sm text-gray-500 font-medium">{{ recentlyViewedResources.length }} Recent Items</span>
                </div>

                <!-- PrimeVue Carousel -->
                <Carousel :value="recentlyViewedResources" :numVisible="3" :numScroll="1" :responsiveOptions="carouselResponsiveOptions" :circular="true" :autoplayInterval="0" :showNavigators="true" :showIndicators="false" class="custom-carousel">
                    <template #item="{ data: item, index }">
                        <div class="px-3">
                            <div class="group cursor-pointer relative">
                                <!-- Timeline connector -->
                                <div v-if="index < recentlyViewedResources.length - 1" class="absolute top-8 right-0 w-6 h-0.5 bg-gray-200 z-0"></div>

                                <!-- Timeline dot -->
                                <div class="absolute -left-3 top-8 w-6 h-6 bg-white border-2 border-purple-500 rounded-full shadow-sm z-10 flex items-center justify-center">
                                    <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                                </div>

                                <!-- Content card -->
                                <div class="ml-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200" @click="showResourcePreview(item.ebook)">
                                    <!-- Resource thumbnail -->
                                    <div class="relative h-32 bg-gray-100 overflow-hidden">
                                        <div class="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100"></div>

                                        <!-- Resource icon -->
                                        <div class="absolute inset-0 flex items-center justify-center">
                                            <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                <i v-if="isVideoType(item.ebook)" class="pi pi-video text-xl text-red-600"></i>
                                                <i v-else-if="isPdfType(item.ebook)" class="pi pi-file-pdf text-xl text-orange-600"></i>
                                                <i v-else class="pi pi-file text-xl text-purple-600"></i>
                                            </div>
                                        </div>

                                        <!-- Time ago badge -->
                                        <div class="absolute top-3 right-3">
                                            <span class="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                                                {{ formatTimeAgo(item.viewed_at) }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Resource info -->
                                    <div class="p-4">
                                        <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">
                                            {{ getResourceTitle(item.ebook) }}
                                        </h3>

                                        <!-- Resource type badge -->
                                        <div class="mb-3">
                                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :style="{ backgroundColor: getResourceTypeColor(item.ebook) + '20', color: getResourceTypeColor(item.ebook) }">
                                                <i :class="getResourceTypeIcon(item.ebook)" class="mr-1"></i>
                                                {{ getResourceTypeDisplay(item.ebook) }}
                                            </span>
                                        </div>

                                        <!-- File size -->
                                        <div v-if="item.ebook.file_size_mb" class="text-xs text-gray-400 mb-4">
                                            <i class="pi pi-database mr-1"></i>
                                            {{ formatFileSize(item.ebook.file_size_mb * 1024 * 1024) }}
                                        </div>

                                        <!-- Action button -->
                                        <button @click.stop="openInReader(item.ebook)" class="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-colors">Continue Reading</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Carousel>
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
                        <img :src="selectedResource.image || 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'" alt="" class="w-full h-full object-cover opacity-60" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div class="absolute bottom-5 left-5 right-5 text-white">
                            <span class="px-3 py-1 bg-indigo-600 rounded-md text-xs font-semibold tracking-wider">
                                {{ selectedResource.type }}
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
                                    <div class="relative h-[500px] overflow-hidden rounded-lg shadow-lg bg-gray-100 flex items-center justify-center">
                                        <!-- <ModernPDFReader :resourceUrl="selectedResource.file_url" :darkMode="false" /> -->
                                        <div class="text-gray-500 text-center">
                                            <i class="pi pi-file-pdf text-6xl mb-4"></i>
                                            <p class="text-lg font-medium">PDF Preview</p>
                                            <p class="text-sm">Click "View Details" to open the full document</p>
                                        </div>
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
import Carousel from 'primevue/carousel';
import Dialog from 'primevue/dialog';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const AUTH_TOKEN = localStorage.getItem('access_token');
const loading = ref(true);

// Recently viewed resources state
const recentlyViewedResources = ref([]);

// Local state for preview modal
const previewModalVisible = ref(false);
const selectedResource = ref(null);
const youtubeEmbedUrl = ref('');

// Helper function to capitalize the first letter
const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Carousel responsive options
const carouselResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
]);

// Fetch recently viewed resources
const fetchRecentlyViewed = async () => {
    loading.value = true;
    try {
        console.log('Fetching recently viewed resources...');
        const response = await axiosInstance.get('/recently-viewed', {
            params: {
                with: 'ebook,ebook.bookItem'
            }
        });

        console.log('API response:', response.data);
        recentlyViewedResources.value = response.data.data || [];
        console.log('Recently viewed data fetched:', recentlyViewedResources.value.length, 'items');
        console.log('Sample item:', recentlyViewedResources.value[0]);
    } catch (error) {
        console.error('Error fetching recently viewed:', error?.response?.data || error);
        recentlyViewedResources.value = [];
    } finally {
        loading.value = false;
    }
};

// On component mount, fetch recently viewed resources
onMounted(() => {
    fetchRecentlyViewed();
});

// Format relative time (time ago)
const formatTimeAgo = (dateString) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
    } catch (error) {
        return 'Unknown time';
    }
};

// Navigation function
const viewAllRecentlyViewed = () => {
    console.log('Viewing all recently viewed resources');
    // In a real app, this would navigate to a dedicated page
    // router.push('/student/recently-viewed');
};

// Function to navigate to featured resources
const browseFeaturedResources = () => {
    console.log('Browsing featured resources');
    // Scroll to featured resources section
    document.querySelector('.featured-resources-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
};

// Check resource type
const isVideoResource = computed(() => {
    if (!selectedResource.value) return false;
    // Check for video resources from API data structure
    return (
        (selectedResource.value.type && (selectedResource.value.type.toLowerCase() === 'video' || selectedResource.value.type.toLowerCase() === 'video series')) ||
        (selectedResource.value.media_type && selectedResource.value.media_type.toLowerCase() === 'youtube') ||
        (selectedResource.value.item_type &&
            selectedResource.value.item_type.toLowerCase() === 'other' &&
            selectedResource.value.other_asset &&
            selectedResource.value.other_asset.asset_type &&
            selectedResource.value.other_asset.asset_type.file_type_category === 'video')
    );
});

const isPdfResource = computed(() => {
    if (!selectedResource.value) return false;
    // Check for PDF/eBook resources from API data structure
    return (
        (selectedResource.value.type && (selectedResource.value.type.toLowerCase() === 'ebook' || selectedResource.value.type.toLowerCase() === 'pdf' || selectedResource.value.type.toLowerCase() === 'e-book')) ||
        (selectedResource.value.file_format && selectedResource.value.file_format.toLowerCase() === 'pdf') ||
        (selectedResource.value.item_type && selectedResource.value.item_type.toLowerCase() === 'ebook') ||
        (selectedResource.value.ebook && selectedResource.value.ebook.file_format === 'AZW') ||
        (selectedResource.value.ebook && selectedResource.value.ebook.file_path && selectedResource.value.ebook.file_path.endsWith('.pdf'))
    );
});

const isPhysicalBook = computed(() => {
    if (!selectedResource.value) return false;
    // Check for physical book resources from API data structure
    return (
        (selectedResource.value.type && (selectedResource.value.type.toLowerCase() === 'physical book' || selectedResource.value.type.toLowerCase() === 'book')) ||
        (selectedResource.value.item_type && selectedResource.value.item_type.toLowerCase() === 'physical') ||
        (selectedResource.value.book && !selectedResource.value.ebook)
    );
});

// Show resource preview
const showResourcePreview = (resource) => {
    selectedResource.value = resource;

    // Handle YouTube videos
    if (isVideoResource.value) {
        // Check for video URL in the API data structure
        let videoUrl = '';
        if (resource.media_url && resource.media_url.includes('youtube')) {
            videoUrl = resource.media_url;
        } else if (resource.book_item && resource.book_item.other_asset && resource.book_item.other_asset.embed_url) {
            videoUrl = resource.book_item.other_asset.embed_url;
        } else if (resource.video_url) {
            videoUrl = resource.video_url;
        }

        if (videoUrl) {
            const videoId = extractYoutubeId(videoUrl);
            youtubeEmbedUrl.value = `https://www.youtube.com/embed/${videoId}`;
        } else {
            // Fallback to demo YouTube video based on category
            const demoVideos = {
                science: 'Ci6lMQNLmZU',
                math: 'X54SAB9E-0k',
                literature: 'E5OgpUNbSEg',
                history: '54jB5woNbgw',
                'computer science': 'rBasaTye2kM',
                physics: 'SZorAJ4I-sA',
                chemistry: 'bka20Q9TN6M',
                biology: 'QnQe0xW_JY4',
                engineering: 'ZSt9tm3RoUU',
                medicine: '8Ey2egWPu0k',
                arts: 'ZwKhufmMxko',
                languages: 'iBpgqJAJWzs',
                geography: '6Ra3oY_XzC8',
                economics: '3ez10ADR_gM',
                education: 'ymJEIZjespw',
                default: 'dQw4w9WgXcQ' // Famous Rick Roll as default
            };

            // Find appropriate video based on resource category or title
            let demoKey = 'default';
            if (resource.category && typeof resource.category === 'object' && resource.category.category_name) {
                const category = resource.category.category_name.toString().toLowerCase();
                demoKey = Object.keys(demoVideos).find((key) => category.includes(key)) || demoKey;
            } else if (resource.category) {
                const category = resource.category.toString().toLowerCase();
                demoKey = Object.keys(demoVideos).find((key) => category.includes(key)) || demoKey;
            } else if (resource.title) {
                const title = resource.title.toLowerCase();
                demoKey = Object.keys(demoVideos).find((key) => title.includes(key)) || demoKey;
            }

            youtubeEmbedUrl.value = `https://www.youtube.com/embed/${demoVideos[demoKey]}`;

            // Add media_url to the resource for Open in YouTube button
            if (!resource.media_url) {
                resource.media_url = `https://www.youtube.com/watch?v=${demoVideos[demoKey]}`;
            }
        }
    }

    // Handle PDF resources
    if (isPdfResource.value) {
        // Check for file URL in the API data structure
        if (!resource.file_url) {
            if (resource.book_item && resource.book_item.ebook && resource.book_item.ebook.file_path) {
                resource.file_url = resource.book_item.ebook.file_path;
            } else if (resource.ebook && resource.ebook.file_path) {
                resource.file_url = resource.ebook.file_path;
            } else if (resource.book_item && resource.book_item.other_asset && resource.book_item.other_asset.file_path) {
                resource.file_url = resource.book_item.other_asset.file_path;
            } else if (resource.other_asset && resource.other_asset.file_path) {
                resource.file_url = resource.other_asset.file_path;
            } else {
                // Add a demo PDF URL for eBooks and PDFs
                resource.file_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
            }
        }
    }

    previewModalVisible.value = true;
};

// Navigate to details page
const goToDetailsPage = (resource) => {
    if (resource && resource.id) {
        previewModalVisible.value = false;
        router.push({
            name: 'resource-details',
            params: { id: resource.id }
        });
    }
};

// Helper functions for ebook types and navigation
const isVideoType = (ebook) => {
    return ebook?.e_book_type?.name?.toLowerCase() === 'video';
};

const isPdfType = (ebook) => {
    return ebook?.e_book_type?.name?.toLowerCase() === 'pdf';
};

const getResourceTypeDisplay = (ebook) => {
    return ebook?.e_book_type?.name || 'Unknown';
};

const getResourceTypeIcon = (ebook) => {
    const type = ebook?.e_book_type?.name?.toLowerCase();
    if (type === 'video') return 'pi pi-video';
    if (type === 'pdf') return 'pi pi-file-pdf';
    return 'pi pi-file';
};

const getResourceTypeColor = (ebook) => {
    const type = ebook?.e_book_type?.name?.toLowerCase();
    if (type === 'video') return '#dc2626'; // red-600
    if (type === 'pdf') return '#ea580c'; // orange-600
    return '#4f46e5'; // indigo-600
};

const getResourceTitle = (ebook) => {
    return (
        ebook?.file_name
            ?.replace(/\.pdf$/, '')
            ?.replace(/_/g, ' ')
            ?.replace(/^bookitem_\d+_-_/, '') || 'Untitled Resource'
    );
};

const formatFileSize = (bytes) => {
    if (!bytes) return '0MB';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)}${units[unitIndex]}`;
};

// Format date function
const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
};

// Add line-clamp styles for text truncation
const addLineClampStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
};

// Call the function to add line-clamp styles on component setup
addLineClampStyles();

// Extract YouTube video ID from a URL
const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

// Helper function to extract YouTube ID from URL (for existing modal functionality)
const extractYoutubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
};

// Open in Reader function - similar to EbookDetails.vue
const openInReader = (ebook) => {
    if (!ebook) return;

    // Get the video ID for YouTube videos
    if (isVideoType(ebook)) {
        const videoId = getYoutubeVideoId(ebook.file_path);
        if (videoId) {
            // Navigate to the reader with the videoId parameter
            router.push({
                path: `/reader/${ebook.book_item_id}`,
                query: {
                    type: 'video',
                    ebookId: ebook.id,
                    videoId: videoId
                }
            });
        } else {
            // Fallback to opening in a new tab if we can't extract a video ID
            window.open(ebook.file_path, '_blank');
        }
        return;
    }

    // Navigate to reader view for PDFs
    router.push({
        path: `/reader/${ebook.book_item_id}`,
        query: {
            type: 'pdf',
            ebookId: ebook.id,
            source: encodeURIComponent(ebook.file_path.replace(/\\\//g, '/'))
        }
    });
};

// Download file function
const downloadFile = (ebook) => {
    if (!ebook.file_path || !ebook.is_downloadable) {
        console.error('File is not available for download');
        return;
    }

    // Create a file name for download
    const fileName = ebook.file_name || `file-${ebook.id}`;

    // Create a temporary anchor element to trigger download
    const a = document.createElement('a');
    a.href = ebook.file_path;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log('Download started for:', fileName);
};
</script>

<style scoped>
/* Hide scrollbar for horizontal scrolling */
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
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

/* Enhanced resource modal styles */
:deep(.resource-modal) {
    overflow: hidden;
    max-width: 95vw;
}

:deep(.p-dialog-content) {
    padding: 0;
    overflow: auto;
}

/* Text shadow utility for better visibility on image backgrounds */
.text-shadow-sm {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Timeline animations */
@keyframes slideInFromLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.group {
    animation: slideInFromLeft 0.6s ease-out forwards;
}

/* Hover effects for timeline cards */
.group:hover .transform-gpu {
    transform: translateY(-4px) scale(1.02);
}

/* Backdrop blur support fallback */
@supports not (backdrop-filter: blur()) {
    .backdrop-blur-sm {
        background-color: rgba(255, 255, 255, 0.9);
    }
}

/* Custom PrimeVue Carousel Styling */
:deep(.p-carousel) {
    .p-carousel-content {
        position: relative;
    }

    .p-carousel-container {
        position: relative;
    }

    .p-carousel-next,
    .p-carousel-prev {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: white;
        border: 1px solid #e5e7eb;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        transition: all 0.3s ease;
    }

    .p-carousel-prev {
        left: -20px;
    }

    .p-carousel-next {
        right: -20px;
    }

    .p-carousel-next:hover,
    .p-carousel-prev:hover {
        background: #f9fafb;
        color: #8b5cf6;
        border-color: #8b5cf6;
        box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .p-carousel-next:disabled,
    .p-carousel-prev:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .p-carousel-items-content {
        overflow: visible;
    }
}

.custom-carousel {
    padding: 0 30px; /* Add padding to accommodate navigation buttons */
}
</style>
