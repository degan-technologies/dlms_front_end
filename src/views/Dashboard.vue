<script setup>
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';

import BorrowingHistory from '@/components/dashboard/BorrowingHistory.vue';
import DashboardCategories from '@/components/dashboard/DashboaredCategories.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
</script>
<template>
    <div class="card grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 md:gap-6 xl:gap-8">
        <!-- Stats Widget: Full width on mobile, half on md, 1/3 on xl -->
        <div class="col-span-1 md:col-span-2 xl:col-span-12">
            <StatsWidget />
        </div>

        <!-- Borrowing History & Best Selling: Stack on mobile, side by side on xl -->
        <div class="col-span-1 md:col-span-1 xl:col-span-6 flex flex-col gap-4">
            <BorrowingHistory />
            <BestSellingWidget />
        </div>
        <div class="col-span-1 md:col-span-1 xl:col-span-6 flex flex-col gap-4">
            <DashboardCategories />
            <NotificationsWidget />
        </div>
    </div>
</template>
