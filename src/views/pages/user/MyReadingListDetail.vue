<template>
    <div class="bg-white">
        <!-- Improved Page header for consistency -->
        <div class="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-sm z-50 border-b border-gray-200">
            <div class="container mx-auto py-4 px-6 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <button @click="goBack" class="p-2 rounded-full hover:bg-blue-100 transition-colors">
                        <i class="pi pi-arrow-left text-blue-700 text-lg"></i>
                    </button>
                    <div class="flex items-center gap-3">
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 truncate max-w-lg">{{ collection ? collection.name : 'Collection Details' }}</h1>
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
            <div v-else-if="!collection" class="flex justify-center items-center py-16">
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
                                        <div v-if="!collection.ebooks_count?.by_type?.pdf && !collection.ebooks_count?.by_type?.video" class="w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
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
                                <div class="flex items-center gap-2">
                                    <i class="pi pi-clock text-gray-500"></i>
                                    <span class="font-semibold text-gray-800">Self-paced</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="pi pi-infinity text-gray-500"></i>
                                    <span class="font-semibold text-gray-800">Lifetime access</span>
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
                            <div class="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                <div class="text-center">
                                    <i class="pi pi-video text-blue-500 text-4xl mb-2"></i>
                                    <p class="text-blue-600 font-medium text-sm">Video Content</p>
                                </div>
                            </div>
                            <!-- Video play overlay -->
                            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                <div class="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                    <i class="pi pi-play text-gray-800 text-xl ml-1"></i>
                                </div>
                            </div>
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
                            <!-- Type badge and downloadable badge -->
                            <div class="flex justify-between items-center mb-3">
                                <span class="text-xs font-semibold text-gray-500 flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
                                    <i :class="getResourceTypeIcon(ebook)" class="text-gray-600"></i>
                                    {{ ebook.e_book_type ? ebook.e_book_type.name : 'File' }}
                                </span>
                                <span v-if="ebook.is_downloadable" class="text-xs text-white font-semibold bg-green-500 px-2 py-1 rounded-full">Downloadable</span>
                                <span v-else class="text-xs text-white font-semibold bg-orange-500 px-2 py-1 rounded-full">View Only</span>
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
    </div>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const collection = ref(null);
const ebooksFirst = ref(0);
const ebooksPerPage = ref(9);
const filters = ref({
    type: 'all',
    downloadable: 'all'
});

const fetchCollection = async () => {
    loading.value = true;
    try {
        const response = await axiosInstance.get(`/my-collections/${route.params.id}`, {
            params: {
                with: 'ebooks,ebooks.bookItem,user'
            }
        });
        // Defensive: check if response.data.data exists and is an object
        if (response.data && response.data.data && typeof response.data.data === 'object') {
            collection.value = response.data.data;
        } else {
            collection.value = { ebooks: [] }; // fallback to empty collection
        }
    } catch (error) {
        collection.value = null;
    } finally {
        loading.value = false;
    }
};

// Only call fetchCollection once on mount
onMounted(() => {
    fetchCollection();
});

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const goToEbookDetail = (ebook) => {
    if (ebook && ebook.book_item_id) {
        router.push(`/reader/${ebook.book_item_id}`);
    }
};

const goBack = () => {
    router.back();
};

const paginatedEbooks = computed(() => {
    if (!collection.value || !collection.value.ebooks) return [];
    return collection.value.ebooks.slice(ebooksFirst.value, ebooksFirst.value + ebooksPerPage.value);
});

const onEbooksPageChange = (event) => {
    ebooksFirst.value = event.first;
    ebooksPerPage.value = event.rows;
};

const applyFilters = () => {
    ebooksFirst.value = 0;
    // Additional logic for applying filters can be added here if needed
};

const resetFilters = () => {
    filters.value = {
        type: 'all',
        downloadable: 'all'
    };
    ebooksFirst.value = 0;
};

const filteredEbooks = computed(() => {
    if (!collection.value || !collection.value.ebooks) return [];
    return collection.value.ebooks.filter((ebook) => {
        const matchesType = filters.value.type === 'all' || (ebook.e_book_type && ebook.e_book_type.name.toLowerCase() === filters.value.type);
        const matchesDownloadable = filters.value.downloadable === 'all' || (filters.value.downloadable === 'yes' && ebook.is_downloadable) || (filters.value.downloadable === 'no' && !ebook.is_downloadable);
        return matchesType && matchesDownloadable;
    });
});

const isVideoType = (ebook) => {
    return ebook.e_book_type && ebook.e_book_type.name.toLowerCase() === 'video';
};

const isPdfType = (ebook) => {
    return ebook.e_book_type && ebook.e_book_type.name.toLowerCase() === 'pdf';
};

const getResourceTypeIcon = (ebook) => {
    if (isVideoType(ebook)) return 'pi pi-video';
    if (isPdfType(ebook)) return 'pi pi-file-pdf';
    return 'pi pi-file';
};

const getCollectionGradient = (collection) => {
    // Define your gradient logic based on collection properties
    return 'from-blue-500 to-purple-500';
};

const getCategoryIcon = (categoryName) => {
    // Map category names to icons
    const icons = {
        Programming: 'pi pi-code',
        Design: 'pi pi-paint-bucket',
        Marketing: 'pi pi-bullhorn',
        Business: 'pi pi-briefcase',
        Finance: 'pi pi-money-bill',
        Health: 'pi pi-heart',
        Music: 'pi pi-music',
        Photography: 'pi pi-camera',
        Videography: 'pi pi-video',
        Writing: 'pi pi-pencil',
        Reading: 'pi pi-book',
        Learning: 'pi pi-graduation-cap'
    };
    return icons[categoryName] || 'pi pi-folder';
};

const getCollectionDescription = (collection) => {
    // Generate a dynamic description for the collection
    const types = [];
    if (collection.ebooks_count?.by_type?.pdf) types.push(`${collection.ebooks_count.by_type.pdf} PDF`);
    if (collection.ebooks_count?.by_type?.video) types.push(`${collection.ebooks_count.by_type.video} Video`);
    if (collection.ebooks_count?.downloadable) types.push(`${collection.ebooks_count.downloadable} Downloadable`);
    return `This collection includes ${types.join(', ')} resources.`;
};

// Add stubs if missing to avoid template errors
const getResourceTitle = (ebook) => {
    return ebook.file_name || ebook.title || 'Untitled';
};

const formatFileSize = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
};
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.video-thumbnail {
    /* Aspect ratio 16:9 */
    position: relative;
    padding-top: 56.25%;
}

.video-thumbnail video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.paginator-container {
    /* Center the paginator and add some margin */
    margin: 0 auto;
    padding: 0 1rem;
}
</style>
