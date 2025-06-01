<template>
    <div class="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
        <!-- Header Section -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="container mx-auto px-6 py-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Resource Management</h1>
                        <p class="text-gray-600 mt-2">Manage your digital library and educational resources</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg">
                            <div class="text-sm opacity-90">Total Resources</div>
                            <div class="text-2xl font-bold">{{ totalResources }}</div>
                        </div>
                        <div class="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-lg">
                            <div class="text-sm opacity-90">Collections</div>
                            <div class="text-2xl font-bold">{{ totalCollections }}</div>
                        </div>
                        <!-- User Avatar -->
                        <Avatar @click="toggleProfileMenu" :label="user?.email?.charAt(0).toUpperCase()" class="ml-4 cursor-pointer" size="large" shape="circle" />
                    </div>
                </div>
            </div>
        </div>

        <div class="container mx-auto px-6 py-8">
            <!-- Quick Actions -->
            <div class="mb-8">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button @click="showAddBookItemModal = true" class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200 group">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <i class="pi pi-book text-blue-600 text-xl"></i>
                            </div>
                            <div class="text-left">
                                <h3 class="font-semibold text-gray-900">Add Book Item</h3>
                                <p class="text-sm text-gray-600">Create a new book resource</p>
                            </div>
                        </div>
                    </button>

                    <button @click="showCreateCollectionModal = true" class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200 group">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <i class="pi pi-folder text-purple-600 text-xl"></i>
                            </div>
                            <div class="text-left">
                                <h3 class="font-semibold text-gray-900">Create Collection</h3>
                                <p class="text-sm text-gray-600">Organize resources</p>
                            </div>
                        </div>
                    </button>

                    <!-- <button @click="showBulkUploadModal = true" class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200 group">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <i class="pi pi-upload text-green-600 text-xl"></i>
                            </div>
                            <div class="text-left">
                                <h3 class="font-semibold text-gray-900">Bulk Upload</h3>
                                <p class="text-sm text-gray-600">Upload multiple files</p>
                            </div>
                        </div>
                    </button> -->
                </div>
            </div>

            <!-- Filters and Search -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                <div class="flex flex-wrap items-center gap-4 justify-between">
                    <div class="flex-1 min-w-80">
                        <div class="relative">
                            <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Search resources by title, author, or description..."
                                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                @input="debouncedSearch"
                            />
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        <select v-model="filters.category" @change="applyFilters" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option value="">All Categories</option>
                            <option v-for="category in filterOptions.categories" :key="category.value" :value="category.value">
                                {{ category.label }}
                            </option>
                        </select>
                        <select v-model="filters.subject" @change="applyFilters" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option value="">All Subjects</option>
                            <option v-for="subject in filterOptions.subjects" :key="subject.value" :value="subject.value">
                                {{ subject.label }}
                            </option>
                        </select>
                        <select v-model="filters.grade" @change="applyFilters" class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option value="">All Grades</option>
                            <option v-for="grade in filterOptions.grades" :key="grade.value" :value="grade.value">
                                {{ grade.label }}
                            </option>
                        </select>
                        <button @click="resetFilters" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                            <i class="pi pi-refresh"></i>
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-16">
                <div class="flex flex-col items-center">
                    <i class="pi pi-spin pi-spinner text-3xl text-purple-600 mb-4"></i>
                    <span class="text-gray-600">Loading resources...</span>
                </div>
            </div>

            <!-- Resources Grid -->
            <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="bookItem in bookItems" :key="bookItem.id" class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200">
                    <!-- Cover Image -->
                    <div class="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        <img
                            :src="bookItem.cover_image || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'"
                            :alt="bookItem.title"
                            class="w-full h-full object-cover"
                            @error="(e) => (e.target.src = 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')"
                        />
                        <!-- Action overlay -->
                        <div class="absolute top-3 right-3 flex gap-2">
                            <button @click="editBookItem(bookItem)" class="w-8 h-8 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all" title="Edit">
                                <i class="pi pi-pencil text-gray-700 text-sm"></i>
                            </button>
                            <button @click="deleteBookItem(bookItem)" class="w-8 h-8 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all" title="Delete">
                                <i class="pi pi-trash text-red-500 text-sm"></i>
                            </button>
                        </div>
                        <!-- Resource count badge -->
                        <div class="absolute bottom-3 left-3">
                            <span class="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full"> {{ (bookItem.books?.length || 0) + (bookItem.ebooks?.length || 0) }} resources </span>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                        <!-- Header -->
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex-1">
                                <h3 class="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">{{ bookItem.title }}</h3>
                                <p class="text-gray-600 text-sm">by {{ bookItem.author }}</p>
                            </div>
                        </div>

                        <!-- Metadata chips -->
                        <div class="flex flex-wrap gap-2 mb-4">
                            <span v-if="bookItem.category" class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {{ bookItem.category.name }}
                            </span>
                            <span v-if="bookItem.subject" class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {{ bookItem.subject.name }}
                            </span>
                            <span v-if="bookItem.grade" class="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"> Grade {{ bookItem.grade.name }} </span>
                        </div>

                        <!-- Description -->
                        <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                            {{ bookItem.description }}
                        </p>

                        <!-- Resource stats -->
                        <div class="flex items-center gap-4 mb-4 text-sm text-gray-500">
                            <span class="flex items-center gap-1">
                                <i class="pi pi-book"></i>
                                {{ bookItem.books?.length || 0 }} physical
                            </span>
                            <span class="flex items-center gap-1">
                                <i class="pi pi-file-pdf"></i>
                                {{ bookItem.ebooks?.length || 0 }} digital
                            </span>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2">
                            <button @click="viewBookItemDetails(bookItem)" class="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">View Details</button>
                            <button @click="addEbookToItem(bookItem)" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors" title="Add Ebook">
                                <i class="pi pi-plus"></i>
                            </button>
                            <button @click="addToCollection(bookItem)" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors" title="Add to Collection">
                                <i class="pi pi-folder"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && bookItems.length === 0" class="text-center py-16">
                <div class="max-w-md mx-auto">
                    <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-book text-gray-400 text-3xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
                    <p class="text-gray-600 mb-6">Start by creating your first book item or adjust your search filters.</p>
                    <button @click="showAddBookItemModal = true" class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">Create First Resource</button>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="bookItems.length > 0" class="mt-8 flex justify-center">
                <Paginator
                    :rows="pagination.perPage"
                    :totalRecords="pagination.total"
                    v-model:first="pagination.first"
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

        <!-- Modals -->
        <AddBookItemDialog :visible="showAddBookItemModal" @update:visible="showAddBookItemModal = $event" :filter-options="filterOptions" @book-item-added="onBookItemAdded" />

        <EditBookItemDialog :visible="showEditBookItemModal" @update:visible="showEditBookItemModal = $event" :book-item="selectedBookItem" :filter-options="filterOptions" @book-item-updated="onBookItemUpdated" />

        <AddEbookDialog :visible="showAddEbookModal" @update:visible="showAddEbookModal = $event" :book-item-id="selectedBookItemId" :ebook-types="filterOptions.ebook_types" @ebook-added="onEbookAdded" />

        <CreateCollectionModal :visible="showCreateCollectionModal" @update:visible="showCreateCollectionModal = $event" @collection-created="onCollectionCreated" />

        <CollectionModal :visible="showCollectionModal" @update:visible="showCollectionModal = $event" :book-item="selectedBookItemForCollection" />

        <!-- <BulkUploadModal :visible="showBulkUploadModal" @update:visible="showBulkUploadModal = $event" @bulk-upload-complete="onBulkUploadComplete" /> -->

        <!-- Delete Confirmation Dialog -->
        <Dialog :visible="showDeleteDialog" @update:visible="showDeleteDialog = $event" header="Confirm Delete" :modal="true" :style="{ width: '400px' }">
            <div class="mb-4">
                <p>Are you sure you want to delete "{{ selectedBookItem?.title }}"?</p>
                <p class="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
            </div>
            <div class="flex justify-end gap-2">
                <Button label="Cancel" text @click="showDeleteDialog = false" />
                <Button label="Delete" severity="danger" @click="confirmDelete" :loading="deleting" />
            </div>
        </Dialog>
        <Toast />

        <!-- Profile Dialog -->
        <Dialog position="topright" v-model:visible="showProfileMenu" header="Profile" :modal="false" :closable="true" :baseZIndex="1000" appendTo="body">
            <div class="p-4 space-y-3">
                <div class="flex items-center justify-center space-x-4">
                    <i class="pi pi-user text-2xl"></i>
                    <h4 class="text-lg font-semibold">{{ user?.username || user?.email }}</h4>
                </div>
                <div class="flex flex-col space-y-2">
                    <Button
                        label="Settings"
                        icon="pi pi-cog"
                        class="p-button-text"
                        @click="
                            () => {
                                showProfileMenu = false;
                                router.push('/userprofile');
                            }
                        "
                    />
                    <Button label="Logout" :loading="loading" icon="pi pi-sign-out" class="p-button-danger" @click="logout" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/util/axios-config';
