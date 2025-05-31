<script setup>
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';

import BorrowingHistory from '@/components/dashboard/BorrowingHistory.vue';
import DashboardCategories from '@/components/dashboard/DashboaredCategories.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
</script>
<template>
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-6">
            <BorrowingHistory />
            <BestSellingWidget />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <DashboardCategories />
            <NotificationsWidget />
        </div>
    </div>
</template>
