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
                    <div class="text-blue-600 font-semibold mb-1 tracking-widest uppercase">Bookmarks</div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-2">Your Bookmarked Resources</h1>
                </div>
            </div>
            <div v-if="loading" class="flex justify-center items-center py-24">
                <i class="pi pi-spin pi-spinner text-blue-600 text-4xl"></i>
            </div>
            <div v-else-if="bookmarks.length === 0" class="bg-white p-12 rounded-lg text-center shadow-sm">
                <i class="pi pi-bookmark text-5xl text-gray-300 mb-4"></i>
                <h3 class="text-2xl font-semibold mb-2">No Bookmarks Yet</h3>
                <p class="text-gray-500 max-w-md mx-auto">You haven't bookmarked any resources yet.</p>
            </div>
            <div v-else>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div v-for="bookmark in bookmarks" :key="bookmark.id" class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 relative">
                        <!-- Decorative color bar -->
                        <div class="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 via-sky-400 to-cyan-400"></div>
                        <div class="absolute top-3 left-4 z-10 flex items-center gap-2">
                            <span class="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow">BOOKMARKED</span>
                            <span class="px-2 py-1 bg-white/80 text-blue-700 text-xs font-semibold rounded shadow border border-blue-100">{{ bookmark.ebook?.file_format }}</span>
                        </div>
                        <div class="absolute top-3 right-4 z-10 flex gap-2">
                            <button @click.stop="deleteBookmark(bookmark)" class="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded shadow text-xs font-semibold flex items-center gap-1 transition-all">
                                <i class="pi pi-trash"></i> Remove
                            </button>
                        </div>
                        <div class="relative h-48 bg-gradient-to-t from-gray-100 to-white flex items-center justify-center">
                            <img
                                :src="bookmark.ebook?.cover_image_url || 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'"
                                :alt="bookmark.ebook?.title"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div class="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-xs text-blue-700 shadow flex items-center gap-1">
                                <i v-if="bookmark.ebook?.file_format === 'YOUTUBE'" class="pi pi-youtube text-red-500"></i>
                                <i v-else class="pi pi-book text-blue-600"></i>
                                <span>{{ bookmark.ebook?.file_format }}</span>
                            </div>
                        </div>
                        <div class="p-5 flex flex-col gap-2">
                            <h3 class="font-bold text-lg text-gray-900 line-clamp-2 mb-1">{{ bookmark.ebook?.title }}</h3>
                            <p class="text-gray-500 text-sm mb-1 flex items-center gap-2"><i class="pi pi-user text-blue-400"></i> {{ bookmark.ebook?.author }}</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">Bookmarked: {{ formatDate(bookmark.created_at) }}</span>
                            </div>
                            <button @click="goToEbookDetail(bookmark.ebook)" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all font-semibold shadow">
                                <i class="pi pi-eye"></i> View Resource
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mt-10 flex justify-center">
                    <Paginator
                        :rows="bookmarksPerPage"
                        :totalRecords="totalRecords"
                        v-model:first="bookmarksFirst"
                        :rowsPerPageOptions="[6, 9, 12, 18]"
                        @page="onBookmarksPageChange($event)"
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
const bookmarks = ref([]);
const bookmarksFirst = ref(0);
const bookmarksPerPage = ref(9);
const totalRecords = ref(0);

const fetchBookmarks = async () => {
    loading.value = true;
    try {
        const currentPage = Math.floor(bookmarksFirst.value / bookmarksPerPage.value) + 1;
        const response = await axiosInstance.get('/bookmarks', {
            params: {
                with: 'ebook,ebook.bookItem',
                per_page: bookmarksPerPage.value,
                page: currentPage
            }
        });
        bookmarks.value = response.data.data;
        totalRecords.value = response.data.pagination?.total || 0;
    } catch (error) {
        bookmarks.value = [];
        totalRecords.value = 0;
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load bookmarks. Please try again.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchBookmarks();
});

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const goToEbookDetail = (ebook) => {
    if (ebook && ebook.id) {
        router.push(`/reader/${ebook.id}`);
    }
};

const goBack = () => {
    router.back();
};

const onBookmarksPageChange = (event) => {
    bookmarksFirst.value = event.first;
    bookmarksPerPage.value = event.rows;
    fetchBookmarks();
};

const deleteBookmark = async (bookmark) => {
    if (!bookmark || !bookmark.id) return;
    try {
        await axiosInstance.delete(`/bookmarks/${bookmark.id}`);
        toast.add({
            severity: 'success',
            summary: 'Removed',
            detail: 'Bookmark removed successfully.',
            life: 2000
        });
        fetchBookmarks();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to remove bookmark.',
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