import { storeToRefs } from 'pinia';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

// Import components
import CollectionModal from '@/components/modals/CollectionModal.vue';
import CreateCollectionModal from '@/components/modals/CreateCollectionModal.vue';
import AddBookItemDialog from '@/views/pages/book/components/AddBookItemDialog.vue';
import AddEbookDialog from '@/views/pages/book/components/AddEbookDialog.vue';
import EditBookItemDialog from '@/views/pages/book/components/EditBookItemDialog.vue';
// import BulkUploadModal from '@/components/modals/BulkUploadModal.vue';

const router = useRouter();
const toast = useToast();

// Auth store
const authStore = useAuthStore();
const { getUser } = storeToRefs(authStore);

// User computed
const user = computed(() => {
    return getUser.value;
});

// Profile menu state
const showProfileMenu = ref(false);

// State
const loading = ref(true);
const bookItems = ref([]);
const searchQuery = ref('');
const totalCollections = ref(0);

// Pagination
const pagination = reactive({
    first: 0,
    perPage: 12,
    total: 0
});

// Filters
const filters = reactive({
    category: '',
    subject: '',
    grade: '',
    language: ''
});

// Modal states
const showAddBookItemModal = ref(false);
const showEditBookItemModal = ref(false);
const showAddEbookModal = ref(false);
const showCreateCollectionModal = ref(false);
const showCollectionModal = ref(false);
const showBulkUploadModal = ref(false);
const showDeleteDialog = ref(false);

