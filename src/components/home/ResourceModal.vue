<template>
    <div>
        <Dialog v-model:visible="resourceModalVisible" :modal="true" :breakpoints="{ '960px': '75vw', '640px': '90vw' }" class="p-fluid resource-modal" :style="{ width: '50rem' }" :showHeader="false" :dismissableMask="true">
            <div v-if="selectedResource" class="relative">
                <!-- Close button -->
                <button
                    @click="resourceModalVisible = false"
                    class="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white hover:text-white transition-all duration-300 border border-white/20"
                >
                    <i class="pi pi-times"></i>
                </button>

                <!-- Resource cover image -->
                <div class="relative h-64 bg-gradient-to-r from-indigo-900 to-blue-900 overflow-hidden">
                    <img :src="selectedResource.image || 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'" alt="" class="w-full h-full object-cover opacity-60" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div class="absolute bottom-5 left-5 right-5 text-white">
                        <span class="px-3 py-1 bg-indigo-600 rounded-md text-xs font-semibold tracking-wider">
                            {{ selectedResource.type }}
                        </span>
                        <h3 class="text-2xl font-bold mt-3 text-shadow-sm line-clamp-2">{{ selectedResource.title }}</h3>
                    </div>
                </div>

                <!-- Resource content -->
                <div class="p-5">
                    <!-- Resource info -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="md:col-span-2">
                            <h4 class="text-lg font-semibold mb-2">About this resource</h4>
                            <p class="text-gray-600 mb-4">{{ selectedResource.description || 'No description available for this resource.' }}</p>

                            <!-- YouTube video embed if applicable -->
                            <div v-if="isYoutubeVideo && youtubeEmbedUrl" class="mt-4">
                                <h4 class="text-lg font-semibold mb-2">Video Preview</h4>
                                <div class="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
                                    <iframe :src="youtubeEmbedUrl" class="absolute top-0 left-0 w-full h-full border-0" allowfullscreen allow="autoplay; encrypted-media"></iframe>
                                </div>
                                <div class="mt-3 flex gap-3">
                                    <button @click="navigateToReader()" class="flex items-center gap-1.5 text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors">
                                        <i class="pi pi-play"></i>
                                        <span>Open in Video Player</span>
                                    </button>
                                    <button @click="openExternalLink(selectedResource.media_url)" class="flex items-center gap-1.5 text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors">
                                        <i class="pi pi-youtube"></i>
                                        <span>Open in YouTube</span>
                                    </button>
                                </div>
                            </div>

                            <!-- PDF preview button if applicable -->
                            <div v-if="selectedResource.file_url && (selectedResource.type === 'PDF' || selectedResource.type === 'E-Book' || selectedResource.type === 'Ebook')" class="mt-4">
                                <h4 class="text-lg font-semibold mb-2">Document Preview</h4>
                                <div class="flex gap-3">
                                    <button @click="navigateToReader()" class="flex items-center gap-1.5 text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors">
                                        <i class="pi pi-file-pdf"></i>
                                        <span>View Document</span>
                                    </button>
                                    <button @click="openExternalLink(selectedResource.file_url)" class="flex items-center gap-1.5 text-sm px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md shadow-sm transition-colors">
                                        <i class="pi pi-download"></i>
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Resource details sidebar -->
                        <div class="bg-gray-50 p-4 rounded-md">
                            <h4 class="text-lg font-semibold mb-3">Resource Details</h4>
                            <div class="space-y-3">
                                <div v-if="selectedResource.author" class="flex items-start gap-2">
                                    <i class="pi pi-user text-indigo-600 mt-1"></i>
                                    <div>
                                        <div class="text-sm text-gray-500">Author</div>
                                        <div>{{ selectedResource.author }}</div>
                                    </div>
                                </div>
                                <div v-if="selectedResource.publisher" class="flex items-start gap-2">
                                    <i class="pi pi-building text-indigo-600 mt-1"></i>
                                    <div>
                                        <div class="text-sm text-gray-500">Publisher</div>
                                        <div>{{ selectedResource.publisher }}</div>
                                    </div>
                                </div>
                                <div v-if="selectedResource.publication_year" class="flex items-start gap-2">
                                    <i class="pi pi-calendar text-indigo-600 mt-1"></i>
                                    <div>
                                        <div class="text-sm text-gray-500">Published</div>
                                        <div>{{ selectedResource.publication_year }}</div>
                                    </div>
                                </div>
                                <div v-if="selectedResource.language" class="flex items-start gap-2">
                                    <i class="pi pi-globe text-indigo-600 mt-1"></i>
                                    <div>
                                        <div class="text-sm text-gray-500">Language</div>
                                        <div>{{ selectedResource.language }}</div>
                                    </div>
                                </div>
                                <div v-if="selectedResource.isbn" class="flex items-start gap-2">
                                    <i class="pi pi-id-card text-indigo-600 mt-1"></i>
                                    <div>
                                        <div class="text-sm text-gray-500">ISBN</div>
                                        <div>{{ selectedResource.isbn }}</div>
                                    </div>
                                </div>
                                <div v-if="selectedResource.category" class="flex items-start gap-2">
                                    <i class="pi pi-folder text-indigo-600 mt-1"></i>
                                    <div>
                                        <div class="text-sm text-gray-500">Category</div>
                                        <div>{{ selectedResource.category }}</div>
                                    </div>
                                </div>
                                <div class="flex items-start gap-2">
                                    <i class="pi pi-check-circle text-indigo-600 mt-1"></i>
                                    <div>
                                        <div class="text-sm text-gray-500">Status</div>
                                        <div :class="{ 'text-green-600': selectedResource.availability_status === 'available', 'text-red-600': selectedResource.availability_status !== 'available' }">
                                            {{ capitalizeFirstLetter(selectedResource.availability_status || 'Unknown') }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="mt-6 space-y-2">
                                <button class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all">
                                    <i class="pi pi-bookmark"></i>
                                    <span>Add to Reading List</span>
                                </button>
                                <button class="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all">
                                    <i class="pi pi-book"></i>
                                    <span>Reserve Copy</span>
                                </button>
                                <button @click="navigateToReader" class="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all">
                                    <i class="pi pi-external-link"></i>
                                    <span>Open in Reader</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { useHomeStore } from '@/stores/homeStore';
import { storeToRefs } from 'pinia';
import Dialog from 'primevue/dialog';
import { useRouter } from 'vue-router';

const router = useRouter();
const homeStore = useHomeStore();
const { selectedResource, resourceModalVisible, pdfViewerVisible, isYoutubeVideo, youtubeEmbedUrl } = storeToRefs(homeStore);

const { openExternalLink, capitalizeFirstLetter } = homeStore;

// Function to navigate to universal reader
const navigateToReader = () => {
    if (selectedResource.value && selectedResource.value.id) {
        resourceModalVisible.value = false;
        router.push({
            name: 'universal-reader',
            params: { id: selectedResource.value.id },
            query: { type: selectedResource.value.type.toLowerCase() }
        });
    }
};
</script>
