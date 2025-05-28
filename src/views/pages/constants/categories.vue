<script setup>
import axiosInstance from '@/util/axios-config';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
const toast = useToast();
const categories = ref([]);
const category = ref({});
const selectedCategories = ref([]);
const categoryDialog = ref(false);
const deleteCategoryDialog = ref(false);
const deleteCategoriesDialog = ref(false);
const submitted = ref(false);
const loading = ref(true);
const sortField = ref('category_name');
const sortOrder = ref(1); // 1 for asc, -1 for desc
const totalRecords = ref(0);
const first = ref(0);
const rows = ref(10); // Default rows per page
const rowsPerPageOptions = [5, 10, 20, 50];
const categorySearch = ref('');

const filteredCategories = computed(() => {
    if (!categorySearch.value) return categories.value;
    return categories.value.filter((cat) => (cat.category_name && cat.category_name.toLowerCase().includes(categorySearch.value.toLowerCase())) || (cat.id && String(cat.id).includes(categorySearch.value)));
});

const loadCategories = async (page, pageSize = 10) => {
    loading.value = true;
    try {
        const response = await axiosInstance.get('/constants/categories', {
            params: {
                page: page,
                per_page: pageSize,
                sort_by: sortField.value,
                sort_dir: sortOrder.value === 1 ? 'asc' : 'desc'
            }
        });
        // Backend returns data and meta
        const meta = response.data.meta;
        categories.value = response.data.data.map((cat) => ({
            ...cat,
            books_count: cat.books_count ?? 0 // Fallback if not present
        }));
        totalRecords.value = Array.isArray(meta.total) ? meta.total[0] : meta.total;
        first.value = ((Array.isArray(meta.current_page) ? meta.current_page[0] : meta.current_page) - 1) * (Array.isArray(meta.per_page) ? meta.per_page[0] : meta.per_page);
        rows.value = Array.isArray(meta.per_page) ? meta.per_page[0] : meta.per_page;
    } catch (error) {
        console.error('Error loading categories', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to load categories',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    first.value = event.first;
    rows.value = event.rows;
    const page = Math.floor(event.first / event.rows) + 1;
    loadCategories(page, event.rows);
};

const openNew = () => {
    category.value = {};
    submitted.value = false;
    categoryDialog.value = true;
};

const hideDialog = () => {
    categoryDialog.value = false;
    submitted.value = false;
};

const saveCategory = async () => {
    submitted.value = true;
    if (!category.value.category_name) return;
    try {
        if (category.value.id) {
            // UPDATE
            await axiosInstance.put(`/constants/categories/${category.value.id}`, { category_name: category.value.category_name }, { headers: { 'Content-Type': 'application/json' } });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Category Updated',
                life: 3000
            });
        } else {
            // ADD
            await axiosInstance.post('/constants/categories', {
                category_name: category.value.category_name
            });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Category Created',
                life: 3000
            });
        }
        categoryDialog.value = false;
        loadCategories(1, rows.value);
        category.value = { id: null, category_name: '' };
        submitted.value = false;
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Operation failed',
            life: 3000
        });
    }
};

const onSort = (event) => {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
    loadCategories(1, rows.value);
    first.value = 0;
};

const editCategory = (selectedCategory) => {
    category.value = { ...selectedCategory };
    categoryDialog.value = true;
};

const confirmDeleteCategory = (editCategory) => {
    category.value = editCategory;
    deleteCategoryDialog.value = true;
};

const deleteCategory = async () => {
    try {
        await axiosInstance.delete(`/constants/categories/${category.value.id}`);
        categories.value = categories.value.filter((c) => c.id !== category.value.id);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Category Deleted',
            life: 3000
        });
        reloadCurrentPage();
    } catch (error) {
        console.error('Delete failed:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to delete category',
            life: 3000
        });
    } finally {
        deleteCategoryDialog.value = false;
        category.value = {};
    }
};

const confirmDeleteSelected = () => {
    deleteCategoriesDialog.value = true;
};

const deleteSelectedCategories = async () => {
    // Only allow deleting categories with no books/bookItems
    const deletable = selectedCategories.value.filter((cat) => (cat.books_count || cat.total_books || 0) === 0);
    if (deletable.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'No deletable categories selected (must have no books).',
            life: 3000
        });
        deleteCategoriesDialog.value = false;
        return;
    }
    try {
        for (const cat of deletable) {
            await axiosInstance.delete(`/constants/categories/${cat.id}`);
        }
        categories.value = categories.value.filter((c) => !deletable.some((d) => d.id === c.id));
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Selected categories deleted',
            life: 3000
        });
        reloadCurrentPage();
    } catch (error) {
        console.error('Bulk delete failed:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Failed to delete categories',
            life: 3000
        });
    } finally {
        deleteCategoriesDialog.value = false;
        selectedCategories.value = [];
    }
};