// Selected items
const selectedBookItem = ref(null);
const selectedBookItemId = ref(null);
const selectedBookItemForCollection = ref(null);
const deleting = ref(false);

// Filter options
const filterOptions = reactive({
    categories: [],
    subjects: [],
    grades: [],
    languages: [],
    libraries: [],
    ebook_types: []
});

// Computed
const totalResources = computed(() => {
    return bookItems.value.reduce((total, item) => {
        return total + (item.books?.length || 0) + (item.ebooks?.length || 0);
    }, 0);
});

// Methods
const fetchBookItems = async () => {
    try {
        loading.value = true;
        const currentPage = Math.floor(pagination.first / pagination.perPage) + 1;

        const params = {
            page: currentPage,
            per_page: pagination.perPage,
            with: 'language,category,subject,grade,library,books,ebooks'
        };

        // Add search query
        if (searchQuery.value.trim()) {
            params.search = searchQuery.value.trim();
        }

        // Add filters
        if (filters.category) params.category_id = filters.category;
        if (filters.subject) params.subject_id = filters.subject;
        if (filters.grade) params.grade_id = filters.grade;
        if (filters.language) params.language_id = filters.language;

        const response = await axiosInstance.get('/teacher-book-items', { params });

        bookItems.value = response.data.data;
        pagination.total = response.data.meta?.total || 0;
    } catch (error) {
        console.error('Error fetching book items:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch resources', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const fetchFilterOptions = async () => {
    try {
        const response = await axiosInstance.get('/constants/all');
        const data = response.data;

        filterOptions.categories = (data.categories?.data || []).map((c) => ({ label: c.name, value: c.id }));
        filterOptions.subjects = (data.subjects?.data || []).map((s) => ({ label: s.name, value: s.id }));
        filterOptions.grades = (data.grades?.data || []).map((g) => ({ label: g.name, value: g.id }));
        filterOptions.languages = (data.languages?.data || []).map((l) => ({ label: l.name, value: l.id }));
        filterOptions.libraries = (data.libraries?.data || []).map((l) => ({ label: l.name, value: l.id }));
        filterOptions.ebook_types = (data.ebook_types?.data || []).map((t) => ({ label: t.name, value: t.id }));
    } catch (error) {
        console.error('Error fetching filter options:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch filter options', life: 3000 });
    }
};

const fetchCollectionsCount = async () => {
    try {
        const response = await axiosInstance.get('/collections');
        totalCollections.value = response.data.meta?.total || 0;
    } catch (error) {
        console.error('Error fetching collections count:', error);
    }
};

// Debounced search
let searchTimeout = null;
const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        pagination.first = 0;
        fetchBookItems();
    }, 500);
};

