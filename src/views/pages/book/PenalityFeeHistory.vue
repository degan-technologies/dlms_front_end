<script setup>
import axiosInstance from '@/util/axios-config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';

const router = useRouter();
const borrowedItems = ref([]);
const selectedItems = ref([]);
const loading = ref(true);
const totalRecords = ref(0); // Track total records for pagination
const filters = ref({
    global: { value: null, matchMode: 'contains' },
    status: { value: null, matchMode: 'equals' }
});
const dateFilterOptions = ref([
    { label: 'Last 30 Days', value: '30days' },
    { label: 'Last 3 Months', value: '3months' },
    { label: 'Last 6 Months', value: '6months' },
    { label: 'Last Year', value: '1year' },
    { label: 'All Time', value: 'all' }
]);
const selectedDateFilter = ref('3months');

onMounted(() => {
    fetchPenalityHistory();
});

const fetchPenalityHistory = async (lazyParams = { first: 0, rows: 10 }) => {
    loading.value = true;
    try {
        console.log('Fetching data with params:', {
            page: Math.floor(parseInt(lazyParams.first, 10) / parseInt(lazyParams.rows, 10)) + 1,
            per_page: parseInt(lazyParams.rows, 10),
            filter: filters.value.global.value,
            status: filters.value.status.value,
            dateRange: selectedDateFilter.value
        }); // Log the parameters being sent to the backend

        const response = await axiosInstance.get('/fines', {
            params: {
                page: Math.floor(parseInt(lazyParams.first, 10) / parseInt(lazyParams.rows, 10)) + 1, // Ensure page is an integer
                per_page: parseInt(lazyParams.rows, 10), // Ensure per_page is an integer
                filter: filters.value.global.value,
                status: filters.value.status.value,
                dateRange: selectedDateFilter.value
            }
        });

        console.log('Response from backend:', response.data); // Log the response from the backend

        const rawItems = response.data.data || response.data;
        borrowedItems.value = rawItems.map((item) => ({
            id: item.id,
            fine_amount: item.fine_amount ?? 0,
            fine_date: item.fine_date ?? 'Unknown Author',
            reason: item.reason ?? 'Unknown',
            payment_date: item.payment_date ?? 'Unknown',
            payment_status: item.payment_status,
            user_id: item.user_id,
            loan_id: item.loan_id ?? 0,
            return_date: item.return_date,
            library_branch_id: item.library_branch_id ?? 'Unknown',
            fullItem: item
        }));

        totalRecords.value = response.data.pagination.total_records || 0; // Ensure totalRecords is updated correctly
        console.log('Total records:', totalRecords.value); // Log the total records
        console.log('Processed items:', borrowedItems.value); // Log the processed items
    } catch (error) {
        console.error('Failed to fetch borrowed items:', error);
    } finally {
        loading.value = false;
    }
};

const viewDetails = (item) => {
    // Navigate based on asset type
    if (item.asset_type === 'Physical Book') {
        router.push(`/books/physical/${item.id}`);
    } else if (item.asset_type === 'E-Book') {
        router.push(`/books/ebooks/${item.id}`);
    } else {
        router.push(`/books/assets/${item.id}`);
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'returned':
            return 'success';
        case 'returned_late':
            return 'warning';
        case 'lost':
            return 'danger';
        default:
            return 'info';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'returned':
            return 'Returned';
        case 'returned_late':
            return 'Returned Late';
        case 'lost':
            return 'Lost/Damaged';
        default:
            return status;
    }
};

const onDateFilterChange = () => {
    // Trigger a new API call with the selected date range
    console.log('Selected Date Filter:', selectedDateFilter.value); // Log the selected date filter
    fetchPenalityHistory();
};

const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Penality Fee History', 10, 10);

    autoTable(doc, {
        head: [['Loan ID', 'User ID', 'Fine Amount', 'Fine Date', 'Payment Status', 'Reason', 'Library Branch']],
        body: borrowedItems.value.map((item) => [
            item.loan_id,
            item.user_id,
            `$${(Number(item.fine_amount) || 0).toFixed(2)}`, // Ensure fine_amount is a valid number
            item.fine_date,
            getStatusLabel(item.payment_status),
            item.reason,
            item.library_branch_id
        ])
    });

    doc.save('penality-fee-history.pdf');
};

