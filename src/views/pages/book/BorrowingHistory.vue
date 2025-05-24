<script setup>
import axiosInstance from '@/util/axios-config';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

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
    fetchBorrowingHistory();
});

const fetchBorrowingHistory = async (lazyParams = { first: 0, rows: 10 }) => {
    loading.value = true;
    try {
        console.log('Fetching data with params:', {
            page: Math.floor(parseInt(lazyParams.first, 10) / parseInt(lazyParams.rows, 10)) + 1,
            per_page: parseInt(lazyParams.rows, 10),
            filter: filters.value.global.value,
            status: filters.value.status.value,
            dateRange: selectedDateFilter.value
        });

        const response = await axiosInstance.get('/loans', {
            params: {
                page: Math.floor(parseInt(lazyParams.first, 10) / parseInt(lazyParams.rows, 10)) + 1,
                per_page: parseInt(lazyParams.rows, 10),
                filter: filters.value.global.value,
                status: filters.value.status.value,
                dateRange: selectedDateFilter.value
            }
        });

        console.log('Response from backend:', response.data);

        const rawItems = response.data.data || response.data;
        borrowedItems.value = rawItems.map((item) => ({
            id: item.id,
            title: item.book_item?.title ?? 'Unknown Title',
            author: item.book_item?.author ?? 'Unknown Author',
            item_type: item.book_item?.item_type ?? 'Unknown',
            asset_type: item.book_item?.asset_type ?? 'Unknown',
            borrow_date: item.borrow_date,
            due_date: item.due_date,
            renewals_count: item.renewals_count ?? 0,
            return_date: item.return_date,
            status: item.fine?.status,
            fine_amount: item.fine?.amount ?? 0,
            cover_image_url: item.book_item?.cover_image_url ?? 'https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg',
            fullItem: item
        }));

        totalRecords.value = response.data.pagination.total_records || 0; // Update total records for pagination
        console.log('Total records:', totalRecords.value);
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
    // In a real implementation, this would trigger a new API call with the selected date range
    fetchBorrowingHistory();
};

const exportPDF = () => {
    // Implement PDF export functionality

    alert('PDF export would be implemented here');
};

const exportExcel = () => {
    // Implement Excel export functionality
    alert('Excel export would be implemented here');
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const onPage = (event) => {
    console.log('Pagination event:', event); // Log the pagination event for debugging
    fetchBorrowingHistory({ first: event.first, rows: event.rows }); // Pass the correct rows value
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Borrowing History</h5>
                <p class="text-gray-600 mb-4">View your complete library borrowing history and transaction details.</p>

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
                    :rows="10"
                    :lazy="true"
                    :loading="loading"
                    :total-records="totalRecords"
                    :paginator="true"
                    :filters="filters"
                    :rowsPerPageOptions="[5, 10, 25]"
                    responsiveLayout="scroll"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :totalRecords="totalRecords"
                    @page="onPage"
                >
                    <template #empty>
                        <div class="flex flex-column align-items-center p-5">
                            <i class="pi pi-history text-primary" style="font-size: 2rem"></i>
                            <p>No borrowing history found for the selected period.</p>
                        </div>
                    </template>

                    <template #header>
                        <div class="flex justify-content-end">
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters.global.value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>

                    <Column field="title" header="Title" sortable>
                        <template #body="slotProps">
                            <div class="flex align-items-center">
                                <Avatar :image="slotProps.data.cover_image_url" shape="circle" class="mr-2" style="width: 2rem; height: 2rem" />
                                <div>
                                    <span class="font-bold block">{{ slotProps.data.title }}</span>
                                    <small>{{ slotProps.data.author }}</small>
                                </div>
                            </div>
                        </template>
                    </Column>

                    <Column field="asset_type" header="Type" sortable style="min-width: 10rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.item_type" severity="info" />
                        </template>
                    </Column>

                    <Column field="borrow_date" header="Borrowed On" sortable style="width: 10rem">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.borrow_date) }}
                        </template>
                    </Column>

                    <Column field="return_date" header="Returned On" sortable style="width: 10rem">
                        <template #body="slotProps">
                            {{ slotProps.data.return_date }}
                        </template>
                    </Column>

                    <Column field="status" header="Status" sortable style="width: 11rem">
                        <template #body="slotProps">
                            <Tag :value="getStatusLabel(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" />
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

                    <Column field="fine_amount" header="Fine" sortable style="width: 8rem">
                      <template #body="slotProps">
    <span v-if="Number(slotProps.data.fine_amount) > 0" class="text-red-500 font-medium">
        ${{ Number(slotProps.data.fine_amount).toFixed(2) }}
    </span>
    <span v-else class="text-green-500 font-medium">$0.00</span>
</template>

                    </Column>

                    <Column header="Actions" style="width: 5rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-eye" v-tooltip="'View Details'" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-text p-button-sm" @click="viewDetails(slotProps.data)" />
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
