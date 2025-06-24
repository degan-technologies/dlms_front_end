<script setup>
import axiosInstance from '@/util/axios-config';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const loans = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const rows = ref(10);
const page = ref(1);
const filter = ref('');
const status = ref('');
const dateRange = ref([]);

const fetchLoans = async () => {
    loading.value = true;
    try {
        const params = {
            per_page: rows.value,
            page: page.value
        };
        if (filter.value) params.filter = filter.value;
        if (status.value) params.status = status.value;
        if (dateRange.value.length === 2) params.dateRange = dateRange.value;
        const res = await axiosInstance.get('/librarian/loans', { params });
        loans.value = res.data.data;
        // Only set totalRecords from meta, do not overwrite rows/page
        const meta = res.data.meta || res.data.pagination || {};
        totalRecords.value = meta.total_records ?? meta.total ?? totalRecords.value;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch borrowing history',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    // PrimeVue DataTable uses zero-based page index, but our API expects 1-based
    page.value = event.page + 1;
    rows.value = event.rows;
    fetchLoans();
};

const onSearch = () => {
    page.value = 1;
    fetchLoans();
};

const resetFilters = () => {
    filter.value = '';
    status.value = '';
    dateRange.value = [];
    page.value = 1;
    fetchLoans();
};

const showFineDialog = ref(false);
const fineDialogData = ref({
    loan: null,
    fineAmount: 0,
    reason: '',
    returnDate: '',
    damageReason: '',
    damageFineAmount: '' // new field for custom damage fine
});

const handleMarkReturned = (loan) => {
    const now = new Date();
    const returnDate = now.toISOString().slice(0, 10);
    const due = new Date(loan.due_date);
    const daysLate = Math.max(0, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
    let fineAmount = 0;
    let reason = '';
    if (daysLate > 0) {
        fineAmount = daysLate * 1; // $1 per day late
        reason = `Overdue book: ${daysLate} day${daysLate === 1 ? '' : 's'} late`;
    }
    fineDialogData.value = {
        loan,
        fineAmount,
        reason,
        returnDate,
        damageReason: '',
        damageFineAmount: ''
    };
    showFineDialog.value = true;
};

const confirmReturnWithFine = async () => {
    const { loan, fineAmount, reason, returnDate, damageReason, damageFineAmount } = fineDialogData.value;
    let totalFine = fineAmount;
    let finalReason = reason;
    if (damageReason && damageReason.trim() !== '') {
        const damageFine = parseFloat(damageFineAmount) || 0;
        totalFine += damageFine;
        finalReason = finalReason ? finalReason + '; ' : '';
        finalReason += damageReason;
        if (damageFine > 0) {
            finalReason += ` (Damage fine: $${damageFine})`;
        }
    }
    try {
        await axiosInstance.put(`/librarian/loans/${loan.id}`, { returned_date: returnDate, book_id: loan.book_id });
        // Update the local data
        const idx = loans.value.findIndex((l) => l.id === loan.id);
        if (idx !== -1) {
            loans.value[idx].return_date = returnDate;
        }
        if (totalFine > 0) {
            await axiosInstance.post('/fines', {
                fine_amount: totalFine,
                fine_date: returnDate,
                reason: finalReason,
                payment_status: 'Unpaid',
                user_id: loan.user_id,
                loan_id: loan.id,
                library_id: loan.library_id || 1
            });
            toast.add({
                severity: 'info',
                summary: 'Fine Issued',
                detail: finalReason,
                life: 4000
            });
        } else {
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Book marked as returned',
                life: 3000
            });
        }
        fetchLoans();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to mark as returned',
            life: 3000
        });
    } finally {
        showFineDialog.value = false;
    }
};

function getDueStatus(loan) {
    if (!loan.due_date) return '-';
    if (loan.returned_date) return 'Returned';
    const today = new Date();
    const due = new Date(loan.due_date);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diff > 0) {
        return diff + ' day' + (diff === 1 ? '' : 's') + ' left';
    } else if (diff === 0) {
        return 'Due today';
    } else {
        return Math.abs(diff) + ' day' + (Math.abs(diff) === 1 ? '' : 's') + ' overdue';
    }
}

onMounted(fetchLoans);
</script>

