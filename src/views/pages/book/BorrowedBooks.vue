<script setup>
import axiosInstance from '@/util/axios-config';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();
const borrowedItems = ref([]);
const selectedItems = ref([]);
const extendDialog = ref(false);
const returnDialog = ref(false);
const loading = ref(true);
const currentItem = ref(null);
const extendDays = ref(7);
const totalRecords = ref(0); // Track total records for pagination

onMounted(() => {
    fetchBorrowedItems();
});

const fetchBorrowedItems = async (lazyParams = { first: 0, rows: 10 }) => {
    loading.value = true;
    try {
        console.log('Fetching data with params:', {
            page: Math.floor(parseInt(lazyParams.first, 10) / parseInt(lazyParams.rows, 10)) + 1,
            per_page: parseInt(lazyParams.rows, 10)
        });

        const response = await axiosInstance.get('/loans', {
            params: {
                page: Math.floor(parseInt(lazyParams.first, 10) / parseInt(lazyParams.rows, 10)) + 1,
                per_page: parseInt(lazyParams.rows, 10)
            }
        });

        console.log('Response from backend:', response.data);

        const rawItems = response.data.data || response.data;
        borrowedItems.value = rawItems
            .filter((item) => item.return_date === null)
            .map((item) => ({
                id: item.id,
                title: item.book_item?.title ?? 'Unknown Title',
                author: item.book_item?.author ?? 'Unknown Author',
                item_type: item.book_item?.item_type ?? 'Unknown',
                asset_type: item.book_item?.asset_type ?? 'Unknown',
                borrow_date: item.borrow_date,
                due_date: item.due_date,
                renewals_count: item.renewals_count ?? 0,
                return_date: 'Not Returned',
                cover_image_url: item.book_item?.cover_image_url ?? 'https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg',

                // Optional: if needed for actions
                fullItem: item
            }));

        totalRecords.value = response.data.pagination?.total_records || 0; // Update total records for pagination
        console.log('Total records:', totalRecords.value);
    } catch (error) {
        console.error('Failed to fetch borrowed items:', error);
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    console.log('Pagination event:', event); // Log the pagination event for debugging
    fetchBorrowedItems({ first: event.first, rows: event.rows }); // Pass the correct rows value
};

const confirmReturn = (item) => {
    currentItem.value = item;
    returnDialog.value = true;
};

const confirmExtend = (item) => {
    currentItem.value = item;
    extendDialog.value = true;
};

const returnItem = async () => {
    try {
        const item = borrowedItems.value.find((i) => i.id === currentItem.value.id);
        if (!item) return;

        const fullData = item.fullItem || {};
        const returnDate = new Date(); // Now
        const dueDate = new Date(item.due_date);

        // Calculate days late
        const timeDiff = returnDate - dueDate;
        const daysLate = Math.max(Math.ceil(timeDiff / (1000 * 60 * 60 * 24)), 0);

        const feePerDay = 5; // Adjust as needed
        const totalFine = daysLate * feePerDay;

        // Prepare payload for loan update
        const payload = {
            student_id: fullData.student_id,
            book_item_id: fullData.book_item_id,
            borrow_date: item.borrow_date,
            due_date: item.due_date,
            library_branch_id: fullData.library_branch_id,
            return_date: returnDate.toISOString().slice(0, 10)
        };

        // 1. Update return date in the loan record
        await axiosInstance.put(`/loans/${item.id}`, payload);

        // 2. If late, record fine
        if (daysLate > 0) {
            const finePayload = {
                library_branch_id: fullData.library_branch_id,
                user_id: fullData.student_id,
                loan_id: item.id,
                fine_amount: totalFine,
                fine_date: returnDate.toISOString().slice(0, 10),
                reason: `Returned ${daysLate} day(s) late`,
                payment_status: 'Unpaid' // Default
            };

            await axiosInstance.post('/fines', finePayload);
        }

        toast.add({
            severity: 'success',
            summary: 'Returned',
            detail: daysLate > 0 ? `Returned late. Fine of ${totalFine} recorded.` : 'Returned on time.',
            life: 3000
        });

        returnDialog.value = false;
        borrowedItems.value = borrowedItems.value.filter((i) => i.id !== item.id);
    } catch (error) {
        console.error('Return error:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to return item',
            life: 3000
        });
    }
};

