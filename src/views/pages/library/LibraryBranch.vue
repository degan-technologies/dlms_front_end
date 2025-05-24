<script setup>
import axiosInstance from '@/util/axios-config';
import { debounce } from 'lodash-es';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, reactive, ref } from 'vue';

import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';

const branches = ref([]);
const loading = ref(false);
const dialog = ref(false);
const selectedBranches = ref([]);
const branch = reactive({ id: null, branch_name: '', address: '', contact_number: '', email: '', opening_hours: '', location: '' });
const errors = reactive({});
const globalFilterValue = ref('');
const viewMode = ref('list');
const toast = ref(null);
const confirm = useConfirm();

const fetchBranches = async () => {
    loading.value = true;
    try {
        const { data } = await axiosInstance.get('/branches');
        branches.value = data;
    } catch (error) {
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch branches.', life: 2000 });
    } finally {
        loading.value = false;
    }
};

onMounted(() => fetchBranches());

const openNew = () => {
    Object.assign(branch, { id: null, branch_name: '', address: '', contact_number: '', email: '', opening_hours: '', location: '' });
    Object.keys(errors).forEach((key) => delete errors[key]);
    dialog.value = true;
};

const hideDialog = () => {
    dialog.value = false;
};

const saveBranch = async () => {
    try {
        const payload = { ...branch };
        if (branch.id) {
            await axiosInstance.put(`/branches/${branch.id}`, payload);
            toast.value.add({ severity: 'success', summary: 'Updated', detail: 'Branch updated successfully.', life: 2000 });
        } else {
            await axiosInstance.post('/branches', payload);
            toast.value.add({ severity: 'success', summary: 'Created', detail: 'Branch created successfully.', life: 2000 });
        }
        dialog.value = false;
        fetchBranches();
    } catch ({ response }) {
        if (response?.data?.errors) Object.assign(errors, response.data.errors);
        toast.value.add({ severity: 'error', summary: 'Error', detail: response.data.message || 'Operation failed.', life: 2000 });
    }
};

const editBranch = (data) => {
    Object.assign(branch, data);
    dialog.value = true;
};

const deleteBranch = (data) => {
    confirm.require({
        message: `Are you sure you want to delete ${data.branch_name}?`,
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                await axiosInstance.delete(`/branches/${data.id}`);
                fetchBranches();
                toast.value.add({ severity: 'success', summary: 'Deleted', detail: 'Branch deleted.', life: 2000 });
            } catch {
                toast.value.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.', life: 2000 });
            }
        }
    });
};

const confirmBulkDelete = () => {
    confirm.require({
        message: `Delete ${selectedBranches.value.length} selected branches?`,
        header: 'Bulk Delete',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                const ids = selectedBranches.value.map((branch) => branch.id);
                if (ids.length === 0) return;

                await axiosInstance.delete('/bulkdelete', { data: { ids } });
                toast.value.add({ severity: 'success', summary: 'Deleted', detail: 'Selected branches deleted.', life: 2000 });
                selectedBranches.value = [];
                fetchBranches();
            } catch (error) {
                toast.value.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Bulk delete failed.', life: 2000 });
            }
        }
    });
};

const onGlobalFilter = debounce(async (e) => {
    globalFilterValue.value = e.target.value;
    await fetchBranches();
}, 400);
</script>

