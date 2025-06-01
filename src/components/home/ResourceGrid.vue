<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useFilterStore } from '@/stores/filterStore';
import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import { storeToRefs } from 'pinia';
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Use stores
const filterStore = useFilterStore();
const authStore = useAuthStore();
const { resources, loading, totalRecords, currentPage, resourcesPerPage } = storeToRefs(filterStore);

const user = computed(() => authStore.getUser || {});
const userId = computed(() => (user.value && user.value.user ? user.value.user.id : null));
const authLoading = ref(true);

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
// We'll keep local bookmarks for non-authenticated users or fallback
const userBookmarks = ref([]); // For bookmarks from the API

// Computed property to get current page first index
const first = computed(() => (currentPage.value - 1) * resourcesPerPage.value);

// Helper functions
const resetFilters = () => {
    // Reset the filters and fetch all resources
    console.log('Filters reset');
    filterStore.resetFilters();
};

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const onPageChange = (event) => {
    const page = Math.floor(event.first / resourcesPerPage.value) + 1;
    filterStore.updatePage(page);
    console.log('Page changed:', {
        page: page,
        perPage: resourcesPerPage.value,
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

// Watch for user changes and re-authenticate if needed
watch(
    () => user.value,
    async (newUser) => {
        if (!newUser && !!localStorage.getItem('pinia-auth')) {
            await authStore.authCheck();
        }
    },
    { immediate: true }
);

// Fetch data when component mounts
onMounted(async () => {
    const token = Cookies.get('access_token');
    if (token && !user.value) {
        await authStore.authCheck();
    }
    authLoading.value = false;
    await filterStore.fetchResources();
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
const requestBook = async (resource) => {
    if (resource && resource.available_books_count > 0) {
        try {
            await axiosInstance.post('/reservations', {
                book_item_id: resource.originalId // always send book_item_id
            });

            toast.add({
                severity: 'info',
                summary: 'Book Reservation',
                detail: `Your request for "${resource.title}" has been submitted.`,
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Reservation Failed',
                detail: error.response?.data?.message || 'Failed to submit reservation request.',
                life: 3000
            });
            return;
        }
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
            // Close modal and navigate to EbookDetails page
            setTimeout(() => {
                router.push(`/ebook-details/${originalId}`);
            }, 100);
        }
    }
};
</script>
<template>
    <div id="resource-grid" class="w-full lg:w-3/4 min-h-screen">
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
        <!-- Enhanced Udemy-style Course Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div v-for="resource in resources" :key="resource.id" class="group cursor-pointer h-full" @click="showResourcePreview(resource)">
                <!-- Enhanced Course Card with Fixed Height -->
                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full min-h-[480px] max-h-[480px]">
                    <!-- Course Image with Enhanced Overlays -->
                    <div class="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
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

                        <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>

                        <!-- Course Type Badge -->
                        <div class="absolute top-3 left-3">
                            <span class="px-3 py-1.5 bg-white/95 text-xs font-bold rounded-full shadow-md" :class="resource.resource_type === 'physical' ? 'text-green-700' : 'text-purple-700'">
                                {{ resource.resource_type === 'physical' ? '📚 Physical Book' : '🎓 Digital Course' }}
                            </span>
                        </div>

                        <!-- Enhanced Availability/Count Badge -->
                        <div class="absolute top-3 right-3">
                            <span v-if="resource.resource_type === 'physical'" class="px-3 py-1.5 bg-white/95 text-xs font-bold rounded-full shadow-md" :class="resource.availability_status === 'available' ? 'text-green-700' : 'text-red-700'">
                                {{ resource.available_books_count }}/{{ resource.total_books_count }} Available
                            </span>
                            <span v-else class="px-3 py-1.5 bg-white/95 text-purple-700 text-xs font-bold rounded-full shadow-md"> {{ resource.downloadable_count }} Lessons </span>
                        </div>

                        <!-- Content Type Indicators for eBooks -->
                        <div v-if="resource.resource_type === 'ebook' && resource.ebook_types_breakdown" class="absolute bottom-3 left-3">
                            <div class="flex gap-1">
                                <span v-if="resource.ebook_types_breakdown.pdf > 0" class="px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full"> 📄 {{ resource.ebook_types_breakdown.pdf }} </span>
                                <span v-if="resource.ebook_types_breakdown.video > 0" class="px-2 py-1 bg-blue-500/90 text-white text-xs font-bold rounded-full"> 🎥 {{ resource.ebook_types_breakdown.video }} </span>
                                <span v-if="resource.ebook_types_breakdown.audio > 0" class="px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full"> 🎵 {{ resource.ebook_types_breakdown.audio }} </span>
                            </div>
                        </div>
                    </div>
                    <!-- Enhanced Course Content -->
                    <div class="p-4 flex-1 flex flex-col">
                        <!-- Educational Metadata Row -->
                        <div class="flex flex-wrap gap-1.5 mb-2">
                            <span v-if="resource.category" class="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-200">
                                <i class="pi pi-folder mr-1 text-xs"></i>
                                {{ resource.category }}
                            </span>
                            <span v-if="resource.subject" class="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-semibold border border-purple-200">
                                <i class="pi pi-book mr-1 text-xs"></i>
                                {{ resource.subject }}
                            </span>
                            <span v-if="resource.grade" class="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-semibold border border-orange-200">
                                <i class="pi pi-chart-line mr-1 text-xs"></i>
                                {{ resource.grade.replace('Grade ', 'Gr ') }}
                            </span>
                        </div>

                        <!-- Title -->
                        <h3 class="font-bold text-gray-900 text-base mb-2 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">
                            {{ resource.title }}
                        </h3>

                        <!-- Author with enhanced styling -->
                        <p v-if="resource.author" class="text-sm text-gray-600 mb-2 flex items-center">
                            <i class="pi pi-user text-gray-400 mr-2"></i>
                            {{ resource.author }}
                        </p>

                        <!-- Description -->
                        <p class="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed flex-grow">
                            {{ resource.description || 'Comprehensive educational resource designed to enhance your learning experience.' }}
                        </p>

                        <!-- Enhanced Metadata Section -->
                        <div class="space-y-2 mb-3">
                            <!-- Language and Library Info -->
                            <div class="flex items-center justify-between text-xs text-gray-500">
                                <span v-if="resource.language" class="flex items-center">
                                    <i class="pi pi-globe mr-1"></i>
                                    {{ resource.language }}
                                </span>
                                <span v-if="resource.library" class="flex items-center">
                                    <i class="pi pi-building mr-1"></i>
                                    {{ resource.library }}
                                </span>
                            </div>

                            <!-- Content Summary for eBooks -->
                            <div v-if="resource.resource_type === 'ebook' && resource.ebook_types_breakdown" class="bg-gray-50 rounded-lg p-2">
                                <div class="text-xs text-gray-600 mb-1 font-medium">Content:</div>
                                <div class="flex flex-wrap gap-1">
                                    <span v-if="resource.ebook_types_breakdown.pdf > 0" class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                        {{ resource.ebook_types_breakdown.pdf }} PDF{{ resource.ebook_types_breakdown.pdf > 1 ? 's' : '' }}
                                    </span>
                                    <span v-if="resource.ebook_types_breakdown.video > 0" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        {{ resource.ebook_types_breakdown.video }} Video{{ resource.ebook_types_breakdown.video > 1 ? 's' : '' }}
                                    </span>
                                    <span v-if="resource.ebook_types_breakdown.audio > 0" class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        {{ resource.ebook_types_breakdown.audio }} Audio{{ resource.ebook_types_breakdown.audio > 1 ? 's' : '' }}
                                    </span>
                                </div>
                            </div>

                            <!-- Physical Book Summary -->
                            <div v-if="resource.resource_type === 'physical'" class="bg-gray-50 rounded-lg p-2">
                                <div class="flex items-center justify-between">
                                    <div class="text-xs text-gray-600">
                                        <span class="font-medium">Availability:</span>
                                        <span :class="resource.availability_status === 'available' ? 'text-green-600' : 'text-red-600'" class="font-bold ml-1"> {{ resource.available_books_count }}/{{ resource.total_books_count }} </span>
                                    </div>
                                    <div class="flex items-center">
                                        <div class="w-2 h-2 rounded-full mr-1" :class="resource.availability_status === 'available' ? 'bg-green-500' : 'bg-red-500'"></div>
                                        <span class="text-xs font-medium" :class="resource.availability_status === 'available' ? 'text-green-600' : 'text-red-600'">
                                            {{ resource.availability_status === 'available' ? 'Available' : 'Limited' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Enhanced Bottom Action Section -->
                        <div class="pt-3 border-t border-gray-100 mt-auto">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <!-- Resource Type Indicator -->
                                    <div class="flex items-center">
                                        <div class="w-2 h-2 rounded-full mr-2" :class="resource.resource_type === 'physical' ? (resource.availability_status === 'available' ? 'bg-green-500' : 'bg-red-500') : 'bg-purple-500'"></div>
                                        <span class="text-xs font-medium" :class="resource.resource_type === 'physical' ? (resource.availability_status === 'available' ? 'text-green-600' : 'text-red-600') : 'text-purple-600'">
                                            {{ resource.resource_type === 'physical' ? (resource.availability_status === 'available' ? 'Ready' : 'Wait list') : 'Start now' }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Action Button -->
                                <button
                                    class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200"
                                    :class="
                                        resource.resource_type === 'physical'
                                            ? resource.availability_status === 'available'
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    "
                                    @click.stop="resource.resource_type === 'physical' ? requestBook(resource) : goToDetailsPage(resource)"
                                >
                                    {{ resource.resource_type === 'physical' ? (resource.availability_status === 'available' ? 'Reserve' : 'Not Available') : 'Start' }}
                                </button>
                            </div>
                        </div>
                    </div>
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
        <Dialog
            v-model:visible="previewModalVisible"
            :modal="true"
            :breakpoints="{ '1200px': '75vw', '960px': '85vw', '640px': '95vw' }"
            :style="{ width: '60rem' }"
            :showHeader="false"
            :dismissableMask="true"
            :closeOnEscape="true"
            class="resource-preview-modal"
        >
            <div v-if="selectedResource" class="bg-white overflow-hidden">
                <!-- Mobile Header Image (Full Width on Mobile) -->
                <div class="block md:hidden relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img :src="selectedResource.image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'" :alt="selectedResource.title" class="w-full h-full object-cover" />

                    <!-- Mobile Image Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    <!-- Close Button -->
                    <button @click="previewModalVisible = false" class="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors z-10">
                        <i class="pi pi-times text-white text-lg"></i>
                    </button>

                    <!-- Resource Type Badge - Mobile -->
                    <div class="absolute top-4 left-4">
                        <span class="px-3 py-1.5 bg-white/95 text-xs font-bold rounded-full shadow-md" :class="selectedResource.resource_type === 'physical' ? 'text-green-700' : 'text-purple-700'">
                            {{ selectedResource.resource_type === 'physical' ? '📚 Physical Book' : '🎓 Digital Course' }}
                        </span>
                    </div>

                    <!-- Mobile Title Overlay -->
                    <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h2 class="text-xl font-bold mb-1 leading-tight">{{ selectedResource.title }}</h2>
                        <p v-if="selectedResource.author" class="text-white/90 text-sm mb-3">by {{ selectedResource.author }}</p>

                        <!-- Mobile Quick Stats -->
                        <div class="flex items-center gap-4 text-xs text-white/90">
                            <span v-if="selectedResource.resource_type === 'physical'" class="flex items-center gap-1">
                                <i class="pi pi-bookmark"></i>
                                {{ selectedResource.available_books_count }}/{{ selectedResource.total_books_count }} Available
                            </span>
                            <span v-else class="flex items-center gap-1">
                                <i class="pi pi-play-circle"></i>
                                {{ selectedResource.downloadable_count }} Lessons
                            </span>
                            <span v-if="selectedResource.library" class="flex items-center gap-1">
                                <i class="pi pi-building"></i>
                                {{ selectedResource.library }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Desktop Modal Header (Hidden on Mobile) -->
                <div class="hidden md:flex items-start gap-6 p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div class="w-24 h-32 flex-shrink-0">
                        <img
                            :src="selectedResource.image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'"
                            :alt="selectedResource.title"
                            class="w-full h-full object-cover rounded-lg shadow-md"
                        />
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                            <div class="flex-1 min-w-0 mr-4">
                                <h2 class="text-2xl font-bold text-gray-900 mb-2 leading-tight">{{ selectedResource.title }}</h2>
                                <p v-if="selectedResource.author" class="text-gray-600 mb-3 text-lg">by {{ selectedResource.author }}</p>

                                <!-- Enhanced metadata badges -->
                                <div class="flex flex-wrap gap-2 mb-4">
                                    <span class="px-3 py-1.5 text-white text-sm font-bold rounded-full" :class="selectedResource.resource_type === 'physical' ? 'bg-green-600' : 'bg-purple-600'">
                                        {{ selectedResource.resource_type === 'physical' ? '📚 Physical Book' : '🎓 Digital Course' }}
                                    </span>
                                    <span v-if="selectedResource.category" class="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full border border-blue-200">
                                        <i class="pi pi-folder mr-1"></i>{{ selectedResource.category }}
                                    </span>
                                    <span v-if="selectedResource.subject" class="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full border border-purple-200">
                                        <i class="pi pi-book mr-1"></i>{{ selectedResource.subject }}
                                    </span>
                                    <span v-if="selectedResource.grade" class="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full border border-orange-200">
                                        <i class="pi pi-chart-line mr-1"></i>{{ selectedResource.grade }}
                                    </span>
                                    <span v-if="selectedResource.language" class="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full border border-gray-200">
                                        <i class="pi pi-globe mr-1"></i>{{ selectedResource.language }}
                                    </span>
                                </div>

                                <!-- Resource statistics -->
                                <div class="flex items-center gap-6 text-sm text-gray-600">
                                    <span v-if="selectedResource.resource_type === 'physical'" class="flex items-center gap-1">
                                        <i class="pi pi-bookmark text-gray-400"></i>
                                        <span class="font-medium">{{ selectedResource.available_books_count }}/{{ selectedResource.total_books_count }} Available</span>
                                    </span>
                                    <span v-else class="flex items-center gap-1">
                                        <i class="pi pi-play-circle text-gray-400"></i>
                                        <span class="font-medium">{{ selectedResource.downloadable_count }} Lessons</span>
                                    </span>
                                    <span v-if="selectedResource.library" class="flex items-center gap-1">
                                        <i class="pi pi-building text-gray-400"></i>
                                        {{ selectedResource.library }}
                                    </span>
                                </div>
                            </div>

                            <button @click="previewModalVisible = false" class="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                                <i class="pi pi-times text-gray-500"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Modal Content -->
                <div class="p-4 md:p-6">
                    <!-- Mobile metadata badges (shown only on mobile) -->
                    <div class="md:hidden mb-4">
                        <div class="flex flex-wrap gap-2">
                            <span v-if="selectedResource.category" class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200"> <i class="pi pi-folder mr-1"></i>{{ selectedResource.category }} </span>
                            <span v-if="selectedResource.subject" class="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200"> <i class="pi pi-book mr-1"></i>{{ selectedResource.subject }} </span>
                            <span v-if="selectedResource.grade" class="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200"> <i class="pi pi-chart-line mr-1"></i>{{ selectedResource.grade }} </span>
                            <span v-if="selectedResource.language" class="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200"> <i class="pi pi-globe mr-1"></i>{{ selectedResource.language }} </span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Description and Content -->
                        <div class="lg:col-span-2 space-y-6">
                            <div>
                                <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <i class="pi pi-info-circle text-blue-500"></i>
                                    About this {{ selectedResource.resource_type === 'physical' ? 'book' : 'course' }}
                                </h3>
                                <p class="text-gray-600 leading-relaxed text-sm md:text-base">
                                    {{ selectedResource.description || 'This educational resource provides valuable learning materials to enhance your knowledge and skills.' }}
                                </p>
                            </div>

                            <!-- Format Information for eBooks -->
                            <div v-if="selectedResource.resource_type === 'ebook' && selectedResource.ebook_types_breakdown" class="bg-gray-50 rounded-lg p-4">
                                <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <i class="pi pi-file text-purple-500"></i>
                                    Available Content Formats
                                </h4>
                                <div class="grid grid-cols-3 gap-3">
                                    <div v-if="selectedResource.ebook_types_breakdown.pdf > 0" class="text-center p-3 bg-red-100 rounded-lg border border-red-200">
                                        <i class="pi pi-file-pdf text-red-500 text-2xl mb-2 block"></i>
                                        <div class="text-red-700 font-bold text-lg">{{ selectedResource.ebook_types_breakdown.pdf }}</div>
                                        <div class="text-red-600 text-sm">PDF Documents</div>
                                    </div>
                                    <div v-if="selectedResource.ebook_types_breakdown.video > 0" class="text-center p-3 bg-blue-100 rounded-lg border border-blue-200">
                                        <i class="pi pi-video text-blue-500 text-2xl mb-2 block"></i>
                                        <div class="text-blue-700 font-bold text-lg">{{ selectedResource.ebook_types_breakdown.video }}</div>
                                        <div class="text-blue-600 text-sm">Video Lessons</div>
                                    </div>
                                    <div v-if="selectedResource.ebook_types_breakdown.audio > 0" class="text-center p-3 bg-green-100 rounded-lg border border-green-200">
                                        <i class="pi pi-volume-up text-green-500 text-2xl mb-2 block"></i>
                                        <div class="text-green-700 font-bold text-lg">{{ selectedResource.ebook_types_breakdown.audio }}</div>
                                        <div class="text-green-600 text-sm">Audio Files</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Physical Book Information -->
                            <div v-if="selectedResource.resource_type === 'physical'" class="bg-gray-50 rounded-lg p-4">
                                <h4 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <i class="pi pi-bookmark text-green-500"></i>
                                    Book Availability
                                </h4>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="text-center p-3 bg-green-100 rounded-lg border border-green-200">
                                        <div class="text-green-700 font-bold text-2xl">{{ selectedResource.available_books_count }}</div>
                                        <div class="text-green-600 text-sm">Available Now</div>
                                    </div>
                                    <div class="text-center p-3 bg-gray-100 rounded-lg border border-gray-200">
                                        <div class="text-gray-700 font-bold text-2xl">{{ selectedResource.total_books_count }}</div>
                                        <div class="text-gray-600 text-sm">Total Copies</div>
                                    </div>
                                </div>
                                <div class="mt-3 flex items-center justify-center">
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded-full" :class="selectedResource.availability_status === 'available' ? 'bg-green-500' : 'bg-red-500'"></div>
                                        <span class="text-sm font-medium" :class="selectedResource.availability_status === 'available' ? 'text-green-600' : 'text-red-600'">
                                            {{ selectedResource.availability_status === 'available' ? 'Ready for reservation' : 'Limited availability' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Details & Actions Sidebar -->
                        <div class="space-y-6">
                            <!-- Resource Details -->
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <i class="pi pi-info text-blue-500"></i>
                                    Resource Details
                                </h3>
                                <div class="space-y-3 text-sm">
                                    <div v-if="selectedResource.subject" class="flex justify-between items-center">
                                        <span class="text-gray-600 flex items-center gap-1">
                                            <i class="pi pi-book text-gray-400"></i>
                                            Subject:
                                        </span>
                                        <span class="font-medium text-gray-900">{{ selectedResource.subject }}</span>
                                    </div>
                                    <div v-if="selectedResource.grade" class="flex justify-between items-center">
                                        <span class="text-gray-600 flex items-center gap-1">
                                            <i class="pi pi-chart-line text-gray-400"></i>
                                            Grade:
                                        </span>
                                        <span class="font-medium text-gray-900">{{ selectedResource.grade }}</span>
                                    </div>
                                    <div v-if="selectedResource.language" class="flex justify-between items-center">
                                        <span class="text-gray-600 flex items-center gap-1">
                                            <i class="pi pi-globe text-gray-400"></i>
                                            Language:
                                        </span>
                                        <span class="font-medium text-gray-900">{{ selectedResource.language }}</span>
                                    </div>
                                    <div v-if="selectedResource.category" class="flex justify-between items-center">
                                        <span class="text-gray-600 flex items-center gap-1">
                                            <i class="pi pi-folder text-gray-400"></i>
                                            Category:
                                        </span>
                                        <span class="font-medium text-gray-900">{{ selectedResource.category }}</span>
                                    </div>
                                    <div v-if="selectedResource.library" class="flex justify-between items-center">
                                        <span class="text-gray-600 flex items-center gap-1">
                                            <i class="pi pi-building text-gray-400"></i>
                                            Library:
                                        </span>
                                        <span class="font-medium text-gray-900">{{ selectedResource.library }}</span>
                                    </div>
                                </div>
                            </div>
                            <!-- Actions -->
                            <div class="space-y-3">
                                <!-- Mobile Primary Action Button (Full Width) -->
                                <button
                                    v-if="selectedResource.resource_type === 'ebook'"
                                    @click="goToDetailsPage(selectedResource)"
                                    class="w-full py-3 md:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md text-sm md:text-base"
                                >
                                    <i class="pi pi-play-circle"></i>
                                    Start learning
                                </button>
                                <button
                                    v-else-if="selectedResource.resource_type === 'physical'"
                                    @click="requestBook(selectedResource)"
                                    class="w-full py-3 md:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md text-sm md:text-base"
                                    :disabled="selectedResource.available_books_count === 0"
                                >
                                    <i class="pi pi-bookmark"></i>
                                    {{ selectedResource.available_books_count > 0 ? 'Reserve book' : 'Currently unavailable' }}
                                </button>

                                <!-- Secondary Actions (Mobile Optimized) -->
                                <div class="grid grid-cols-2 gap-3">
                                    <button class="py-2 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1">
                                        <i class="pi pi-heart"></i>
                                        <span class="hidden sm:inline">Save</span>
                                    </button>
                                    <button class="py-2 md:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1">
                                        <i class="pi pi-share-alt"></i>
                                        <span class="hidden sm:inline">Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<!-- <script setup>
import { useFilterStore } from '@/stores/filterStore';
import axiosInstance from '@/util/axios-config';
import { storeToRefs } from 'pinia';
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Use Pinia store
const filterStore = useFilterStore();
const { resources, loading, totalRecords, currentPage, resourcesPerPage } = storeToRefs(filterStore);

const router = useRouter();
const toast = useToast();
// We'll keep local bookmarks for non-authenticated users or fallback
const bookmarkedResources = ref(JSON.parse(localStorage.getItem('bookmarkedResources') || '[]'));
const userBookmarks = ref([]); // For bookmarks from the API

// Computed property to get current page first index
const first = computed(() => (currentPage.value - 1) * resourcesPerPage.value);

// Enhanced helper functions for better UI
const clearAllFilters = () => {
    filterStore.resetFilters();
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

// Helper functions
const resetFilters = () => {
    // Reset the filters and fetch all resources
    console.log('Filters reset');
    filterStore.resetFilters();
};

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const onPageChange = (event) => {
    const page = Math.floor(event.first / resourcesPerPage.value) + 1;
    filterStore.updatePage(page);
    console.log('Page changed:', {
        page: page,
        perPage: resourcesPerPage.value,
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
    filterStore.fetchResources();
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
            // Close modal and navigate to EbookDetails page
            setTimeout(() => {
                router.push(`/ebook-details/${originalId}`);
            }, 100);
        }
    }
};
</script> -->

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

/* Mobile modal optimizations */
:deep(.resource-preview-modal .p-dialog) {
    margin: 0;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
}

@media (min-width: 768px) {
    :deep(.resource-preview-modal .p-dialog) {
        margin: 1rem;
        height: auto;
        max-height: calc(100vh - 2rem);
        border-radius: 1rem;
    }
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
