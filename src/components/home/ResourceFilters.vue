<template>
    <div class="w-full lg:w-1/4 bg-white shadow-sm border border-gray-200 overflow-hidden lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-5rem)] flex flex-col">
        <!-- Udemy-style Simple Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-900">Filter</h3>
                <div class="flex items-center gap-2">
                    <span v-if="getActiveFilterCount() > 0" class="bg-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                        {{ getActiveFilterCount() }}
                    </span>
                    <button @click="resetAndEmitFilters" class="text-purple-600 hover:text-purple-700 text-sm font-semibold transition-colors">Clear all</button>
                </div>
            </div>
        </div>

        <!-- Search Bar -->
        <div class="p-6 border-b border-gray-200 flex-shrink-0">
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="pi pi-search text-gray-400"></i>
                </div>
                <input
                    type="text"
                    v-model="filters.keyword"
                    placeholder="Search for anything"
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    @keyup.enter="applyFilters"
                />
            </div>
        </div>

        <!-- Filter Sections - Scrollable Container -->
        <div class="flex-1 overflow-y-auto">
            <div class="space-y-0">
                <!-- Format -->
                <div class="border-b border-gray-200">
                    <button @click="openSection = openSection === 'format' ? '' : 'format'" class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <span class="font-semibold text-gray-900">Format</span>
                        <i :class="openSection === 'format' ? 'pi pi-minus' : 'pi pi-plus'" class="text-gray-500"></i>
                    </button>
                    <div v-if="openSection === 'format'" class="px-6 pb-4">
                        <div class="flex gap-3">
                            <label v-for="option in formatOptions" :key="option.value" class="flex items-center cursor-pointer">
                                <input type="radio" :value="option.value" v-model="filters.format" class="mr-2" />
                                <span class="text-sm text-gray-700">{{ option.label }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Resource Type -->
                <div class="border-b border-gray-200">
                    <button @click="openSection = openSection === 'resourceType' ? '' : 'resourceType'" class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <span class="font-semibold text-gray-900">Resource Type</span>
                        <i :class="openSection === 'resourceType' ? 'pi pi-minus' : 'pi pi-plus'" class="text-gray-500"></i>
                    </button>
                    <div v-if="openSection === 'resourceType'" class="px-6 pb-4">
                        <div class="max-h-32 overflow-y-auto space-y-3">
                            <label v-for="type in itemTypeOptions" :key="type.id" class="flex items-center cursor-pointer">
                                <input type="checkbox" :value="type.id" v-model="filters.itemType" class="mr-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                <span class="text-sm text-gray-700">{{ type.name }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Category -->
                <div class="border-b border-gray-200">
                    <button @click="openSection = openSection === 'category' ? '' : 'category'" class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <span class="font-semibold text-gray-900">Category</span>
                        <i :class="openSection === 'category' ? 'pi pi-minus' : 'pi pi-plus'" class="text-gray-500"></i>
                    </button>
                    <div v-if="openSection === 'category'" class="px-6 pb-4">
                        <div class="max-h-40 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <label v-for="category in categoryOptions" :key="category.id" class="flex items-center cursor-pointer">
                                <input type="checkbox" :value="category.id" v-model="filters.categoryId" class="mr-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                <span class="text-sm text-gray-700">{{ category.name }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Grade Level -->
                <div class="border-b border-gray-200">
                    <button @click="openSection = openSection === 'grade' ? '' : 'grade'" class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <span class="font-semibold text-gray-900">Grade Level</span>
                        <i :class="openSection === 'grade' ? 'pi pi-minus' : 'pi pi-plus'" class="text-gray-500"></i>
                    </button>
                    <div v-if="openSection === 'grade'" class="px-6 pb-4">
                        <div class="max-h-32 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <label v-for="grade in gradeOptions" :key="grade.id" class="flex items-center cursor-pointer">
                                <input type="checkbox" :value="grade.id" v-model="filters.gradeLevel" class="mr-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                <span class="text-sm text-gray-700">{{ grade.name }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Subject -->
                <div class="border-b border-gray-200">
                    <button @click="openSection = openSection === 'subject' ? '' : 'subject'" class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <span class="font-semibold text-gray-900">Subject</span>
                        <i :class="openSection === 'subject' ? 'pi pi-minus' : 'pi pi-plus'" class="text-gray-500"></i>
                    </button>
                    <div v-if="openSection === 'subject'" class="px-6 pb-4">
                        <div class="max-h-40 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <label v-for="subject in subjectOptions" :key="subject.id" class="flex items-center cursor-pointer">
                                <input type="checkbox" :value="subject.id" v-model="filters.subject" class="mr-3 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                                <span class="text-sm text-gray-700">{{ subject.name }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Language -->
                <div>
                    <button @click="openSection = openSection === 'language' ? '' : 'language'" class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <span class="font-semibold text-gray-900">Language</span>
                        <i :class="openSection === 'language' ? 'pi pi-minus' : 'pi pi-plus'" class="text-gray-500"></i>
                    </button>
                    <div v-if="openSection === 'language'" class="px-6 pb-4">
                        <div class="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <select v-model="filters.language" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
                                <option value="">All Languages</option>
                                <option v-for="language in languageOptions" :key="language.id" :value="language.id">
                                    {{ language.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Apply Button at Bottom -->
        <div class="p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <button @click="applyFilters" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" :disabled="loading">
                <span v-if="loading" class="inline-flex items-center gap-2">
                    <i class="pi pi-spin pi-spinner"></i>
                    Applying...
                </span>
                <span v-else>Apply filters</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { useFilterStore } from '@/stores/filterStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// Use Pinia store
const filterStore = useFilterStore();
const { filters, filterOptions, loading, filtersLoading } = storeToRefs(filterStore);

// Local state
const toast = useToast();
const openSection = ref('resourceType'); // Default open section

// Format options
const formatOptions = [
    { value: 'all', label: 'All' },
    { value: 'book', label: 'Physical Book' },
    { value: 'ebook', label: 'Ebook' }
];

// Fetch all filter options from the backend
const fetchFilterOptions = async () => {
    try {
        await filterStore.fetchFilterOptions();
    } catch (error) {
        console.error('Failed to fetch filter options:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load filter options. Please try again.',
            life: 3000
        });
    }
};

// Add format filter
const selectedFormat = ref('all');

// Helper functions
const resetFilters = () => {
    filterStore.resetFilters();
    console.log('Filters reset');
};

const applyFilter = (filterType, value) => {
    if (filterType === 'language') {
        filters.value.language = value;
    } else {
        if (!filters.value[filterType].includes(value)) {
            filters.value[filterType].push(value);
        }
    }
};

const removeFilter = (filterType, value, index) => {
    if (filterType === 'language') {
        filters.value.language = '';
    } else {
        filters.value[filterType].splice(index, 1);
    }
};

const fetchBookItem = () => {
    console.log('Searching for:', filterKeyword.value);
};

// Computed properties for filter options
const itemTypeOptions = computed(() => {
    return (
        filterOptions.value.ebook_types?.map((type) => ({
            id: type.id,
            name: type.name
        })) || []
    );
});

const categoryOptions = computed(() => {
    return (
        filterOptions.value.categories?.map((category) => ({
            id: category.id,
            name: category.name,
            count: category.count || 0
        })) || []
    );
});

const languageOptions = computed(() => {
    return (
        filterOptions.value.languages?.map((lang) => ({
            id: lang.id,
            name: lang.name,
            code: lang.code
        })) || []
    );
});

const gradeOptions = computed(() => {
    return (
        filterOptions.value.grades?.map((grade) => ({
            id: grade.id,
            name: `Grade ${grade.name}`
        })) || []
    );
});

const subjectOptions = computed(() => {
    return (
        filterOptions.value.subjects?.map((subject) => ({
            id: subject.id,
            name: subject.name
        })) || []
    );
});

// Methods
const toggleFilter = (filterType, value) => {
    const index = activeFilters.value[filterType].indexOf(value);
    if (index === -1) {
        applyFilter(filterType, value);
    } else {
        removeFilter(filterType, null, index);
    }
};

// Apply all current filters
const applyFilters = async () => {
    try {
        await filterStore.applyFilters();
        toast.add({
            severity: 'success',
            summary: 'Filters Applied',
            detail: 'Your search results have been updated',
            life: 2000
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to apply filters. Please try again.',
            life: 3000
        });
    }
};

// Toggle filter sections to show/hide them
const toggleFilterSection = (sectionName) => {
    // If clicking on the same section, close it, otherwise open clicked section
    openSection.value = openSection.value === sectionName ? '' : sectionName;

    // Save the user's preference for opened section
    localStorage.setItem('dlms-filter-open-section', openSection.value);
};

// Get total count of active filters for the badge display
const getActiveFilterCount = () => {
    return filterStore.getActiveFilterCount();
};

// Function to reset filters and emit to parent
const resetAndEmitFilters = () => {
    filterStore.resetFilters();
};

// Fetch filter options on component mount
onMounted(async () => {
    // Restore user's preference for opened section
    const savedSection = localStorage.getItem('dlms-filter-open-section');
    if (savedSection) {
        openSection.value = savedSection;
    }

    await filterStore.fetchFilterOptions();
});
</script>

<style scoped>
/* Smooth transition for collapsible sections */
.transition-all {
    transition: all 0.3s ease-in-out;
}

/* Add a slight highlight for the active section */
.border-t {
    transition: background-color 0.2s ease;
}

/* Hover effect for filter section headers */
[class*='cursor-pointer']:hover h4 {
    color: #4f46e5; /* Indigo 600 */
}

/* Make the scrollbars look better on overflow sections */
.overflow-y-auto::-webkit-scrollbar {
    width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #888;
}
</style>
