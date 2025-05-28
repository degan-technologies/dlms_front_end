<template>
    <section class="bg-gradient-to-b from-blue-50 to-white min-h-screen py-12 px-5">
        <div class="max-w-5xl mx-auto">
            <!-- Back button -->
            <div class="mb-8 flex items-center gap-2">
                <button @click="goBack" class="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded shadow-sm font-medium transition-all">
                    <i class="pi pi-arrow-left"></i>
                    <span>Back</span>
                </button>
            </div>
            <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
                <div>
                    <div class="text-blue-700 font-semibold mb-1 tracking-widest uppercase">EBook Collection</div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ collection.name }}</h1>
                    <div class="flex items-center gap-3 text-gray-500 text-sm">
                        <span> <i class="pi pi-user text-blue-400"></i> {{ collection.user.username }} </span>
                        <span> <i class="pi pi-calendar text-blue-400"></i> Created {{ formatDate(collection.created_at) }} </span>
                        <span> <i class="pi pi-book text-blue-400"></i> {{ collection.ebooks.length }} EBooks </span>
                    </div>
                </div>
                <div class="mt-6 md:mt-0 flex gap-2">
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all flex items-center gap-2"><i class="pi pi-share-alt"></i> Share</button>
                </div>
            </div>
            <div v-if="loading" class="flex justify-center items-center py-24">
                <i class="pi pi-spin pi-spinner text-blue-600 text-4xl"></i>
            </div>
            <div v-else-if="!collection || !collection.ebooks || collection.ebooks.length === 0" class="bg-white p-12 rounded-lg text-center shadow-sm">
                <i class="pi pi-book text-5xl text-gray-300 mb-4"></i>
                <h3 class="text-2xl font-semibold mb-2">No EBooks in this Collection</h3>
                <p class="text-gray-500 max-w-md mx-auto">This collection currently has no ebooks.</p>
            </div>
            <div v-else>
                <!-- Carousel style for ebook cards -->
                <div class="relative">
                    <button v-if="ebooksFirst > 0" @click="prevPage" class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-2 shadow transition-all"><i class="pi pi-chevron-left"></i></button>
                    <div class="flex overflow-x-auto gap-8 px-12 py-4 scrollbar-hide">
                        <div v-for="ebook in paginatedEbooks" :key="ebook.id" class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col md:flex-row mb-6">
                            <img :src="ebook.cover_image_url" alt="Ebook cover" class="w-full md:w-40 h-48 object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none" />
                            <div class="p-5 flex flex-col gap-2 flex-1">
                                <h3 class="font-bold text-lg text-gray-900 line-clamp-2 mb-1">{{ ebook.title }}</h3>
                                <p class="text-gray-500 text-sm mb-1 flex items-center gap-2"><i class="pi pi-user text-blue-400"></i> {{ ebook.author }}</p>
                                <p class="text-gray-600 text-xs italic mb-2 line-clamp-2">{{ ebook.description }}</p>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">Pages: {{ ebook.pages }}</span>
                                    <span class="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">Added: {{ formatDate(ebook.created_at) }}</span>
                                </div>
                                <div class="flex gap-2 mt-4">
                                    <button class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-yellow-50 transition-all shadow group" @click="bookmarkEbook(ebook)" :title="'Bookmark'">
                                        <i class="pi pi-bookmark text-xl group-hover:text-yellow-500 text-gray-400"></i>
                                    </button>
                                    <button class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all font-semibold shadow"><i class="pi pi-eye"></i> View Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button v-if="ebooksFirst + ebooksPerPage < collection.ebooks.length" @click="nextPage" class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-2 shadow transition-all">
                        <i class="pi pi-chevron-right"></i>
                    </button>
                </div>
                <div class="mt-10 flex justify-center">
                    <Paginator
                        :rows="ebooksPerPage"
                        :totalRecords="collection.ebooks.length"
                        v-model:first="ebooksFirst"
                        :rowsPerPageOptions="[3, 6, 9, 12]"
                        @page="onEbooksPageChange($event)"
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
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const loading = ref(false);
const ebooksFirst = ref(0);
const ebooksPerPage = ref(6);

// Dummy data for the collection and ebooks
const collection = ref({
    name: 'Modern Science EBooks',
    user: { username: 'john_doe' },
    created_at: '2023-01-15T10:00:00Z',
    ebooks: Array.from({ length: 18 }).map((_, i) => ({
        id: i + 1,
        title: `EBook Title ${i + 1}`,
        author: `Author ${i + 1}`,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus.',
        cover_image_url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        file_format: i % 2 === 0 ? 'PDF' : 'EPUB',
        isbn: `978-00000000${100 + i}`,
        pages: 100 + i * 10,
        created_at: `2023-01-${(i % 28) + 1}T10:00:00Z`
    }))
});

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const goBack = () => {
    router.back();
};

const paginatedEbooks = computed(() => {
    if (!collection.value || !collection.value.ebooks) return [];
    return collection.value.ebooks.slice(ebooksFirst.value, ebooksFirst.value + ebooksPerPage.value);
});

const onEbooksPageChange = (event) => {
    ebooksFirst.value = event.first;
    ebooksPerPage.value = event.rows;
};

const prevPage = () => {
    if (ebooksFirst.value > 0) {
        ebooksFirst.value = Math.max(0, ebooksFirst.value - ebooksPerPage.value);
    }
};
const nextPage = () => {
    if (ebooksFirst.value + ebooksPerPage.value < collection.value.ebooks.length) {
        ebooksFirst.value = Math.min(collection.value.ebooks.length - ebooksPerPage.value, ebooksFirst.value + ebooksPerPage.value);
    }
};

const bookmarkEbook = async (ebook) => {
    if (!ebook || !ebook.id) return;
    try {
        await axiosInstance.post('/bookmarks', { e_book_id: ebook.id });
        toast.add({
            severity: 'success',
            summary: 'Bookmarked',
            detail: 'Ebook bookmarked successfully',
            life: 3000
        });
    } catch (err) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: err.response?.data?.message || 'Failed to bookmark',
            life: 4000
        });
    }
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
