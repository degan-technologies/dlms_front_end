<script setup>
import { useHomeStore } from '@/stores/homeStore';
import { storeToRefs } from 'pinia';
import Paginator from 'primevue/paginator';

const homeStore = useHomeStore();
const { loading, featuredResources, totalRecords, resourcesPerPage, first } = storeToRefs(homeStore);

const { resetFilters, viewResource, capitalizeFirstLetter, onPageChange } = homeStore;
</script>

<template>
    <div class="lg:w-3/4">
        <!-- Enhanced Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-16">
            <div class="relative">
                <!-- Main spinner -->
                <div class="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                <!-- Center dot -->
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-2 h-2 bg-purple-600 rounded-full"></div>
                </div>
            </div>
        </div>

        <!-- Enhanced No Results State -->
        <div v-else-if="resources.length === 0" class="text-center py-16">
            <div class="bg-gray-50 rounded-xl p-12">
                <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="pi pi-search text-3xl text-gray-400"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3">No results found</h3>
                <p class="text-gray-600 mb-6 max-w-md mx-auto">We couldn't find any courses matching your criteria. Try adjusting your filters.</p>
                <button @click="resetFilters" class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">Clear filters</button>
            </div>
        </div>

        <!-- Udemy-style Course Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="resource in resources" :key="resource.id" class="group cursor-pointer" @click="showResourcePreview(resource)">
                <!-- Course Card -->
                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <!-- Course Image -->
                    <div class="relative h-44 overflow-hidden bg-gray-100">
                        <img
                            :src="resource.image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'"
                            :alt="resource.title"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            @error="
                                (e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                                }
                            "
                        />

                        <!-- Course Type Badge -->
                        <div class="absolute top-3 left-3">
                            <span class="px-2 py-1 bg-white text-xs font-bold rounded shadow-sm" :class="resource.resource_type === 'physical' ? 'text-green-600' : 'text-purple-600'">
                                {{ resource.resource_type === 'physical' ? 'Book' : 'Course' }}
                            </span>
                        </div>

                        <!-- Availability Badge -->
                        <div class="absolute top-3 right-3">
                            <span v-if="resource.resource_type === 'physical'" class="px-2 py-1 bg-white text-xs font-bold rounded shadow-sm" :class="resource.availability_status === 'available' ? 'text-green-600' : 'text-red-600'">
                                {{ resource.available_books_count }} left
                            </span>
                            <span v-else class="px-2 py-1 bg-white text-purple-600 text-xs font-bold rounded shadow-sm"> {{ resource.downloadable_count }} lessons </span>
                        </div>
                    </div>

                    <!-- Course Content -->
                    <div class="p-4">
                        <!-- Title -->
                        <h3 class="font-bold text-gray-900 text-base mb-2 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">
                            {{ resource.title }}
                        </h3>

                        <!-- Author -->
                        <p v-if="resource.author" class="text-sm text-gray-600 mb-3">{{ resource.author }}</p>

                        <!-- Description -->
                        <p class="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {{ resource.description || 'Comprehensive educational resource designed to enhance your learning experience.' }}
                        </p>

                        <!-- Metadata Tags -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            <span v-if="resource.subject" class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                {{ resource.subject }}
                            </span>
                            <span v-if="resource.grade" class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {{ resource.grade.replace('Grade ', '') }}
                            </span>
                        </div>

                        <!-- Bottom Section -->
                        <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div class="flex items-center gap-1">
                                <div class="w-2 h-2 rounded-full" :class="resource.resource_type === 'physical' ? (resource.availability_status === 'available' ? 'bg-green-500' : 'bg-red-500') : 'bg-purple-500'"></div>
                                <span class="text-xs font-medium" :class="resource.resource_type === 'physical' ? (resource.availability_status === 'available' ? 'text-green-600' : 'text-red-600') : 'text-purple-600'">
                                    {{ resource.resource_type === 'physical' ? (resource.availability_status === 'available' ? 'Available' : 'Borrowed') : 'Online' }}
                                </span>
                            </div>

                            <!-- Rating/Status -->
                            <div class="flex items-center gap-1">
                                <i class="pi pi-star-fill text-yellow-400 text-xs"></i>
                                <span class="text-xs font-bold text-gray-700">4.5</span>
                            </div>
                        </div>
                    </div>
                    <button v-if="resource.type.toLowerCase() === 'book'" @click="viewResource(resource)" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">View Details</button>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <div class="mt-8 flex justify-center">
            <Paginator
                :rows="resourcesPerPage"
                :totalRecords="totalRecords"
                v-model:first="first"
                :rowsPerPageOptions="[9, 15, 24, 30]"
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

        <!-- Resource Preview Modal -->
        <Dialog v-model:visible="previewModalVisible" :modal="true" :breakpoints="{ '1200px': '75vw', '960px': '85vw', '640px': '95vw' }" :style="{ width: '60rem' }" :showHeader="false" :dismissableMask="true" :closeOnEscape="true">
            <div v-if="selectedResource" class="bg-white">
                <!-- Modal Header -->
                <div class="flex items-start gap-4 p-6 border-b border-gray-200">
                    <img :src="selectedResource.image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'" :alt="selectedResource.title" class="w-20 h-20 object-cover rounded-lg" />
                    <div class="flex-1">
                        <h2 class="text-xl font-bold text-gray-900 mb-1">{{ selectedResource.title }}</h2>
                        <p v-if="selectedResource.author" class="text-gray-600 mb-2">by {{ selectedResource.author }}</p>
                        <div class="flex items-center gap-2">
                            <span class="px-3 py-1 text-white text-xs font-bold rounded-full" :class="selectedResource.resource_type === 'physical' ? 'bg-green-600' : 'bg-purple-600'">
                                {{ selectedResource.resource_type === 'physical' ? 'Book' : 'Course' }}
                            </span>
                            <span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                {{ selectedResource.resource_type === 'physical' ? `${selectedResource.available_books_count}/${selectedResource.total_books_count} Available` : `${selectedResource.downloadable_count} Lessons` }}
                            </span>
                        </div>
                    </div>
                    <button @click="previewModalVisible = false" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <i class="pi pi-times text-gray-500"></i>
                    </button>
                </div>

                <!-- Modal Content -->
                <div class="p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Description -->
                        <div class="lg:col-span-2">
                            <h3 class="text-lg font-bold text-gray-900 mb-3">About this {{ selectedResource.resource_type === 'physical' ? 'book' : 'course' }}</h3>
                            <p class="text-gray-600 leading-relaxed mb-4">
                                {{ selectedResource.description || 'This educational resource provides valuable learning materials to enhance your knowledge and skills.' }}
                            </p>

                            <!-- Format Information for eBooks -->
                            <div v-if="selectedResource.resource_type === 'ebook' && selectedResource.ebook_types_breakdown" class="space-y-2">
                                <h4 class="font-semibold text-gray-900">Available formats:</h4>
                                <div class="flex gap-2 flex-wrap">
                                    <span v-if="selectedResource.ebook_types_breakdown.pdf > 0" class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"> 📄 {{ selectedResource.ebook_types_breakdown.pdf }} PDF </span>
                                    <span v-if="selectedResource.ebook_types_breakdown.video > 0" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"> 🎥 {{ selectedResource.ebook_types_breakdown.video }} Videos </span>
                                    <span v-if="selectedResource.ebook_types_breakdown.audio > 0" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"> 🎵 {{ selectedResource.ebook_types_breakdown.audio }} Audio </span>
                                </div>
                            </div>
                        </div>

                        <!-- Details & Actions -->
                        <div class="space-y-4">
                            <!-- Details -->
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h3 class="font-bold text-gray-900 mb-3">Details</h3>
                                <div class="space-y-2 text-sm">
                                    <div v-if="selectedResource.subject" class="flex justify-between">
                                        <span class="text-gray-600">Subject:</span>
                                        <span class="font-medium">{{ selectedResource.subject }}</span>
                                    </div>
                                    <div v-if="selectedResource.grade" class="flex justify-between">
                                        <span class="text-gray-600">Grade:</span>
                                        <span class="font-medium">{{ selectedResource.grade }}</span>
                                    </div>
                                    <div v-if="selectedResource.language" class="flex justify-between">
                                        <span class="text-gray-600">Language:</span>
                                        <span class="font-medium">{{ selectedResource.language }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="space-y-3">
                                <button v-if="selectedResource.resource_type === 'ebook'" @click="goToDetailsPage(selectedResource)" class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
                                    Start learning
                                </button>
                                <button
                                    v-else-if="selectedResource.resource_type === 'physical'"
                                    @click="requestBook(selectedResource)"
                                    class="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    :disabled="selectedResource.available_books_count === 0"
                                >
                                    {{ selectedResource.available_books_count > 0 ? 'Reserve book' : 'Currently unavailable' }}
                                </button>

                                <div class="grid grid-cols-2 gap-3">
                                    <button class="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Save</button>
                                    <button class="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Share</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    filters: {
        type: Object,
        default: () => ({})
    }
});

