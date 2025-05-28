<script setup>
import axiosInstance from '@/util/axios-config';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';

// Import modals
import AddBookDialog from './components/AddBookDialog.vue';
import AddBookItemDialog from './components/AddBookItemDialog.vue';
import AddEbookDialog from './components/AddEbookDialog.vue';
import EditBookDialog from './components/EditBookDialog.vue';
import EditBookItemDialog from './components/EditBookItemDialog.vue';
import EditEbookDialog from './components/EditEbookDialog.vue';

// State for BookItems with pagination
const bookItems = ref([]);
const loading = ref(false);
const pagination = ref({
    page: 1,
    perPage: 15,
    total: 0
});

// Main table filter
const mainFilters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    language_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    category_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    subject_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    grade_id: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// Define separate filters for books and ebooks tables
const booksFilters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    language_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    category_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    subject_id: { value: null, matchMode: FilterMatchMode.EQUALS },
    grade_id: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const ebooksFilters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    is_downloadable: { value: null, matchMode: FilterMatchMode.EQUALS },
    e_book_type_id: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// Toast instance
const toast = useToast();

// Expanded rows state
const expandedRows = ref({});
const editingRows = ref({});
const booksEditingRows = reactive({});
const ebooksEditingRows = reactive({});

// Fetch BookItems from API
const fetchBookItems = async () => {
    try {
        loading.value = true;

        const params = {
            page: pagination.value.page,
            per_page: pagination.value.perPage,
            with: 'language,category,subject,grade,library'
        };
        if (mainFilters.value.global.value) {
            params.title = mainFilters.value.global.value;
        }

        if (mainFilters.value.language_id.value) {
            params.language_id = mainFilters.value.language_id.value;
        }

        if (mainFilters.value.category_id.value) {
            params.category_id = mainFilters.value.category_id.value;
        }

        if (mainFilters.value.subject_id.value) {
            params.subject_id = mainFilters.value.subject_id.value;
        }

        if (mainFilters.value.grade_id.value) {
            params.grade_id = mainFilters.value.grade_id.value;
        }

        const response = await axiosInstance.get('/book-items', { params });

        bookItems.value = response.data.data;
        pagination.value = {
            page: response.data.meta.current_page,
            perPage: response.data.meta.per_page,
            total: response.data.meta.total
        };

        bookItems.value.forEach((item) => {
            ordersExpanded[item.id] = false;
            shipmentsExpanded[item.id] = false;
            if (!booksEditingRows[item.id]) booksEditingRows[item.id] = ref([]);
            if (!ebooksEditingRows[item.id]) ebooksEditingRows[item.id] = ref([]);
        });
    } catch (error) {
        console.error('Error fetching book items:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch book items', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const fetchBooks = async (bookItemId) => {
    try {
        const bookItem = bookItems.value.find((item) => item.id === bookItemId);
        if (!bookItem) return;

        if (bookItem.books && bookItem.books.length > 0) return;

        bookItem.loadingBooks = true;

        const response = await axiosInstance.get(`/books`, {
            params: {
                book_item_id: bookItemId,
                with: 'bookItem,library,shelf,bookCondition'
            }
        });

        const index = bookItems.value.findIndex((item) => item.id === bookItemId);
        if (index !== -1) {
            bookItems.value[index].books = Array.isArray(response.data.data) ? response.data.data : [];
        }

        if (!booksEditingRows[bookItemId]) {
            booksEditingRows[bookItemId] = ref([]);
        }
    } catch (error) {
        console.error(`Error fetching books for item ${bookItemId}:`, error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch books', life: 3000 });
    } finally {
        const index = bookItems.value.findIndex((item) => item.id === bookItemId);
        if (index !== -1) {
            bookItems.value[index].loadingBooks = false;
        }
    }
};

const fetchEbooks = async (bookItemId) => {
    try {
        const bookItem = bookItems.value.find((item) => item.id === bookItemId);
        if (!bookItem) return;

        if (bookItem.ebooks && bookItem.ebooks.length > 0) return;

        bookItem.loadingEbooks = true;

        const response = await axiosInstance.get(`/ebooks`, {
            params: {
                book_item_id: bookItemId,
                with: 'bookItem,ebookType'
            }
        });

        const index = bookItems.value.findIndex((item) => item.id === bookItemId);
        if (index !== -1) {
            bookItems.value[index].ebooks = Array.isArray(response.data.data) ? response.data.data : [];
        }

        if (!ebooksEditingRows[bookItemId]) {
            ebooksEditingRows[bookItemId] = ref([]);
        }
    } catch (error) {
        console.error(`Error fetching ebooks for item ${bookItemId}:`, error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch ebooks', life: 3000 });
    } finally {
        const index = bookItems.value.findIndex((item) => item.id === bookItemId);
        if (index !== -1) {
            bookItems.value[index].loadingEbooks = false;
        }
    }
};

const toggleOrders = (id) => {
    ordersExpanded.value[id] = !ordersExpanded.value[id];
    if (ordersExpanded.value[id]) {
        fetchBooks(id);
    }
};

const toggleShipments = (id) => {
    shipmentsExpanded.value[id] = !shipmentsExpanded.value[id];
    if (shipmentsExpanded.value[id]) {
        // If expanding, fetch ebooks if we don't have them already
        fetchEbooks(id);
    }
};

// Update row expand to fetch both books and ebooks
const onRowExpand = async (event) => {
    const id = event.data.id;

    // Fetch books and ebooks when a row is expanded
    await Promise.all([fetchBooks(id), fetchEbooks(id)]);

    toast.add({ severity: 'info', summary: 'Item Expanded', detail: event.data.title, life: 3000 });
};

// Expand all children function
const expandAllChildren = async (id) => {
    ordersExpanded.value[id] = true;
    shipmentsExpanded.value[id] = true;

    // Fetch both books and ebooks
    await Promise.all([fetchBooks(id), fetchEbooks(id)]);
};

const ordersExpanded = ref({});
const shipmentsExpanded = ref({});

const collapseAllChildren = (id) => {
    ordersExpanded.value[id] = false;
    shipmentsExpanded.value[id] = false;
};
const onRowCollapse = (event) => {
    toast.add({ severity: 'success', summary: 'Item Collapsed', detail: event.data.title, life: 3000 });
};

const expandAll = () => {
    expandedRows.value = bookItems.value.reduce((acc, p) => (acc[p.id] = true) && acc, {});
};
const collapseAll = () => {
    expandedRows.value = null;
};

// Options for dropdowns
const borrowableOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
];
const reservedOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
];
const downloadableOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
];

// Dialog state
const showAddBookItemModal = ref(false);
const showEditBookItemModal = ref(false);
const showAddBookModal = ref(false);
const showEditBookModal = ref(false);
const showAddEbookModal = ref(false);
const showEditEbookModal = ref(false);
const showDeleteDialog = ref(false);

// Selected items for editing
const selectedBookItem = ref(null);
const selectedBook = ref(null);
const selectedEbook = ref(null);
const addBookParentId = ref(null);
const addEbookParentId = ref(null);

// Delete action
let deleteAction = null;

// Modal opening handlers
const openAddBookModal = (parentId) => {
    addBookParentId.value = parentId;
    showAddBookModal.value = true;
};

const openEditBookModal = (book) => {
    selectedBook.value = book;
    showEditBookModal.value = true;
};

const openAddEbookModal = (parentId) => {
    addEbookParentId.value = parentId;
    showAddEbookModal.value = true;
};

const openEditEbookModal = (ebook) => {
    selectedEbook.value = ebook;
    showEditEbookModal.value = true;
};

// Handlers for modal events
const onBookItemAdded = () => {
    fetchBookItems();
};

const onBookItemUpdated = () => {
    fetchBookItems();
};

const onBookAdded = () => {
    fetchBooks(addBookParentId.value);
};

const onBookUpdated = () => {
    if (selectedBook.value?.book_item_id) {
        fetchBooks(selectedBook.value.book_item_id);
    }
};

const onEbookAdded = () => {
    fetchEbooks(addEbookParentId.value);
};

const onEbookUpdated = () => {
    if (selectedEbook.value?.book_item_id) {
        fetchEbooks(selectedEbook.value.book_item_id);
    }
};

// Row edit handlers
const onRowEditSave = async (event) => {
    try {
        const { newData } = event;

        await axiosInstance.put(`/book-items/${newData.id}`, newData);

        toast.add({ severity: 'success', summary: 'Success', detail: 'Book item updated', life: 3000 });
        fetchBookItems();
    } catch (error) {
        console.error('Error updating book item:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update book item', life: 3000 });
    }
};

const onBookRowEditSave = async (event, bookItem) => {
    try {
        const { newData } = event;

        await axiosInstance.put(`/books/${newData.id}`, newData);

        toast.add({ severity: 'success', summary: 'Success', detail: 'Book updated', life: 3000 });
        fetchBooks(bookItem.id);
    } catch (error) {
        console.error('Error updating book:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update book', life: 3000 });
    }
};

