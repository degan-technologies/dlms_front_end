<script setup>
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

onMounted(() => {
    fetchBorrowedItems();
});

const fetchBorrowedItems = async () => {
    loading.value = true;
    try {
        // In a real app, this would be an API call
        setTimeout(() => {
            borrowedItems.value = [
                {
                    id: 1,
                    title: 'The Design of Everyday Things',
                    author: 'Don Norman',
                    category: 'Design',
                    asset_type: 'Physical Book',
                    isbn: '9780465050659',
                    borrow_date: '2025-04-15',
                    due_date: '2025-05-15',
                    return_date: null,
                    status: 'borrowed',
                    renewals_count: 0,
                    cover_image_url: '/demo/images/product/product-placeholder.svg'
                },
                {
                    id: 2,
                    title: 'Introduction to Algorithms',
                    author: 'Thomas H. Cormen',
                    category: 'Computer Science',
                    asset_type: 'Physical Book',
                    isbn: '9780262033848',
                    borrow_date: '2025-04-20',
                    due_date: '2025-05-20',
                    return_date: null,
                    status: 'borrowed',
                    renewals_count: 0,
                    cover_image_url: '/demo/images/product/product-placeholder.svg'
                },
                {
                    id: 3,
                    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
                    author: 'Robert C. Martin',
                    category: 'Programming',
                    asset_type: 'E-Book',
                    isbn: '9780132350884',
                    borrow_date: '2025-04-25',
                    due_date: '2025-05-25',
                    return_date: null,
                    status: 'borrowed',
                    renewals_count: 0,
                    cover_image_url: '/demo/images/product/product-placeholder.svg'
                },
                {
                    id: 4,
                    title: 'Deep Learning Techniques',
                    author: 'Andrew Johnson',
                    category: 'Artificial Intelligence',
                    asset_type: 'Digital Asset',
                    isbn: null,
                    borrow_date: '2025-05-01',
                    due_date: '2025-05-31',
                    return_date: null,
                    status: 'borrowed',
                    renewals_count: 0,
                    cover_image_url: '/demo/images/product/product-placeholder.svg'
                }
            ];
            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('Failed to fetch borrowed items:', error);
        loading.value = false;
    }
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
        // In a real app, this would be an API call
        const item = borrowedItems.value.find((i) => i.id === currentItem.value.id);
        if (item) {
            item.status = 'returned';
            item.return_date = new Date().toISOString().slice(0, 10);
        }
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Item returned successfully',
            life: 3000
        });
        returnDialog.value = false;

        // Remove from the list or update status
        borrowedItems.value = borrowedItems.value.filter((i) => i.id !== currentItem.value.id);
    } catch (error) {
        console.error('Error returning item:', error);
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
                <p class="text-gray-600 mb-4">
                    View and manage your borrowed books and other library resources.
                </p>

                <DataTable
                    v-model:selection="selectedItems"
                    :value="borrowedItems"
                    dataKey="id"
                    :rows="10"
                    :loading="loading"
                    :paginator="true"
                    :rowsPerPageOptions="[5, 10, 25]"
                    responsiveLayout="scroll"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    class="p-datatable-sm">
                    <template #empty>
                        <div class="flex flex-column align-items-center p-5">
                            <i class="pi pi-info-circle text-primary" style="font-size: 2rem"></i>
                            <p>You don't have any borrowed items at the moment.</p>
                            <Button
                                label="Browse Library"
                                icon="pi pi-search"
                                @click="router.push('/books')" />
                        </div>
                    </template>

                    <Column style="width: 4rem">
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
                            <Tag :value="slotProps.data.asset_type" severity="info" />
                        </template>
                    </Column>

                    <Column
                        field="borrow_date"
                        header="Borrowed On"
                        sortable
                        style="width: 10rem"></Column>

                    <Column field="due_date" header="Due Date" sortable style="width: 12rem">
                        <template #body="slotProps">
                            <div class="flex align-items-center">
                                <span>{{ slotProps.data.due_date }}</span>
                                <Tag
                                    :value="getDaysRemaining(slotProps.data.due_date) + ' days'"
                                    :severity="getSeverity(slotProps.data.due_date)"
                                    class="ml-2" />
                            </div>
                        </template>
                    </Column>

                    <Column field="renewals_count" header="Renewals" style="width: 8rem">
                        <template #body="slotProps">
                            <Badge :value="slotProps.data.renewals_count" severity="secondary" />
                        </template>
                    </Column>

                    <Column style="width: 14rem">
                        <template #body="slotProps">
                            <div class="flex">
                                <Button
                                    icon="pi pi-eye"
                                    tooltip="View Details"
                                    tooltipOptions="{ position: 'top' }"
                                    class="p-button-rounded p-button-text p-button-sm"
                                    @click="viewDetails(slotProps.data)" />
                                <Button
                                    icon="pi pi-calendar-plus"
                                    tooltip="Extend"
                                    tooltipOptions="{ position: 'top' }"
                                    class="p-button-rounded p-button-success p-button-sm"
                                    @click="confirmExtend(slotProps.data)" />
                                <Button
                                    icon="pi pi-check"
                                    tooltip="Return"
                                    tooltipOptions="{ position: 'top' }"
                                    class="p-button-rounded p-button-primary p-button-sm"
                                    @click="confirmReturn(slotProps.data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <!-- Return Dialog -->
                <Dialog
                    v-model:visible="returnDialog"
                    :style="{ width: '450px' }"
                    header="Confirm Return"
                    :modal="true">
                    <div class="confirmation-content">
                        <i class="pi pi-check-circle mr-3" style="font-size: 2rem" />
                        <span
                            >Are you sure you want to return <b>{{ currentItem?.title }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button
                            label="No"
                            icon="pi pi-times"
                            class="p-button-text"
                            @click="returnDialog = false" />
                        <Button
                            label="Yes"
                            icon="pi pi-check"
                            class="p-button-text"
                            @click="returnItem" />
                    </template>
                </Dialog>

                <!-- Extend Dialog -->
                <Dialog
                    v-model:visible="extendDialog"
                    :style="{ width: '450px' }"
                    header="Extend Borrowing Period"
                    :modal="true">
                    <div class="p-fluid">
                        <div class="field">
                            <label for="extendDays">How many days would you like to extend?</label>
                            <div class="p-inputgroup">
                                <InputNumber
                                    id="extendDays"
                                    v-model="extendDays"
                                    :min="1"
                                    :max="30" />
                                <span class="p-inputgroup-addon">days</span>
                            </div>
                            <small>Current due date: {{ currentItem?.due_date }}</small>
                        </div>
                    </div>
                    <template #footer>
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            class="p-button-text"
                            @click="extendDialog = false" />
                        <Button
                            label="Extend"
                            icon="pi pi-check"
                            class="p-button-text"
                            @click="extendBorrowingPeriod" />
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