// Define emits for parent communication
const emit = defineEmits(['filterReset']);

const router = useRouter();
const toast = useToast();
const loading = ref(true);
const first = ref(0);
const resourcesPerPage = ref(15); // Default per_page from API is 15
const totalRecords = ref(0);
// We'll keep local bookmarks for non-authenticated users or fallback
const bookmarkedResources = ref(JSON.parse(localStorage.getItem('bookmarkedResources') || '[]'));
const userBookmarks = ref([]); // For bookmarks from the API

// Initialize with empty resources array
const resources = ref([]);

// Watch for filter changes from parent component
watch(
    () => props.filters,
    (newFilters) => {
        console.log('Filters changed in ResourceGrid:', newFilters);
        applyFiltersToAPI(newFilters);
    },
    { deep: true }
);

// Apply filters to API request
const applyFiltersToAPI = async (filters) => {
    if (!filters || Object.keys(filters).length === 0) {
        await fetchResources();
        return;
    }

    loading.value = true;
    try {
        const currentPage = Math.floor(first.value / resourcesPerPage.value) + 1;
        const params = {
            page: currentPage,
            per_page: resourcesPerPage.value,
            format: 'all'
        };

        // Add filters to API params
        if (filters.keyword && filters.keyword.trim()) {
            params.search = filters.keyword.trim();
        }
        if (filters.categoryId && filters.categoryId.length > 0) {
            params.category_ids = filters.categoryId.join(',');
        }
        if (filters.language && filters.language !== '') {
            params.language = filters.language;
        }
        if (filters.gradeLevel && filters.gradeLevel.length > 0) {
            params.grade_ids = filters.gradeLevel.join(',');
        }
        if (filters.subject && filters.subject.length > 0) {
            params.subject_ids = filters.subject.join(',');
        }
        if (filters.itemType && filters.itemType.length > 0) {
            params.ebook_type_ids = filters.itemType.join(',');
        }

        const response = await axiosInstance.get('/book-items', { params });

        if (response.data && response.data.data) {
            processResourcesData(response.data);
        }
    } catch (error) {
        console.error('Failed to fetch filtered resources:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to apply filters. Please try again.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Fetch resources from API
const fetchResources = async () => {
    loading.value = true;
    try {
        // Calculate current page from first and rows per page
        const currentPage = Math.floor(first.value / resourcesPerPage.value) + 1;

        // Add pagination parameters to the request
        const response = await axiosInstance.get('/book-items', {
            params: {
                page: currentPage,
                per_page: resourcesPerPage.value,
                format: 'all'
            }
        });

        if (response.data && response.data.data) {
            // Create a new array to hold our expanded resources
            const expandedResources = [];

            // Process each book item and create separate entries for physical books and ebooks
            response.data.data.forEach((item) => {
                const hasPhysicalBook = item.books_count && item.books_count.total > 0;
                const hasEbook = item.ebooks_count && item.ebooks_count.total > 0;

                // If it has physical books, create a physical book card
                if (hasPhysicalBook) {
                    const physicalBookCard = {
                        id: `${item.id}-physical`,
                        originalId: item.id,
                        title: item.title,
                        author: item.author,
                        description: item.description,
                        type: 'Physical Book',
                        image: item.cover_image,
                        category: item.category ? item.category.name : null,
                        language: item.language ? item.language.name : null,
                        grade: item.grade ? `Grade ${item.grade.name}` : '',
                        subject: item.subject ? item.subject.name : null,
                        library: item.library ? item.library.name : null,
                        available_books_count: item.books_count.available,
                        total_books_count: item.books_count.total,
                        availability_status: item.books_count.available > 0 ? 'available' : 'borrowed',
                        resource_type: 'physical',
                        // Only include what's in the API response
                        is_physical: true
                    };
                    expandedResources.push(physicalBookCard);
                }

                // If it has ebooks, create one combined ebook card
                if (hasEbook) {
                    const ebookTypes = item.ebooks_count.by_type || {};

                    // Create combined type string showing all available formats
                    const availableTypes = [];
                    if (ebookTypes.pdf > 0) availableTypes.push(`PDF (${ebookTypes.pdf})`);
                    if (ebookTypes.video > 0) availableTypes.push(`Video (${ebookTypes.video})`);
                    if (ebookTypes.audio > 0) availableTypes.push(`Audio (${ebookTypes.audio})`);

                    const ebookCard = {
                        id: `${item.id}-ebook`,
                        originalId: item.id,
                        title: item.title,
                        author: item.author,
                        description: item.description,
                        type: 'Digital Collection',
                        image: item.cover_image,
                        category: item.category ? item.category.name : null,
                        language: item.language ? item.language.name : null,
                        grade: item.grade ? `Grade ${item.grade.name}` : '',
                        subject: item.subject ? item.subject.name : null,
                        library: item.library ? item.library.name : null,
                        total_ebooks_count: item.ebooks_count.total,
                        downloadable_count: item.ebooks_count.downloadable,
                        ebook_types: availableTypes.join(', '),
                        ebooks_count: item.ebooks_count,
                        availability_status: 'available',
                        resource_type: 'ebook',
                        ebook_types_breakdown: ebookTypes,
                        is_ebook: true
                    };
                    expandedResources.push(ebookCard);
                }
            });

            // Set the resources to our expanded list
            resources.value = expandedResources;

            // Set total records (now it's the number of cards, not book items)
            totalRecords.value = expandedResources.length;
        }
    } catch (error) {
        console.error('Failed to fetch resources:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load resources. Please try again.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Enhanced helper functions for better UI
const clearAllFilters = () => {
    emit('filterReset');
    toast.add({
        severity: 'success',
        summary: 'Filters Cleared',
        detail: 'All filters have been cleared. Showing all resources.',
        life: 2000
    });
};

const showSuggestions = () => {
    toast.add({
        severity: 'info',
        summary: 'Tip',
        detail: 'Try browsing by category or reducing filter criteria to find more resources.',
        life: 4000
    });
};

const processResourcesData = (apiResponse) => {
    // Create a new array to hold our expanded resources
    const expandedResources = [];

    // Process each book item and create separate entries for physical books and ebooks
    apiResponse.data.forEach((item) => {
        const hasPhysicalBook = item.books_count && item.books_count.total > 0;
        const hasEbook = item.ebooks_count && item.ebooks_count.total > 0;

        // If it has physical books, create a physical book card
        if (hasPhysicalBook) {
            const physicalBookCard = {
                id: `${item.id}-physical`,
                originalId: item.id,
                title: item.title,
                author: item.author,
                description: item.description,
                type: 'Physical Book',
                image: item.cover_image,
                category: item.category ? item.category.name : null,
                language: item.language ? item.language.name : null,
                grade: item.grade ? `Grade ${item.grade.name}` : '',
                subject: item.subject ? item.subject.name : null,
                library: item.library ? item.library.name : null,
                available_books_count: item.books_count.available,
                total_books_count: item.books_count.total,
                availability_status: item.books_count.available > 0 ? 'available' : 'borrowed',
                resource_type: 'physical',
                is_physical: true
            };
            expandedResources.push(physicalBookCard);
        }

        // If it has ebooks, create one combined ebook card
        if (hasEbook) {
            const ebookTypes = item.ebooks_count.by_type || {};

            // Create combined type string showing all available formats
            const availableTypes = [];
            if (ebookTypes.pdf > 0) availableTypes.push(`PDF (${ebookTypes.pdf})`);
            if (ebookTypes.video > 0) availableTypes.push(`Video (${ebookTypes.video})`);
            if (ebookTypes.audio > 0) availableTypes.push(`Audio (${ebookTypes.audio})`);

            const ebookCard = {
                id: `${item.id}-ebook`,
                originalId: item.id,
                title: item.title,
                author: item.author,
                description: item.description,
                type: 'Digital Collection',
                image: item.cover_image,
                category: item.category ? item.category.name : null,
                language: item.language ? item.language.name : null,
                grade: item.grade ? `Grade ${item.grade.name}` : '',
                subject: item.subject ? item.subject.name : null,
                library: item.library ? item.library.name : null,
                total_ebooks_count: item.ebooks_count.total,
                downloadable_count: item.ebooks_count.downloadable,
                ebook_types: availableTypes.join(', '),
                ebooks_count: item.ebooks_count,
                availability_status: 'available',
                resource_type: 'ebook',
                ebook_types_breakdown: ebookTypes,
                is_ebook: true
            };
            expandedResources.push(ebookCard);
        }
    });

    // Set the resources to our expanded list
    resources.value = expandedResources;

    // Set pagination info from API response
    totalRecords.value = apiResponse.total || 0;
};

// Helper functions
const resetFilters = () => {
    // Reset the filters and fetch all resources
    console.log('Filters reset');
    fetchResources();
};

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const onPageChange = (event) => {
    first.value = event.first;
    resourcesPerPage.value = event.rows;

    // Fetch resources with the new pagination parameters
    fetchResources();
    console.log('Page changed:', {
        page: Math.floor(event.first / event.rows) + 1,
        perPage: event.rows,
        first: event.first
    });
};

// We no longer need these functions since we're using the actual data from the API

// Fetch user's bookmarks from the API
const fetchUserBookmarks = async () => {
    try {
        const response = await axiosInstance.get('/bookmarks', {
            params: {
                with: 'ebook,ebook.bookItem'
            }
        });

        if (response.data && response.data.data) {
            // Map the bookmarks to an easier format for checking
            userBookmarks.value = response.data.data.map((bookmark) => ({
                id: bookmark.id,
                e_book_id: bookmark.e_book_id,
                resource_id: bookmark.ebook?.book_item_id || null
            }));

            console.log('User bookmarks loaded:', userBookmarks.value.length);
        }
    } catch (error) {
        console.error('Error fetching user bookmarks:', error);
        // We'll continue with local storage as fallback
    }
};

// Fetch data when component mounts
onMounted(() => {
    fetchResources();
});

// Local state for preview modal
const previewModalVisible = ref(false);
const selectedResource = ref(null);

// Show resource preview
const showResourcePreview = (resource) => {
    // Set selected resource
    selectedResource.value = resource;

    // Show the modal
    previewModalVisible.value = true;
};

// Function to request/reserve a book
const requestBook = (resource) => {
    if (resource && resource.available_books_count > 0) {
        toast.add({
            severity: 'info',
            summary: 'Book Reservation',
            detail: `Your request for "${resource.title}" has been submitted.`,
            life: 3000
        });

        // Here you would normally send a request to the API
        // For now we'll just show a confirmation toast
    } else {
        toast.add({
            severity: 'error',
            summary: 'Unavailable',
            detail: 'This book is currently unavailable for reservation.',
            life: 3000
        });
    }
};

// Navigate to details page
const goToDetailsPage = (resource) => {
    if (resource && resource.id) {
        // Extract the original ID for the API call
        const originalId = resource.originalId || resource.id.split('-')[0];
        previewModalVisible.value = false;

        if (resource.resource_type === 'ebook') {
            router.push(`/ebook-details/${originalId}`);
        }
    }
};
</script>

<style scoped>
/* Enhanced animations and utilities */
@keyframes float {
    0%,
    100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

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

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}

.animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
}

.animate-slideInLeft {
    animation: slideInFromLeft 0.6s ease-out forwards;
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

.line-clamp-4 {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur()) {
    .backdrop-blur-sm {
        background-color: rgba(255, 255, 255, 0.9);
    }
    .backdrop-blur-md {
        background-color: rgba(255, 255, 255, 0.85);
    }
}

/* Transform GPU acceleration */
.transform-gpu {
    transform-style: preserve-3d;
    backface-visibility: hidden;
    will-change: transform;
}

/* Hover animations */
.group:hover .transform-gpu {
    transform: translateY(-4px) scale(1.02);
}

/* Text shadow for better readability */
.text-shadow-sm {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.text-shadow-md {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

/* Enhanced PrimeVue component styling */
:deep(.p-dialog) {
    border-radius: 1rem;
    overflow: hidden;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

:deep(.p-dialog-mask) {
    backdrop-filter: blur(8px);
    background-color: rgba(0, 0, 0, 0.7);
}

:deep(.p-paginator) {
    border: none;
    background: transparent;
    padding: 1.5rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
    color: #6366f1;
    border: 2px solid transparent;
    margin: 0 0.25rem;
    border-radius: 0.75rem;
    min-width: 2.5rem;
    height: 2.5rem;
    transition: all 0.3s ease;
    font-weight: 500;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page:hover) {
    background: linear-gradient(135deg, #a855f7, #6366f1);
    color: white;
    border-color: #a855f7;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.3);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: white;
    border-color: #7c3aed;
    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
}

/* Enhanced input styling */
:deep(.p-inputtext) {
    border-radius: 0.75rem;
    border: 2px solid #e5e7eb;
    transition: all 0.3s ease;
    padding: 0.75rem 1rem;
}

:deep(.p-inputtext:hover) {
    border-color: #a855f7;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

:deep(.p-inputtext:focus) {
    border-color: #7c3aed;
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.2);
}

/* Card hover effects */
.resource-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform, box-shadow;
}

.resource-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Gradient borders */
.gradient-border {
    position: relative;
    background:
        linear-gradient(white, white) padding-box,
        linear-gradient(135deg, #667eea, #764ba2) border-box;
    border: 2px solid transparent;
}

/* Loading spinner enhancements */
.spinner-overlay {
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(100%);
    }
}
</style>
