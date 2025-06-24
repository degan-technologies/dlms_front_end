<script setup>
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
const authStore = useAuthStore();
const user = computed(() => authStore.getUser || {});
console.log('User:', user.value);
const confirm = useConfirm();
const toast = useToast();

// State
const announcements = ref([]);
const loading = ref(true);
const editingId = ref(null);
const form = ref({
    title: '',
    content: '',
    is_published: false
});
const dialogVisible = ref(false);

// Fetch all announcements
const fetchAnnouncements = async () => {
    try {
        loading.value = true;
        const response = await axiosInstance.get('/librarian/announcements');

        // Handle both wrapped and unwrapped responses
        announcements.value = response.data.data || response.data;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load announcements',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Create or update announcement
const saveAnnouncement = async () => {
    try {
        if (editingId.value) {
            await axiosInstance.put(`/librarian/announcements/${editingId.value}`, form.value);
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Announcement updated successfully',
                life: 3000
            });
        } else {
            await axiosInstance.post('/librarian/announcements', form.value);
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Announcement created successfully',
                life: 3000
            });
        }
        resetForm();
        fetchAnnouncements();
        dialogVisible.value = false;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Operation failed',
            life: 3000
        });
    }
};

// Edit announcement
const editAnnouncement = (announcement) => {
    editingId.value = announcement.id;
    form.value = {
        title: announcement.title,
        content: announcement.content,
        is_published: announcement.is_published
    };
    dialogVisible.value = true;
};

// Delete announcement
const deleteAnnouncement = (id) => {
    confirm.require({
        message: 'Are you sure you want to delete this announcement?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                await axiosInstance.delete(`/librarian/announcements/${id}`);
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Announcement deleted successfully',
                    life: 3000
                });
                fetchAnnouncements();
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete announcement',
                    life: 3000
                });
            }
        }
    });
};

