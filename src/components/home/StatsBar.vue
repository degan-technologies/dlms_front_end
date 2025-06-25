<script setup>
import { ref, onMounted } from 'vue';
import Cookies from 'js-cookie';
import axiosInstance from '@/util/axios-config';

const totalBooks = ref(0);
const totalEbooks = ref(0);
const totalStudents = ref(0);
const totalVideos = ref(0);
const totalAudios = ref(0);
const totalLanguages = ref(0);

const fetchCounts = async () => {
    const token = Cookies.get('access_token') || localStorage.getItem('access_token');

    try {
        const response = await axiosInstance.get('/counts', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        totalBooks.value = response.data.total_books;
        totalEbooks.value = response.data.total_ebooks;
        totalStudents.value = response.data.total_students;
        totalVideos.value = response.data.total_videos;
        totalAudios.value = response.data.total_audios;
        totalLanguages.value = response.data.total_languages;
    } catch (error) {
        console.error('Error fetching counts:', error);
    }
};

onMounted(() => {
    fetchCounts();
});
</script>

<template>
    <section class="bg-white border-b border-slate-200 shadow-sm py-6">
        <div class="max-w-7xl mx-auto px-5 flex flex-wrap justify-between items-center gap-8">
            <div class="flex items-center gap-3">
                <i class="pi pi-book text-sky-600 text-xl"></i>
                <div>
                    <div class="font-bold text-xl">{{ totalBooks + totalEbooks }}+</div>
                    <div class="text-sm text-gray-500">Books & E-Books</div>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <i class="pi pi-video text-sky-600 text-xl"></i>
                <div>
                    <div class="font-bold text-xl">{{ totalVideos + totalAudios }}</div>
                    <div class="text-sm text-gray-500">Educational Videos</div>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <i class="pi pi-users text-sky-600 text-xl"></i>
                <div>
                    <div class="font-bold text-xl">{{ totalStudents }}+</div>
                    <div class="text-sm text-gray-500">Global Students</div>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <i class="pi pi-globe text-sky-600 text-xl"></i>
                <div>
                    <div class="font-bold text-xl">{{ totalLanguages }}</div>
                    <div class="text-sm text-gray-500">Languages</div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
tr:hover td {
    background-color: #f3f4f6;
    transition: background 0.2s;
}
.dark tr:hover td {
    background-color: #374151;
}
</style>