const reloadCurrentPage = () => {
    const page = Math.floor(first.value / rows.value) + 1;
    loadCategories(page, rows.value);
};

onMounted(() => {
    loadCategories(1, rows.value);
});
</script>
<template>
    <div class="">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template #start>
                        <h5 class="m-0">Manage Book Categories</h5>
                    </template>
                    <template #end>
                        <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                        <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedCategories || !selectedCategories.length" />
                    </template>
                </Toolbar>
                <div class="mb-3 flex items-center gap-2">
                    <InputText v-model="categorySearch" placeholder="Search categories..." class="w-full max-w-xs" />
                </div>
                <div style="overflow: auto">
                    <DataTable
                        :value="filteredCategories"
                        v-model:selection="selectedCategories"
                        dataKey="id"
                        :paginator="true"
                        v-model:rows="rows"
                        v-model:first="first"
                        :lazy="true"
                        :loading="loading"
                        :totalRecords="totalRecords"
                        :rowsPerPageOptions="rowsPerPageOptions"
                        @page="onPage"
                        @sort="onSort"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
                        responsiveLayout="scroll"
                        scrollable
                        style="min-width: 900px"
                    >
                        <template #empty>
                            <div class="p-4 text-center">
                                <i class="pi pi-folder-open text-primary" style="font-size: 3rem"></i>
                                <p>No categories found.</p>
                            </div>
                        </template>
                        <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                        <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>
                        <Column field="category_name" header="Name" sortable style="min-width: 16rem"></Column>
                        <Column field="created_at" header="Created At" sortable style="min-width: 18rem">
                            <template #body="slotProps">
                                {{ new Date(slotProps.data.created_at).toLocaleString() }}
                            </template>
                        </Column>
                        <Column field="books_count" header="Books" sortable style="min-width: 8rem">
                            <template #body="slotProps">
                                <Badge :value="slotProps.data.books_count || slotProps.data.total_books || 0" severity="info"></Badge>
                            </template>
                        </Column>
                        <Column header="Actions" style="min-width: 8rem">
                            <template #body="slotProps">
                                <Button icon="pi pi-pencil" v-tooltip="'Edit'" class="p-button-rounded p-button-success mr-2" @click="editCategory(slotProps.data)" />
                                <Button icon="pi pi-trash" v-tooltip="'Delete'" class="p-button-rounded p-button-danger" @click="confirmDeleteCategory(slotProps.data)" :disabled="(slotProps.data.books_count || slotProps.data.total_books || 0) > 0" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>
    </div>
    <!-- Category Dialog -->
    <Dialog v-model:visible="categoryDialog" :style="{ width: '500px' }" header="Category Details" :modal="true" class="p-fluid">
        <div class="p-3">
            <div class="formgrid grid gap-4">
                <!-- Category Name -->
                <div class="field col-12">
                    <label for="category_name" class="font-semibold text-sm text-gray-700">Category Name</label>
                    <InputText
                        id="category_name"
                        v-model.trim="category.category_name"
                        required
                        autofocus
                        :class="{
                            'p-invalid': submitted && !category.category_name
                        }"
                        class="w-full"
                    />
                    <small class="p-error" v-if="submitted && !category.category_name"> Name is required.</small>
                </div>
            </div>
        </div>
        <!-- Dialog Footer -->
        <template #footer>
            <div class="flex justify-content-end gap-2">
                <Button label="Cancel" icon="pi pi-times" class="p-button-text p-button-secondary" @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" class="p-button p-button-primary" @click="saveCategory" />
            </div>
        </template>
    </Dialog>
    <!-- Delete Category Dialog -->
    <Dialog v-model:visible="deleteCategoryDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="category"
                >Are you sure you want to delete <b>{{ category.category_name }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteCategoryDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteCategory" />
        </template>
    </Dialog>
    <!-- Delete Categories Dialog -->
    <Dialog v-model:visible="deleteCategoriesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="selectedCategories && selectedCategories.length">Are you sure you want to delete the selected categories?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteCategoriesDialog = false" />
            <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSelectedCategories" />
        </template>
    </Dialog>
</template>
<style scoped>
.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
