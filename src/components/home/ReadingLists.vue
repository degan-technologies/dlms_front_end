<template>
    <section class="bg-white py-16 px-5">
        <div class="max-w-7xl mx-auto">
            <!-- Header Section -->
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Reading Collections</h2>
                    <p class="text-gray-600">Curated collections to accelerate your learning</p>
                </div>
                <button @click="viewAllReadingLists" class="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2 transition-colors">
                    <span>View all</span>
                    <i class="pi pi-arrow-right text-sm"></i>
                </button>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                    <span class="text-gray-600">Loading collections...</span>
                </div>
            </div>

            <!-- Empty state -->
            <div v-else-if="readingLists.length === 0" class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-bookmark text-2xl text-gray-400"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No Collections Found</h3>
                <p class="text-gray-600 mb-4">Create your first collection to organize your favorite resources.</p>
                <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">Create Collection</button>
            </div>

            <!-- Grid layout with pagination -->
            <div v-else>
                <!-- Collections Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div v-for="(list, index) in readingLists" :key="list.id" @click="viewReadingList(list)" class="group cursor-pointer">
                        <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 h-full flex flex-col">
                            <!-- Collection header with fixed height - Udemy-inspired design -->
                            <div class="relative h-48 bg-gray-50 overflow-hidden">
                                <!-- Dynamic gradient based on content types -->
                                <div :class="getCollectionGradient(list)" class="absolute inset-0"></div>

                                <!-- Subtle pattern overlay -->
                                <div class="absolute inset-0 opacity-10 bg-white bg-opacity-5"></div>

                                <!-- Content type icons display -->
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="flex items-center gap-3">
                                        <!-- PDF Icon -->
                                        <div v-if="list.ebooks_count?.by_type?.pdf > 0" class="w-14 h-14 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                                            <i class="pi pi-file-pdf text-xl text-red-500"></i>
                                        </div>

                                        <!-- Video Icon -->
                                        <div v-if="list.ebooks_count?.by_type?.video > 0" class="w-14 h-14 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                                            <i class="pi pi-video text-xl text-blue-500"></i>
                                        </div>

                                        <!-- Fallback category icon if no specific types -->
                                        <div v-if="!list.ebooks_count?.by_type?.pdf && !list.ebooks_count?.by_type?.video" class="w-14 h-14 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                                            <i :class="getCategoryIcon(list.name)" class="text-xl text-purple-600"></i>
                                        </div>
                                    </div>
                                </div>

                                <!-- Total count badge -->
                                <div class="absolute top-4 right-4">
                                    <div class="bg-white bg-opacity-90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-white border-opacity-20">
                                        {{ list.ebooks_count?.total || list.itemCount || 0 }} resources
                                    </div>
                                </div>

                                <!-- Content type breakdown badges -->
                                <div class="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                                    <div v-if="list.ebooks_count?.by_type?.pdf > 0" class="bg-red-500 bg-opacity-90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                                        <i class="pi pi-file-pdf text-xs"></i>
                                        <span>{{ list.ebooks_count.by_type.pdf }}</span>
                                    </div>
                                    <div v-if="list.ebooks_count?.by_type?.video > 0" class="bg-blue-500 bg-opacity-90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                                        <i class="pi pi-video text-xs"></i>
                                        <span>{{ list.ebooks_count.by_type.video }}</span>
                                    </div>
                                    <div v-if="list.ebooks_count?.downloadable > 0" class="bg-green-500 bg-opacity-90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                                        <i class="pi pi-download text-xs"></i>
                                        <span>{{ list.ebooks_count.downloadable }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Collection info with flex-grow to fill remaining space -->
                            <div class="p-4 flex-1 flex flex-col">
                                <!-- Title -->
                                <h3 class="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                    {{ list.name }}
                                </h3>

                                <!-- Description -->
                                <p class="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed flex-grow">
                                    {{ getCollectionDescription(list) }}
                                </p>

                                <!-- Creator info -->
                                <div class="flex items-center gap-2 mb-3 text-sm text-gray-500">
                                    <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                        <i class="pi pi-user text-gray-600 text-xs"></i>
                                    </div>
                                    <span>{{ list.creator?.name || 'Anonymous' }}</span>
                                    <span class="text-gray-400">•</span>
                                    <span>{{ formatDate(list.created_at) }}</span>
                                </div>

                                <!-- Enhanced metadata using new data structure -->
                                <div class="bg-gray-50 rounded-lg p-3 mb-4">
                                    <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                        <div class="flex items-center justify-between">
                                            <span>PDF Files:</span>
                                            <span class="font-semibold text-red-600">{{ list.ebooks_count?.by_type?.pdf || 0 }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span>Videos:</span>
                                            <span class="font-semibold text-blue-600">{{ list.ebooks_count?.by_type?.video || 0 }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span>Downloadable:</span>
                                            <span class="font-semibold text-green-600">{{ list.ebooks_count?.downloadable || 0 }}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span>Total Size:</span>
                                            <span class="font-semibold text-gray-700">{{ getTotalSize(list.ebooks) }}</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action button at bottom -->
                                <button class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-auto">
                                    <i class="pi pi-play-circle"></i>
                                    <span>Start Learning</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pagination -->
                <div class="mt-8 flex justify-center">
                    <Paginator
                        :rows="collectionsPerPage"
                        :totalRecords="totalRecords"
                        v-model:first="first"
                        :rowsPerPageOptions="[8, 12, 16, 24]"
                        @page="onPageChange($event)"
                        class="border-none bg-transparent"
                        :template="{
                            '640px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
                            '960px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
                            '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport'
                        }"
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                    />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import Paginator from 'primevue/paginator';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const readingLists = ref([]);
const first = ref(0);
const collectionsPerPage = ref(12);
const totalRecords = ref(0);

// Fetch collections from the backend
const fetchCollections = async () => {
    loading.value = true;
    try {
        const currentPage = Math.floor(first.value / collectionsPerPage.value) + 1;
        const response = await axiosInstance.get('/collections', {
            params: {
                with: 'user,ebooks,ebooks.e_book_type',
                per_page: collectionsPerPage.value,
                page: currentPage
            }
        });

        // Map API data to UI format with new data structure
        readingLists.value = (response.data.data || []).map((col) => ({
            id: col.id,
            name: col.name,
            description: col.description || generateDescription(col),
            itemCount: col.ebooks_count?.total || col.ebooks?.length || 0,
            ebooks: col.ebooks || [],
            ebooks_count: col.ebooks_count || {
                total: col.ebooks?.length || 0,
                downloadable: 0,
                by_type: { pdf: 0, video: 0 }
            },
            creator: col.user
                ? {
                      name: col.user.username || col.user.name,
                      avatar: col.user.avatar_url || ''
                  }
                : null,
            created_at: col.created_at
        }));

        totalRecords.value = response.data.pagination?.total || response.data.meta?.total || 0;
        console.log('Collections fetched:', readingLists.value.length, 'items');
    } catch (error) {
        console.error('Error fetching collections:', error);
        readingLists.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchCollections();
});

// View all reading lists
const viewAllReadingLists = () => {
    console.log('Viewing all reading lists');
    router.push('/student/reading-lists');
};

// View a specific reading list
const viewReadingList = (list) => {
    router.push(`/reading-list-details/${list.id}`);
};

// Handle page change
const onPageChange = (event) => {
    first.value = event.first;
    collectionsPerPage.value = event.rows;
    fetchCollections();
};

// Get collection gradient based on content types
const getCollectionGradient = (list) => {
    const hasPdf = list.ebooks_count?.by_type?.pdf > 0;
    const hasVideo = list.ebooks_count?.by_type?.video > 0;

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

// Helper functions for reading list display
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

const getCollectionDescription = (list) => {
    const itemCount = list.itemCount || list.ebooks?.length || 0;
    const descriptions = [
        `A curated collection of ${itemCount} educational resources`,
        `Discover ${itemCount} carefully selected learning materials`,
        `Explore ${itemCount} handpicked educational content`,
        `Access ${itemCount} premium learning resources`
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// Add the missing generateDescription function
const generateDescription = (list) => {
    if (list.description) {
        return list.description;
    }

    const itemCount = list.ebooks?.length || list.books_count || 0;
    const type = list.type || 'collection';

    const templates = [
        `A comprehensive ${type} featuring ${itemCount} carefully selected resources`,
        `Discover ${itemCount} high-quality educational materials in this ${type}`,
        `Explore ${itemCount} expertly curated learning resources`,
        `Access ${itemCount} premium educational content in this specialized ${type}`,
        `A rich ${type} containing ${itemCount} diverse learning materials`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
};

const getResourceTypePreviews = (ebooks) => {
    if (!ebooks) return [];
    const types = [...new Set(ebooks.map((ebook) => ebook.e_book_type?.name || 'Unknown'))];
    return types;
};

const getTypePreviewClass = (type) => {
    switch (type.toLowerCase()) {
        case 'pdf':
            return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
        case 'video':
            return 'bg-gradient-to-r from-red-400 to-red-500 text-white';
        case 'audio':
            return 'bg-gradient-to-r from-green-400 to-green-500 text-white';
        default:
            return 'bg-gradient-to-r from-blue-400 to-blue-500 text-white';
    }
};

const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
        case 'pdf':
            return 'pi pi-file-pdf';
        case 'video':
            return 'pi pi-video';
        case 'audio':
            return 'pi pi-volume-up';
        default:
            return 'pi pi-file';
    }
};

const getResourceTypeCount = (ebooks, type) => {
    if (!ebooks) return 0;
    return ebooks.filter((ebook) => ebook.e_book_type?.name?.toUpperCase() === type).length;
};

const getTotalPages = (ebooks) => {
    if (!ebooks) return 0;
    return ebooks.reduce((total, ebook) => total + (ebook.pages || 0), 0);
};

const getTotalSize = (ebooks) => {
    if (!ebooks) return '0MB';
    const totalBytes = ebooks.reduce((total, ebook) => total + (ebook.file_size_mb * 1024 * 1024 || 0), 0);
    return formatFileSize(totalBytes);
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

const getResourceIndicatorClass = (type) => {
    switch (type.toLowerCase()) {
        case 'pdf':
            return 'pdf-indicator';
        case 'video':
            return 'video-indicator';
        case 'audio':
            return 'audio-indicator';
        default:
            return 'default-indicator';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
};

// Browse featured resources section
const browseFeaturedResources = () => {
    console.log('Browsing featured resources');
    // Scroll to featured resources section or navigate
    document.querySelector('.featured-resources-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
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

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Smooth hover transitions */
.group:hover .transform-gpu {
    transform: translateY(-4px);
}
</style>
