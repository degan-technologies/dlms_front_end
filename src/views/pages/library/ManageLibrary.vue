<script setup>
import axiosInstance from '@/util/axios-config';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { useConfirm } from 'primevue/useconfirm';
import { onMounted, reactive, ref } from 'vue';

import Button from 'primevue/button';
import Card from 'primevue/card';
import ConfirmDialog from 'primevue/confirmdialog';
import DataView from 'primevue/dataview';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';

const libraries = ref([]);
const loading = ref(false);
const dialog = ref(false);
const selectedLibraries = ref([]);
const library = reactive({ id: null, name: '', contact_number: '', library_branch_id: null });
const errors = reactive({});
const globalFilterValue = ref('');
const viewMode = ref('list');
const toast = ref(null);
const confirm = useConfirm();
const branches = ref([]);

const fetchLibraries = async () => {
    loading.value = true;
    try {
        const params = {};
        if (globalFilterValue.value) {
            params.search = globalFilterValue.value;
        }

        const { data } = await axiosInstance.get('/libraries');
        libraries.value = data;
    } catch (err) {
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch libraries.', life: 2000 });
    } finally {
        loading.value = false;
    }
};

const fetchLibraryBranches = async () => {
    try {
        const { data } = await axiosInstance.get('/branches');
        branches.value = data.map((branch) => ({ value: branch.id, label: branch.branch_name }));
    } catch (err) {
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch library branches.', life: 2000 });
    }
};

onMounted(() => {
    fetchLibraryBranches();
    fetchLibraries();
});

const openNew = () => {
    Object.assign(library, { id: null, name: '', contact_number: '', library_branch_id: null });
    Object.keys(errors).forEach((key) => delete errors[key]);
    dialog.value = true;
};

const hideDialog = () => (dialog.value = false);

const saveLibrary = async () => {
    try {
        errors.name = errors.address = errors.contact_number = null;
        const payload = { name: library.name, contact_number: library.contact_number, library_branch_id: library.library_branch_id };
        if (library.id) {
            await axiosInstance.put(`/libraries/${library.id}`, payload);
            toast.value.add({ severity: 'success', summary: 'Updated', detail: 'Library updated successfully.', life: 2000 });
        } else {
            await axiosInstance.post('/libraries', payload);
            toast.value.add({ severity: 'success', summary: 'Created', detail: 'Library created successfully.', life: 2000 });
        }
        dialog.value = false;
        fetchLibraries();
    } catch ({ response }) {
        if (response?.data?.errors) Object.assign(errors, response.data.errors);
        toast.value.add({ severity: 'error', summary: 'Error', detail: response.data.message || 'Operation failed.', life: 2000 });
    }
};

const editLibrary = (data) => {
    Object.assign(library, data);
    dialog.value = true;
};

const deleteLibrary = (data) => {
    confirm.require({
        message: `Are you sure you want to delete ${data.name}?`,
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                await axiosInstance.delete(`/libraries/${data.id}`);
                fetchLibraries();
                toast.value.add({ severity: 'success', summary: 'Deleted', detail: 'Library deleted.', life: 2000 });
            } catch {
                toast.value.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.', life: 2000 });
            }
        }
    });
};

const confirmBulkDelete = () => {
    confirm.require({
        message: `Delete ${selectedLibraries.value.length} selected libraries?`,
        header: 'Bulk Delete',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                const ids = selectedLibraries.value.map((lib) => lib.id);
                if (ids.length === 0) {
                    toast.value.add({ severity: 'warn', summary: 'Warning', detail: 'No libraries selected for deletion.', life: 2000 });
                    return;
                }
                await axiosInstance.delete('/bulk-delete', { data: { ids } });
                toast.value.add({ severity: 'success', summary: 'Deleted', detail: 'Selected libraries deleted successfully.', life: 2000 });
                selectedLibraries.value = [];
                fetchLibraries();
            } catch (error) {
                toast.value.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to delete libraries.', life: 2000 });
            }
        }
    });
};
</script>

