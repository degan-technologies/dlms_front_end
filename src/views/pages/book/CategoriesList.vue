<script setup>
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const categories = ref([]);
const category = ref({});
const selectedCategories = ref([]);
const categoryDialog = ref(false);
const deleteCategoryDialog = ref(false);
const deleteCategoriesDialog = ref(false);
const submitted = ref(false);
const loading = ref(true);

onMounted(() => {
    loadCategories();
});

const loadCategories = async () => {
    loading.value = true;
    try {
        // In a real app, this would be an API call
        setTimeout(() => {
            categories.value = [
                { id: 1, name: 'Fiction', description: 'Literary works that are not based on facts', books_count: 120 },
                { id: 2, name: 'Non-Fiction', description: 'Literary works based on facts', books_count: 95 },
                { id: 3, name: 'Science Fiction', description: 'Fiction based on imagined future scientific advances', books_count: 56 },
                { id: 4, name: 'Mystery', description: 'Fiction dealing with the solution of a crime or puzzle', books_count: 78 },
                { id: 5, name: 'Biography', description: "Account of someone's life written by someone else", books_count: 42 },
                { id: 6, name: 'History', description: 'Study of past events', books_count: 67 },
                { id: 7, name: 'Computer Science', description: 'Study of computers and computing technologies', books_count: 85 },
                { id: 8, name: 'Mathematics', description: 'Study of numbers, quantities, and shapes', books_count: 35 },
                { id: 9, name: 'Self-Help', description: 'Books that aim to help readers solve personal problems', books_count: 23 },
                { id: 10, name: 'Poetry', description: 'Literary work in which expression of feelings and ideas is given intensity', books_count: 19 }
            ];
            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('Error loading categories', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories', life: 3000 });
        loading.value = false;
    }
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

const saveCategory = () => {
    submitted.value = true;

    if (category.value.name?.trim()) {
        if (category.value.id) {
            // Update existing category
            const index = categories.value.findIndex((c) => c.id === category.value.id);
            categories.value[index] = { ...category.value };
            toast.add({ severity: 'success', summary: 'Success', detail: 'Category Updated', life: 3000 });
        } else {
            // Create new category
            category.value.id = categories.value.length ? Math.max(...categories.value.map((c) => c.id)) + 1 : 1;
            category.value.books_count = 0;
            categories.value.push({ ...category.value });
            toast.add({ severity: 'success', summary: 'Success', detail: 'Category Created', life: 3000 });
        }

        categoryDialog.value = false;
        category.value = {};
    }
};

const editCategory = (editCategory) => {
    category.value = { ...editCategory };
    categoryDialog.value = true;
};

const confirmDeleteCategory = (editCategory) => {
    category.value = editCategory;
    deleteCategoryDialog.value = true;
};

const deleteCategory = () => {
    categories.value = categories.value.filter((c) => c.id !== category.value.id);
    deleteCategoryDialog.value = false;
    category.value = {};
    toast.add({ severity: 'success', summary: 'Success', detail: 'Category Deleted', life: 3000 });
};

const confirmDeleteSelected = () => {
    deleteCategoriesDialog.value = true;
};

const deleteSelectedCategories = () => {
    categories.value = categories.value.filter((c) => !selectedCategories.value.includes(c));
    deleteCategoriesDialog.value = false;
    selectedCategories.value = [];
    toast.add({ severity: 'success', summary: 'Success', detail: 'Categories Deleted', life: 3000 });
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template #start>
                        <h5 class="m-0">Manage Book Categories</h5>
                    </template>

                    <template #end>
                        <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                        <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedCategories.value || !selectedCategories.value.length" />
                    </template>
                </Toolbar>

                <DataTable
                    :value="categories"
                    v-model:selection="selectedCategories"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :loading="loading"
                    :rowsPerPageOptions="[5, 10, 25]"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
                    responsiveLayout="scroll"
                >
                    <template #empty>
                        <div class="p-4 text-center">
                            <i class="pi pi-folder-open text-primary" style="font-size: 3rem"></i>
                            <p>No categories found.</p>
                        </div>
                    </template>

                    <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                    <Column field="id" header="ID" sortable style="min-width: 5rem"></Column>
                    <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
                    <Column field="description" header="Description" sortable style="min-width: 18rem"></Column>
                    <Column field="books_count" header="Books" sortable style="min-width: 8rem">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.books_count" severity="info"></Badge>
                        </template>
                    </Column>
                    <Column style="min-width: 8rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editCategory(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDeleteCategory(slotProps.data)" :disabled="slotProps.data.books_count > 0" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <!-- Category Dialog -->
    <Dialog v-model:visible="categoryDialog" :style="{ width: '450px' }" header="Category Details" :modal="true" class="p-fluid">
        <div class="field">
            <label for="name">Name</label>
            <InputText id="name" v-model.trim="category.name" required autofocus :class="{ 'p-invalid': submitted && !category.name }" />
            <small class="p-error" v-if="submitted && !category.name">Name is required.</small>
        </div>
        <div class="field">
            <label for="description">Description</label>
            <Textarea id="description" v-model="category.description" rows="3" cols="20" />
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveCategory" />
        </template>
    </Dialog>

    <!-- Delete Category Dialog -->
    <Dialog v-model:visible="deleteCategoryDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="category"
                >Are you sure you want to delete <b>{{ category.name }}</b
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