// Toggle publish status
const togglePublish = async (announcement) => {
    try {
        await axiosInstance.put(`/librarian/announcements/${announcement.id}/toggle-publish`, {
            is_published: !announcement.is_published
        });
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Announcement ${announcement.is_published ? 'unpublished' : 'published'}`,
            life: 3000
        });
        fetchAnnouncements();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update status',
            life: 3000
        });
    }
};

// Reset form
const resetForm = () => {
    editingId.value = null;
    form.value = {
        title: '',
        content: '',
        is_published: false
    };
};

// Format date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
};

onMounted(() => {
    const token = Cookies.get('access_token');
    if (token && !user.value) {
        authStore.authCheck();
    }
    fetchAnnouncements();
});
</script>

<template>
    <div class="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <ConfirmDialog />
        <Toast />

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <h1 class="text-xl sm:text-2xl font-bold">Announcement Management</h1>
            <Button label="Create Announcement" icon="pi pi-plus" @click="dialogVisible = true" class="p-button-primary w-full sm:w-auto">
                <span class="hidden sm:inline">Create Announcement</span>
                <span class="sm:hidden">Create</span>
            </Button>
        </div>

        <!-- Announcement List -->
        <div v-if="loading" class="flex justify-center py-8">
            <ProgressSpinner />
        </div>

        <div v-else class="space-y-3 sm:space-y-4 border rounded-lg p-3 sm:p-4">
            <Card v-for="announcement in announcements" :key="announcement.id" class="border border-gray-200 shadow-none hover:shadow-sm transition-shadow">
                <template #title>
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-gray-200 pb-2">
                        <span class="text-base sm:text-lg font-semibold break-words">{{ announcement.title }}</span>
                        <Tag :value="announcement.is_published ? 'Published' : 'Draft'" :severity="announcement.is_published ? 'success' : 'warning'" class="w-fit" />
                    </div>
                </template>
                <template #subtitle>
                    <span class="text-xs sm:text-sm text-gray-500">{{ formatDate(announcement.created_at) }}</span>
                </template>
                <template #content>
                    <p class="whitespace-pre-wrap text-sm sm:text-base">{{ announcement.content }}</p>
                </template>
                <template #footer v-if="user.id === announcement.user.id">
                    <div class="flex flex-wrap gap-2 justify-end">
                        <Button :label="announcement.is_published ? 'Unpublish' : 'Publish'" :icon="announcement.is_published ? 'pi pi-eye-slash' : 'pi pi-eye'" @click="togglePublish(announcement)" class="p-button-secondary text-xs sm:text-sm" />
                        <Button label="Edit" icon="pi pi-pencil" @click="editAnnouncement(announcement)" class="p-button-primary text-xs sm:text-sm" />
                        <Button label="Delete" icon="pi pi-trash" @click="deleteAnnouncement(announcement.id)" class="p-button-danger text-xs sm:text-sm" />
                    </div>
                </template>
            </Card>

            <div v-if="announcements.length === 0" class="text-center py-8">
                <p class="text-gray-500">No announcements found</p>
            </div>
        </div>

        <!-- Create/Edit Dialog -->
        <Dialog
            v-model:visible="dialogVisible"
            :header="editingId ? 'Edit Announcement' : 'Create Announcement'"
            :modal="true"
            :style="{ width: 'min(95vw, 600px)' }"
            :breakpoints="{ '960px': '75vw', '640px': '95vw' }"
            :draggable="false"
            @after-hide="resetForm"
            class="announcement-dialog"
        >
            <div class="p-fluid dialog-content">
                <div class="field mb-3 sm:mb-4">
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <InputText id="title" v-model="form.title" required placeholder="e.g. Library Closure Notice" class="w-full text-sm sm:text-base" :class="{ 'p-invalid': !form.title && formSubmitted }" />
                    <small v-if="!form.title && formSubmitted" class="p-error">Title is required</small>
                </div>

                <div class="field mb-3 sm:mb-4">
                    <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                    <Textarea id="content" v-model="form.content" rows="5" required placeholder="Enter detailed announcement content..." class="w-full text-sm sm:text-base" :class="{ 'p-invalid': !form.content && formSubmitted }" auto-resize />
                    <small v-if="!form.content && formSubmitted" class="p-error">Content is required</small>
                </div>

                <div class="field-checkbox flex items-center mt-4 sm:mt-6">
                    <Checkbox id="is_published" v-model="form.is_published" :binary="true" class="mr-2" />
                    <label for="is_published" class="text-xs sm:text-sm text-gray-600">Publish immediately</label>
                </div>
            </div>

            <template #footer>
                <div class="flex flex-row justify-end gap-2 border-t border-gray-100 pt-3 sm:pt-4">
                    <Button label="Cancel" icon="pi pi-times" @click="dialogVisible = false" class="p-button-text p-button-plain order-2 sm:order-1 w-full sm:w-auto" />
                    <Button :label="editingId ? 'Update' : 'Save'" icon="pi pi-check" @click="saveAnnouncement()" class="p-button-primary order-1 sm:order-2 w-full sm:w-auto" :loading="loading" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.container {
    max-width: 1200px;
    width: 100%;
}

.p-card {
    margin-bottom: 0.75rem;
    transition: all 0.2s ease;
}

.p-card-title {
    font-size: 1rem;
}

@media (min-width: 640px) {
    .p-card-title {
        font-size: 1.25rem;
    }
}

.p-card-subtitle {
    color: #6c757d;
    font-size: 0.75rem;
}

@media (min-width: 640px) {
    .p-card-subtitle {
        font-size: 0.875rem;
    }
}

.p-card-content {
    margin-top: 0.5rem;
    padding: 0.5rem 0;
}

@media (min-width: 640px) {
    .p-card-content {
        margin-top: 1rem;
        padding: 1rem 0;
    }
}

.field {
    margin-bottom: 1rem;
}

@media (min-width: 640px) {
    .field {
        margin-bottom: 1.5rem;
    }
}

.field-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

@media (min-width: 640px) {
    .field-checkbox {
        margin-bottom: 1.5rem;
    }
}

/* Better mobile button sizes */
@media (max-width: 639px) {
    .p-button {
        padding: 0.4rem 0.6rem;
        font-size: 0.75rem;
    }

    .p-button-icon {
        font-size: 0.75rem;
    }
}

/* Dialog adjustments for mobile */
.announcement-dialog .p-dialog-content {
    padding: 0.75rem;
}

@media (min-width: 640px) {
    .announcement-dialog .p-dialog-content {
        padding: 1rem;
    }
}
</style>
