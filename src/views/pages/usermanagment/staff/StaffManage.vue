<script setup>
import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const staff = ref([]);
const loading = ref(false);
const selectedStaff = ref([]);
const confirm = useConfirm();
const totalRecords = ref(0);
const searchQuery = ref('');
const lazyParams = ref({
    first: 0,
    rows: 10,
    sortField: 'first_name',
    sortOrder: 1
});

const handleSearch = () => {
    lazyParams.value.first = 0;
    fetchStaff();
};

const filters = ref({
    global: { value: '', matchMode: 'contains' },
    first_name: { value: null, matchMode: 'contains' },
    last_name: { value: null, matchMode: 'contains' },
    department: { value: null, matchMode: 'contains' },
    role: { value: null, matchMode: 'equals' }
});

const fetchStaff = async () => {
    loading.value = true;
    try {
        const token = Cookies.get('access_token') || localStorage.getItem('access_token');
        if (!token) {
            alert('No access token found. Please log in again.');
            return;
        }

        const params = {
            page: Math.floor(lazyParams.value.first / lazyParams.value.rows) + 1,
            per_page: lazyParams.value.rows,
            sortField: lazyParams.value.sortField,
            sortOrder: lazyParams.value.sortOrder === 1 ? 'asc' : 'desc',
            search: searchQuery.value // Send search query to backend
        };

        // Add other filters if needed
        for (const [key, filter] of Object.entries(filters.value)) {
            if (filter.value && filter.value.trim() !== '') {
                params[key] = filter.value.trim();
            }
        }

        const response = await axiosInstance.get('/staff', {
            headers: { Authorization: `Bearer ${token}` },
            params
        });

        staff.value = response.data.data;
        totalRecords.value = response.data.meta?.total ?? 0;
    } catch (error) {
        console.error('Error fetching staff:', error);
        alert(error.response?.data?.message || 'Failed to fetch staff.');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchStaff();
});

const onPage = (event) => {
    lazyParams.value = { ...lazyParams.value, ...event };
    fetchStaff();
};

const onSort = (event) => {
    lazyParams.value = { ...lazyParams.value, ...event };
    fetchStaff();
};

const onFilter = () => {
    lazyParams.value.first = 0;
};

const addStaff = () => router.push({ name: 'staffregister' });

const deleteStaff = (staffMember) => {
    confirm.require({
        message: `Are you sure you want to delete ${staffMember.first_name} ${staffMember.last_name}?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                const token = Cookies.get('access_token') || localStorage.getItem('access_token');
                await axiosInstance.delete(`/staff/${staffMember.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchStaff();
            } catch (error) {
                alert('Failed to delete staff: ' + (error.response?.data?.message || error.message));
            }
        }
    });
};

const deleteSelectedStaff = () => {
    if (!selectedStaff.value.length) {
        alert('No staff selected.');
        return;
    }

    confirm.require({
        message: `Are you sure you want to delete ${selectedStaff.value.length} selected staff members?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                const token = Cookies.get('access_token') || localStorage.getItem('access_token');
                const deletePromises = selectedStaff.value.map((s) =>
                    axiosInstance.delete(`/staff/${s.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                );
                await Promise.all(deletePromises);
                fetchStaff();
            } catch (error) {
                alert('Failed to delete selected staff: ' + (error.response?.data?.message || error.message));
            }
        }
    });
};

// Edit form logic
const showEditDialog = ref(false);
const editForm = ref({
    id: null,
    first_name: '',
    last_name: '',
    department: '',
    user: {
        username: '',
        email: '',
        phone_no: ''
    }
});

const openEditDialog = (staffMember) => {
    editForm.value = {
        id: staffMember.id,
        first_name: staffMember.first_name,
        last_name: staffMember.last_name,
        department: staffMember.department,
        user: {
            username: staffMember.user?.username || '',
            email: staffMember.user?.email || '',
            phone_no: staffMember.user?.phone_no || ''
        }
    };
    showEditDialog.value = true;
};