<template>
    <div class="min-h-screen py-6 flex flex-col items-center">
        <div class="w-full px-2 sm:px-4 md:px-6 mx-auto">
            <div class="card shadow-5 p-4 sm:p-6 md:p-8 rounded-3xl border border-blue-100">
                <div class="flex flex-col gap-10 mb-6">
                    <div>
                        <h2 class="text-xl sm:text-2xl font-extrabold text-blue-800 flex items-center gap-2 mb-4">
                            <i class="pi pi-history text-xl text-blue-500" />
                            Borrowing History
                        </h2>
                        <p class="text-gray-600 text-sm sm:text-base">View all book loans and their status.</p>
                    </div>
                    <div class="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 md:gap-2 md:justify-end mb-6">
                        <InputText v-model="filter" placeholder="Search by title, author, date..." class="w-full sm:w-64" @keyup.enter="onSearch" />
                        <Dropdown
                            v-model="status"
                            :options="[
                                { label: 'All', value: '' },
                                { label: 'Returned', value: 'Returned' },
                                { label: 'Not Returned', value: 'Not Returned' }
                            ]"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Status"
                            class="w-full sm:w-40"
                        />
                        <Calendar v-model="dateRange" selectionMode="range" placeholder="Date Range" class="w-full sm:w-56" />
                        <Button icon="pi pi-search" class="p-button-primary w-full sm:w-auto" @click="onSearch" />
                        <Button icon="pi pi-refresh" label="Reset" class="p-button-secondary w-full sm:w-auto" @click="resetFilters" />
                    </div>
                </div>
                <div class="w-full">
                    <div style="height: 100%; overflow: auto">
                        <DataTable
                            :value="loans"
                            :loading="loading"
                            :paginator="true"
                            :rows="rows"
                            :totalRecords="totalRecords"
                            :rowsPerPageOptions="[5, 10, 20, 50]"
                            :first="(page - 1) * rows"
                            :lazy="true"
                            @page="onPage"
                            dataKey="id"
                            responsive-layout="scroll"
                            class="p-datatable-sm min-w-full"
                            scrollable
                            style="min-width: 700px"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} loans"
                        >
                            <Column field="id" header="#" style="width: 4rem" />
                            <Column field="user_id" header="User ID" />
                            <Column field="user_name" header="User Name" />
                            <Column header="Book">
                                <template #body="{ data }">
                                    <div class="flex items-center gap-3">
                                        <div>
                                            <div class="text-base sm:text-lg">
                                                {{ data.book_title }}
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </Column>
                            <Column field="borrow_date" header="Borrowed" sortable>
                                <template #body="{ data }">
                                    {{ new Date(data.borrow_date).toLocaleDateString() }}
                                </template>
                            </Column>
                            <Column field="due_date" header="Due" sortable>
                                <template #body="{ data }">
                                    {{ new Date(data.due_date).toLocaleDateString() }}
                                </template>
                            </Column>
                            <Column field="returned_date" header="Returned" sortable>
                                <template #body="{ data }">
                                    <span v-if="data.returned_date">
                                        {{ new Date(data.returned_date).toLocaleDateString() }}
                                    </span>
                                    <span v-else class="text-orange-500 font-semibold">Not Returned</span>
                                </template>
                            </Column>
                            <Column header="Fine">
                                <template #body="{ data }">
                                    <span v-if="data.fine">
                                        ${{ data.fine.amount }} (<span :class="data.fine.status === 'true' || data.fine.status === true ? 'text-green-600' : 'text-red-500'">
                                            {{ data.fine.status === 'true' || data.fine.status === true ? 'Paid' : 'Not Paid' }} </span
                                        >)
                                    </span>
                                    <span v-else>-</span>
                                </template>
                            </Column>
                            <Column header="Due Status">
                                <template #body="{ data }">
                                    {{ getDueStatus(data) }}
                                </template>
                            </Column>
                            <Column header="Action" style="min-width: 8rem">
                                <template #body="{ data }">
                                    <Button v-if="!data.returned_date" icon="pi pi-check" class="p-button-success p-button-sm" label="Mark Returned" @click="() => handleMarkReturned(data)" />
                                    <span v-else class="text-green-600 font-semibold">Returned</span>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Dialog v-model:visible="showFineDialog" modal header="Return Book & Fine" :style="{ width: '400px' }">
        <div v-if="fineDialogData.fineAmount > 0" class="mb-3">
            <div class="text-red-600 font-semibold mb-2">Fine Penalty: ${{ fineDialogData.fineAmount }}</div>
            <div class="text-gray-700 text-sm mb-2">Reason: {{ fineDialogData.reason }}</div>
        </div>
        <div class="mb-3">
            <label class="block text-gray-700 text-sm font-bold mb-1">Damage Reason (optional):</label>
            <Textarea v-model="fineDialogData.damageReason" autoResize rows="2" placeholder="Describe any damage (leave blank if none)" class="w-full" />
        </div>
        <div class="mb-3">
            <label class="block text-gray-700 text-sm font-bold mb-1">Damage Fine Amount (optional):</label>
            <InputText v-model="fineDialogData.damageFineAmount" type="number" min="0" step="0.01" placeholder="Enter damage fine (if any)" class="w-full" />
        </div>
        <div class="flex justify-end gap-2 mt-4">
            <Button label="Cancel" class="p-button-text" @click="showFineDialog = false" />
            <Button label="Confirm Return" class="p-button-success" @click="confirmReturnWithFine" />
        </div>
    </Dialog>
</template>