<template>
    <div class="p-grid p-dir-col p-gap-4">
        <!-- Toolbar -->
        <div class="p-col">
            <Toolbar>
                <template #start>
                    <Button label="New Branch" icon="pi pi-plus" @click="openNew" class="p-button-success" />
                    <span class="p-ml-8"></span>
                    <Button label="Delete Selected" icon="pi pi-trash" class="p-button-danger" :disabled="!selectedBranches.length" @click="confirmBulkDelete" />
                </template>
                <template #end>
                    <div class="p-toolbar-group-right p-d-flex p-ai-center">
                        <!-- <span class="p-input-icon-left">
                            <i class="pi pi-search" />
                            <InputText placeholder="Global Search" v-model="globalFilterValue" @input="onGlobalFilter" />
                        </span> -->
                        <Button icon="pi pi-th-large" class="p-button-text p-ml-2" @click="viewMode = 'grid'" :class="{ 'p-button-outlined': viewMode !== 'grid' }" />
                        <Button icon="pi pi-list" class="p-button-text p-ml-1" @click="viewMode = 'list'" :class="{ 'p-button-outlined': viewMode !== 'list' }" />
                    </div>
                </template>
            </Toolbar>
        </div>

        <!-- Data Section -->
        <div class="p-col">
            <!-- Table View -->
            <DataTable
                v-if="viewMode === 'list'"
                :value="branches"
                v-model:selection="selectedBranches"
                dataKey="id"
                selectionMode="checkbox"
                paginator
                :rows="10"
                :globalFilterFields="['branch_name', 'address', 'contact_number', 'email', 'opening_hours', 'location']"
                :globalFilter="globalFilterValue"
                rowHover
                responsiveLayout="scroll"
                :loading="loading"
                class="p-datatable-gridlines"
            >
                <Column selectionMode="multiple" headerStyle="width: 3em" />
                <Column field="branch_name" header="Branch Name" sortable />
                <Column field="address" header="Address" sortable />
                <Column field="contact_number" header="Contact" sortable />
                <Column field="email" header="Email" sortable />
                <Column field="opening_hours" header="Opening Hours" sortable />
                <Column field="location" header="Location" sortable />
                <Column header="Actions" style="min-width: 8rem">
                    <template #body="slotProps">
                        <div class="p-d-flex p-ai-center p-gap-2">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click="editBranch(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="deleteBranch(slotProps.data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>

            <!-- Grid/Card View -->
            <DataView v-else :value="branches" :layout="'grid'" paginator :rows="6" :loading="loading" class="p-dataview-grid">
                <template #grid="slotProps">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full p-4 m-auto">
                        <Card v-for="(item, index) in slotProps.items" :key="index" class="shadow-lg border border-gray-200 rounded-xl transition-transform hover:scale-[1.02] hover:shadow-2xl">
                            <template #title>
                                <div class="text-2xl font-bold text-gray-800 text-center mt-4">{{ item.branch_name }}</div>
                            </template>

                            <template #subtitle>
                                <div class="text-sm text-gray-500 text-center">{{ item.contact_number }}</div>
                            </template>

                            <template #content>
                                <div class="p-4">
                                    <p class="text-gray-600 text-sm text-center">{{ item.address }}</p>
                                    <div class="mt-4 flex justify-center">
                                        <span class="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full"> Email: {{ item.email || 'N/A' }} </span>
                                    </div>
                                </div>
                            </template>

                            <template #footer>
                                <div class="flex justify-between mt-4 px-4 pb-4">
                                    <Button icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm text-blue-600 hover:text-blue-800" @click="editBranch(item)" v-tooltip="'Edit Branch'" />
                                    <Button icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm text-red-600 hover:text-red-800" @click="deleteBranch(item)" v-tooltip="'Delete Branch'" />
                                </div>
                            </template>
                        </Card>
                    </div>
                </template>
            </DataView>
        </div>

        <!-- Dialog -->
        <Dialog :header="branch.id ? 'Edit Branch' : 'New Branch'" v-model:visible="dialog" modal :style="{ width: '600px' }" class="p-dialog-rounded">
            <div class="card flex justify-center">
                <Toast />
                <Form
                    :initialValues="{ branch_name: branch.branch_name, address: branch.address, contact_number: branch.contact_number, email: branch.email, opening_hours: branch.opening_hours, location: branch.location }"
                    :resolver="
                        ({ values }) => {
                            const errors = {};
                            const phoneRegex = /^\+251[0-9]{9}$/;
                            const locationRegex = /^-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+$/;

                            if (!values.branch_name) errors.branch_name = [{ message: 'Branch name is required.' }];
                            if (!values.address) errors.address = [{ message: 'Address is required.' }];
                            if (values.contact_number && !phoneRegex.test(values.contact_number)) errors.contact_number = [{ message: 'Use +251 format with 9 digits after.' }];
                            if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = [{ message: 'Invalid email format.' }];
                            if (!values.location || !locationRegex.test(values.location)) errors.location = [{ message: 'Location must be in latitude,longitude format.' }];

                            return { errors };
                        }
                    "
                    @submit="
                        ({ valid, values }) => {
                            if (valid) {
                                Object.assign(branch, values);
                                saveBranch();
                            }
                        }
                    "
                    class="flex flex-col gap-4 w-full"
                >
                    <InputText name="branch_name" v-model="branch.branch_name" placeholder="Enter branch name" />
                    <small v-if="errors.branch_name" class="p-error">{{ errors.branch_name[0]?.message }}</small>
                    <Textarea name="address" v-model="branch.address" rows="3" placeholder="Enter address" autoResize />
                    <small v-if="errors.address" class="p-error">{{ errors.address[0]?.message }}</small>
                    <InputText name="contact_number" v-model="branch.contact_number" placeholder="Enter contact number" />
                    <small v-if="errors.contact_number" class="p-error">{{ errors.contact_number[0]?.message }}</small>
                    <InputText name="email" v-model="branch.email" placeholder="Enter email" />
                    <small v-if="errors.email" class="p-error">{{ errors.email[0]?.message }}</small>
                    <Dropdown
                        name="opening_hours"
                        v-model="branch.opening_hours"
                        :options="[
                            { label: '08:00-17:00', value: '08:00-17:00' },
                            { label: '09:00-18:00', value: '09:00-18:00' },
                            { label: '10:00-19:00', value: '10:00-19:00' }
                        ]"
                        placeholder="Select opening hours"
                    />
                    <small v-if="errors.opening_hours" class="p-error">{{ errors.opening_hours[0]?.message }}</small>
                    <InputText name="location" v-model="branch.location" placeholder="Latitude,Longitude" />
                    <small v-if="errors.location" class="p-error">{{ errors.location[0]?.message }}</small>

                    <div class="flex justify-end gap-2">
                        <Button label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" type="submit" class="p-button-primary" />
                    </div>
                </Form>
            </div>
        </Dialog>

        <ConfirmDialog />
        <Toast ref="toast" />
    </div>
</template>

<style scoped>
/* Temporary remove custom toolbar background to debug visibility */
/* .p-toolbar {
    background-color: var(--primary-color);
    color: #ffffff;
} */
.p-dataview-grid .p-card {
    transition:
        transform 0.2s ease-in-out,
        box-shadow 0.2s ease-in-out;
}
.p-dataview-grid .p-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
</style>
