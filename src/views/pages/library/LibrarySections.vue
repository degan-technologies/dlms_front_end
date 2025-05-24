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
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';

const sections = ref([]);
const branches = ref([]);
const selectedSections = ref([]);
const loading = ref(false);
const dialog = ref(false);
const toast = ref(null);
const viewMode = ref('list');
const confirm = useConfirm();
const globalFilterValue = ref('');

const section = reactive({
    id: null,
    SectionName: '',
    library_branch_id: null
});

const errors = reactive({});

const fetchSections = async () => {
    loading.value = true;
    try {
        const { data } = await axiosInstance.get('/sections');
        sections.value = data.data;
        console.log('Sections:', sections.value);
    } catch (e) {
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch sections.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const fetchBranches = async () => {
    try {
        const { data } = await axiosInstance.get('/branches');
        branches.value = data.map((branch) => ({ label: branch.branch_name, value: branch.id }));
    } catch (e) {
        toast.value.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch branches.', life: 3000 });
    }
};

onMounted(() => {
    fetchSections();
    fetchBranches();
});

const openNew = () => {
    Object.assign(section, { id: null, SectionName: '', library_branch_id: null });
    Object.keys(errors).forEach((key) => delete errors[key]);
    dialog.value = true;
};

const hideDialog = () => {
    dialog.value = false;
};

const saveSection = async () => {
    try {
        if (section.id) {
            await axiosInstance.put(`/sections/${section.id}`, section);
            toast.value.add({ severity: 'success', summary: 'Updated', detail: 'Section updated successfully.', life: 2000 });
        } else {
            await axiosInstance.post('/sections', section);
            toast.value.add({ severity: 'success', summary: 'Created', detail: 'Section created successfully.', life: 2000 });
        }
        dialog.value = false;
        fetchSections();
    } catch ({ response }) {
        if (response?.data?.errors) Object.assign(errors, response.data.errors);
        toast.value.add({ severity: 'error', summary: 'Error', detail: response.data.message || 'Operation failed.', life: 3000 });
    }
};

const editSection = (data) => {
    Object.assign(section, data);
    dialog.value = true;
};

const deleteSection = (section) => {
    confirm.require({
        message: `Are you sure you want to delete "${section.SectionName}"?`,
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                await axiosInstance.delete(`/sections/${section.id}`);
                fetchSections();
                toast.value.add({ severity: 'success', summary: 'Deleted', detail: 'Section deleted.', life: 2000 });
            } catch (e) {
                toast.value.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.', life: 3000 });
            }
        }
    });
};

const confirmBulkDelete = () => {
    confirm.require({
        message: `Delete ${selectedSections.value.length} selected sections?`,
        header: 'Bulk Delete',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                const ids = selectedSections.value.map((sec) => sec.id);
                await axiosInstance.delete('/section-bulk-delete', { data: { ids } });
                selectedSections.value = [];
                fetchSections();
                toast.value.add({ severity: 'success', summary: 'Deleted', detail: 'Selected sections deleted.', life: 2000 });
            } catch (e) {
                toast.value.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.message || 'Bulk delete failed.', life: 3000 });
            }
        }
    });
};

