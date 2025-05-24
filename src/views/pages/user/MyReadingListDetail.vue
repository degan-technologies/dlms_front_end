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
                    <div class="text-blue-600 font-semibold mb-1 tracking-widest uppercase">My Collection</div>
                    <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ collection?.name }}</h1>
                    <div class="flex items-center gap-3 text-gray-500 text-sm">
                        <span v-if="collection?.user"> <i class="pi pi-user text-blue-400"></i> {{ collection.user.username }} </span>
                        <span v-if="collection?.created_at"> <i class="pi pi-calendar text-blue-400"></i> Created {{ formatDate(collection.created_at) }} </span>
                        <span v-if="collection?.ebooks?.length"> <i class="pi pi-book text-blue-400"></i> {{ collection.ebooks.length }} Resources </span>
                    </div>
                </div>
                <div class="mt-6 md:mt-0 flex gap-2">
                    <button class="px-4 py-2 bg-white text-blue-700 border border-blue-200 rounded-lg font-semibold shadow hover:bg-blue-50 transition-all flex items-center gap-2"><i class="pi pi-share-alt"></i> Share</button>
                </div>
            </div>
            <div v-if="loading" class="flex justify-center items-center py-24">
                <i class="pi pi-spin pi-spinner text-blue-600 text-4xl"></i>
            </div>
            <div v-else-if="!collection || !collection.ebooks || collection.ebooks.length === 0" class="bg-white p-12 rounded-lg text-center shadow-sm">
                <i class="pi pi-book text-5xl text-gray-300 mb-4"></i>
                <h3 class="text-2xl font-semibold mb-2">No Resources in this List</h3>
                <p class="text-gray-500 max-w-md mx-auto">This collection currently has no resources.</p>
            </div>
            <div v-else>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div v-for="ebook in paginatedEbooks" :key="ebook.id" class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 relative">
                        <!-- Decorative color bar -->
                        <div class="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 via-sky-400 to-cyan-400"></div>
                        <div class="absolute top-3 left-4 z-10 flex items-center gap-2">
                            <span class="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow">IN LIST</span>
                            <span class="px-2 py-1 bg-white/80 text-blue-700 text-xs font-semibold rounded shadow border border-blue-100">{{ ebook.file_format }}</span>
                        </div>
                        <div class="absolute top-3 right-4 z-10">
                            <span class="px-2 py-1 bg-black/70 text-xs font-medium rounded shadow text-white">ISBN: {{ ebook.isbn }}</span>
                        </div>
                        <div class="relative h-48 bg-gradient-to-t from-gray-100 to-white flex items-center justify-center">
                            <img
                                :src="ebook.book_item?.cover_image_url || 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'"
                                :alt="ebook.book_item?.title"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div class="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-xs text-blue-700 shadow flex items-center gap-1">
                                <i v-if="ebook.file_format === 'YOUTUBE'" class="pi pi-youtube text-red-500"></i>
                                <i v-else class="pi pi-book text-blue-600"></i>
                                <span>{{ ebook.file_format }}</span>
                            </div>
                        </div>
                        <div class="p-5 flex flex-col gap-2">
                            <h3 class="font-bold text-lg text-gray-900 line-clamp-2 mb-1">{{ ebook.book_item?.title }}</h3>
                            <p class="text-gray-500 text-sm mb-1 flex items-center gap-2"><i class="pi pi-user text-blue-400"></i> {{ ebook.book_item?.author }}</p>
                            <p class="text-gray-600 text-xs italic mb-2 line-clamp-2">{{ ebook.book_item?.description }}</p>
                            <div class="flex items-center gap-2 mt-2"></div>
                            <button @click="goToEbookDetail(ebook)" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all font-semibold shadow">
                                <i class="pi pi-eye"></i> View Resource
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mt-10 flex justify-center">
                    <Paginator
                        :rows="ebooksPerPage"
                        :totalRecords="collection.ebooks.length"
                        v-model:first="ebooksFirst"
                        :rowsPerPageOptions="[6, 9, 12, 18]"
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
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const collection = ref(null);
const ebooksFirst = ref(0);
const ebooksPerPage = ref(9);

const fetchCollection = async () => {
    loading.value = true;
    try {
        const response = await axiosInstance.get(`/my-collections/${route.params.id}`, {
            params: {
                with: 'ebooks,ebooks.bookItem,user'
            }
        });
        collection.value = response.data.data;
    } catch (error) {
        collection.value = null;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchCollection();
});

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const goToEbookDetail = (ebook) => {
    if (ebook && ebook.book_item_id) {
        router.push(`/reader/${ebook.book_item_id}`);
    }
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
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
