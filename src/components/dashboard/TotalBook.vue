<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Cookies from 'js-cookie';

const menu = ref(null)

const items = ref([
    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
    { label: 'Remove', icon: 'pi pi-fw pi-trash' }
])

const loanHistory = ref([])
const statusFilter = ref('all')

// Pagination state
const currentPage = ref(1)
const perPage = ref(7)
const totalPages = ref(1)
const totalRecords = ref(0)

const fetchLoans = async (page = 1) => {
    const token = Cookies.get('access_token') || localStorage.getItem('access_token');
    try {
        const response = await axios.get('http://localhost:8000/api/loan-history', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                page,
                per_page: perPage.value
            }
        });
        loanHistory.value = response.data.data
        totalPages.value = response.data.pagination.total_pages
        totalRecords.value = response.data.pagination.total_records
        currentPage.value = response.data.pagination.current_page
    } catch (error) {
        console.error('Failed to fetch loan history:', error);
    }
}

onMounted(() => {
    fetchLoans()
})

// Computed filtered list
const filteredLoans = computed(() => {
    if (statusFilter.value === 'all') return loanHistory.value;
    return loanHistory.value.filter(loan => loan.status === statusFilter.value);
});

// Pagination controls
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        fetchLoans(page)
    }
}
</script>

<template>
    <div class="card mt-8 shadow-lg border border-gray-200 rounded-xl" style="font-size: 1.1rem; background: linear-gradient(135deg, #f8fafc 60%, #e0f7fa 100%);">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
                <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="font-extrabold text-2xl bg-gradient-to-r from-green-500 via-blue-500 to-teal-400 bg-clip-text text-transparent drop-shadow">
                    Borrowing Status
                </span>
            </div>
            <router-link to="/books/history">
                <button class="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 shadow transition font-semibold">
                    Detail
                </button>
            </router-link>
        </div>
        <div class="mb-4 flex items-center gap-2">
            <label class="font-medium text-green-700"> Status:</label>
            <select v-model="statusFilter" class="border rounded px-2 py-1 focus:ring-2 focus:ring-green-300">
                <option value="all">All Borrowing Status</option>
                <option value="returned">Returned</option>
                <option value="not returned">Not Returned</option>
            </select>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full border-collapse" style="font-size: 1.08rem;">
                <thead>
                    <tr class="bg-gray-100 dark:bg-gray-800">
                        <th class="py-3 px-4 text-left font-semibold w-12">No</th>
                        <th class="py-3 px-4 text-left font-semibold">User</th>
                        <th class="py-3 px-2 text-left font-semibold">Book</th>
                        <th class="py-3 px-2 text-left font-semibold"> Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(loan, idx) in filteredLoans" :key="loan.loan_id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td class="py-4 px-3 font-small">{{ idx + 1 + (currentPage - 1) * perPage }}</td>
                        <td class="py-3 px-4">
                            <span class="font-small">
                                {{ loan.user?.username || loan.user?.email || 'Unknown User' }}
                            </span>
                        </td>
                        <td class="py-3 px-4">
                            <span class="font-small">
                            {{ loan.book?.title || 'Unknown Book' }}
                        </span>
                        </td>
                        <td class="py-3 px-4">
                            <span
                                :class="[
                                    'px-1 py-1 rounded-full text-xs font-bold shadow',
                                    loan.status === 'returned'
                                        ? 'bg-green-200 text-green-900 border border-green-400'
                                        : 'bg-red-200 text-red-900 border border-red-400'
                                ]"
                            >
                                {{ loan.status === 'returned' ? 'Returned' : 'Not Returned' }}
                            </span>
                        </td>
                    </tr>
                    <tr v-if="filteredLoans.length === 0">
                        <td colspan="4" class="py-4 text-center text-gray-400">No borrowing records found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- Pagination Controls -->
        <div class="flex justify-center items-center gap-2 mt-4">
            <button
                class="px-3 py-1 rounded border transition font-semibold
                    hover:bg-green-600 hover:text-white
                "
                :class="currentPage === 1
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-green-500 text-white'"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
            >Prev</button>
            <span class="font-semibold text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>
            <button
                class="px-3 py-1 rounded border transition font-semibold
                    hover:bg-green-600 hover:text-white
                "
                :class="currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-green-500 text-white'"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
            >Next</button>
        </div>
    </div>
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