const updateStaff = async () => {
    try {
        const token = Cookies.get('access_token') || localStorage.getItem('access_token');
        const staffData = {
            username: editForm.value.user.username,
            first_name: editForm.value.first_name,
            last_name: editForm.value.last_name,
            //password: editForm.value.user.password,
            email: editForm.value.user.email,
            phone_no: editForm.value.user.phone_no,
            department: editForm.value.department
        };

        await axiosInstance.put(`/staff/${editForm.value.id}`, staffData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        showEditDialog.value = false;
        fetchStaff();
    } catch (error) {
        alert('Failed to update staff: ' + (error.response?.data?.message || error.message));
    }
};
</script>

<template>
    <div class="card">
        <h5 class="m-0">Staff Management</h5>
        <p class="mt-2 mb-4 text-gray-600">Browse, search, and manage staff in the system.</p>

        <!-- Toolbar -->
        <div class="toolbar-responsive mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div class="toolbar-actions flex gap-2">
                <Button label="Add Staff" icon="pi pi-plus" class="mr-2 p-button-success" @click="addStaff" />
                <Button label="Delete Selected" icon="pi pi-trash" class="p-button-danger" :disabled="!selectedStaff.length" @click="deleteSelectedStaff" />
            </div>
            <div class="toolbar-search flex items-center gap-2 w-full md:w-auto">
                <span class="p-input-icon-left w-full">
                    <InputText v-model="searchQuery" placeholder="Search students..." @keyup.enter="handleSearch" class="w-full" />
                </span>
                <Button icon="pi pi-search" class="p-button-outlined" @click="handleSearch" />
            </div>
        </div>

        <!-- Data Table -->
        <DataTable
            v-model:selection="selectedStaff"
            :value="staff"
            :paginator="true"
            :lazy="true"
            :rowsPerPageOptions="[10, 20, 50]"
            :rows="lazyParams.rows"
            :totalRecords="totalRecords"
            :loading="loading"
            :filters="filters"
            selectionMode="multiple"
            @page="onPage"
            @sort="onSort"
            @filter="onFilter"
        >
            <Column selectionMode="multiple" headerStyle="width: 3rem" />
            <Column field="user.username" header="Username" sortable />
            <Column field="first_name" header="First Name" sortable />
            <Column field="last_name" header="Last Name" sortable />
            <Column field="user.email" header="Email" sortable />
            <!-- <Column field="user.password" header="Password" sortable /> -->
            <Column field="department" header="Department" sortable />
            <Column field="user.phone_no" header="Phone" sortable />
            <Column headerStyle="min-width:10rem; text-align:center" bodyStyle="text-align:center">
                <template #header>Actions</template>
                <template #body="{ data }">
                    <div class="flex flex-wrap justify-content-center gap-2">
                        <Button icon="pi pi-pencil" tooltip="Edit" class="p-button-rounded p-button-success p-button-sm" @click="openEditDialog(data)" />
                        <Button icon="pi pi-trash" tooltip="Delete" class="p-button-rounded p-button-danger p-button-sm" @click="deleteStaff(data)" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Edit Dialog -->
        <Dialog v-model:visible="showEditDialog" :modal="true" :closable="true" :style="{ width: '500px' }">
            <template #header>
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-user-edit" style="font-size: 1.5rem; color: #42a5f5"></i>
                    <span class="text-xl font-bold" style="color: #42a5f5">Edit Staff</span>
                </div>
            </template>
            <div class="mb-2 text-gray-600">Update the staff information below and click <b>Update</b> to save changes.</div>
            <Divider />
            <form @submit.prevent="updateStaff">
                <div class="grid grid-cols-2 gap-4">
                    <div class="field">
                        <label>Username</label>
                        <InputText v-model="editForm.user.username" class="w-full" />
                    </div>
                    <div class="field">
                        <label>First Name</label>
                        <InputText v-model="editForm.first_name" class="w-full" required />
                    </div>
                    <div class="field">
                        <label>Last Name</label>
                        <InputText v-model="editForm.last_name" class="w-full" required />
                    </div>
                    <!-- <div class="field">
                        <label>Password</label>
                        <InputText v-model="editForm.user.password" class="w-full" />
                    </div> -->
                    <div class="field">
                        <label>Email</label>
                        <InputText v-model="editForm.user.email" class="w-full" />
                    </div>
                    <div class="field">
                        <label>Phone</label>
                        <InputText v-model="editForm.user.phone_no" class="w-full" />
                    </div>

                    <div class="field">
                        <label>Department</label>
                        <InputText v-model="editForm.department" class="w-full" required />
                    </div>
                </div>
                <div class="flex justify-end mt-4">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text mr-2" @click="showEditDialog = false" />
                    <Button label="Update" icon="pi pi-check" type="submit" class="p-button-success" />
                </div>
            </form>
        </Dialog>
        <ConfirmDialog />
    </div>
</template>

<style scoped>
.card {
    padding: 2rem;
    border-radius: 1rem;
}
.field {
    display: flex;
    flex-direction: column;
}
</style>
