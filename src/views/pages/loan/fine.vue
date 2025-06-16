<script setup>
import axiosInstance from '@/util/axios-config';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const loadingFines = ref(false);
const fines = ref([]);
const totalFines = ref(0);
const fineRows = ref(10);
const finePage = ref(1);
const fineFilter = ref('');
const fineStatus = ref('');
const fineDateRange = ref([]);

const fetchFines = async () => {
    loadingFines.value = true;
    try {
        const params = {
            per_page: fineRows.value,
            page: finePage.value
        };
        if (fineFilter.value) params.filter = fineFilter.value;
        if (fineStatus.value) params.status = fineStatus.value;
        if (fineDateRange.value.length === 2) params.dateRange = fineDateRange.value;
        const res = await axiosInstance.get('/fines', { params });
        fines.value = res.data.data;
        totalFines.value = res.data.pagination.total_records;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch fines',
            life: 3000
        });
    } finally {
        loadingFines.value = false;
    }
};

const onFinePage = (event) => {
    finePage.value = event.page + 1;
    fineRows.value = event.rows;
    fetchFines();
};

const onFineSearch = () => {
    finePage.value = 1;
    fetchFines();
};

const resetFineFilters = () => {
    fineFilter.value = '';
    fineStatus.value = '';
    fineDateRange.value = [];
    finePage.value = 1;
    fetchFines();
};

const showReceiptDialog = ref(false);
const selectedFine = ref(null);
const receiptFile = ref(null);

// Script (no change needed here)
const handleReceiptUpload = (event) => {
    receiptFile.value = event.target.files[0];
};

const markFinePaidWithReceipt = async () => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        if (receiptFile.value) {
            const formData = new FormData();
            formData.append('payment_status', 'Paid');
            formData.append('payment_date', today);
            formData.append('receipt_path', receiptFile.value); // Key matches input name
            formData.append('_method', 'PUT');
            await axiosInstance.post(`/fines/${selectedFine.value.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            await axiosInstance.put(`/fines/${selectedFine.value.id}`, {
                payment_status: 'Paid',
                payment_date: today
            });
        }
        selectedFine.value.payment_status = 'Paid';
        selectedFine.value.payment_date = today;
        showReceiptDialog.value = false;
        receiptFile.value = null;
        selectedFine.value = null;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Payment status and receipt uploaded', life: 2000 });
        fetchFines(); // Refresh fines list
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to update fine status', life: 3000 });
    }
};

const updateFineStatus = (fine) => {
    selectedFine.value = fine;
    receiptFile.value = null;
    showReceiptDialog.value = true;
};

onMounted(fetchFines);
</script>

<template>
    <div class="card mt-5">
        <h5 class="mb-3">Payment Management (Fines)</h5>
        <div class="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 md:gap-2 md:justify-end mb-4">
            <InputText v-model="fineFilter" placeholder="Search by reason, user, loan..." class="w-full sm:w-64" @keyup.enter="onFineSearch" />
            <Dropdown
                v-model="fineStatus"
                :options="[
                    { label: 'All', value: '' },
                    { label: 'Paid', value: 'Paid' },
                    { label: 'Unpaid', value: 'Unpaid' }
                ]"
                optionLabel="label"
                optionValue="value"
                placeholder="Status"
                class="w-full sm:w-40"
            />
            <Calendar v-model="fineDateRange" selectionMode="range" placeholder="Date Range" class="w-full sm:w-56" />
            <Button icon="pi pi-search" class="p-button-primary w-full sm:w-auto" @click="onFineSearch" />
            <Button icon="pi pi-refresh" label="Reset" class="p-button-secondary w-full sm:w-auto" @click="resetFineFilters" />
        </div>
        <div class="w-full">
            <div style="height: 100%; overflow: auto">
                <DataTable
                    :value="fines"
                    :loading="loadingFines"
                    :paginator="true"
                    :rows="fineRows"
                    :totalRecords="totalFines"
                    :lazy="true"
                    @page="onFinePage"
                    dataKey="id"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    responsive-layout="scroll"
                    class="p-datatable-sm min-w-full"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} loans"
                    scrollable
                    style="min-width: 1100px"
                >
                    <Column field="id" header="#" style="width: 4rem" />
                    <Column field="user_id" header="User" />
                    <Column field="loan_id" header="Loan" />
                    <Column field="fine_amount" header="Amount" />
                    <Column field="fine_date" header="Fine Date">
                        <template #body="{ data }">
                            {{ data.fine_date ? new Date(data.fine_date).toLocaleDateString() : '-' }}
                        </template>
                    </Column>
                    <Column field="reason" header="Reason" />
                    <Column field="payment_date" header="Payment Date">
                        <template #body="{ data }">
                            {{ data.payment_date ? new Date(data.payment_date).toLocaleDateString() : '-' }}
                        </template>
                    </Column>
                    <Column field="payment_status" header="Status">
                        <template #body="{ data }">
                            <Tag :value="data.payment_status === true || data.payment_status === 'Paid' ? 'Paid' : 'Unpaid'" :severity="data.payment_status === true || data.payment_status === 'Paid' ? 'success' : 'warning'" />
                        </template>
                    </Column>
                    <Column field="receipt_path" header="Receipt">
                        <template #body="{ data }">
                            <span v-if="data.receipt_path">
                                <a :href="data.receipt_path" target="_blank" class="text-blue-600 underline">View Receipt</a>
                            </span>
                            <span v-else>-</span>
                        </template>
                    </Column>
                    <Column header="Action" style="min-width: 8rem">
                        <template #body="{ data }">
                            <Button v-if="!data.payment_status || data.payment_status === 'Unpaid'" icon="pi pi-check" class="p-button-success p-button-sm mr-2" label="Mark Paid" @click="() => updateFineStatus(data, 'Paid')" />
                            <span v-else class="text-green-600 font-semibold">Paid</span>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <Dialog v-model:visible="showReceiptDialog" header="Upload Receipt" modal :style="{ width: '450px' }" class="p-fluid">
            <div class="p-field p-grid p-mb-3">
                <label for="receipt" class="p-col-12 p-md-4 p-mb-2 md:p-mb-0">Receipt File</label>
                <div class="p-col-12 p-md-8">
                    <input type="file" id="receipt" name="receipt_path" accept="image/*,application/pdf" @change="handleReceiptUpload" class="w-full" />
                </div>
            </div>
            <template #footer>
                <div class="p-d-flex p-jc-end p-gap-2">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text p-button-secondary" @click="showReceiptDialog = false" />
                    <Button label="Mark Paid" icon="pi pi-check" class="p-button p-button-success" @click="markFinePaidWithReceipt" />
                </div>
            </template>
        </Dialog>
    </div>
</template>
