<template>
    <section class="bg-gradient-to-b from-gray-50 to-white min-h-screen pb-12 px-4 md:px-8">
        <!-- Modern Header -->
        <div class="fixed top-0 left-0 right-0 bg-white/90 shadow-sm z-50 border-b border-gray-200 backdrop-blur">
            <div class="max-w-6xl mx-auto py-4 px-4 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <button @click="goBack" class="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <i class="pi pi-arrow-left text-gray-700 text-lg"></i>
                    </button>
                    <div class="flex items-center gap-3">
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 truncate max-w-lg">My Study Notes</h1>
                        <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium hidden md:inline">Organized by Ebook</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="max-w-6xl mx-auto pt-24">
            <div v-if="loading" class="flex justify-center items-center py-24">
                <i class="pi pi-spin pi-spinner text-indigo-600 text-4xl"></i>
            </div>
            <div v-else-if="groupedNotes.length === 0" class="bg-white p-12 rounded-2xl text-center shadow-md border border-gray-100 mt-10">
                <i class="pi pi-file-edit text-5xl text-gray-300 mb-4"></i>
                <h3 class="text-2xl font-bold mb-2">No Notes Yet</h3>
                <p class="text-gray-500 max-w-md mx-auto">You haven't created any notes yet.</p>
            </div>
            <div v-else>
                <div class="space-y-12">
                    <div v-for="group in groupedNotes" :key="group.ebook.id" class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div class="flex flex-col md:flex-row gap-6 p-8 items-start bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-b border-gray-100">
                            <div class="flex-1">
                                <div class="flex flex-wrap gap-2 mb-2">
                                    <span class="text-xs font-semibold text-gray-600 flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
                                        <i :class="getEbookTypeIcon(group.ebook)" class="text-indigo-500"></i>
                                        {{ group.ebook.e_book_type ? group.ebook.e_book_type.name : 'File' }}
                                    </span>
                                    <span v-if="group.ebook.is_downloadable" class="text-xs text-white font-semibold bg-green-500 px-2 py-1 rounded-full">Downloadable</span>
                                    <span v-else class="text-xs text-white font-semibold bg-orange-500 px-2 py-1 rounded-full">View Only</span>
                                </div>
                                <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ group.ebook.file_name || group.ebook.title || 'Untitled File' }}</h2>
                                <div class="flex items-center gap-3 text-base text-gray-500 mb-2">
                                    <span v-if="group.ebook.pages"><i class="pi pi-file-o mr-1"></i>{{ group.ebook.pages }} pages</span>
                                    <span v-if="group.ebook.created_at"><i class="pi pi-calendar mr-1"></i>{{ formatDate(group.ebook.created_at) }}</span>
                                </div>
                                <div class="flex items-center gap-2 text-base text-gray-600 mb-2">
                                    <span v-if="group.ebook.author"><i class="pi pi-user mr-1"></i>{{ group.ebook.author }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="px-8 pb-8 pt-6 bg-gradient-to-br from-white to-indigo-50">
                            <!-- Notes Carousel -->
                            <div class="notes-carousel-container">
                                <Carousel
                                    :value="group.notes"
                                    :numVisible="getCarouselVisible(group.notes.length)"
                                    :numScroll="1"
                                    :circular="true"
                                    :autoplayInterval="0"
                                    :showNavigators="group.notes.length > 1"
                                    :showIndicators="group.notes.length > 3"
                                    :responsiveOptions="carouselResponsiveOptions"
                                    class="notes-carousel"
                                >
                                    <template #item="{ data: note }">
                                        <div class="p-2">
                                            <div
                                                @click="goToReader(group.ebook)"
                                                class="group bg-yellow-50 rounded-2xl shadow hover:shadow-xl border border-yellow-100 cursor-pointer transition-all p-6 flex flex-col gap-3 hover:bg-yellow-100 relative h-64"
                                            >
                                                <span class="absolute top-4 right-4 text-xs text-gray-400 font-semibold">#{{ note.id }}</span>
                                                <div class="flex items-center gap-2 mb-1">
                                                    <span class="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Page {{ note.page_number }}</span>
                                                    <span v-if="note.highlight_text" class="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">Highlight</span>
                                                </div>
                                                <div class="text-gray-900 font-semibold text-lg line-clamp-3 flex-1">{{ note.content }}</div>
                                                <div class="flex items-center gap-2 text-xs text-gray-400 mt-2">
                                                    <span><i class="pi pi-calendar mr-1"></i>{{ formatDate(note.created_at) }}</span>
                                                </div>
                                                <button @click.stop="deleteNote(note)" class="mt-2 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded shadow text-xs font-semibold flex items-center gap-1 transition-all self-start">
                                                    <i class="pi pi-trash"></i> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </template>
                                </Carousel>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-12 flex justify-center">
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
import Carousel from 'primevue/carousel';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
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

// Group notes by ebook id
const groupedNotes = computed(() => {
    const groups = {};
    for (const note of notes.value) {
        if (!note.ebook) continue;
        if (!groups[note.ebook.id]) {
            groups[note.ebook.id] = { ebook: note.ebook, notes: [] };
        }
        groups[note.ebook.id].notes.push(note);
    }
    // Return as array
    return Object.values(groups);
});

const getEbookTypeIcon = (ebook) => {
    const type = ebook?.e_book_type?.name?.toLowerCase() || '';
    if (type.includes('pdf')) return 'pi pi-file-pdf';
    if (type.includes('video')) return 'pi pi-video';
    if (type.includes('audio')) return 'pi pi-volume-up';
    return 'pi pi-file';
};

const goToReader = (ebook) => {
    if (!ebook) return;
    // If video, pass videoId; if PDF, pass type
    if (ebook.e_book_type?.name?.toLowerCase() === 'video') {
        // Try to extract videoId from file_path
        const videoId = getYoutubeVideoId(ebook.file_path);
        router.push({
            path: `/reader/${ebook.book_item_id}`,
            query: {
                type: 'video',
                ebookId: ebook.id,
                videoId: videoId
            }
        });
    } else {
        router.push({
            path: `/reader/${ebook.book_item_id}`,
            query: {
                type: 'pdf',
                ebookId: ebook.id,
                source: encodeURIComponent(ebook.file_path.replace(/\\\//g, '/'))
            }
        });
    }
};

const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

// Carousel configuration
const carouselResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
]);

const getCarouselVisible = (notesLength) => {
    if (notesLength === 1) return 1;
    if (notesLength === 2) return 2;
    return Math.min(3, notesLength);
};
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 3;
}

.notes-carousel-container {
    margin: 0 -8px;
}

.notes-carousel :deep(.p-carousel-item) {
    display: flex;
    align-items: stretch;
}

.notes-carousel :deep(.p-carousel-item > div) {
    width: 100%;
}

/* Custom Carousel Styling */
.notes-carousel :deep(.p-carousel-prev),
.notes-carousel :deep(.p-carousel-next) {
    background-color: rgba(99, 102, 241, 0.1);
    border: 2px solid rgb(99, 102, 241);
    color: rgb(99, 102, 241);
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.notes-carousel :deep(.p-carousel-prev):hover,
.notes-carousel :deep(.p-carousel-next):hover {
    background-color: rgb(99, 102, 241);
    color: white;
    transform: scale(1.1);
}

.notes-carousel :deep(.p-carousel-indicators) {
    padding: 1rem 0;
}

.notes-carousel :deep(.p-carousel-indicator) {
    background-color: rgba(99, 102, 241, 0.3);
    border-radius: 50%;
    width: 12px;
    height: 12px;
    margin: 0 6px;
    transition: all 0.3s ease;
}

.notes-carousel :deep(.p-carousel-indicator.p-highlight) {
    background-color: rgb(99, 102, 241);
    transform: scale(1.2);
}
</style>
