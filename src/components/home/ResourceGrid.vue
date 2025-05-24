<script setup>
import { useHomeStore } from '@/stores/homeStore';
import { storeToRefs } from 'pinia';
import Paginator from 'primevue/paginator';

const homeStore = useHomeStore();
const { loading, featuredResources, totalRecords, resourcesPerPage, first } = storeToRefs(homeStore);

const { resetFilters, viewResource, capitalizeFirstLetter, onPageChange } = homeStore;
</script>

<template>
    <div class="lg:w-3/4">
        <!-- Loading overlay -->
        <div v-if="loading" class="flex justify-center items-center py-16">
            <div class="flex flex-col items-center">
                <i class="pi pi-spin pi-spinner text-3xl text-indigo-600 mb-4"></i>
                <span class="text-gray-600">Loading resources...</span>
            </div>
        </div>

        <!-- No results message -->
        <div v-else-if="featuredResources.length === 0" class="flex justify-center items-center py-16">
            <div class="flex flex-col items-center">
                <i class="pi pi-info-circle text-3xl text-gray-400 mb-4"></i>
                <span class="text-gray-600">No resources found matching your criteria</span>
                <button @click="resetFilters" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Reset Filters</button>
            </div>
        </div>

        <!-- Resources grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
            <div
                v-for="resource in featuredResources"
                :key="resource.id"
                class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100"
                data-tooltip="Click to view resource details"
            >
                <div class="relative h-48">
                    <img :src="resource.cover_image_url" :alt="resource.title" class="w-full h-full object-cover" />
                    <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-indigo-700 px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
                        {{ resource.type }}
                    </div>
                    <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold shadow-sm" :class="resource.availability_status === 'available' ? 'text-green-600' : 'text-red-600'">
                        {{ capitalizeFirstLetter(resource.availability_status) }}
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-16"></div>
                </div>
                <div class="p-5">
                    <h3 class="font-semibold text-lg mb-2 line-clamp-1">{{ resource.title }}</h3>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ resource.description || 'No description available' }}</p>
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between items-center text-sm">
                            <span v-if="resource.author" class="flex items-center gap-1.5 text-gray-500"> <i class="pi pi-user"></i> {{ resource.author }} </span>
                            <span class="text-xs text-gray-500">{{ resource.publication_year }}</span>
                        </div>
                        <div class="flex justify-between items-center text-sm mt-1">
                            <span v-if="resource.category" class="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                {{ resource.category }}
                            </span>
                            <span v-if="resource.isbn" class="text-xs text-gray-500"> ISBN: {{ resource.isbn }} </span>
                        </div>
                    </div>
                    <button v-if="resource.type.toLowerCase() === 'book'" @click="viewResource(resource)" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">View Details</button>
                </div>
            </div>
        </div>
        <div class="mt-8 flex justify-center">
            <Paginator :rows="resourcesPerPage" :totalRecords="totalRecords" v-model:first="first" :rowsPerPageOptions="[5, 10, 15, 20]" @page="onPageChange($event)" class="border-none" :loading="loading" />
        </div>
    </div>
</template>
