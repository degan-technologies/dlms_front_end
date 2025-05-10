<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const borrowingHistory = ref([]);
const selectedItems = ref([]);
const loading = ref(true);
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

const fetchBorrowingHistory = async () => {
    loading.value = true;
    try {
        // In a real app, this would be an API call with date filtering
        setTimeout(() => {
            borrowingHistory.value = [
                {
                    id: 1,
                    title: 'Designing Data-Intensive Applications',
                    author: 'Martin Kleppmann',
                    category: 'Computer Science',
                    asset_type: 'Physical Book',
                    isbn: '9781449373320',
                    borrow_date: '2024-12-10',
                    due_date: '2025-01-10',
                    return_date: '2025-01-08',
                    status: 'returned',
                    renewals_count: 0,
                    fine_amount: 0,
                    cover_image_url: '/demo/images/product/product-placeholder.svg'
                },
                {
                    id: 2,
                    title: 'The Pragmatic Programmer',
                    author: 'Andrew Hunt, David Thomas',
                    category: 'Programming',
                    asset_type: 'E-Book',
                    isbn: '9780201616224',
                    borrow_date: '2025-01-15',
                    due_date: '2025-02-15',
                    return_date: '2025-02-10',
                    status: 'returned',
                    renewals_count: 0,
                    fine_amount: 0,
                    cover_image_url: '/demo/images/product/product-placeholder.svg'
                },
                {
                    id: 3,
                    title: 'Fundamentals of Database Systems',
                    author: 'Ramez Elmasri, Shamkant Navathe',
                    category: 'Database',
                    asset_type: 'Physical Book',
                    isbn: '9780133970777',
                    borrow_date: '2025-02-05',
                    due_date: '2025-03-05',
                    return_date: '2025-03-10',
                    status: 'returned_late',
                    renewals_count: 0,
                    fine_amount: 2.5,
                    cover_image_url: '/demo/images/product/product-placeholder.svg'
                },
                {
                    id: 4,
                    title: 'The Art of Computer Programming, Vol. 1',
                    author: 'Donald E. Knuth',
                    category: 'Computer Science',
                    asset_type: 'Physical Book',
                    isbn: '9780201896831',
                    borrow_date: '2025-03-01',
                    due_date: '2025-04-01',
                    return_date: '2025-03-29',
                    status: 'returned',
                    renewals_count: 1,
                    fine_amount: 0,
                    cover_image_url: '/demo/images/product/product-placeholder.svg'
                },
                {
                    id: 5,
                    title: 'Clean Architecture',
                    author: 'Robert C. Martin',
                    category: 'Software Design',
                    asset_type: 'E-Book',
                    isbn: '9780134494166',
                    borrow_date: '2025-03-15',
                    due_date: '2025-04-15',
                    return_date: '2025-04-07',
                    status: 'returned',
                    renewals_count: 0,
                    fine_amount: 0,
                    cover_image_url: '/demo/images/product/product-placeholder.svg'
                }
            ];
            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('Failed to fetch borrowing history:', error);
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
                    :value="borrowingHistory"
                    dataKey="id"
                    :rows="10"
                    :loading="loading"
                    :paginator="true"
                    :filters="filters"
                    :rowsPerPageOptions="[5, 10, 25]"
                    responsiveLayout="scroll"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    class="p-datatable-sm"
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

                    <Column field="asset_type" header="Type" sortable style="width: 10rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.asset_type" severity="info" />
                        </template>
                    </Column>

                    <Column field="borrow_date" header="Borrowed On" sortable style="width: 10rem">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.borrow_date) }}
                        </template>
                    </Column>

                    <Column field="return_date" header="Returned On" sortable style="width: 10rem">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.return_date) }}
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
                            <span v-if="slotProps.data.fine_amount > 0" class="text-red-500 font-medium">${{ slotProps.data.fine_amount.toFixed(2) }}</span>
                            <span v-else class="text-green-500 font-medium">$0.00</span>
                        </template>
                    </Column>

                    <Column style="width: 5rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-eye" tooltip="View Details" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-text p-button-sm" @click="viewDetails(slotProps.data)" />
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
