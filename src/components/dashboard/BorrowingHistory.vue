<script setup>
import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import { computed, onMounted, ref } from 'vue';

const loans = ref([]);
const statusFilter = ref('all');
const loading = ref(false);
const currentPage = ref(1);
const perPage = ref(7);
const totalPages = ref(1);
const totalRecords = ref(0);

const fetchLoans = async (page = 1, pageSize = perPage.value) => {
    loading.value = true;
    const token = Cookies.get('access_token') || localStorage.getItem('access_token');
    try {
        const response = await axiosInstance.get('/loans', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page,
                per_page: pageSize
            }
        });
        loans.value = response.data.data;
        const meta = response.data.meta || response.data.pagination || {};
        totalPages.value = meta.total_pages || 1;
        totalRecords.value = meta.total_records || loans.value.length;
        currentPage.value = meta.current_page || 1;
    } catch (error) {
        console.error('Failed to fetch loan history:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchLoans();
});

const filteredLoans = computed(() => {
    if (statusFilter.value === 'all') return loans.value;
    if (statusFilter.value === 'returned') {
        return loans.value.filter((loan) => !!loan.returned_date);
    }
    if (statusFilter.value === 'not returned') {
        return loans.value.filter((loan) => !loan.returned_date);
    }
    return loans.value;
});

const onPage = (event) => {
    currentPage.value = event.page + 1;
    perPage.value = event.rows;
    fetchLoans(currentPage.value, perPage.value);
};
</script>

<template>
    <div class="card mt-8 shadow-lg border border-gray-200 rounded-xl" style="font-size: 1.1rem">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
                <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-extrabold text-2xl bg-gradient-to-r from-green-500 via-blue-500 to-teal-400 bg-clip-text text-transparent drop-shadow"> Borrowing Status </span>
            </div>
            <router-link to="/loans/loan/history" class="flex items-center gap-2">
                <button class="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 shadow transition font-semibold">Detail</button>
            </router-link>
        </div>
        <div class="mb-4 flex items-center gap-2 mt-4">
            <label class="font-medium text-green-700"> Status:</label>
            <select v-model="statusFilter" class="border rounded px-2 py-1">
                <option value="all">All Borrowing Status</option>
                <option value="returned">Returned</option>
                <option value="not returned">Not Returned</option>
            </select>
        </div>
        <div class="overflow-x-auto">
            <DataTable
                :value="filteredLoans"
                :paginator="true"
                :rows="perPage"
                :totalRecords="totalRecords"
                :rowsPerPageOptions="[5, 7, 10, 20]"
                :loading="loading"
                :first="(currentPage - 1) * perPage"
                :lazy="true"
                @page="onPage"
                dataKey="id"
                responsive-layout="scroll"
                class="p-datatable-sm min-w-full"
                scrollable
                style="min-width: 900px"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} loans"
            >
                <Column field="id" header="#" :body="(_, { rowIndex }) => rowIndex + 1 + (currentPage - 1) * perPage" style="width: 4rem" />
                <Column field="user_id" header="User ID" />
                <Column field="book_title" header="Book" />
                <Column field="borrow_date" header="Borrow Date" />
                <Column field="due_date" header="Due Date" />
                <Column field="returned_date" header="Returned Date" :body="(data) => data.returned_date || '-'" />
            </DataTable>
        </div>
    </div>
</template>

<style scoped>
tr:hover td {
    background-color: #f3f4f6;
    transition: background 0.2s;
}
.dark tr:hover td {
    background-color: #374151;
}
</style>
