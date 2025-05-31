<script setup>
import axiosInstance from '@/util/axios-config';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
const toast = useToast();
const categories = ref([]);
const loading = ref(true);
const sortField = ref('category_name');
const sortOrder = ref(1); // 1 for asc, -1 for desc
const totalRecords = ref(0);
const first = ref(0);
const rows = ref(10); // Default rows per page
const rowsPerPageOptions = [5, 10, 20, 50];

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

const onSort = (event) => {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
    loadCategories(1, rows.value);
    first.value = 0;
};

onMounted(() => {
    loadCategories(1, rows.value);
});
</script>
<template>
    <div class="card p-4 shadow mb-10 rounded-lg bg-white">
        <div class="flex items-center justify-between mb-8">
            <div class="font-extrabold text-2xl text-transparent bg-gradient-to-r from-green-500 via-blue-500 to-teal-400 bg-clip-text drop-shadow flex items-center gap-2">
                <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H4a1 1 0 00-1 1v2a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1z" />
                </svg>
                Total Books of FIS
            </div>
            <router-link to="/constants/categories">
                <Button label="View Detail" icon="pi pi-eye" class="p-button-primary" />
            </router-link>
        </div>
        <DataTable
            :value="categories"
            :paginator="true"
            :rows="rows"
            :totalRecords="totalRecords"
            :first="first"
            :rowsPerPageOptions="rowsPerPageOptions"
            :loading="loading"
            :lazy="true"
            @page="onPage"
            @sort="onSort"
            responsiveLayout="scroll"
            class="p-datatable-sm min-w-full"
            scrollable
            style="min-width: 600px"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
        >
            <Column field="id" header="ID" sortable style="min-width: 5rem" />
            <Column field="name" header="Name" sortable style="min-width: 16rem" />
            <Column field="books_count" header="Books" sortable style="min-width: 8rem">
                <template #body="slotProps">
                    <Badge :value="slotProps.data.books_count || slotProps.data.total_books || 0" severity="info"></Badge>
                </template>
            </Column>
        </DataTable>
    </div>
</template>
<style scoped>
.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
