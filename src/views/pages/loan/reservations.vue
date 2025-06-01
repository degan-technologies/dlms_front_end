<script setup>
import axiosInstance from '@/util/axios-config';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';

const toast = useToast();
const reservations = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const rows = ref(10);
const page = ref(1);
const filter = ref('');
const status = ref('');
const dateRange = ref([]);

const fetchReservations = async () => {
    loading.value = true;
    try {
        const params = {
            per_page: rows.value,
            page: page.value
        };
        if (filter.value) params.filter = filter.value;
        if (status.value) params.status = status.value;
        if (dateRange.value.length === 2) params.dateRange = dateRange.value;
        const res = await axiosInstance.get('/reservations', { params });
        reservations.value = res.data.data;
        totalRecords.value = res.data.meta?.total_records || res.data.meta?.total || res.data.data.length;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch reservations',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    page.value = event.page + 1;
    rows.value = event.rows;
    fetchReservations();
};

const onFilter = () => {
    page.value = 1;
    fetchReservations();
};

let fetchReservationsTimeout = null;
watch(
    () => [filter.value, status.value, dateRange.value],
    () => {
        page.value = 1;
        if (fetchReservationsTimeout) clearTimeout(fetchReservationsTimeout);
        fetchReservationsTimeout = setTimeout(() => {
            fetchReservations();
        }, 300);
    },
    { deep: true }
);

const handleApprove = async (reservation) => {
    try {
        // 1. Update reservation status to 'approved'
        await axiosInstance.put(`/reservations/${reservation.id}`, { status: 'approved' });
        // 2. Create a loan for this reservation
        // Set borrow_date as today, due_date as 14 days from today (example)
        const today = new Date();
        const borrowDate = today.toISOString().slice(0, 10);
        const dueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        await axiosInstance.post('/loans', {
            user_id: reservation.user_id,
            book_id: reservation.book_id,
            borrow_date: borrowDate,
            due_date: dueDate,
            library_id: reservation.library_id
        });
        toast.add({
            severity: 'success',
            summary: 'Reservation Approved',
            detail: 'Loan created for this reservation.',
            life: 3000
        });
        fetchReservations();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to approve reservation',
            life: 3000
        });
    }
};

const handleReject = async (reservation) => {
    try {
        await axiosInstance.put(`/reservations/${reservation.id}`, { status: 'rejected' });
        toast.add({
            severity: 'info',
            summary: 'Reservation Rejected',
            detail: 'Reservation has been rejected.',
            life: 3000
        });
        fetchReservations();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to reject reservation',
            life: 3000
        });
    }
};

onMounted(fetchReservations);
</script>

<template>
    <div class="min-h-screen py-6 flex flex-col items-center">
        <div class="w-full px-2 sm:px-4 md:px-6 mx-auto">
            <div class="w-full shadow-5 p-4 sm:p-6 md:p-8 rounded-3xl border border-blue-100">
                <div class="flex flex-col gap-10 mb-6">
                    <div>
                        <h2 class="text-xl sm:text-2xl font-extrabold text-blue-800 flex items-center gap-2 mb-4">
                            <i class="pi pi-calendar-plus text-xl text-blue-500"></i>
                            Reservation Management
                        </h2>
                        <p class="text-gray-600 text-sm sm:text-base">Manage all book reservations and their status.</p>
                    </div>
                    <div class="flex flex-col gap-2 w-full sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 md:gap-2 md:justify-end mb-6">
                        <InputText v-model="filter" placeholder="Search by book, user, code..." class="w-full sm:w-64" @keyup.enter="onFilter" />
                        <Dropdown
                            v-model="status"
                            :options="[
                                { label: 'All', value: '' },
                                { label: 'Pending', value: 'pending' },
                                { label: 'Approved', value: 'approved' },
                                { label: 'Rejected', value: 'rejected' },
                                { label: 'Expired', value: 'expired' },
                                { label: 'Fulfilled', value: 'fulfilled' }
                            ]"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Status"
                            class="w-full sm:w-40"
                            @change="onFilter"
                        />
                        <Calendar v-model="dateRange" selectionMode="range" placeholder="Date Range" class="w-full sm:w-56" @date-select="onFilter" />
                        <Button icon="pi pi-search" class="p-button-primary w-full sm:w-auto" @click="onFilter" />
                    </div>
                </div>
                <div class="w-full">
                    <div style="height: 100%; overflow: auto">
                        <DataTable
                            :value="reservations"
                            :loading="loading"
                            :paginator="true"
                            :rows="rows"
                            :total-records="totalRecords"
                            @page="onPage"
                            dataKey="id"
                            responsive-layout="scroll"
                            class="p-datatable-sm min-w-full"
                            scrollable
                            style="min-width: 900px"
                        >
                            <Column field="id" header="#" style="width: 4rem" />
                            <Column field="reservation_code" header="Code" />
                            <Column field="user_id" header="User ID" />
                            <Column field="book_id" header="Book ID" />
                            <Column field="reservation_date" header="Reserved On">
                                <template #body="{ data }">
                                    {{ new Date(data.reservation_date).toLocaleDateString() }}
                                </template>
                            </Column>
                            <Column field="expiration_time" header="Expires">
                                <template #body="{ data }">
                                    <span v-if="data.expiration_time">{{ new Date(data.expiration_time).toLocaleDateString() }}</span>
                                    <span v-else>-</span>
                                </template>
                            </Column>
                            <Column field="status" header="Status">
                                <template #body="{ data }">
                                    <span
                                        :class="{
                                            'text-yellow-600': data.status === 'pending',
                                            'text-green-600': data.status === 'approved' || data.status === 'fulfilled',
                                            'text-red-500': data.status === 'rejected' || data.status === 'expired'
                                        }"
                                    >
                                        {{ data.status }}
                                    </span>
                                </template>
                            </Column>
                            <Column field="created_at" header="Created">
                                <template #body="{ data }">
                                    {{ new Date(data.created_at).toLocaleDateString() }}
                                </template>
                            </Column>
                            <Column header="Action" style="min-width: 8rem">
                                <template #body="{ data }">
                                    <Button v-if="data.status === 'pending'" label="Approve" icon="pi pi-check" class="p-button-success p-button-sm mr-2" @click="handleApprove(data)" />
                                    <Button v-if="data.status === 'pending'" label="Reject" icon="pi pi-times" class="p-button-danger p-button-sm" @click="handleReject(data)" />
                                    <Button v-if="data.status === 'approved'" label="Fulfill" icon="pi pi-book" class="p-button-info p-button-sm ml-2" />
                                </template>
                            </Column>
                        </DataTable>
                        <div v-if="!reservations.length && !loading" class="text-gray-400 text-center py-4">No reservations found.</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
