<template>
    <Dialog v-model:visible="isVisible" :header="header" modal :closable="true" :style="{ width: '30vw' }">
        <div class="p-4">
            <h3 class="text-lg font-semibold mb-4">Manage Bookmark</h3>
            <div class="mb-4">
                <label for="bookmarkTitle" class="block text-sm font-medium text-gray-700">Bookmark Title</label>
                <input id="bookmarkTitle" v-model="bookmarkTitle" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div class="flex justify-end gap-2">
                <button @click="onCancel" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Cancel</button>
                <button @click="onSave" :disabled="loading" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    <span v-if="loading"><i class="pi pi-spin pi-spinner"></i></span>
                    <span v-else>Save</span>
                </button>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { computed, ref, watch } from 'vue';

const props = defineProps({
    visible: Boolean,
    ebook: {
        type: Object,
        required: true
    }
});
const emit = defineEmits(['update:visible', 'bookmarkAdded']);

const toast = useToast();
const header = ref('Bookmark');
const bookmarkTitle = ref('');
const loading = ref(false);

const isVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
});

watch(
    () => props.ebook,
    (ebook) => {
        if (ebook) {
            bookmarkTitle.value = ebook.file_name || '';
        }
    }
);

watch(isVisible, (v) => {
    if (!v) bookmarkTitle.value = '';
});

const onCancel = () => {
    isVisible.value = false;
};

const onSave = async () => {
    if (!props.ebook?.id) return;
    loading.value = true;
    try {
        await axiosInstance.post('/bookmarks', {
            e_book_id: props.ebook.id,
            title: bookmarkTitle.value
        });
        toast.add({
            severity: 'success',
            summary: 'Bookmarked',
            detail: 'Ebook bookmarked successfully',
            life: 3000
        });
        emit('bookmarkAdded', props.ebook.id);
        isVisible.value = false;
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.response?.data?.message || 'Failed to bookmark',
            life: 4000
        });
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped></style>
