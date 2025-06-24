<script setup>
import axiosInstance from '@/util/axios-config';
import Header from '@/views/pages/home/Header.vue';
import Paginator from 'primevue/paginator';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(true);
const myCollections = ref([]);
const first = ref(0);
const collectionsPerPage = ref(12);
const totalRecords = ref(0);

const fetchMyCollections = async () => {
    loading.value = true;
    try {
        const currentPage = Math.floor(first.value / collectionsPerPage.value) + 1;
        const response = await axiosInstance.get('/my-collections', {
            params: {
                with: 'user,ebooks,ebooks.bookItem',
                per_page: collectionsPerPage.value,
                page: currentPage
            }
        });
        myCollections.value = response.data.data || [];
        totalRecords.value = response.data.pagination?.total || 0;
    } catch (error) {
        myCollections.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchMyCollections();
});

const createCollection = () => {
    router.push('/student/create-reading-list');
};

const viewCollection = (list) => {
    router.push({
        name: 'my-reading-list-detail',
        params: { id: list.id }
    });
};

const onPageChange = (event) => {
    first.value = event.first;
    collectionsPerPage.value = event.rows;
    fetchMyCollections();
};

const getCollectionGradient = (list) => {
    if (list.ebooks_count?.by_type?.video > 0) {
        return 'bg-gradient-to-br from-blue-500 to-blue-300';
    } else if (list.ebooks_count?.by_type?.pdf > 0) {
        return 'bg-gradient-to-br from-red-500 to-red-300';
    } else {
        return 'bg-gradient-to-br from-purple-500 to-purple-300';
    }
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>
<template>
    <div class="layout-content">
        <Header />
        <section class="bg-white py-0 px-0 min-h-screen">
            <!-- Visually rich header -->
            <div class="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-sm border-b border-gray-200">
                <div class="max-w-7xl mx-auto py-4 px-5 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h5 class="text-3xl md:text-3xl font-extrabold text-gray-900 mb-2">My Reading Lists</h5>
                        <p class="text-gray-700 text-lg">Your personal collections to organize and accelerate your learning</p>
                    </div>
                </div>
            </div>
            <div class="max-w-7xl mx-auto pt-8">
                <!-- Loading state -->
                <div v-if="loading" class="flex justify-center items-center py-16">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span class="text-gray-600">Loading your collections...</span>
                    </div>
                </div>
                <!-- Empty state -->
                <div v-else-if="myCollections.length === 0" class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-folder-open text-2xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">No Collections Yet</h3>
                    <p class="text-gray-600 mb-4">Create your first collection to organize your favorite resources.</p>
                    <button @click="createCollection" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Create Collection</button>
                </div>
                <!-- Collections Grid -->
                <div v-else>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div v-for="list in myCollections" :key="list.id" @click="viewCollection(list)" class="group cursor-pointer">
                            <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 h-full flex flex-col">
                                <!-- Collection header with fixed height - Udemy-inspired design -->
                                <div class="relative h-48 bg-gray-50 overflow-hidden">
                                    <!-- Dynamic gradient based on content types -->
                                    <div :class="getCollectionGradient(list)" class="absolute inset-0"></div>
                                    <div class="absolute inset-0 opacity-10 bg-white bg-opacity-5"></div>
                                    <!-- Content type icons display -->
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <div class="flex items-center gap-3">
                                            <div
                                                v-if="list.ebooks_count?.by_type?.pdf > 0"
                                                class="w-14 h-14 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                                            >
                                                <i class="pi pi-file-pdf text-xl text-red-500"></i>
                                            </div>
                                            <div
                                                v-if="list.ebooks_count?.by_type?.video > 0"
                                                class="w-14 h-14 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
                                            >
                                                <i class="pi pi-video text-xl text-blue-500"></i>
                                            </div>
                                            <div v-if="!list.ebooks_count?.by_type?.pdf && !list.ebooks_count?.by_type?.video" class="w-14 h-14 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                                                <i class="pi pi-bookmark text-xl text-purple-600"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Total count badge -->
                                    <div class="absolute top-4 right-4">
                                        <div class="bg-white bg-opacity-90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-white border-opacity-20">
                                            {{ list.ebooks_count?.total || list.ebooks?.length || 0 }} resources
                                        </div>
                                    </div>
                                    <!-- Content type breakdown badges -->
                                    <div class="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                                        <div v-if="list.ebooks_count?.by_type?.pdf > 0" class="bg-red-500 bg-opacity-90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                                            <i class="pi pi-file-pdf text-xs"></i>
                                            <span>{{ list.ebooks_count.by_type.pdf }}</span>
                                        </div>
                                        <div v-if="list.ebooks_count?.by_type?.video > 0" class="bg-blue-500 bg-opacity-90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                                            <i class="pi pi-video text-xs"></i>
                                            <span>{{ list.ebooks_count.by_type.video }}</span>
                                        </div>
                                        <div v-if="list.ebooks_count?.downloadable > 0" class="bg-green-500 bg-opacity-90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                                            <i class="pi pi-download text-xs"></i>
                                            <span>{{ list.ebooks_count.downloadable }}</span>
                                        </div>
                                    </div>
                                </div>
                                <!-- Collection info with flex-grow to fill remaining space -->
                                <div class="p-4 flex-1 flex flex-col">
                                    <h3 class="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {{ list.name }}
                                    </h3>
                                    <p class="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed flex-grow">
                                        {{ list.description || 'A curated collection of resources.' }}
                                    </p>
                                    <div class="flex items-center gap-2 mb-3 text-sm text-gray-500">
                                        <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                            <i class="pi pi-user text-gray-600 text-xs"></i>
                                        </div>
                                        <span>{{ list.user?.username || 'Anonymous' }}</span>
                                        <span class="text-gray-400">•</span>
                                        <span>{{ formatDate(list.created_at) }}</span>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3 mb-4">
                                        <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                            <div class="flex items-center justify-between">
                                                <span>PDF Files:</span>
                                                <span class="font-semibold text-red-600">{{ list.ebooks_count?.by_type?.pdf || 0 }}</span>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <span>Videos:</span>
                                                <span class="font-semibold text-blue-600">{{ list.ebooks_count?.by_type?.video || 0 }}</span>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <span>Downloadable:</span>
                                                <span class="font-semibold text-green-600">{{ list.ebooks_count?.downloadable || 0 }}</span>
                                            </div>
                                            <div class="flex items-center justify-between">
                                                <span>Total:</span>
                                                <span class="font-semibold text-gray-700">{{ list.ebooks_count?.total || 0 }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mt-auto">
                                        <i class="pi pi-eye"></i>
                                        <span>View Collection</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-8 flex justify-center">
                        <Paginator
                            :rows="collectionsPerPage"
                            :totalRecords="totalRecords"
                            v-model:first="first"
                            :rowsPerPageOptions="[8, 12, 16, 24]"
                            @page="onPageChange($event)"
                            class="border-none bg-transparent"
                            :template="{
                                '640px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
                                '960px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
                                '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport'
                            }"
                            currentPageReportTemplate="{first} to {last} of {totalRecords}"
                        />
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