const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
        borrowedItems.value.map((item) => ({
            'Loan ID': item.loan_id,
            'User ID': item.user_id,
            'Fine Amount': `$${(Number(item.fine_amount) || 0).toFixed(2)}`, // Ensure fine_amount is a valid number
            'Fine Date': item.fine_date,
            'Payment Status': getStatusLabel(item.payment_status),
            Reason: item.reason,
            'Library Branch': item.library_branch_id
        }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penality Fee History');
    XLSX.writeFile(workbook, 'penality-fee-history.xlsx');
};

const onPage = (event) => {
    console.log('Pagination event:', event); // Log the pagination event for debugging
    fetchPenalityHistory({ first: event.first, rows: event.rows }); // Pass the correct rows value
    console.log('Updated first:', event.first, 'Updated rows:', event.rows); // Log updated values
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Penality History</h5>
                <p class="text-gray-600 mb-4">View your complete penality history and transaction details.</p>

                <div class="flex justify-content-between mb-4">
                    <div class="flex align-items-center">
                        <span class="mr-2">Filter by: </span>
                        <Dropdown v-model="selectedDateFilter" :options="dateFilterOptions" optionLabel="label" optionValue="value" class="w-12rem" @change="onDateFilterChange" />
                    </div>
                    <div>
                        <Button icon="pi pi-file-pdf" label="Export PDF" class="p-button-outlined p-button-danger mr-2" @click="exportPDF" />
                        <Button icon="pi pi-file-excel" label="Export Excel" class="p-button-outlined p-button-success" @click="exportExcel" />
                    </div>
                </div>

                <DataTable
                    v-model:selection="selectedItems"
                    :value="borrowedItems"
                    dataKey="id"
                    :lazy="true"
                    :rows="2"
                    :loading="loading"
                    :paginator="true"
                    :filters="filters"
                    :rowsPerPageOptions="[2, 10, 25, 50]"
                    :totalRecords="totalRecords"
                    responsiveLayout="scroll"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    @page="onPage"
                    class="p-datatable-sm"
                >
                    <template #empty>
                        <div class="flex flex-column align-items-center p-5 gap-3">
                            <i class="pi pi-history text-primary" style="font-size: 2rem"></i>
                            <p>No borrowing history found for the selected period.</p>
                        </div>
                    </template>

                    <template #header>
                        <div class="flex justify-content-end">
                            <span class="p-input-icon-left">
                                <i class="pi pi-search mr-2" />
                                <InputText v-model="filters.global.value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column field="loan_id" header="Loan Id" sortable>
                        <template #body="slotProps">
                            {{ slotProps.data.loan_id }}
                        </template>
                    </Column>

                    <Column field="user_id" header="User Id" sortable style="width: 10rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.user_id" severity="info" />
                        </template>
                    </Column>

                    <Column field="fine_amount" header="Fine Amount" sortable style="width: 10rem">
                        <template #body="slotProps">
                            {{ slotProps.data.fine_amount }}
                        </template>
                    </Column>

                    <Column field="fine_date" header="Fine Date" sortable style="width: 10rem">
                        <template #body="slotProps">
                            {{ slotProps.data.fine_date }}
                        </template>
                    </Column>

                    <Column field="payment_status" header="Payment Status" sortable style="width: 11rem">
                        <template #body="slotProps">
                            <Tag :value="getStatusLabel(slotProps.data.payment_status)" :severity="getStatusSeverity(slotProps.data.status)" />
                        </template>
                        <template #filter>
                            <Dropdown
                                v-model="filters.status.value"
                                :options="[
                                    { label: 'All', value: null },
                                    { label: 'Returned', value: 'returned' },
                                    { label: 'Returned Late', value: 'returned_late' },
                                    { label: 'Lost/Damaged', value: 'lost' }
                                ]"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Select Status"
                                class="p-column-filter"
                                showClear
                            />
                        </template>
                    </Column>

                    <Column field="reason" header="Reason" sortable style="width: 8rem">
                        <template #body="slotProps">
                            {{ slotProps.data.reason }}
                        </template>
                    </Column>
                    <Column field="library_branch_id" header="Library Branch" style="width: 5rem" sortable>
                        <template #body="slotProps">
                            {{ slotProps.data.library_branch_id }}
                        </template>
                    </Column>
                    <Column header="Actions" style="width: 5rem">
                        <template #body="slotProps">
                            <div class="flex">
                                <Button icon="pi pi-eye" v-tooltip="'View Details'" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-text p-button-sm" @click="viewDetails(slotProps.data)" />
                                <Button icon="pi pi-check" v-tooltip="'View Details'" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-text p-button-sm" @click="viewDetails(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
.p-datatable .p-datatable-tbody > tr > td {
    padding: 0.75rem 1rem;
}
.p-dropdown {
    min-width: 12rem;
}
</style>
