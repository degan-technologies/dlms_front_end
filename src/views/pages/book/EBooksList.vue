<script setup>
// import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const ebooks = ref([]);
const loading = ref(true);
const totalEbooks = ref(0);
const selectedEbooks = ref([]);
const filters = ref({});
const globalFilterValue = ref('');
const lazyParams = ref({
    first: 0,
    rows: 10,
    page: 0,
    sortField: null,
    sortOrder: null
});

// Form options
const categories = ref([]);
const fileFormats = ref([
    { name: 'PDF', code: 'PDF' },
    { name: 'EPUB', code: 'EPUB' },
    { name: 'MOBI', code: 'MOBI' },
    { name: 'AZW', code: 'AZW' },
    { name: 'HTML', code: 'HTML' },
    { name: 'TXT', code: 'TXT' }
]);

onMounted(() => {
    initFilters();
    loadEbooks();
    fetchCategories();
});

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        title: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        author: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        'category.name': { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
        file_format: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] }
    };
    globalFilterValue.value = '';
};

const fetchCategories = async () => {
    // In a real app, this would be an API call
    try {
        setTimeout(() => {
            categories.value = [
                { name: 'Fiction', id: 1 },
                { name: 'Science Fiction', id: 2 },
                { name: 'Mystery', id: 3 },
                { name: 'Biography', id: 4 },
                { name: 'History', id: 5 },
                { name: 'Science', id: 6 },
                { name: 'Technology', id: 7 },
                { name: 'Arts', id: 8 }
            ];
        }, 500);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

const loadEbooks = async () => {
    loading.value = true;
    try {
        // In a real app, this would be an API call with pagination
        setTimeout(() => {
            // Mock data
            ebooks.value = [
                {
                    id: 1,
                    title: 'Introduction to Programming',
                    author: 'John Smith',
                    isbn: '9780123456789',
                    publication_year: 2022,
                    cover_image_url: '/demo/images/product/product-placeholder.svg',
                    category: { id: 6, name: 'Technology' },
                    publisher: { id: 5, name: 'Digital Education Group' },
                    language: 'en',
                    pages: 450,
                    file_url: '/demo/data/sample.pdf',
                    file_format: 'PDF',
                    file_size_mb: 12.5,
                    is_downloadable: true,
                    requires_authentication: true,
                    drm_type: 'none',
                    availability_status: 'Available',
                    download_count: 24,
                    view_count: 85
                },
                {
                    id: 2,
                    title: 'Advanced Data Science',
                    author: 'Jane Doe',
                    isbn: '9781234567890',
                    publication_year: 2023,
                    cover_image_url: '/demo/images/product/product-placeholder.svg',
                    category: { id: 6, name: 'Technology' },
                    publisher: { id: 4, name: 'University Press' },
                    language: 'en',
                    pages: 520,
                    file_url: '/demo/data/sample.pdf',
                    file_format: 'EPUB',
                    file_size_mb: 8.2,
                    is_downloadable: true,
                    requires_authentication: true,
                    drm_type: 'adobe',
                    availability_status: 'Available',
                    download_count: 12,
                    view_count: 45
                },
                {
                    id: 3,
                    title: 'Modern Web Development',
                    author: 'Robert Johnson',
                    isbn: '9782345678901',
                    publication_year: 2022,
                    cover_image_url: '/demo/images/product/product-placeholder.svg',
                    category: { id: 7, name: 'Technology' },
                    publisher: { id: 5, name: 'Digital Education Group' },
                    language: 'en',
                    pages: 380,
                    file_url: '/demo/data/sample.pdf',
                    file_format: 'PDF',
                    file_size_mb: 10.3,
                    is_downloadable: true,
                    requires_authentication: false,
                    drm_type: 'none',
                    availability_status: 'Available',
                    download_count: 36,
                    view_count: 120
                },
                {
                    id: 4,
                    title: 'Artificial Intelligence Foundations',
                    author: 'Sarah Williams',
                    isbn: '9783456789012',
                    publication_year: 2021,
                    cover_image_url: '/demo/images/product/product-placeholder.svg',
                    category: { id: 6, name: 'Technology' },
                    publisher: { id: 2, name: 'Learning Resources Ltd.' },
                    language: 'en',
                    pages: 420,
                    file_url: '/demo/data/sample.pdf',
                    file_format: 'MOBI',
                    file_size_mb: 7.8,
                    is_downloadable: false,
                    requires_authentication: true,
                    drm_type: 'proprietary',
                    availability_status: 'Available',
                    download_count: 0,
                    view_count: 68
                },
                {
                    id: 5,
                    title: 'Introduction to Psychology',
                    author: 'Michael Brown',
                    isbn: '9784567890123',
                    publication_year: 2020,
                    cover_image_url: '/demo/images/product/product-placeholder.svg',
                    category: { id: 4, name: 'Psychology' },
                    publisher: { id: 4, name: 'University Press' },
                    language: 'en',
                    pages: 350,
                    file_url: '/demo/data/sample.pdf',
                    file_format: 'PDF',
                    file_size_mb: 6.4,
                    is_downloadable: true,
                    requires_authentication: true,
                    drm_type: 'none',
                    availability_status: 'Available',
                    download_count: 42,
                    view_count: 156
                },
                {
                    id: 6,
                    title: 'The History of Art',
                    author: 'Elizabeth Taylor',
                    isbn: '9785678901234',
                    publication_year: 2019,
                    cover_image_url: '/demo/images/product/product-placeholder.svg',
                    category: { id: 8, name: 'Arts' },
                    publisher: { id: 4, name: 'University Press' },
                    language: 'en',
                    pages: 480,
                    file_url: '/demo/data/sample.pdf',
                    file_format: 'PDF',
                    file_size_mb: 15.2,
                    is_downloadable: true,
                    requires_authentication: true,
                    drm_type: 'none',
                    availability_status: 'Available',
                    download_count: 18,
                    view_count: 92
                }
            ];
            totalEbooks.value = 48; // Total count for pagination
            loading.value = false;
        }, 1000);

        loading.value = false;
    } catch (error) {
        console.error('Error loading ebooks:', error);
        loading.value = false;
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    lazyParams.value.first = event.first;
    lazyParams.value.rows = event.rows;
    lazyParams.value.page = event.page;
    loadEbooks();
};

const onSort = (event) => {
    lazyParams.value.sortField = event.sortField;
    lazyParams.value.sortOrder = event.sortOrder;
    loadEbooks();
};

const onFilter = () => {
    lazyParams.value.first = 0;
    loadEbooks();
};

const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    filters.value.global.value = value;
    globalFilterValue.value = value;
    onFilter();
};

const clearFilter = () => {
    initFilters();
    onFilter();
};

const formatFileSize = (sizeInMB) => {
    if (sizeInMB < 1) {
        return `${Math.round(sizeInMB * 1024)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
};

const viewEbook = (ebook) => {
    router.push(`/books/ebooks/${ebook.id}`);
};

const readEbook = (ebook) => {
    router.push(`/books/ebooks/read/${ebook.id}`);
};

const createNewEbook = () => {
    router.push('/books/ebooks/create');
};

const editEbook = (ebook) => {
    router.push(`/books/ebooks/edit/${ebook.id}`);
};

const confirmDeleteEbook = (ebook) => {
    // In a real app, show confirmation dialog before deletion
    const confirmed = window.confirm(`Are you sure you want to delete "${ebook.title}"?`);
    if (confirmed) {
        deleteEbook(ebook);
    }
};

const deleteEbook = async (ebook) => {
    try {
        // In a real app, make API call to delete
        // await fetch(`/api/books/ebooks/${ebook.id}`, { method: 'DELETE' });

        // Remove from local state
        ebooks.value = ebooks.value.filter((b) => b.id !== ebook.id);
        totalEbooks.value--;
    } catch (error) {
        console.error('Error deleting ebook:', error);
    }
};

// Bulk actions
const deleteSelectedEbooks = () => {
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedEbooks.value.length} selected e-books?`);
    if (confirmed) {
        // In a real app, make API calls to delete
        // await Promise.all(selectedEbooks.value.map(ebook => fetch(`/api/books/ebooks/${ebook.id}`, { method: 'DELETE' })));

        // Remove from local state
        const selectedIds = selectedEbooks.value.map((ebook) => ebook.id);
        ebooks.value = ebooks.value.filter((ebook) => !selectedIds.includes(ebook.id));
        totalEbooks.value -= selectedEbooks.value.length;
        selectedEbooks.value = [];
    }
};

const getDrmTypeLabel = (drmType) => {
    if (drmType === 'none') return 'None';
    if (drmType === 'adobe') return 'Adobe DRM';
    if (drmType === 'fairplay') return 'Apple FairPlay';
    if (drmType === 'proprietary') return 'Proprietary';
    return drmType;
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>E-Books Collection</h5>
                <p class="text-muted-color mb-4">Browse, search and manage electronic books in the library</p>

                <DataTable
                    v-model:filters="filters"
                    v-model:selection="selectedEbooks"
                    :value="ebooks"
                    paginator
                    :rows="10"
                    :rowsPerPageOptions="[10, 20, 50]"
                    :totalRecords="totalEbooks"
                    :loading="loading"
                    dataKey="id"
                    filterDisplay="menu"
                    :globalFilterFields="['title', 'author', 'isbn', 'category.name', 'file_format']"
                    responsiveLayout="scroll"
                    @page="onPage"
                    @sort="onSort"
                    :lazy="true"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <span class="p-input-icon-left mb-2 md:mb-0">
                                <i class="pi pi-search" />
                                <InputText v-model="globalFilterValue" placeholder="Search e-books..." @input="onGlobalFilterChange" />
                            </span>
                            <div class="flex">
                                <Button type="button" icon="pi pi-filter-slash" label="Clear Filters" class="p-button-outlined mr-2" @click="clearFilter" />
                                <Button type="button" icon="pi pi-trash" label="Delete Selected" class="p-button-danger p-button-outlined mr-2" :disabled="!selectedEbooks.length" @click="deleteSelectedEbooks" />
                                <Button type="button" icon="pi pi-plus" label="Add New E-Book" class="p-button-success" @click="createNewEbook" />
                            </div>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

                    <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>

                    <Column header="Cover" style="min-width: 8rem">
                        <template #body="{ data }">
                            <img :src="data.cover_image_url" :alt="data.title" class="book-thumbnail shadow-2" />
                        </template>
                    </Column>

                    <Column field="title" header="Title" sortable style="min-width: 15rem">
                        <template #body="{ data }">
                            <div>
                                <span class="block font-bold">{{ data.title }}</span>
                                <span class="block text-sm text-500">ISBN: {{ data.isbn }}</span>
                            </div>
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" @input="filterCallback()" class="p-column-filter" placeholder="Search by title" />
                        </template>
                    </Column>

                    <Column field="author" header="Author" sortable style="min-width: 10rem">
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" @input="filterCallback()" class="p-column-filter" placeholder="Search by author" />
                        </template>
                    </Column>

                    <Column field="category.name" header="Category" sortable style="min-width: 10rem">
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="categories" optionLabel="name" optionValue="name" placeholder="Select Category" class="p-column-filter" style="width: 100%" />
                        </template>
                    </Column>

                    <Column field="file_format" header="Format" sortable style="min-width: 8rem">
                        <template #body="{ data }">
                            <Tag :value="data.file_format" />
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="fileFormats" optionLabel="name" optionValue="code" placeholder="Select Format" class="p-column-filter" style="width: 100%" />
                        </template>
                    </Column>

                    <Column field="file_size_mb" header="Size" sortable style="min-width: 8rem">
                        <template #body="{ data }">
                            {{ formatFileSize(data.file_size_mb) }}
                        </template>
                    </Column>

                    <Column field="is_downloadable" header="Download" sortable style="min-width: 8rem">
                        <template #body="{ data }">
                            <Badge :value="data.is_downloadable ? 'Yes' : 'No'" :severity="data.is_downloadable ? 'success' : 'info'" />
                        </template>
                    </Column>

                    <Column field="drm_type" header="DRM" sortable style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ getDrmTypeLabel(data.drm_type) }}
                        </template>
                    </Column>

                    <Column field="download_count" header="Downloads" sortable style="min-width: 8rem"></Column>

                    <Column style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" class="p-button-rounded p-button-text" tooltip="View Details" tooltipOptions="{ position: 'top' }" @click="viewEbook(data)" />
                                <Button icon="pi pi-book" class="p-button-rounded p-button-text p-button-success" tooltip="Read Online" tooltipOptions="{ position: 'top' }" @click="readEbook(data)" />
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-plain" tooltip="Edit" tooltipOptions="{ position: 'top' }" @click="editEbook(data)" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" tooltip="Delete" tooltipOptions="{ position: 'top' }" @click="confirmDeleteEbook(data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
.book-thumbnail {
    width: 50px;
    height: 75px;
    object-fit: cover;
}
</style>
