<script setup>
import axiosInstance from '@/util/axios-config';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const confirm = useConfirm();
const toast = useToast();

const roles = ref([]);
const permissions = ref([]);
const roleDialog = ref(false);
const role = ref({});
const selectedPermissions = ref([]);
const loading = ref(false);
const roleHeader = ref('');

onMounted(() => {
    fetchRoles();
    fetchPermissions();
});

const fetchRoles = async () => {
    try {
        const response = await axiosInstance.get('/roles');
        roles.value = response.data.data;
    } catch (error) {
        // error handling
    }
};

const fetchPermissions = async () => {
    try {
        const response = await axiosInstance.get('/permissions');
        permissions.value = response.data.data;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch permissions',
            life: 3000
        });
    }
};

const openNew = () => {
    role.value = {};
    selectedPermissions.value = [];
    roleHeader.value = 'Create Role';
    roleDialog.value = true;
};

const editRole = (editRole) => {
    role.value = { ...editRole };
    // Safely handle cases where permissions are undefined or empty
    selectedPermissions.value = editRole.permissions ? editRole.permissions.map((p) => p.id) : [];
    roleHeader.value = 'Edit Role';
    roleDialog.value = true;
};

const hideDialog = () => {
    roleDialog.value = false;
};

const saveRole = async () => {
    try {
        const url = role.value.id ? `/roles/${role.value.id}` : '/roles';

        const method = role.value.id ? 'put' : 'post';
        await axiosInstance[method](url, {
            name: role.value.name,
            permissions: selectedPermissions.value
        });
        roleDialog.value = false;
        fetchRoles();
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: role.value.id ? 'Role updated successfully' : 'Role created successfully',
            life: 3000
        });
        role.value = {}; // Reset role object after saving
        selectedPermissions.value = []; // Reset selected permissions

        // Handle success
    } catch (error) {
        // error handling
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to save role',
            life: 3000
        });
    }
};
const confirmDelete = (deleteRole) => {
    confirm.require({
        message: `Are you sure you want to delete ${deleteRole.name}?`,
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await axiosInstance.delete(`/roles/${deleteRole.id}`);
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Role deleted successfully',
                    life: 3000
                });
                fetchRoles();
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message || 'Delete failed',
                    life: 3000
                });
            }
        }
    });
};
</script>
<template>
    <div class="card">
        <Toolbar class="mb-4">
            <template #start>
                <h2>Role Management</h2>
            </template>
            <template #end>
                <Button label="New Role" icon="pi pi-plus" class="p-button-success" @click="openNew" />
            </template>
        </Toolbar>

        <DataTable :value="roles" :loading="loading" stripedRows responsiveLayout="scroll" scrollable>
            <Column field="name" header="Name"></Column>
            <Column header="Permissions">
                <template #body="{ data }">
                    <template v-if="data.permissions && data.permissions.length">
                        <Chip v-for="perm in data.permissions" :key="perm.id" :label="perm.name" class="mr-2 mb-2" />
                    </template>
                    <span v-else class="text-gray-400">No permissions assigned</span>
                </template>
            </Column>
            <Column header="Actions" style="width: 150px">
                <template #body="{ data }">
                    <div class="flex justify-end">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning mr-2" @click="editRole(data)" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDelete(data)" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="roleDialog" :header="roleHeader" :modal="true" class="p-fluid">
            <div class="field">
                <label for="name">Role Name</label>
                <InputText id="name" v-model.trim="role.name" required="true" autofocus />
            </div>

            <h3 class="mt-4">Permissions</h3>
            <div class="grid">
                <div v-for="permission in permissions" :key="permission.id" class="col-12 md:col-6 lg:col-4">
                    <Checkbox v-model="selectedPermissions" :inputId="'perm_' + permission.id" name="permissions" :value="permission.id" />
                    <label :for="'perm_' + permission.id" class="ml-2">{{ permission.name }}</label>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveRole" />
            </template>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>
    </div>
</template>
<style scoped>
/* Add any custom styles here */
</style>