const applyFilters = () => {
    pagination.first = 0;
    fetchBookItems();
};

const resetFilters = () => {
    filters.category = '';
    filters.subject = '';
    filters.grade = '';
    filters.language = '';
    searchQuery.value = '';
    pagination.first = 0;
    fetchBookItems();
};

// Actions
const viewBookItemDetails = (bookItem) => {
    router.push(`/ebooks/${bookItem.id}`);
};

const editBookItem = (bookItem) => {
    selectedBookItem.value = bookItem;
    showEditBookItemModal.value = true;
};

const deleteBookItem = (bookItem) => {
    selectedBookItem.value = bookItem;
    showDeleteDialog.value = true;
};

const confirmDelete = async () => {
    try {
        deleting.value = true;
        await axiosInstance.delete(`/book-items/${selectedBookItem.value.id}`);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Resource deleted successfully', life: 3000 });
        showDeleteDialog.value = false;
        fetchBookItems();
    } catch (error) {
        console.error('Error deleting book item:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete resource', life: 3000 });
    } finally {
        deleting.value = false;
    }
};

const addEbookToItem = (bookItem) => {
    selectedBookItemId.value = bookItem.id;
    showAddEbookModal.value = true;
};

const addToCollection = (bookItem) => {
    selectedBookItemForCollection.value = bookItem;
    showCollectionModal.value = true;
};

// Event handlers
const onPageChange = (event) => {
    pagination.first = event.first;
    pagination.perPage = event.rows;
    fetchBookItems();
};

const onBookItemAdded = () => {
    fetchBookItems();
};

const onBookItemUpdated = () => {
    fetchBookItems();
};

const onEbookAdded = () => {
    fetchBookItems();
};

const onCollectionCreated = () => {
    fetchCollectionsCount();
};

const onBulkUploadComplete = () => {
    fetchBookItems();
};

// Initialize
onMounted(async () => {
    await Promise.all([fetchFilterOptions(), fetchCollectionsCount()]);
    fetchBookItems();
});

// Profile menu toggle function
function toggleProfileMenu() {
    showProfileMenu.value = !showProfileMenu.value;
}

// Logout function
const logout = async () => {
    try {
        loading.value = true;
        await authStore.logout();
        loading.value = false;
    } catch (error) {
        console.error('Logout error:', error);
        loading.value = false;
    }
};
</script>

<style scoped>
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