const extendBorrowingPeriod = async () => {
    try {
        // In a real app, this would be an API call
        const item = borrowedItems.value.find((i) => i.id === currentItem.value.id);
        if (item) {
            const currentDueDate = new Date(item.due_date);
            currentDueDate.setDate(currentDueDate.getDate() + extendDays.value);
            item.due_date = currentDueDate.toISOString().slice(0, 10);
            item.renewals_count += 1;
        }
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Borrowing period extended by ${extendDays.value} days`,
            life: 3000
        });
        extendDialog.value = false;
    } catch (error) {
        console.error('Error extending borrowing period:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to extend borrowing period',
            life: 3000
        });
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

const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysRemaining;
};

const getSeverity = (dueDate) => {
    const daysRemaining = getDaysRemaining(dueDate);
    if (daysRemaining < 0) return 'danger';
    if (daysRemaining < 3) return 'warning';
    return 'success';
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <h5>Currently Borrowed Items</h5>
                <p class="text-gray-600 mb-4">View and manage your borrowed books and other library resources.</p>

                <DataTable
                    v-model:selection="selectedItems"
                    :value="borrowedItems"
                    dataKey="id"
                    :rows="10"
                    :loading="loading"
                    :paginator="true"
                    :rowsPerPageOptions="[5, 10, 25]"
                    :totalRecords="totalRecords"
                    responsiveLayout="scroll"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    @page="onPage"
                    class="p-datatable-sm"
                >
                    <template #empty>
                        <div class="flex flex-column align-items-center p-5">
                            <i class="pi pi-info-circle text-primary" style="font-size: 2rem"></i>
                            <p>You don't have any borrowed items at the moment.</p>
                            <Button label="Browse Library" icon="pi pi-search" @click="router.push('/books')" />
                        </div>
                    </template>

                    <Column field="cover_image_url" header="Cover Image" style="width: 4rem">
                        <template #body="slotProps">
                            <Avatar :image="slotProps.data.cover_image_url" shape="circle" />
                        </template>
                    </Column>

                    <Column field="title" header="Title" sortable>
                        <template #body="slotProps">
                            <div>
                                <span class="font-bold block">{{ slotProps.data.title }}</span>
                                <small>{{ slotProps.data.author }}</small>
                            </div>
                        </template>
                    </Column>

                    <Column field="asset_type" header="Type" sortable style="width: 10rem">
                        <template #body="slotProps">
                            <i class="pi pi-book"></i>
                            <Tag :value="slotProps.data.item_type" severity="info" />
                        </template>
                    </Column>

                    <Column field="borrow_date" header="Borrowed On" sortable style="width: 10rem"></Column>

                    <Column field="due_date" header="Due Date" sortable style="width: 12rem">
                        <template #body="slotProps">
                            <div class="flex align-items-center">
                                <span>{{ slotProps.data.due_date }}</span>
                                <Tag :value="getDaysRemaining(slotProps.data.due_date) + ' days'" :severity="getSeverity(slotProps.data.due_date)" class="ml-2" />
                            </div>
                        </template>
                    </Column>

                    <Column field="renewals_count" header="Renewals" style="width: 8rem">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.renewals_count" severity="secondary" />
                        </template>
                    </Column>
                    <Column field="return_date" header="Return Date" style="width: 9rem">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.return_date" severity="secondary" />
                        </template>
                    </Column>

                    <Column header="Actions" style="width: 14rem">
                        <template #body="slotProps">
                            <div class="flex">
                                <Button icon="pi pi-eye" v-tooltip="'View Details'" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-text p-button-sm" @click="viewDetails(slotProps.data)" />
                                <Button icon="pi pi-calendar-plus" v-tooltip="'Extend'" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-success p-button-sm" @click="confirmExtend(slotProps.data)" />
                                <Button icon="pi pi-check" v-tooltip="'Return'" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-primary p-button-sm" @click="confirmReturn(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <!-- Return Dialog -->
                <Dialog v-model:visible="returnDialog" :style="{ width: '450px' }" header="Confirm Return" :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-check-circle mr-3" style="font-size: 2rem" />
                        <span
                            >Are you sure you want to return <b>{{ currentItem?.title }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="returnDialog = false" />
                        <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="returnItem" />
                    </template>
                </Dialog>

                <!-- Extend Dialog -->
                <Dialog v-model:visible="extendDialog" :style="{ width: '450px' }" header="Extend Borrowing Period" :modal="true">
                    <div class="p-fluid">
                        <div class="field">
                            <label for="extendDays">How many days would you like to extend?</label>
                            <div class="p-inputgroup">
                                <InputNumber id="extendDays" v-model="extendDays" :min="1" :max="30" />
                                <span class="p-inputgroup-addon">days</span>
                            </div>
                            <small>Current due date: {{ currentItem?.due_date }}</small>
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="extendDialog = false" />
                        <Button label="Extend" icon="pi pi-check" class="p-button-text" @click="extendBorrowingPeriod" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped>
.confirmation-content {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
