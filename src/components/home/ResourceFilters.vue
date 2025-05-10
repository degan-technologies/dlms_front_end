<template>
    <div class="lg:w-1/4 bg-white rounded-xl p-5 shadow-sm h-fit border border-gray-200">
        <div class="mb-6">
            <h3 class="font-semibold text-lg mb-3 flex items-center justify-between">
                <span>Filters</span>
                <button @click="resetFilters" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Reset</button>
            </h3>
            <div class="relative">
                <input
                    type="text"
                    v-model="filterKeyword"
                    placeholder="Filter by keyword"
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    @keyup.enter="fetchBookItem"
                />
                <button @click="fetchBookItem" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-indigo-600">
                    <i class="pi pi-search"></i>
                </button>
            </div>
        </div>

        <!-- Resource Type Filter -->
        <div class="border-t border-gray-200 py-4">
            <h4 class="font-medium mb-3">Resource Type</h4>
            <div class="space-y-2">
                <div v-for="type in resourceTypes" :key="type.id" class="flex items-center">
                    <input :id="'filter-type-' + type.id" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" :checked="activeFilters.itemType.includes(type.id)" @change="toggleFilter('itemType', type.id)" />
                    <label :for="'filter-type-' + type.id" class="ml-2 text-gray-700">{{ type.name }}</label>
                </div>
            </div>
        </div>

        <!-- Category Filter -->
        <div class="border-t border-gray-200 py-4">
            <h4 class="font-medium mb-3">Category</h4>
            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                <div v-for="category in categories" :key="category.id" class="flex items-center">
                    <input
                        :id="'filter-category-' + category.id"
                        type="checkbox"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                        :checked="activeFilters.categoryId.includes(category.id)"
                        @change="toggleFilter('categoryId', category.id)"
                    />
                    <label :for="'filter-category-' + category.id" class="ml-2 text-gray-700 flex items-center gap-2">
                        {{ category.name }}
                        <span class="text-xs text-gray-500">({{ category.count }})</span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Language Filter -->
        <div class="border-t border-gray-200 py-4">
            <h4 class="font-medium mb-3">Language</h4>
            <div class="space-y-2">
                <div v-for="language in languages" :key="language.code" class="flex items-center">
                    <input
                        :id="'filter-lang-' + language.code"
                        type="radio"
                        name="language"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        :checked="activeFilters.language === language.code"
                        @change="applyFilter('language', language.code)"
                    />
                    <label :for="'filter-lang-' + language.code" class="ml-2 text-gray-700">{{ language.name }}</label>
                </div>
            </div>
        </div>

        <!-- Grade Level Filter -->
        <div class="border-t border-gray-200 py-4">
            <h4 class="font-medium mb-3">Grade Level</h4>
            <div class="grid grid-cols-2 gap-2">
                <div v-for="grade in gradeOptions" :key="grade.id" class="flex items-center">
                    <input :id="'filter-grade-' + grade.id" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" :checked="activeFilters.gradeLevel.includes(grade.id)" @change="toggleFilter('gradeLevel', grade.id)" />
                    <label :for="'filter-grade-' + grade.id" class="ml-2 text-gray-700">{{ grade.name }}</label>
                </div>
            </div>
        </div>
        <!-- Apply Button -->
        <div class="pt-4 border-t border-gray-200">
            <button @click="fetchBookItem" class="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors">Apply Filters</button>
        </div>
    </div>
</template>

<script setup>
import { useHomeStore } from '@/stores/homeStore';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const homeStore = useHomeStore();
const { activeFilters, filterKeyword } = storeToRefs(homeStore);

const { resetFilters, applyFilter, removeFilter, fetchBookItem } = homeStore;

// Filter options
const resourceTypes = ref([
    { id: 'physical', name: 'Physical Books' },
    { id: 'ebook', name: 'eBooks' },
    { id: 'pdf', name: 'PDF Documents' },
    { id: 'video', name: 'Videos' },
    { id: 'audio', name: 'Audio' }
]);

const categories = ref([
    { id: 1, name: 'Science', count: 247 },
    { id: 2, name: 'Mathematics', count: 183 },
    { id: 3, name: 'Literature', count: 325 },
    { id: 4, name: 'History', count: 210 },
    { id: 5, name: 'Computer Science', count: 176 },
    { id: 6, name: 'Arts & Music', count: 154 }
]);

const languages = ref([
    { name: 'All', code: '' },
    { name: 'English', code: 'en' },
    { name: 'French', code: 'fr' },
    { name: 'Spanish', code: 'es' },
    { name: 'Arabic', code: 'ar' }
]);

const gradeOptions = ref([
    { id: '9', name: 'Grade 9' },
    { id: '10', name: 'Grade 10' },
    { id: '11', name: 'Grade 11' },
    { id: '12', name: 'Grade 12' }
]);

// Methods
const toggleFilter = (filterType, value) => {
    const index = activeFilters.value[filterType].indexOf(value);
    if (index === -1) {
        applyFilter(filterType, value);
    } else {
        removeFilter(filterType, null, index);
    }
};
</script>
