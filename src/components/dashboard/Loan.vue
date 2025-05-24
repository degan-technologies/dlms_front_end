<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';

const categories = ref([]);
const loading = ref(true);
const error = ref(null);

const currentPage = ref(1);
const perPage = ref(6); // Set to 4 per your requirement
const totalPages = ref(1);

// Get token from cookies or local storage
const token = Cookies.get('access_token') || localStorage.getItem('access_token');

const fetchCategories = async (page = 1) => {
    loading.value = true;
    if (!token) {
        error.value = "Authentication token not found.";
        loading.value = false;
        return;
    }

    try {
        const response = await axios.get('http://localhost:8000/api/category', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            },
            params: {
                page,
                per_page: perPage.value,
                t: Date.now() // prevent caching (bypass 304)
            }
        });

        categories.value = Array.isArray(response.data)
            ? response.data
            : response.data.data ?? [];
        // Update pagination state
        totalPages.value = response.data.pagination?.total_pages || 1;
        currentPage.value = response.data.pagination?.current_page || 1;

    } catch (err) {
        console.error('Error fetching categories:', err);
        error.value = 'Failed to fetch categories.';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchCategories();
});

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        fetchCategories(page);
    }
};
</script>

<template>
    <div class="card p-4 shadow mb-10 rounded-lg bg-white">
        <div class="font-extrabold text-2xl mb-4 text-transparent bg-gradient-to-r from-green-500 via-blue-500 to-teal-400 bg-clip-text drop-shadow flex items-center gap-2">
            <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H4a1 1 0 00-1 1v2a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1z"/>
            </svg>
            Total Books of FIS 
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="text-gray-500">Loading categories...</div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-500 mb-2">{{ error }}</div>

        <!-- Data Table -->
        <DataTable
            v-if="!loading && !error && categories.length"
            :value="categories"
            :rows="perPage"
            :paginator="false"
            responsiveLayout="scroll"
        >
            <Column header="No" style="width: 10%">
                <template #body="slotProps">
                    {{ slotProps.index + 1 + (currentPage - 1) * perPage }}
                </template>
            </Column>
            <Column field="category_name" header="Category Name" :sortable="true" style="width: 60%" />
            <Column field="total_books" header="Total Books" :sortable="true" style="width: 30%">
                <template #body="slotProps">
                    {{ slotProps.data.total_books }}
                </template>
            </Column>
        </DataTable>

        <!-- Empty State -->
        <div v-else-if="!loading && !categories.length && !error" class="text-gray-500">
            No categories found.
        </div>
        <!-- Pagination Controls -->
        <div class="flex justify-center items-center gap-2 mt-4">
            <button
                class="px-3 py-1 rounded border transition font-semibold hover:bg-green-600 hover:text-white"
                :class="currentPage === 1
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-green-500 text-white'"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
            >
                <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
            </button>
            <span class="font-semibold text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>
            <button
                class="px-3 py-1 rounded border transition font-semibold hover:bg-green-600 hover:text-white"
                :class="currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-green-500 text-white'"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
            >
                Next
                <svg class="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.card {
    max-width: 800px;
    margin: 0 auto;
}
</style>
