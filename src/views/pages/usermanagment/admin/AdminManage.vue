<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Cookies from 'js-cookie';

const router = useRouter();
const admins = ref([]);
const loading = ref(true);
const filters = ref({
    global: { value: null, matchMode: 'contains' },
    FirstName: { value: null, matchMode: 'contains' },
    LastName: { value: null, matchMode: 'contains' },
    email: { value: null, matchMode: 'contains' },
    phone_no: { value: null, matchMode: 'contains' }
});
const totalRecords = ref(0);
const selectedAdmins = ref([]);
const lazyParams = ref({
    first: 0, // Should start from 0 for PrimeVue DataTable
    rows: 10,
    sortField: 'FirstName',
    sortOrder: 1,
    filters: {}
});

onMounted(() => {
    fetchAdmins();
});

const fetchAdmins = async () => {
    loading.value = true;
    try {
        let token = Cookies.get('access_token');
        if (!token) token = localStorage.getItem('access_token');
        if (!token) {
            alert('No access token found. Please log in again.');
            loading.value = false;
            return;
        }
        const filterParams = {};
        Object.keys(filters.value).forEach(key => {
            if (filters.value[key].value) {
                filterParams[key] = filters.value[key].value;
            }
        });

        // Calculate the correct page index for Laravel pagination (starts from 1)
        const page = Math.floor(lazyParams.value.first / lazyParams.value.rows) + 1;

        const response = await axios.get('http://localhost:8000/api/admins', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page: page,
                per_page: lazyParams.value.rows,
                ...filterParams
            }
        });
        admins.value = response.data.data || [];
        // Use meta.total for correct pagination
        totalRecords.value = response.data.meta?.total ?? 0;
    } catch (error) {
        admins.value = [];
        totalRecords.value = 0;
        alert('Failed to fetch admins: ' + (error.response?.data?.message || error.message));
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const updateAdmin = async () => {
    try {
        let token = Cookies.get('access_token');
        if (!token) token = localStorage.getItem('access_token');
        if (!token) {
            alert('No access token found. Please log in again.');
            return;
        }
        await axios.put(
            `http://localhost:8000/api/admins/${editForm.value.id}`,
            editForm.value,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        showEditDialog.value = false;
        fetchAdmins();
    } catch (error) {
        alert('Failed to update admin: ' + (error.response?.data?.message || error.message));
        console.error(error);
    }
};

const deleteAdmin = async (admin) => {
    if (!confirm(`Are you sure you want to delete ${admin.FirstName} ${admin.LastName}?`)) return;
    try {
        let token = Cookies.get('access_token');
        if (!token) token = localStorage.getItem('access_token');
        if (!token) {
            alert('No access token found. Please log in again.');
            return;
        }
        await axios.delete(
            `http://localhost:8000/api/admins/${admin.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        fetchAdmins();
    } catch (error) {
        alert('Failed to delete admin: ' + (error.response?.data?.message || error.message));
        console.error(error);
    }
};

const onPage = (event) => {
    lazyParams.value = { ...lazyParams.value, ...event };
    fetchAdmins();
};

const onSort = (event) => {
    lazyParams.value = { ...lazyParams.value, ...event };
    fetchAdmins();
};

const onFilter = () => {
    lazyParams.value.first = 0;
    fetchAdmins();
};

const showAddDialog = ref(false);
const showEditDialog = ref(false);

const addForm = ref({
    FirstName: '',
    LastName: '',
    email: '',
    phone_no: ''
});

const editForm = ref({
    id: null,
    FirstName: '',
    LastName: '',
    email: '',
    phone_no: ''
});

const openAddDialog = () => {
    addForm.value = {
        FirstName: '',
        LastName: '',
        email: '',
        phone_no: ''
    };
    showAddDialog.value = true;
};

const openEditDialog = (admin) => {
    editForm.value = { ...admin };
    showEditDialog.value = true;
};

const addAdmin = async () => {
    try {
        let token = Cookies.get('access_token');
        if (!token) token = localStorage.getItem('access_token');
        if (!token) {
            alert('No access token found. Please log in again.');
            return;
        }
        await axios.post(
            'http://localhost:8000/api/admins',
            addForm.value,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        showAddDialog.value = false;
        fetchAdmins();
    } catch (error) {
        alert('Failed to add admin: ' + (error.response?.data?.message || error.message));
        console.error(error);
    }
};
</script>

<template>
    <div class="card">
        <h5 class="m-0">Admin Management</h5>
        <p class="mt-2 mb-4 text-gray-600">Browse, search, and manage admins in the system.</p>

        <!-- Toolbar -->
        <div class="flex justify-content-between align-items-center mb-3">
            <div>
                <Button label="Add Admin" icon="pi pi-plus" class="mr-2 p-button-success" @click="openAddDialog" />
            </div>
            <!-- Global Search Bar -->
            <span class="p-input-icon-left" style="min-width: 300px;">
                <i class="pi pi-search" />
                <InputText v-model="filters.global.value" placeholder="Search admins..." @input="onFilter" class="w-full" />
            </span>
        </div>

        <!-- Admin Data Table -->
        <DataTable
            v-model:selection="selectedAdmins"
            :value="admins"
            :paginator="true"
            :rows="10"
            :loading="loading"
            :lazy="true"
            :total-records="totalRecords"
            :row-hover="true"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            current-page-report-template="Showing {first} to {last} of {totalRecords} admins"
            responsive-layout="stack"
            :global-filter-fields="['FirstName', 'LastName', 'email', 'phone_no']"
            v-model:filters="filters"
            filter-display="row"
            @page="onPage($event)"
            @sort="onSort($event)"
            @filter="onFilter()"
            style-class="p-datatable-gridlines p-datatable-sm custom-table"
            breakpoint="960px"
        >
            <template #empty> No admins found. </template>
            <template #loading> Loading admin data. Please wait. </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="FirstName" header="First Name" sortable filter filterPlaceholder="Filter by first name"></Column>
            <Column field="LastName" header="Last Name" sortable filter filterPlaceholder="Filter by last name"></Column>
            <Column field="email" header="Email" sortable filter filterPlaceholder="Filter by email"></Column>
            <Column field="phone_no" header="Phone No" sortable filter filterPlaceholder="Filter by phone"></Column>
            <Column headerStyle="min-width:10rem; text-align:center" bodyStyle="text-align:center">
                <template #header>Actions</template>
                <template #body="{ data }">
                    <div class="flex flex-wrap justify-content-center gap-2">
                        <Button icon="pi pi-pencil" tooltip="Edit" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-success p-button-sm" @click="openEditDialog(data)" />
                        <Button icon="pi pi-trash" tooltip="Delete" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-danger p-button-sm" @click="deleteAdmin(data)" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Add Admin Dialog -->
        <Dialog v-model:visible="showAddDialog" :modal="true" :closable="true" :style="{ width: '500px' }" class="edit-dialog">
            <template #header>
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-user-plus" style="font-size: 1.5rem; color: #42a5f5;"></i>
                    <span class="text-xl font-bold" style="color: #42a5f5;">Add Admin</span>
                </div>
            </template>
            <div class="mb-2 text-gray-600">Enter the admin information below and click <b>Add</b> to save.</div>
            <Divider />
            <form @submit.prevent="addAdmin">
                <div class="edit-form-flex">
                    <div class="field">
                        <label>First Name</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-user" />
                            <InputText v-model="addForm.FirstName" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Last Name</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-user" />
                            <InputText v-model="addForm.LastName" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Email</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-envelope" />
                            <InputText v-model="addForm.email" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Phone No</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-phone" />
                            <InputText v-model="addForm.phone_no" required class="w-full" />
                        </span>
                    </div>
                </div>
                <div class="flex justify-content-end gap-2 mt-3">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showAddDialog = false" type="button" />
                    <Button label="Add" icon="pi pi-check" type="submit" />
                </div>
            </form>
        </Dialog>

        <!-- Edit Admin Dialog -->
        <Dialog v-model:visible="showEditDialog" :modal="true" :closable="true" :style="{ width: '500px' }" class="edit-dialog">
            <template #header>
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-user-edit" style="font-size: 1.5rem; color: #42a5f5;"></i>
                    <span class="text-xl font-bold" style="color: #42a5f5;">Edit Admin</span>
                </div>
            </template>
            <div class="mb-2 text-gray-600">Update the admin information below and click <b>Update</b> to save changes.</div>
            <Divider />
            <form @submit.prevent="updateAdmin">
                <div class="edit-form-flex">
                    <div class="field">
                        <label>First Name</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-user" />
                            <InputText v-model="editForm.FirstName" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Last Name</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-user" />
                            <InputText v-model="editForm.LastName" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Email</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-envelope" />
                            <InputText v-model="editForm.email" required class="w-full" />
                        </span>
                    </div>
                    <div class="field">
                        <label>Phone No</label>
                        <span class="p-input-icon-left w-full">
                            <i class="pi pi-phone" />
                            <InputText v-model="editForm.phone_no" required class="w-full" />
                        </span>
                    </div>
                </div>
                <div class="flex justify-content-end gap-2 mt-3">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showEditDialog = false" type="button" />
                    <Button label="Update" icon="pi pi-check" type="submit" />
                </div>
            </form>
        </Dialog>
    </div>
</template>

<style scoped>
.card {
    margin: 2rem auto;
    max-width: 1200px;
    padding: 2rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.custom-table .p-datatable-tbody > tr:nth-child(even) {
    background: #f9f9f9;
}
.custom-table .p-datatable-tbody > tr:hover {
    background: #e3f2fd;
}
.edit-dialog .p-dialog-header {
    background: #e3f2fd;
    border-bottom: 1px solid #90caf9;
}
.edit-dialog .p-dialog-content {
    background: #f8fafc;
}
.edit-form-flex {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem 1.5rem;
    margin-bottom: 0.5rem;
}
.edit-form-flex .field {
    margin-bottom: 0;
}
@media (max-width: 600px) {
    .edit-form-flex {
        grid-template-columns: 1fr;
    }
}
</style>