const onEBookRowEditSave = async (event, bookItem) => {
    try {
        const { newData } = event;

        await axiosInstance.put(`/ebooks/${newData.id}`, newData);

        toast.add({ severity: 'success', summary: 'Success', detail: 'Ebook updated', life: 3000 });
        fetchEbooks(bookItem.id);
    } catch (error) {
        console.error('Error updating ebook:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update ebook', life: 3000 });
    }
};

// Delete handlers
const confirmDeleteBookRow = (book) => {
    showDeleteDialog.value = true;
    deleteAction = async () => {
        try {
            // Delete the book from API
            await axiosInstance.delete(`/books/${book.id}`);

            toast.add({ severity: 'success', summary: 'Success', detail: 'Book deleted successfully', life: 3000 });

            // Refresh books for this item
            const bookItemId = book.book_item_id;
            await fetchBooks(bookItemId);
        } catch (error) {
            console.error('Error deleting book:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete book', life: 3000 });
        } finally {
            showDeleteDialog.value = false;
        }
    };
};

const confirmDeleteEbookRow = (ebook) => {
    showDeleteDialog.value = true;
    deleteAction = async () => {
        try {
            // Delete the ebook from API
            await axiosInstance.delete(`/ebooks/${ebook.id}`);

            toast.add({ severity: 'success', summary: 'Success', detail: 'Ebook deleted successfully', life: 3000 });

            // Refresh ebooks for this item
            const bookItemId = ebook.book_item_id;
            await fetchEbooks(bookItemId);
        } catch (error) {
            console.error('Error deleting ebook:', error);
            toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete ebook', life: 3000 });
        } finally {
            showDeleteDialog.value = false;
        }
    };
};

