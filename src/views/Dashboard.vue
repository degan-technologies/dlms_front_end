<script setup>
import AdminLoanHistory from '@/components/dashboard/AdminLoanHistory.vue';
import AdminNotifications from '@/components/dashboard/AdminNotifications.vue';
import BorrowingHistory from '@/components/dashboard/BorrowingHistory.vue';
import DashboardCategories from '@/components/dashboard/DashboaredCategories.vue';
import ReadingPerformanceWidget from '@/components/dashboard/ReadingPerformanceWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import NotificationsWidget from '@/components/dashboard/SuperAdminNotifications.vue.vue';
import { useAuthStore } from '@/stores/authStore';
import LibrarianNotifications from '@/views/pages/library/LibrarianNotifications.vue';
import Cookies from 'js-cookie';
import { computed, onMounted, watch } from 'vue';

const authStore = useAuthStore();
const user = computed(() => authStore.getUser || {});
const userRoles = user.value.roles.map((role) => role.name);
onMounted(() => {
    const token = Cookies.get('access_token');
    if (token && !user.value) {
        authStore.authCheck();
    }
});
watch(
    () => user.value,
    (newUser) => {
        if (!newUser) {
            authStore.authCheck();
        }
    },
    { immediate: true }
);
</script>
<template>
    <div class="card min-h-screen w-full md:py-8 md:px-2 flex flex-col gap-8">
        <!-- Dashboard Header -->
        <div class="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2 pl-4">
            <div>
                <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome to the Dashboard</h1>
                <p class="text-slate-600 dark:text-slate-300 text-base pl-2">Overview and quick insights for your digital library</p>
            </div>
            <!-- Optionally, add quick actions or user info here -->
        </div>
        <!-- Stats Widget -->
        <div class="w-full max-w-7xl mx-auto">
            <StatsWidget />
        </div>
        <div>
            <ReadingPerformanceWidget />
        </div>
        <!-- Main Content Grid -->
        <div class="w-full mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
            <!-- Middle: Categories -->
            <div class="flex flex-col h-full">
                <div class="rounded-2xl md:p-6 flex-1 flex flex-col">
                    <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Categories</h2>
                    <DashboardCategories />
                </div>
            </div>
            <!-- Left: Borrowing History -->
            <div class="flex flex-col h-full" v-if="userRoles.includes('librarian') || userRoles.includes('admin')">
                <div class="rounded-2xl md:p-6 flex-1 flex flex-col" v-if="userRoles.includes('librarian')">
                    <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Borrowing History</h2>
                    <BorrowingHistory />
                </div>
                <div class="rounded-2xl md:p-6 flex-1 flex flex-col" v-else-if="userRoles.includes('admin')">
                    <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Borrowing History</h2>
                    <AdminLoanHistory />
                </div>
            </div>
            <!-- Right: Notifications -->
        </div>
        <div class="flex flex-col h-full">
            <div class="rounded-2xl md:p-6 flex-1 flex flex-col" v-if="userRoles.includes('admin')">
                <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Notifications</h2>
                <AdminNotifications />
            </div>
            <div class="rounded-2xl md:p-6 flex-1 flex flex-col" v-else-if="userRoles.includes('librarian')">
                <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Notifications</h2>
                <LibrarianNotifications />
            </div>
            <div class="rounded-2xl md:p-6 flex-1 flex flex-col" v-else>
                <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Notifications</h2>
                <NotificationsWidget />
            </div>
        </div>
    </div>
</template>
