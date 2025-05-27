<script setup>
import axiosInstance from '@/util/axios-config';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const languages = ref([]);
const subjects = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitted = ref(false);
const languageForm = ref({ id: null, name: '', code: '' });

// Subject management
const subjectDialogVisible = ref(false);
const isSubjectEdit = ref(false);
const subjectSubmitted = ref(false);
const subjectForm = ref({ id: null, name: '', code: '' });

const fetchLanguages = async () => {
    loading.value = true;
    try {
        const res = await axiosInstance.get('/constants/languages');
        languages.value = res.data.data || res.data;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch languages',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const fetchSubjects = async () => {
    loading.value = true;
    try {
        const res = await axiosInstance.get('/constants/subjects');
        subjects.value = res.data.data || res.data;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch subjects',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const openNew = () => {
    languageForm.value = { id: null, name: '', code: '' };
    isEdit.value = false;
    dialogVisible.value = true;
    submitted.value = false;
};

const openEdit = (lang) => {
    languageForm.value = { ...lang };
    isEdit.value = true;
    dialogVisible.value = true;
    submitted.value = false;
};

const saveLanguage = async () => {
    submitted.value = true;
    if (!languageForm.value.name || !languageForm.value.code) return;
    loading.value = true;
    try {
        if (isEdit.value) {
            await axiosInstance.put(`/constants/languages/${languageForm.value.id}`, {
                name: languageForm.value.name,
                code: languageForm.value.code
            });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Language updated',
                life: 3000
            });
        } else {
            await axiosInstance.post('/constants/languages', {
                name: languageForm.value.name,
                code: languageForm.value.code
            });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Language created',
                life: 3000
            });
        }
        dialogVisible.value = false;
        fetchLanguages();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to save language',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const deleteLanguage = async (lang) => {
    loading.value = true;
    try {
        await axiosInstance.delete(`/constants/languages/${lang.id}`);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Language deleted',
            life: 3000
        });
        fetchLanguages();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete language',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Subject CRUD
const openNewSubject = () => {
    subjectForm.value = { id: null, name: '', code: '' };
    isSubjectEdit.value = false;
    subjectDialogVisible.value = true;
    subjectSubmitted.value = false;
};

const openEditSubject = (subject) => {
    subjectForm.value = { ...subject };
    isSubjectEdit.value = true;
    subjectDialogVisible.value = true;
    subjectSubmitted.value = false;
};

const saveSubject = async () => {
    subjectSubmitted.value = true;
    if (!subjectForm.value.name) return;
    loading.value = true;
    try {
        if (isSubjectEdit.value) {
            await axiosInstance.put(`/constants/subjects/${subjectForm.value.id}`, {
                name: subjectForm.value.name
            });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Subject updated',
                life: 3000
            });
        } else {
            await axiosInstance.post('/constants/subjects', {
                name: subjectForm.value.name
            });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Subject created',
                life: 3000
            });
        }
        subjectDialogVisible.value = false;
        fetchSubjects();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to save subject',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const deleteSubject = async (subject) => {
    loading.value = true;
    try {
        await axiosInstance.delete(`/constants/subjects/${subject.id}`);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Subject deleted',
            life: 3000
        });
        fetchSubjects();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete subject',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchLanguages();
    fetchSubjects();
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 flex flex-col items-center">
        <div class="w-full max-w-3xl mx-auto">
            <div class="card shadow-5 p-8 bg-white rounded-3xl border border-blue-100 mb-8">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-extrabold text-blue-800 flex items-center gap-2"><i class="pi pi-globe text-xl text-blue-500" /> Manage Languages</h2>
                    <Button label="Add Language" icon="pi pi-plus" class="p-button-success" @click="openNew" />
                </div>
                <DataTable :value="languages" :loading="loading" class="p-datatable-sm" responsive-layout="scroll">
                    <Column field="name" header="Name" sortable></Column>
                    <Column field="code" header="Code" sortable></Column>
                    <Column header="Actions" style="width: 8rem; text-align: center">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm mr-2" @click="openEdit(data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="deleteLanguage(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
            <div class="card shadow-5 p-8 bg-white rounded-3xl border border-blue-100">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-extrabold text-blue-800 flex items-center gap-2"><i class="pi pi-book text-xl text-blue-500" /> Manage Subjects</h2>
                    <Button label="Add Subject" icon="pi pi-plus" class="p-button-success" @click="openNewSubject" />
                </div>
                <DataTable :value="subjects" :loading="loading" class="p-datatable-sm" responsive-layout="scroll">
                    <Column field="name" header="Name" sortable></Column>
                    <Column header="Actions" style="width: 8rem; text-align: center">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm mr-2" @click="openEditSubject(data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="deleteSubject(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <!-- Language Dialog -->
        <Dialog v-model:visible="dialogVisible" :style="{ width: '400px' }" :header="isEdit ? 'Edit Language' : 'Add Language'" :modal="true" class="p-fluid">
            <div class="field mb-4">
                <label for="name" class="font-bold text-blue-900 mb-1 block">Name<span class="text-red-500">*</span></label>
                <InputText id="name" v-model.trim="languageForm.name" :class="{ 'p-invalid': submitted && !languageForm.name }" autofocus />
                <small v-if="submitted && !languageForm.name" class="p-error">Name is required</small>
            </div>
            <div class="field mb-4">
                <label for="code" class="font-bold text-blue-900 mb-1 block">Code<span class="text-red-500">*</span></label>
                <InputText id="code" v-model.trim="languageForm.code" :class="{ 'p-invalid': submitted && !languageForm.code }" />
                <small v-if="submitted && !languageForm.code" class="p-error">Code is required</small>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text p-button-secondary" @click="dialogVisible = false" />
                <Button :label="isEdit ? 'Update' : 'Create'" icon="pi pi-check" class="p-button-primary" @click="saveLanguage" :loading="loading" />
            </template>
        </Dialog>
        <!-- Subject Dialog -->
        <Dialog v-model:visible="subjectDialogVisible" :style="{ width: '400px' }" :header="isSubjectEdit ? 'Edit Subject' : 'Add Subject'" :modal="true" class="p-fluid">
            <div class="field mb-4">
                <label for="subject_name" class="font-bold text-blue-900 mb-1 block">Name<span class="text-red-500">*</span></label>
                <InputText
                    id="subject_name"
                    v-model.trim="subjectForm.name"
                    :class="{
                        'p-invalid': subjectSubmitted && !subjectForm.name
                    }"
                    autofocus
                />
                <small v-if="subjectSubmitted && !subjectForm.name" class="p-error">Name is required</small>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text p-button-secondary" @click="subjectDialogVisible = false" />
                <Button :label="isSubjectEdit ? 'Update' : 'Create'" icon="pi pi-check" class="p-button-primary" @click="saveSubject" :loading="loading" />
            </template>
        </Dialog>
    </div>
</template>
