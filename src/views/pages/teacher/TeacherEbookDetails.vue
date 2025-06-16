<script setup>
// ... existing code... (same as EbookDetails.vue but with additional teacher functionality)
import axiosInstance from '@/util/axios-config';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Import components
import CollectionModal from '@/components/modals/CollectionModal.vue';
import AddEbookDialog from '@/views/pages/book/components/AddEbookDialog.vue';
import EditBookItemDialog from '@/views/pages/book/components/EditBookItemDialog.vue';
import EditEbookDialog from '@/views/pages/book/components/EditEbookDialog.vue';

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
const resourcesPerPage = ref(12);
const deleting = ref(false);

// Modal states
const showAddEbookModal = ref(false);
const showEditEbookModal = ref(false);
const showEditBookItemModal = ref(false);
const showCollectionModal = ref(false);
const showDeleteDialog = ref(false);

// Selected items
const selectedEbook = ref(null);
const selectedEbookForCollection = ref(null);

// Filtering
const filters = ref({
    type: 'all',
    downloadable: 'all'
});

// Options
const ebookTypes = ref([]);
const filterOptions = ref({
    categories: [],
    subjects: [],
    grades: [],
    languages: [],
    libraries: []
});

const bookItemId = computed(() => route.params.id);

// Computed properties
const filteredEbooks = computed(() => {
    let result = [...ebooks.value];

    if (filters.value.type !== 'all') {
        result = result.filter((ebook) => ebook.e_book_type?.name?.toLowerCase() === filters.value.type.toLowerCase());
    }

    if (filters.value.downloadable !== 'all') {
        const isDownloadable = filters.value.downloadable === 'yes';
        result = result.filter((ebook) => ebook.is_downloadable === isDownloadable);
    }

    return result;
});

const downloadableCount = computed(() => {
    return ebooks.value.filter((ebook) => ebook.is_downloadable).length;
});

const videoCount = computed(() => {
    return ebooks.value.filter((ebook) => isYoutubeVideo(ebook)).length;
});

const pdfCount = computed(() => {
    return ebooks.value.filter((ebook) => isPdfFile(ebook)).length;
});

// Methods (same as EbookDetails.vue)
const fetchEbooks = async () => {
    loading.value = true;
    error.value = null;

    try {
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

            if (response.data.pagination) {
                totalRecords.value = response.data.pagination.total;
            }

            if (ebooks.value.length > 0 && ebooks.value[0].book_item) {
                bookItem.value = ebooks.value[0].book_item;
            } else {
                await fetchBookItemDetails();
            }
        } else {
            await fetchBookItemDetails();
        }
    } catch (err) {
        console.error('Error fetching ebooks:', err);
        error.value = 'Failed to load digital resources. Please try again.';
    } finally {
        loading.value = false;
    }
};

const fetchBookItemDetails = async () => {
    try {
        const response = await axiosInstance.get(`/book-items/${bookItemId.value}`, {
            params: { with: 'category,subject,grade,language,library' }
        });
        if (response.data && response.data.data) {
            bookItem.value = response.data.data;
        } else {
            error.value = 'Resource information not found';
        }
    } catch (err) {
        console.error('Error fetching book item details:', err);
        error.value = 'Failed to load resource information';
    }
};

const fetchFilterOptions = async () => {
    try {
        const response = await axiosInstance.get('/constants/all');
        const data = response.data;

        filterOptions.value.categories = (data.categories?.data || []).map((c) => ({ label: c.name, value: c.id }));
        filterOptions.value.subjects = (data.subjects?.data || []).map((s) => ({ label: s.name, value: s.id }));
        filterOptions.value.grades = (data.grades?.data || []).map((g) => ({ label: g.name, value: g.id }));
        filterOptions.value.languages = (data.languages?.data || []).map((l) => ({ label: l.name, value: l.id }));
        filterOptions.value.libraries = (data.libraries?.data || []).map((l) => ({ label: l.name, value: l.id }));
        ebookTypes.value = (data.ebook_types?.data || []).map((t) => ({ label: t.name, value: t.id }));
    } catch (error) {
        console.error('Error fetching filter options:', error);
    }
};

// Helper functions (same as EbookDetails.vue)
const isYoutubeVideo = (ebook) => {
    const type = ebook.e_book_type?.name?.toLowerCase() || '';
    return type.includes('video');
};

