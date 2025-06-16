<script setup>
import BorrowingHistory from '@/components/dashboard/BorrowingHistory.vue';
import DashboardCategories from '@/components/dashboard/DashboaredCategories.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import ReadingPerformanceWidget from '@/components/dashboard/ReadingPerformanceWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
</script>
<template>
    <div class="card min-h-screen w-full md:py-8 md:px-2 flex flex-col gap-8">
        <!-- Dashboard Header -->
        <div class="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <div>
                <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome to the Dashboard</h1>
                <p class="text-slate-600 dark:text-slate-300 text-base">Overview and quick insights for your digital library</p>
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
            <div class="flex flex-col h-full">
                <div class="rounded-2xl md:p-6 flex-1 flex flex-col">
                    <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Borrowing History</h2>
                    <BorrowingHistory />
                </div>
            </div>
        </div>
        <!-- Right: Notifications -->
        <div class="flex flex-col h-full">
            <div class="rounded-2xl md:p-6 flex-1 flex flex-col">
                <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Notifications</h2>
                <NotificationsWidget />
            </div>
        </div>
    </div>
</template>
