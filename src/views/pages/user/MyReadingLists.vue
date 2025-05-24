<template>
    <section class="bg-white py-12 px-5">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <div class="text-blue-600 font-semibold mb-1">MY COLLECTIONS</div>
                    <h2 class="text-3xl font-bold">My Reading Lists</h2>
                </div>
                <div class="mt-4 md:mt-0">
                    <button @click="createCollection" class="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">Create Collection <i class="pi pi-plus"></i></button>
                </div>
            </div>
            <div v-if="loading" class="flex justify-center items-center py-16">
                <div class="flex flex-col items-center">
                    <i class="pi pi-spin pi-spinner text-3xl text-blue-600 mb-4"></i>
                    <span class="text-gray-600">Loading your collections...</span>
                </div>
            </div>
            <div v-else-if="myCollections.length === 0" class="bg-white p-8 rounded-lg text-center shadow-sm">
                <div class="flex flex-col items-center">
                    <i class="pi pi-folder-open text-4xl text-gray-300 mb-3"></i>
                    <h3 class="text-xl font-semibold mb-2">No Collections Yet</h3>
                    <p class="text-gray-500 max-w-md mx-auto">Create your first collection to organize your favorite resources.</p>
                    <button @click="createCollection" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all flex items-center gap-1">
                        <i class="pi pi-plus"></i>
                        <span>Create Collection</span>
                    </button>
                </div>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-2">
                <div
                    v-for="list in myCollections"
                    :key="list.id"
                    @click="viewCollection(list)"
                    class="cursor-pointer overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200"
                >
                    <div class="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-blue-500 via-sky-400 to-cyan-400"></div>
                    <div class="relative p-6 h-full flex flex-col justify-between z-10">
                        <div>
                            <h3 class="text-xl font-bold mb-2 text-gray-900">{{ list.name }}</h3>
                            <p class="text-gray-600 text-sm line-clamp-2 mb-4">{{ list.description }}</p>
                        </div>
                        <div class="flex items-center justify-between mt-2">
                            <span class="text-sm font-bold text-gray-700">{{ list.ebooks ? list.ebooks.length : 0 }} items</span>
                        </div>
                        <div v-if="list.user" class="flex items-center gap-2 mt-4">
                            <div class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                <i class="pi pi-user text-blue-600" v-if="!list.user.avatar"></i>
                                <img v-else :src="list.user.avatar" alt="Creator" class="w-full h-full object-cover" />
                            </div>
                            <span class="text-xs text-gray-700 font-medium">By {{ list.user.username }}</span>
                        </div>
                        <div class="absolute inset-0 bg-blue-50/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                            <button class="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 font-semibold">
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
                    class="border-none"
                    :loading="loading"
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
    </section>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
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
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
