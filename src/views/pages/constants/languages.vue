<script setup>
import axiosInstance from '@/util/axios-config';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

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

const selectedTable = ref('languages'); // 'languages' or 'subjects'

const languageSearch = ref('');
const subjectSearch = ref('');

const filteredLanguages = computed(() => {
    if (!languageSearch.value) return languages.value;
    return languages.value.filter((lang) => (lang.name && lang.name.toLowerCase().includes(languageSearch.value.toLowerCase())) || (lang.code && lang.code.toLowerCase().includes(languageSearch.value.toLowerCase())));
});
const filteredSubjects = computed(() => {
    if (!subjectSearch.value) return subjects.value;
    return subjects.value.filter((subj) => subj.name && subj.name.toLowerCase().includes(subjectSearch.value.toLowerCase()));
});

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

const confirmDeleteDialog = ref(false);
const deleteTarget = ref(null);
const deleteType = ref('language'); // or 'subject'

const askDeleteLanguage = (lang) => {
    deleteTarget.value = lang;
    deleteType.value = 'language';
    confirmDeleteDialog.value = true;
};
const askDeleteSubject = (subject) => {
    deleteTarget.value = subject;
    deleteType.value = 'subject';
    confirmDeleteDialog.value = true;
};
const confirmDelete = async () => {
    if (deleteType.value === 'language') {
        await deleteLanguage(deleteTarget.value);
    } else {
        await deleteSubject(deleteTarget.value);
    }
    confirmDeleteDialog.value = false;
    deleteTarget.value = null;
};
const cancelDelete = () => {
    confirmDeleteDialog.value = false;
    deleteTarget.value = null;
};

onMounted(() => {
    fetchLanguages();
    fetchSubjects();
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 flex flex-col items-center">
        <div class="w-full max-w-4xl mx-auto">
            <!-- Header with switch buttons -->
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-extrabold text-blue-800 flex items-center gap-2">
                    <i class="pi pi-cog text-xl text-blue-500" />
                    Manage Constants
                </h2>
                <div class="flex gap-2">
                    <Button :label="'Languages'" :class="selectedTable === 'languages' ? 'p-button-primary' : 'p-button-outlined'" @click="selectedTable = 'languages'" />
                    <Button :label="'Subjects'" :class="selectedTable === 'subjects' ? 'p-button-primary' : 'p-button-outlined'" @click="selectedTable = 'subjects'" />
                </div>
            </div>
            <!-- Languages DataTable -->
            <div v-if="selectedTable === 'languages'">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-blue-700 flex items-center gap-2"><i class="pi pi-globe text-lg text-blue-500" /> Languages</h3>
                    <Button label="Add Language" icon="pi pi-plus" class="p-button-success" @click="openNew" />
                </div>
                <div class="mb-4 flex items-center gap-2">
                    <InputText v-model="languageSearch" placeholder="Search languages..." class="w-full max-w-xs" />
                </div>
                <DataTable :value="filteredLanguages" :loading="loading" class="p-datatable-sm mb-10" responsive-layout="scroll" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]">
                    <Column field="name" header="Name" sortable></Column>
                    <Column field="code" header="Code" sortable></Column>
                    <Column header="Actions" style="width: 8rem; text-align: center">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm mr-2" @click="openEdit(data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="askDeleteLanguage(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
            <!-- Subjects DataTable -->
            <div v-else>
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-blue-700 flex items-center gap-2"><i class="pi pi-book text-lg text-blue-500" /> Subjects</h3>
                    <Button label="Add Subject" icon="pi pi-plus" class="p-button-success" @click="openNewSubject" />
                </div>
                <div class="mb-4 flex items-center gap-2">
                    <InputText v-model="subjectSearch" placeholder="Search subjects..." class="w-full max-w-xs" />
                </div>
                <DataTable :value="filteredSubjects" :loading="loading" class="p-datatable-sm" responsive-layout="scroll" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]">
                    <Column field="name" header="Name" sortable></Column>
                    <Column header="Actions" style="width: 8rem; text-align: center">
                        <template #body="{ data }">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-info p-button-sm mr-2" @click="openEditSubject(data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-sm" @click="askDeleteSubject(data)" />
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
        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="confirmDeleteDialog" :style="{ width: '350px' }" header="Confirm Delete" :modal="true" :closable="false">
            <div class="flex flex-col items-center justify-center py-4">
                <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <div class="text-lg text-center mb-4">Are you sure you want to delete this {{ deleteType === 'language' ? 'language' : 'subject' }}?</div>
                <div class="flex gap-4 justify-center">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text p-button-secondary" @click="cancelDelete" />
                    <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDelete" />
                </div>
            </div>
        </Dialog>
    </div>
</template>
