<script setup>
import ResourceFilters from '@/components/home/ResourceFilters.vue';
import ResourceGrid from '@/components/home/ResourceGrid.vue';
import { ref } from 'vue';

// Current active filters
const currentFilters = ref({});

// Handle filter changes from ResourceFilters component
const handleFiltersChanged = (filters) => {
    console.log('Filters received from ResourceFilters:', filters);
    currentFilters.value = { ...filters };
};

// Handle filter reset from ResourceGrid component
const handleFilterReset = () => {
    console.log('Filter reset requested');
    currentFilters.value = {};
};
</script>
<template>
    <div class="min-h-screen bg-gray-50 pt-16">
        <div class="container mx-auto px-4 py-8">
            <!-- Page Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Educational Resources</h1>
                <p class="text-gray-600">Discover books, ebooks, and learning materials</p>
            </div>

            <!-- Main Content -->
            <div class="flex gap-6">
                <!-- Filters Sidebar -->
                <ResourceFilters @filtersChanged="handleFiltersChanged" />

                <!-- Resources Grid -->
                <ResourceGrid :filters="currentFilters" @filterReset="handleFilterReset" />
            </div>
        </div>
    </div>
</template>
<style scoped>
/* Add any additional styling if needed */
</style>