const performDelete = () => {
    if (deleteAction) deleteAction();
};

// Main filter options (from API)
const mainFilterOptions = reactive({
    categories: [],
    languages: [],
    grades: [],
    subjects: [],
    libraries: [],
    ebook_types: [],
    shelves: []
});

// Fetch filter options
const fetchMainFilters = async () => {
    try {
        const response = await axiosInstance.get('/constants/all');
        const data = response.data;

        mainFilterOptions.categories = (data.categories?.data || []).map((c) => ({ label: c.name, value: c.id }));
        mainFilterOptions.languages = (data.languages?.data || []).map((l) => ({ label: l.name, value: l.id }));
        mainFilterOptions.grades = (data.grades?.data || []).map((g) => ({ label: g.name, value: g.id }));
        mainFilterOptions.subjects = (data.subjects?.data || []).map((s) => ({ label: s.name, value: s.id }));
        mainFilterOptions.libraries = (data.libraries?.data || []).map((l) => ({ label: l.name, value: l.id }));
        mainFilterOptions.ebook_types = (data.ebook_types?.data || []).map((t) => ({ label: t.name, value: t.id }));
        mainFilterOptions.shelves = (data.shelves?.data || []).map((s) => ({ label: s.name, value: s.id }));
    } catch (error) {
        console.error('Error fetching filter options:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch filter options', life: 3000 });
    }
};

onMounted(() => {
    // Fetch filter options first
    fetchMainFilters().then(() => {
        // Then fetch bookItems with initial page
        fetchBookItems();
    });
});

// Add pagination event handler
const onPageChange = (event) => {
    pagination.value.page = event.page + 1; // PrimeVue pages are zero-based
    pagination.value.perPage = event.rows;
    fetchBookItems();
};

