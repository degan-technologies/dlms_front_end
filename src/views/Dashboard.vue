<script setup>
import Loan from '@/components/dashboard/Loan.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import RecentSalesWidget from '@/components/dashboard/RecentSalesWidget.vue';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import TotalBook from '@/components/dashboard/TotalBook.vue';
import ReadingPerformanceWidget from '../components/dashboard/ReadingPerformanceWidget.vue';
</script>
<template>
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-6">
            <TotalBook />
            <BestSellingWidget />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <Loan />
            <NotificationsWidget />
        </div>
    </div>
</template>
