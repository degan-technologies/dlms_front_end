<template>
    <section class="bg-white min-h-screen py-12 px-5">
        <div class="max-w-6xl mx-auto">
            <!-- Back button -->
            <div class="mb-8 flex items-center gap-2">
                <button @click="goBack" class="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded shadow-sm font-medium transition-all">
                    <i class="pi pi-arrow-left"></i>
                    <span>Back</span>
                </button>
            </div>
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
                <div>
                    <div class="text-blue-600 font-semibold mb-1 tracking-widest uppercase">My Notes</div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-2">Your Notes</h1>
                </div>
            </div>
            <div v-if="loading" class="flex justify-center items-center py-24">
                <i class="pi pi-spin pi-spinner text-blue-600 text-4xl"></i>
            </div>
            <div v-else-if="notes.length === 0" class="bg-white p-12 rounded-lg text-center shadow-sm">
                <i class="pi pi-file-edit text-5xl text-gray-300 mb-4"></i>
                <h3 class="text-2xl font-semibold mb-2">No Notes Yet</h3>
                <p class="text-gray-500 max-w-md mx-auto">You haven't created any notes yet.</p>
            </div>
            <div v-else>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div v-for="note in notes" :key="note.id" class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 relative">
                        <!-- Decorative color bar -->
                        <div class="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 via-sky-400 to-cyan-400"></div>
                        <div class="absolute top-3 right-4 z-10 flex gap-2">
                            <button @click.stop="deleteNote(note)" class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded shadow text-xs font-semibold flex items-center gap-1 transition-all"><i class="pi pi-trash"></i> Remove</button>
                        </div>
                        <div class="relative h-32 bg-gradient-to-t from-gray-100 to-white flex items-center justify-center">
                            <img v-if="note.ebook && note.ebook.cover_image_url" :src="note.ebook.cover_image_url" :alt="note.ebook.title" class="w-20 h-28 object-cover rounded shadow" />
                            <div v-else class="w-20 h-28 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-2xl">
                                <i class="pi pi-book"></i>
                            </div>
                        </div>
                        <div class="p-5 flex flex-col gap-2">
                            <h3 class="font-bold text-lg text-gray-900 line-clamp-2 mb-1">{{ note.ebook?.title || 'Untitled Book' }}</h3>
                            <p class="text-gray-500 text-xs mb-1 flex items-center gap-2"><i class="pi pi-user text-blue-400"></i> {{ note.ebook?.author }}</p>
                            <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <span v-if="note.page_number">Page: {{ note.page_number }}</span>
                                <span v-if="note.highlight_text"
                                    >Highlight: <span class="italic text-blue-700">{{ note.highlight_text }}</span></span
                                >
                            </div>
                            <p class="text-gray-700 text-sm line-clamp-2 mb-2">{{ note.content }}</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">Created: {{ formatDate(note.created_at) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-10 flex justify-center">
                    <Paginator
                        :rows="notesPerPage"
                        :totalRecords="totalRecords"
                        v-model:first="notesFirst"
                        :rowsPerPageOptions="[6, 9, 12, 18]"
                        @page="onNotesPageChange($event)"
                        class="border-none"
                        :template="{
                            '640px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown',
                            '960px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
                            '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport'
                        }"
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                        alwaysShow="true"
                    />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const loading = ref(true);
const notes = ref([]);
const notesFirst = ref(0);
const notesPerPage = ref(9);
const totalRecords = ref(0);

const fetchNotes = async () => {
    loading.value = true;
    try {
        const currentPage = Math.floor(notesFirst.value / notesPerPage.value) + 1;
        const response = await axiosInstance.get('/notes', {
            params: {
                with: 'ebook,ebook.bookItem',
                per_page: notesPerPage.value,
                page: currentPage
            }
        });
        notes.value = response.data.data;
        totalRecords.value = response.data.pagination?.total || 0;
    } catch (error) {
        notes.value = [];
        totalRecords.value = 0;
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load notes. Please try again.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchNotes();
});

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const goBack = () => {
    router.back();
};

const onNotesPageChange = (event) => {
    notesFirst.value = event.first;
    notesPerPage.value = event.rows;
    fetchNotes();
};

const deleteNote = async (note) => {
    if (!note || !note.id) return;
    try {
        await axiosInstance.delete(`/notes/${note.id}`);
        toast.add({
            severity: 'success',
            summary: 'Removed',
            detail: 'Note removed successfully.',
            life: 2000
        });
        fetchNotes();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove note.',
            life: 3000
        });
    }
};
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
