<script setup>
import Loan from '@/components/dashboard/Loan.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import TotalBook from '@/components/dashboard/TotalBook.vue';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
</script>
<template>
    <div class="grid grid-cols-12 gap-8">
        <StatsWidget />

        <div class="col-span-12 xl:col-span-6">
            <TotalBook />
            <Loan />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <RevenueStreamWidget />
            <NotificationsWidget />
        </div>
    </div>
</template>