const isPdfFile = (ebook) => {
    const type = ebook.e_book_type?.name?.toLowerCase() || '';
    return type.includes('pdf');
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

const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

const getYoutubeEmbedUrl = (ebook) => {
    if (!ebook || !ebook.file_path) return null;
    const videoId = getYoutubeVideoId(ebook.file_path);
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    if (isYoutubeVideo(ebook)) {
        return ebook.file_path;
    }
    return null;
};

const openInReader = (ebook) => {
    if (isYoutubeVideo(ebook)) {
        const videoId = getYoutubeVideoId(ebook.file_path);
        if (videoId) {
            router.push({
                path: `/reader/${ebook.id}`,
                query: {
                    type: 'video',
                    videoId
                }
            });
        } else {
            window.open(ebook.file_path, '_blank');
        }
        return;
    }
    router.push({
        path: `/reader/${ebook.id}`,
        query: {
            type: 'pdf',
            source: encodeURIComponent(ebook.file_path.replace(/\\\//g, '/'))
        }
    });
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

    const fileName = ebook.file_name || ebook.title || `file-${ebook.id}`;
    const a = document.createElement('a');
    a.href = ebook.file_path;
    a.download = fileName;
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

// Teacher-specific actions
const editBookItem = () => {
    showEditBookItemModal.value = true;
};

const editEbook = (ebook) => {
    selectedEbook.value = ebook;
    showEditEbookModal.value = true;
};

const deleteEbook = (ebook) => {
    selectedEbook.value = ebook;
    showDeleteDialog.value = true;
};

const confirmDeleteEbook = async () => {
    try {
        deleting.value = true;
        await axiosInstance.delete(`/ebooks/${selectedEbook.value.id}`);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Content deleted successfully',
            life: 3000
        });
        showDeleteDialog.value = false;
        fetchEbooks();
    } catch (error) {
        console.error('Error deleting ebook:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete content',
            life: 3000
        });
    } finally {
        deleting.value = false;
    }
};

const addToCollection = (ebook) => {
    selectedEbookForCollection.value = ebook;
    showCollectionModal.value = true;
};

// Event handlers
const onPageChange = (event) => {
    first.value = event.first;
    resourcesPerPage.value = event.rows;
    fetchEbooks();
};

const onEbookAdded = () => {
    fetchEbooks();
};

const onEbookUpdated = () => {
    fetchEbooks();
};

const onBookItemUpdated = () => {
    fetchBookItemDetails();
};

const applyFilters = () => {
    // Filters are computed, no need to refetch
};

const resetFilters = () => {
    filters.value = {
        type: 'all',
        downloadable: 'all'
    };
};

// Initialize
onMounted(() => {
    if (bookItemId.value) {
        Promise.all([fetchFilterOptions(), fetchEbooks()]);
    } else {
        error.value = 'No resource ID provided';
        loading.value = false;
    }
});
</script>
<template>
    <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
        <!-- Fixed Header -->
        <div class="fixed top-0 left-0 right-0 bg-white shadow-sm z-50 border-b border-gray-200">
            <div class="container mx-auto py-4 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-4">
                        <button @click="$router.back()" class="p-2 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center">
                            <i class="pi pi-arrow-left text-gray-700 text-lg"></i>
                        </button>
                        <h1 class="text-xl font-bold text-gray-900 truncate max-w-lg leading-tight flex items-center">
                            {{ bookItem ? bookItem.title : 'Resource Management' }}
                            <span v-if="bookItem && bookItem.grade" class="ml-3 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium"> Grade {{ bookItem.grade.name }} </span>
                        </h1>
                    </div>
                </div>
                <div class="flex items-center gap-4 mt-2 sm:mt-0">
                    <!-- Quick Actions -->
                    <button @click="showAddEbookModal = true" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <i class="pi pi-plus"></i>
                        Add Content
                    </button>
                    <button @click="editBookItem" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors" title="Edit Resource">
                        <i class="pi pi-pencil"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="container mx-auto pt-28 pb-6 px-4">
            <!-- Loading state -->
            <div v-if="loading" class="flex justify-center items-center py-16">
                <div class="flex flex-col items-center">
                    <i class="pi pi-spin pi-spinner text-3xl text-purple-600 mb-4"></i>
                    <span class="text-gray-600">Loading resource details...</span>
                </div>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="flex justify-center items-center py-16">
                <div class="flex flex-col items-center max-w-md mx-auto text-center">
                    <i class="pi pi-exclamation-circle text-3xl text-red-500 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Error Loading Resource</h3>
                    <p class="text-gray-600 mb-4">{{ error }}</p>
                    <button @click="fetchEbooks" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Try Again</button>
                </div>
            </div>

            <!-- Content when loaded -->
            <div v-else-if="bookItem" class="mb-8">
                <!-- Resource Overview Card -->
                <div class="mb-8 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <div class="flex flex-col lg:flex-row gap-8 items-start">
                        <!-- Book Cover -->
                        <div class="w-full lg:w-64 flex-shrink-0">
                            <div class="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                                <img
                                    :src="bookItem.cover_image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'"
                                    :alt="bookItem.title"
                                    class="w-full h-full object-cover"
                                    @error="(e) => (e.target.src = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')"
                                />
                            </div>
                        </div>

                        <!-- Resource Details -->
                        <div class="flex-grow">
                            <h2 class="text-3xl lg:text-4xl font-bold mb-4 leading-tight text-gray-900">{{ bookItem.title }}</h2>

                            <div class="flex items-center gap-6 text-lg mb-6">
                                <span class="text-gray-700">by {{ bookItem.author }}</span>
                            </div>

                            <p class="text-lg text-gray-600 mb-6 leading-relaxed">
                                {{ bookItem.description }}
                            </p>

                            <!-- Resource metadata -->
                            <div class="flex flex-wrap gap-3 mb-6">
                                <span v-if="bookItem.category" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    {{ bookItem.category.name }}
                                </span>
                                <span v-if="bookItem.subject" class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    {{ bookItem.subject.name }}
                                </span>
                                <span v-if="bookItem.language" class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                    {{ bookItem.language.name }}
                                </span>
                                <span v-if="bookItem.library" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                    {{ bookItem.library.name }}
                                </span>
                            </div>

                            <!-- Stats -->
                            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
                                    <div class="text-2xl font-bold">{{ ebooks.length }}</div>
                                    <div class="text-sm opacity-90">Digital Files</div>
                                </div>
                                <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
                                    <div class="text-2xl font-bold">{{ downloadableCount }}</div>
                                    <div class="text-sm opacity-90">Downloadable</div>
                                </div>
                                <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
                                    <div class="text-2xl font-bold">{{ videoCount }}</div>
                                    <div class="text-sm opacity-90">Videos</div>
                                </div>
                                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
                                    <div class="text-2xl font-bold">{{ pdfCount }}</div>
                                    <div class="text-sm opacity-90">PDFs</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Content Management Section -->
                <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                    <div class="flex items-center justify-between mb-6">
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">Content Management</h3>
                            <p class="text-gray-600 text-sm">{{ filteredEbooks.length }} of {{ ebooks.length }} items</p>
                        </div>
                        <div class="flex flex-wrap gap-3">
                            <!-- Filter Controls -->
                            <select v-model="filters.type" @change="applyFilters" class="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                                <option value="all">All Types</option>
                                <option value="pdf">PDF Documents</option>
                                <option value="video">Videos</option>
                                <option value="audio">Audio</option>
                            </select>
                            <select v-model="filters.downloadable" @change="applyFilters" class="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                                <option value="all">All Files</option>
                                <option value="yes">Downloadable</option>
                                <option value="no">View Only</option>
                            </select>
                            <button @click="resetFilters" class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                                <i class="pi pi-refresh"></i>
                                Reset
                            </button>
                        </div>
                    </div>

                    <!-- Enhanced Content Grid -->
                    <div v-if="filteredEbooks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div v-for="ebook in filteredEbooks" :key="ebook.id" class="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 group">
                            <!-- Media Preview -->
                            <div v-if="isYoutubeVideo(ebook)" class="aspect-video bg-gray-900 relative overflow-hidden">
                                <iframe :src="getYoutubeEmbedUrl(ebook)" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
                                <div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
                            </div>

                            <div v-else-if="isPdfFile(ebook)" class="aspect-video bg-gradient-to-br from-red-50 to-orange-50 border-b border-gray-200 relative">
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="text-center">
                                        <i class="pi pi-file-pdf text-4xl text-red-500 mb-2"></i>
                                        <p class="text-sm text-gray-600">PDF Document</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Content Info -->
                            <div class="p-4">
                                <div class="flex items-start justify-between mb-3">
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{{ ebook.file_name || ebook.title }}</h4>
                                        <p class="text-xs text-gray-500">{{ ebook.e_book_type?.name || 'File' }}</p>
                                    </div>
                                    <div class="flex gap-1">
                                        <button @click="editEbook(ebook)" class="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors" title="Edit">
                                            <i class="pi pi-pencil text-gray-600 text-xs"></i>
                                        </button>
                                        <button @click="deleteEbook(ebook)" class="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors" title="Delete">
                                            <i class="pi pi-trash text-red-600 text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- File Info -->
                                <div class="flex items-center gap-2 mb-3 text-xs text-gray-500">
                                    <span v-if="ebook.file_size">{{ formatFileSize(ebook.file_size) }}</span>
                                    <span v-if="ebook.is_downloadable" class="px-2 py-1 bg-green-100 text-green-700 rounded-full"> Downloadable </span>
                                    <span v-else class="px-2 py-1 bg-gray-100 text-gray-600 rounded-full"> View Only </span>
                                </div>

                                <!-- Actions -->
                                <div class="flex gap-2">
                                    <button @click="openInReader(ebook)" class="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-colors">
                                        {{ isYoutubeVideo(ebook) ? 'Watch' : 'View' }}
                                    </button>
                                    <button v-if="ebook.is_downloadable && !isYoutubeVideo(ebook)" @click="downloadFile(ebook)" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition-colors" title="Download">
                                        <i class="pi pi-download"></i>
                                    </button>
                                    <button @click="addToCollection(ebook)" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition-colors" title="Add to Collection">
                                        <i class="pi pi-folder"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty state for filtered results -->
                    <div v-else class="text-center py-12">
                        <i class="pi pi-search text-3xl text-gray-400 mb-4"></i>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
                        <p class="text-gray-600 mb-4">Try adjusting your filters or add new content to this resource.</p>
                        <button @click="resetFilters" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Clear Filters</button>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="filteredEbooks.length > 0" class="mt-8 flex justify-center">
                    <Paginator
                        :rows="resourcesPerPage"
                        :totalRecords="totalRecords"
                        v-model:first="first"
                        :rowsPerPageOptions="[12, 24, 36, 48]"
                        @page="onPageChange"
                        class="border-none"
                        :template="{
                            '640px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
                            '960px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
                            '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport'
                        }"
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                    />
                </div>
            </div>

            <!-- Empty state for new resource -->
            <div v-else-if="!loading" class="text-center py-16">
                <div class="max-w-md mx-auto">
                    <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-book text-gray-400 text-3xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Resource not found</h3>
                    <p class="text-gray-600 mb-6">This resource may have been moved or deleted.</p>
                    <button @click="$router.push('/teacher/dashboard')" class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">Back to Dashboard</button>
                </div>
            </div>
        </div>

        <!-- Modals -->
        <AddEbookDialog :visible="showAddEbookModal" @update:visible="showAddEbookModal = $event" :book-item-id="bookItemId" :ebook-types="ebookTypes" @ebook-added="onEbookAdded" />

        <EditEbookDialog :visible="showEditEbookModal" @update:visible="showEditEbookModal = $event" :ebook="selectedEbook" :ebook-types="ebookTypes" @ebook-updated="onEbookUpdated" />

        <EditBookItemDialog :visible="showEditBookItemModal" @update:visible="showEditBookItemModal = $event" :book-item="bookItem" :filter-options="filterOptions" @book-item-updated="onBookItemUpdated" />

        <CollectionModal :visible="showCollectionModal" @update:visible="showCollectionModal = $event" :ebook="selectedEbookForCollection" />

        <!-- Delete Confirmation -->
        <Dialog :visible="showDeleteDialog" @update:visible="showDeleteDialog = $event" header="Confirm Delete" :modal="true" :style="{ width: '400px' }">
            <div class="mb-4">
                <p>Are you sure you want to delete "{{ selectedEbook?.file_name }}"?</p>
                <p class="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
            </div>
            <div class="flex justify-end gap-2">
                <Button label="Cancel" text @click="showDeleteDialog = false" />
                <Button label="Delete" severity="danger" @click="confirmDeleteEbook" :loading="deleting" />
            </div>
        </Dialog>

        <Toast />
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