const onGlobalFilter = debounce(async (e) => {
    globalFilterValue.value = e.target.value;
}, 400);
</script>
<template>
    <div class="p-grid p-dir-col p-gap-4">
        <div class="p-col">
            <Toolbar>
                <template #start>
                    <Button label="New Section" icon="pi pi-plus" @click="openNew" class="p-button-success" />
                    <Button label="Delete Selected" icon="pi pi-trash" class="p-button-danger ml-2" :disabled="!selectedSections.length" @click="confirmBulkDelete" />
                </template>
                <template #end>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="globalFilterValue" @input="onGlobalFilter" placeholder="Global Search" />
                    </span>
                    <Button icon="pi pi-th-large" class="p-button-text p-ml-2" @click="viewMode = 'grid'" :class="{ 'p-button-outlined': viewMode !== 'grid' }" />
                    <Button icon="pi pi-list" class="p-button-text p-ml-1" @click="viewMode = 'list'" :class="{ 'p-button-outlined': viewMode !== 'list' }" />
                </template>
            </Toolbar>
        </div>

        <div class="p-col">
            <!-- Table View -->
            <DataTable
                v-if="viewMode === 'list'"
                :value="sections"
                v-model:selection="selectedSections"
                dataKey="id"
                paginator
                :rows="10"
                :globalFilterFields="['SectionName', 'library_branch_id']"
                :globalFilter="globalFilterValue"
                rowHover
                responsiveLayout="scroll"
                :loading="loading"
                class="p-datatable-gridlines"
            >
                <Column selectionMode="multiple" headerStyle="width: 3em" />
                <Column field="sectionName" header="Section Name" sortable />
                <Column field="libraryBranchId" header="Branch Name" sortable>
                    <template #body="slotProps">
                        {{ branches.find((branch) => branch.value === slotProps.data.libraryBranchId)?.label || 'N/A' }}
                    </template>
                </Column>
                <Column header="Actions" style="min-width: 8rem">
                    <template #body="slotProps">
                        <div class="p-d-flex p-ai-center p-gap-2">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-text" @click="editSection(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="deleteSection(slotProps.data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>

            <!-- Grid/Card View -->
            <DataView v-else :value="sections" :layout="'grid'" paginator :rows="6" :loading="loading" class="p-dataview-grid">
                <template #grid="slotProps">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full p-4 m-auto">
                        <Card v-for="(item, index) in slotProps.items" :key="index" class="shadow-lg border border-gray-200 rounded-xl transition-transform hover:scale-[1.02] hover:shadow-2xl">
                            <template #title>
                                <div class="text-2xl font-bold text-gray-800 text-center mt-4">{{ item.sectionName }}</div>
                            </template>

                            <template #subtitle>
                                <div class="text-center">
                                    {{ branches.find((branch) => branch.value === item.libraryBranchId)?.label || 'N/A' }}
                                </div>
                            </template>

                            <template #content>
                                <div class="p-4 flex justify-center">
                                    <span class="px-3 py-1 text-xs text-center font-semibold text-white bg-blue-500 rounded-full">Section Name: {{ sections.find((section) => section.id === item.id)?.sectionName || 'N/A' }}</span>
                                </div>
                            </template>

                            <template #footer>
                                <div class="flex justify-between mt-4 px-4 pb-4">
                                    <Button icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm text-blue-600 hover:text-blue-800" @click="editSection(item)" v-tooltip="'Edit Section'" />
                                    <Button icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm text-red-600 hover:text-red-800" @click="deleteSection(item)" v-tooltip="'Delete Section'" />
                                </div>
                            </template>
                        </Card>
                    </div>
                </template>
            </DataView>
        </div>

        <!-- Dialog -->
        <Dialog :header="section.id ? 'Edit Section' : 'New Section'" v-model:visible="dialog" modal :style="{ width: '600px' }" class="p-dialog-rounded">
            <div class="card flex justify-center">
                <Toast />
                <Form
                    :initialValues="{ SectionName: section.SectionName, library_branch_id: section.library_branch_id }"
                    :resolver="
                        ({ values }) => {
                            const errors = {};
                            if (!values.SectionName) errors.SectionName = [{ message: 'Section name is required.' }];
                            if (!values.library_branch_id) errors.library_branch_id = [{ message: 'Library branch is required.' }];
                            return { errors };
                        }
                    "
                    @submit="
                        ({ valid, values }) => {
                            if (valid) {
                                Object.assign(section, values);
                                saveSection();
                            }
                        }
                    "
                    class="flex flex-col gap-4 w-full"
                >
                    <InputText name="SectionName" v-model="section.SectionName" placeholder="Enter section name" />
                    <Select name="library_branch_id" v-model="section.library_branch_id" :options="branches" optionLabel="label" optionValue="value" placeholder="Select a branch" />
                    <small v-if="errors.library_branch_id" class="p-error">{{ errors.library_branch_id[0]?.message }}</small>
                    <div class="flex justify-end gap-2">
                        <Button label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" @click="hideDialog" />
                        <Button label="Save" icon="pi pi-check" type="submit" class="p-button-primary" />
                    </div>
                </Form>
            </div>
        </Dialog>

        <!-- Confirm & Toast -->
        <ConfirmDialog />
        <Toast ref="toast" />
    </div>
</template>