<template>
    <div class="p-grid p-dir-col p-gap-4">
        <!-- Toolbar -->
        <div class="p-col">
            <Toolbar>
                <template #start>
                    <div class="flex flex-wrap gap-2 items-center">
                        <Button label="New Library" icon="pi pi-plus" @click="openNew" class="p-button-success" />
                        <Button label="Delete Selected" icon="pi pi-trash" class="p-button-danger" :disabled="!selectedLibraries.length" @click="confirmBulkDelete" />
                    </div>
                </template>
                <template #end>
                    <div class="flex flex-wrap gap-2 items-center">
                        <Button icon="pi pi-th-large" class="p-button-text" @click="viewMode = 'grid'" :class="{ 'p-button-outlined': viewMode !== 'grid' }" />
                        <Button icon="pi pi-list" class="p-button-text" @click="viewMode = 'list'" :class="{ 'p-button-outlined': viewMode !== 'list' }" />
                    </div>
                </template>
            </Toolbar>
        </div>

        <!-- List/Table View -->

        <DataTable
            v-if="viewMode === 'list'"
            :value="libraries"
            v-model:selection="selectedLibraries"
            dataKey="id"
            selectionMode="checkbox"
            paginator
            :rows="10"
            :globalFilterFields="['name', 'contact_number']"
            :globalFilter="globalFilterValue"
            rowHover
            responsiveLayout="scroll"
            :loading="loading"
            class="p-datatable-gridlines"
        >
            <Column selectionMode="multiple" headerStyle="width: 3em" />
            <Column field="name" header="Name" sortable />
            <Column field="contactNumber" header="Contact" sortable />
            <Column header="Actions" style="min-width: 8rem">
                <template #body="slotProps">
                    <div class="p-d-flex p-ai-center p-gap-2">
                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click="editLibrary(slotProps.data)" />
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="deleteLibrary(slotProps.data)" />
                    </div>
                </template>
            </Column>
        </DataTable>
        <!-- Grid/Card View -->
        <DataView v-else :value="libraries" :layout="'grid'" paginator :rows="6" :loading="loading" class="p-dataview-grid">
            <template #grid="slotProps">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full p-4 m-auto">
                    <Card v-for="(item, index) in slotProps.items" :key="index" class="shadow-lg border border-gray-200 rounded-xl transition-transform hover:scale-[1.02] hover:shadow-2xl">
                        <template #title>
                            <div class="text-2xl font-bold text-gray-800 text-center mt-4">{{ item.name }}</div>
                        </template>

                        <template #subtitle>
                            <div class="text-sm text-gray-500 text-center">{{ item.contact_number }}</div>
                        </template>

                        <template #content>
                            <div class="p-4">
                                <!-- <p class="text-gray-600 text-sm text-center">{{ item.address }}</p> -->
                                <div class="mt-4 flex justify-center">
                                    <span class="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full"> Branch: {{ branches.find((branch) => branch.value === item.libraryBranchId)?.label || 'N/A' }} </span>
                                </div>
                            </div>
                        </template>

                        <template #footer>
                            <div class="flex justify-between mt-4 px-4 pb-4">
                                <Button icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm text-blue-600 hover:text-blue-800" @click="editLibrary(item)" v-tooltip="'Edit Library'" />
                                <Button icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm text-red-600 hover:text-red-800" @click="deleteLibrary(item)" v-tooltip="'Delete Library'" />
                            </div>
                        </template>
                    </Card>
                </div>
            </template>
        </DataView>

        <!-- Dialog -->
        <Dialog :header="library.id ? 'Edit Library' : 'New Library'" v-model:visible="dialog" modal :style="{ width: '95vw', maxWidth: '600px' }" class="p-dialog-rounded">
            <div class="card flex justify-center">
                <Toast />
                <form
                    @submit.prevent="
                        () => {
                            saveLibrary();
                        }
                    "
                    class="flex flex-col gap-4 w-full"
                >
                    <InputText name="name" v-model="library.name" placeholder="Enter library name" />
                    <InputText name="contact_number" v-model="library.contact_number" placeholder="Enter contact number" />
                    <Dropdown name="library_branch_id" v-model="library.library_branch_id" :options="branches" optionLabel="label" optionValue="value" placeholder="Select a branch" />
                    <small v-if="errors.library_branch_id" class="p-error">{{ errors.library_branch_id[0]?.message }}</small>
                    <div class="flex justify-end gap-2">
                        <Button label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" type="submit" class="p-button-primary" />
                    </div>
                </form>
            </div>
        </Dialog>

        <!-- Confirm & Toast -->
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
