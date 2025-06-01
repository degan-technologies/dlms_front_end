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
                        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 truncate max-w-lg">My Bookmarks</h1>
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hidden md:inline">Quick Access</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="max-w-6xl mx-auto pt-24">
            <div v-if="loading" class="flex justify-center items-center py-24">
                <i class="pi pi-spin pi-spinner text-blue-600 text-4xl"></i>
            </div>
            <div v-else-if="bookmarks.length === 0" class="bg-white p-12 rounded-2xl text-center shadow-md border border-gray-100 mt-10">
                <i class="pi pi-bookmark text-5xl text-gray-300 mb-4"></i>
                <h3 class="text-2xl font-bold mb-2">No Bookmarks Yet</h3>
                <p class="text-gray-500 max-w-md mx-auto">You haven't bookmarked any resources yet.</p>
            </div>
            <div v-else>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bg-white rounded-2xl shadow-lg border border-yellow-200 overflow-hidden group hover:shadow-xl transition-all">
                        <!-- Mobile Layout: Full-width image at top -->
                        <div class="block md:hidden">
                            <!-- Mobile Hero Image -->
                            <div class="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                <img
                                    :src="bookmark.ebook?.cover_image_url || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'"
                                    alt="Ebook cover"
                                    class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                />

                                <!-- Mobile Image Overlay -->
                                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                                <!-- Type and Download Badge - Mobile -->
                                <div class="absolute top-4 left-4 right-4 flex justify-between items-start">
                                    <span class="text-xs font-semibold text-white flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                        <i :class="getEbookTypeIcon(bookmark.ebook)" class="text-white"></i>
                                        {{ bookmark.ebook?.ebook_type?.name || 'File' }}
                                    </span>
                                    <span v-if="bookmark.ebook?.is_downloadable" class="text-xs text-white font-semibold bg-green-500/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-green-400/30">
                                        <i class="pi pi-download mr-1"></i>Available
                                    </span>
                                </div>

                                <!-- Mobile Title Overlay -->
                                <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <h2 class="text-xl font-bold mb-2 leading-tight line-clamp-2">{{ bookmark.ebook?.title || 'Untitled File' }}</h2>
                                    <div class="flex items-center gap-3 text-sm text-white/90 mb-1">
                                        <span v-if="bookmark.ebook?.author" class="flex items-center gap-1.5"> <i class="pi pi-user"></i>{{ bookmark.ebook.author }} </span>
                                        <span class="flex items-center gap-1.5"> <i class="pi pi-calendar"></i>{{ formatDate(bookmark.created_at) }} </span>
                                    </div>

                                    <!-- Quick stats on mobile -->
                                    <div class="flex items-center gap-3 text-xs text-white/80 mt-2">
                                        <span class="flex items-center gap-1"> <i class="pi pi-bookmark"></i>Saved </span>
                                        <span v-if="bookmark.ebook?.book_item?.category" class="flex items-center gap-1"> <i class="pi pi-tag"></i>{{ bookmark.ebook.book_item.category.name }} </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Mobile Content Area -->
                            <div class="p-5">
                                <div class="flex gap-3">
                                    <button
                                        @click="goToReader(bookmark.ebook)"
                                        class="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <i class="pi pi-play text-lg"></i>
                                        <span>Open</span>
                                    </button>
                                    <button
                                        @click.stop="deleteBookmark(bookmark)"
                                        class="px-5 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl shadow-md text-sm font-semibold flex items-center gap-2 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                                    >
                                        <i class="pi pi-trash"></i>
                                        <span class="hidden xs:inline">Remove</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Desktop Layout: Side-by-side -->
                        <div class="hidden md:flex flex-col md:flex-row gap-6 p-6 items-start bg-gradient-to-r from-yellow-50 via-white to-blue-50 border-b border-yellow-100">
                            <img
                                :src="bookmark.ebook?.cover_image_url || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'"
                                alt="Ebook cover"
                                class="w-28 h-36 object-cover rounded-xl border border-gray-200 shadow-sm"
                            />
                            <div class="flex-1 min-w-0">
                                <div class="flex flex-wrap gap-2 mb-2">
                                    <span class="text-xs font-semibold text-blue-600 flex items-center gap-1.5 bg-blue-100 px-2 py-1 rounded-full">
                                        <i :class="getEbookTypeIcon(bookmark.ebook)" class="text-blue-500"></i>
                                        {{ bookmark.ebook?.ebook_type?.name || 'File' }}
                                    </span>
                                    <span v-if="bookmark.ebook?.is_downloadable" class="text-xs text-white font-semibold bg-green-500 px-2 py-1 rounded-full">Downloadable</span>
                                </div>
                                <h2 class="text-xl font-bold text-gray-900 mb-1 truncate">{{ bookmark.ebook?.title || 'Untitled File' }}</h2>
                                <div class="flex items-center gap-3 text-base text-gray-500 mb-2">
                                    <span v-if="bookmark.ebook?.author"><i class="pi pi-user mr-1"></i>{{ bookmark.ebook.author }}</span>
                                </div>
                                <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                    <span><i class="pi pi-calendar mr-1"></i>{{ formatDate(bookmark.created_at) }}</span>
                                </div>
                                <div class="flex gap-2 mt-2">
                                    <button @click="goToReader(bookmark.ebook)" class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-semibold shadow">
                                        <i class="pi pi-book-open"></i> Open
                                    </button>
                                    <button @click.stop="deleteBookmark(bookmark)" class="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded shadow text-xs font-semibold flex items-center gap-1 transition-all">
                                        <i class="pi pi-trash"></i> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-12 flex justify-center">
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

const goToReader = (ebook) => {
    if (!ebook) return;
    if (ebook.ebook_type?.name?.toLowerCase() === 'video') {
        // If you have a videoId, extract and pass it here
        router.push({
            path: `/reader/${ebook.id}`,
            query: {
                type: 'video',
                ebookId: ebook.id
            }
        });
    } else {
        router.push({
            path: `/reader/${ebook.id}`,
            query: {
                type: 'pdf',
                ebookId: ebook.id
            }
        });
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

const getEbookTypeIcon = (ebook) => {
    const type = ebook?.ebook_type?.name?.toLowerCase() || '';
    if (type.includes('pdf')) return 'pi pi-file-pdf';
    if (type.includes('video')) return 'pi pi-video';
    if (type.includes('audio')) return 'pi pi-volume-up';
    return 'pi pi-book';
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