// Handle filter changes
const onFilterChange = () => {
    pagination.value.page = 1; // Reset to first page when filters change
    fetchBookItems();
};
</script>
<template>
    <div class="card">
        <!-- Add buttons to open modals -->
        <div class="flex gap-2 mb-4">
            <Button label="Add Book Item" icon="pi pi-plus" @click="showAddBookItemModal = true" />
        </div>
        <!-- Main Products Table -->
        <DataTable
            v-model:expandedRows="expandedRows"
            v-model:filters="mainFilters"
            v-model:editingRows="editingRows"
            editMode="row"
            paginator
            :rows="pagination.perPage"
            :totalRecords="pagination.total"
            :rowsPerPageOptions="[5, 10, 15, 20, 50]"
            :value="bookItems"
            dataKey="id"
            :loading="loading"
            @rowExpand="onRowExpand"
            @rowCollapse="onRowCollapse"
            @row-edit-save="onRowEditSave"
            @page="onPageChange"
            tableStyle="min-width: 60rem"
            :globalFilterFields="['title', 'author', 'description', 'cover_image_url', 'language', 'category', 'library', 'shelf', 'subject', 'grade']"
            :pt="{
                table: { style: 'min-width: 60rem' }
            }"
        >
            <template #header>
                <div class="flex flex-wrap justify-between gap-2 items-center">
                    <div class="flex gap-2 items-center">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="mainFilters['global'].value" placeholder="Search products..." />
                        </IconField>
                        <Dropdown v-model="mainFilters.language_id.value" :options="mainFilterOptions.languages" optionLabel="label" optionValue="value" placeholder="Language" showClear style="min-width: 120px" @change="onFilterChange" />
                        <Dropdown v-model="mainFilters.category_id.value" :options="mainFilterOptions.categories" optionLabel="label" optionValue="value" placeholder="Category" showClear style="min-width: 120px" @change="onFilterChange" />
                        <Dropdown v-model="mainFilters.subject_id.value" :options="mainFilterOptions.subjects" optionLabel="label" optionValue="value" placeholder="Subject" showClear style="min-width: 120px" @change="onFilterChange" />
                        <Dropdown v-model="mainFilters.grade_id.value" :options="mainFilterOptions.grades" optionLabel="label" optionValue="value" placeholder="Grade" showClear style="min-width: 100px" @change="onFilterChange" />
                    </div>
                    <div>
                        <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" />
                        <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
                    </div>
                </div>
            </template>
            <Column expander />
            <Column field="title" header="Title" style="min-width: 100px; max-width: 150px">
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" fluid />
                </template>
            </Column>
            <Column field="author" header="Author" style="min-width: 100px; max-width: 150px">
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" fluid />
                </template>
            </Column>
            <Column field="description" header="Description" style="min-width: 100px; max-width: 150px">
                <template #editor="{ data, field }">
                    <InputText v-model="data[field]" fluid />
                </template>
            </Column>
            <Column field="cover_image" header="Cover Image" style="min-width: 100px; max-width: 150px">
                <template #body="slotProps">
                    <img :src="slotProps.data.cover_image" :alt="slotProps.data.title" class="shadow-lg" width="64" />
                </template>
                <template #editor="">
                    <FileUpload mode="basic" name="cover" accept="image/*" :auto="false" chooseLabel="Upload Cover Image" class="w-full" />
                </template>
            </Column>
            <Column field="language.name" header="Language" style="min-width: 100px; max-width: 120px">
                <template #body="slotProps">
                    {{ slotProps.data.language?.name }}
                </template>
            </Column>
            <Column field="category.name" header="Category" style="min-width: 100px; max-width: 120px">
                <template #body="slotProps">
                    {{ slotProps.data.category?.name }}
                </template>
            </Column>
            <Column field="library.name" header="Library" style="min-width: 100px; max-width: 120px">
                <template #body="slotProps">
                    {{ slotProps.data.library?.name }}
                </template>
            </Column>
            <Column field="subject.name" header="Subject" style="min-width: 100px; max-width: 120px">
                <template #body="slotProps">
                    {{ slotProps.data.subject?.name }}
                </template>
            </Column>
            <Column field="grade.name" header="Grade" style="min-width: 80px; max-width: 100px">
                <template #body="slotProps">
                    {{ slotProps.data.grade?.name }}
                </template>
            </Column>
            <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
            <template #expansion="slotProps">
                <div class="p-4">
                    <div>
                        <Button text icon="pi pi-plus" label="Expand All" @click="expandAllChildren(slotProps.data.id)" />
                        <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAllChildren(slotProps.data.id)" />
                    </div>
                    <div class="flex items-center gap-2 mt-4 mb-2">
                        <h5 class="cursor-pointer select-none mb-0" @click="toggleOrders(slotProps.data.id)">
                            <i :class="ordersExpanded[slotProps.data.id] ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" class="mr-2" />
                            Physical Books for {{ slotProps.data.title }}
                        </h5>
                        <Button icon="pi pi-plus" text label="Add Book" @click="openAddBookModal(slotProps.data.id)" class="ml-2" />
                    </div>
                    <DataTable
                        v-if="ordersExpanded[slotProps.data.id]"
                        :value="slotProps.data.books"
                        editMode="row"
                        v-model:editingRows="booksEditingRows[slotProps.data.id]"
                        @row-edit-save="(event) => onBookRowEditSave(event, slotProps.data)"
                        paginator
                        :rows="5"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        dataKey="isbn"
                        tableStyle="min-width: 60rem"
                    >
                        <template #header>
                            <div class="flex flex-wrap justify-between gap-2 items-center">
                                <div class="flex gap-2 items-center">
                                    <IconField>
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="booksFilters['global'].value" placeholder="Search books..." />
                                    </IconField>
                                    <Dropdown v-model="booksFilters.language_id.value" :options="mainFilterOptions.languages" optionLabel="label" optionValue="value" placeholder="Language" showClear style="min-width: 120px" />
                                    <Dropdown v-model="booksFilters.category_id.value" :options="mainFilterOptions.categories" optionLabel="label" optionValue="value" placeholder="Category" showClear style="min-width: 120px" />
                                    <Dropdown v-model="booksFilters.subject_id.value" :options="mainFilterOptions.subjects" optionLabel="label" optionValue="value" placeholder="Subject" showClear style="min-width: 120px" />
                                    <Dropdown v-model="booksFilters.grade_id.value" :options="mainFilterOptions.grades" optionLabel="label" optionValue="value" placeholder="Grade" showClear style="min-width: 100px" />
                                </div>
                            </div>
                        </template>
                        <Column field="edition" header="Edition">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" fluid />
                            </template>
                        </Column>
                        <Column field="title" header="Title">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" fluid />
                            </template>
                        </Column>
                        <Column field="cover_image" header="Cover Image">
                            <template #body="slotProps">
                                <img :src="slotProps.data.cover_image" :alt="slotProps.data.title" class="shadow-lg" width="64" />
                            </template>
                        </Column>
                        <Column field="pages" header="Pages">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" fluid />
                            </template>
                        </Column>
                        <Column field="is_borrowable" header="Borrowable">
                            <template #body="slotProps">
                                {{ slotProps.data.is_borrowable ? 'Yes' : 'No' }}
                            </template>
                            <template #editor="{ data, field }">
                                <Dropdown v-model="data[field]" :options="borrowableOptions" optionLabel="label" optionValue="value" placeholder="Borrowable" />
                            </template>
                        </Column>
                        <Column field="shelf" header="Shelf">
                            <template #body="slotProps">
                                {{ slotProps.data.shelf?.name || '-' }}
                            </template>
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field].name" fluid />
                            </template>
                        </Column>
                        <Column field="library" header="Library">
                            <template #body="slotProps">
                                {{ slotProps.data.library?.name || '-' }}
                            </template>
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field].name" fluid />
                            </template>
                        </Column>
                        <Column field="is_reserved" header="Reserved">
                            <template #body="slotProps">
                                {{ slotProps.data.is_reserved ? 'Yes' : 'No' }}
                            </template>
                            <template #editor="{ data, field }">
                                <Dropdown v-model="data[field]" :options="reservedOptions" optionLabel="label" optionValue="value" placeholder="Reserved" />
                            </template>
                        </Column>
                        <Column field="publication_year" header="Publication Year">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" fluid />
                            </template>
                        </Column>
                        <Column header="Actions" style="width: 80px; text-align: center">
                            <template #body="slotProps">
                                <Button icon="pi pi-pencil" text @click="openEditBookModal(slotProps.data)" class="p-1" />
                                <Button icon="pi pi-trash" text severity="danger" @click="confirmDeleteBookRow(slotProps.data, slotProps.index, slotProps)" class="p-1" />
                            </template>
                        </Column>
                        <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
                    </DataTable>
                    <div class="flex items-center gap-2 mt-6 mb-2">
                        <h5 class="cursor-pointer select-none mb-0" @click="toggleShipments(slotProps.data.id)">
                            <i :class="shipmentsExpanded[slotProps.data.id] ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" class="mr-2" />
                            EBooks for {{ slotProps.data.title }}
                        </h5>
                        <Button icon="pi pi-plus" text label="Add Ebook" @click="openAddEbookModal(slotProps.data.id)" class="ml-2" />
                    </div>
                    <DataTable
                        v-if="shipmentsExpanded[slotProps.data.id]"
                        :value="slotProps.data.ebooks"
                        editMode="row"
                        v-model:editingRows="ebooksEditingRows[slotProps.data.id]"
                        @row-edit-save="(event) => onEBookRowEditSave(event, slotProps.data)"
                        paginator
                        :rows="5"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        dataKey="isbn"
                        tableStyle="min-width: 60rem"
                    >
                        <template #header>
                            <div class="flex flex-wrap justify-between gap-2 items-center">
                                <div class="flex gap-2 items-center">
                                    <IconField>
                                        <InputIcon>
                                            <i class="pi pi-search" />
                                        </InputIcon>
                                        <InputText v-model="ebooksFilters.global.value" placeholder="Search ebooks..." />
                                    </IconField>

                                    <Dropdown v-model="ebooksFilters.is_downloadable.value" :options="downloadableOptions" optionLabel="label" optionValue="value" placeholder="Downloadable" showClear style="min-width: 120px" />
                                    <Dropdown v-model="ebooksFilters.e_book_type_id.value" :options="mainFilterOptions.ebook_types" optionLabel="label" optionValue="value" placeholder="Type" showClear style="min-width: 120px" />
                                </div>
                            </div>
                        </template>
                        <Column field="book_item_id" header="Book Item ID">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" fluid />
                            </template>
                        </Column>

                        <Column field="file_name" header="File Name">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" fluid />
                            </template>
                        </Column>

                        <Column field="file_size_mb" header="File Size (MB)">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" fluid />
                            </template>
                        </Column>
                        <Column field="pages" header="Pages">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" fluid />
                            </template>
                        </Column>
                        <Column field="is_downloadable" header="Downloadable">
                            <template #editor="{ data, field }">
                                <InputText v-model="data[field]" fluid />
                            </template>
                        </Column>
                        <Column field="ebookType.name" header="Type">
                            <template #body="slotProps">
                                {{ slotProps.data.e_book_type?.name || '-' }}
                            </template>
                            <template #editor="{ data }">
                                <Dropdown v-model="data.e_book_type_id" :options="mainFilterOptions.ebook_types" optionLabel="label" optionValue="value" placeholder="Type" class="w-full" />
                            </template>
                        </Column>
                        <Column header="Actions" style="width: 80px; text-align: center">
                            <template #body="slotProps">
                                <Button icon="pi pi-pencil" text @click="openEditEbookModal(slotProps.data)" class="p-1" />
                                <Button icon="pi pi-trash" text severity="danger" @click="confirmDeleteEbookRow(slotProps.data, slotProps.index, slotProps)" class="p-1" />
                            </template>
                        </Column>
                        <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
                    </DataTable>
                    <Dialog v-model:visible="showDeleteDialog" header="Confirm Delete" :modal="true" :closable="true" :style="{ width: '350px' }">
                        <div class="mb-4">Are you sure you want to delete this item?</div>
                        <div class="flex justify-end gap-2">
                            <Button label="Cancel" text @click="showDeleteDialog = false" />
                            <Button label="Delete" severity="danger" @click="performDelete" />
                        </div>
                    </Dialog>
                </div>
            </template>
        </DataTable>
        <Toast />
        <!-- Import modals from components -->
        <AddBookItemDialog :visible="showAddBookItemModal" @update:visible="showAddBookItemModal = $event" :filter-options="mainFilterOptions" @book-item-added="onBookItemAdded" />

        <EditBookItemDialog :visible="showEditBookItemModal" @update:visible="showEditBookItemModal = $event" :book-item="selectedBookItem" :filter-options="mainFilterOptions" @book-item-updated="onBookItemUpdated" />
        <AddBookDialog :visible="showAddBookModal" @update:visible="showAddBookModal = $event" :book-item-id="addBookParentId" :filter-options="mainFilterOptions" @book-added="onBookAdded" />

        <EditBookDialog :visible="showEditBookModal" @update:visible="showEditBookModal = $event" :book="selectedBook" :filter-options="mainFilterOptions" @book-updated="onBookUpdated" />

        <AddEbookDialog :visible="showAddEbookModal" @update:visible="showAddEbookModal = $event" :book-item-id="addEbookParentId" :ebook-types="mainFilterOptions.ebook_types" @ebook-added="onEbookAdded" />

        <EditEbookDialog :visible="showEditEbookModal" @update:visible="showEditEbookModal = $event" :ebook="selectedEbook" :ebook-types="mainFilterOptions.ebook_types" @ebook-updated="onEbookUpdated" />
    </div>
</template>
