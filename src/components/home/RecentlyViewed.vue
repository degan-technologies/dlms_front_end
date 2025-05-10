<template>
    <section class="bg-slate-50 py-12 px-5">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <div class="text-indigo-600 font-semibold mb-1">CONTINUE LEARNING</div>
                    <h2 class="text-3xl font-bold">Recently Viewed</h2>
                </div>
                <div class="mt-4 md:mt-0">
                    <button @click="viewAllRecentlyViewed" class="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">View all recent items <i class="pi pi-arrow-right"></i></button>
                </div>
            </div>

            <!-- No recent items message -->
            <div v-if="recentlyViewedResources.length === 0" class="bg-white p-8 rounded-lg text-center shadow-sm">
                <div class="flex flex-col items-center">
                    <i class="pi pi-clock text-4xl text-gray-300 mb-3"></i>
                    <h3 class="text-xl font-semibold mb-2">No Recently Viewed Items</h3>
                    <p class="text-gray-500 max-w-md mx-auto">Browse through our library resources. Your recently viewed items will appear here for easy access.</p>
                    <button @click="browseFeaturedResources" class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-all flex items-center gap-1">
                        <i class="pi pi-book"></i>
                        <span>Browse Resources</span>
                    </button>
                </div>
            </div>

            <!-- Recently viewed items -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="(resource, index) in recentlyViewedResources" :key="resource.id" @click="viewResource(resource)" class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer relative">
                    <!-- Resource type badge -->
                    <div class="absolute top-2 left-2 z-10">
                        <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-md shadow-sm text-indigo-700">
                            {{ resource.type }}
                        </span>
                    </div>

                    <!-- Time viewed badge -->
                    <div class="absolute top-2 right-2 z-10">
                        <span class="px-2 py-1 bg-black/70 backdrop-blur-sm text-xs font-medium rounded-md shadow-sm text-white">
                            {{ formatTimeAgo(resource.viewed_at) }}
                        </span>
                    </div>

                    <!-- Resource thumbnail -->
                    <div class="relative h-40">
                        <img :src="resource.image || 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'" :alt="resource.title" class="w-full h-full object-cover" />

                        <!-- Progress indicator for partially read resources -->
                        <div v-if="resource.progress > 0" class="absolute bottom-0 left-0 right-0">
                            <div class="h-1.5 bg-gray-200">
                                <div class="h-full bg-gradient-to-r from-sky-500 to-indigo-600" :style="{ width: `${resource.progress}%` }"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Resource info -->
                    <div class="p-4">
                        <h3 class="font-semibold line-clamp-1 mb-1">{{ resource.title }}</h3>
                        <p class="text-gray-500 text-sm line-clamp-1">{{ resource.author }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { useHomeStore } from '@/stores/homeStore';
import { ref } from 'vue';

const homeStore = useHomeStore();
const { viewResource } = homeStore;

// Mock recently viewed resources
const recentlyViewedResources = ref([
    {
        id: 101,
        title: 'Calculus: Early Transcendentals',
        author: 'James Stewart',
        type: 'E-Book',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        viewed_at: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
        progress: 72
    },
    {
        id: 102,
        title: 'Introduction to Quantum Mechanics',
        author: 'David J. Griffiths',
        type: 'PDF',
        image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        viewed_at: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
        progress: 45
    },
    {
        id: 103,
        title: 'Understanding Thermodynamics',
        author: 'Prof. Michael Chen',
        type: 'Video',
        image: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        viewed_at: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
        progress: 90
    },
    {
        id: 104,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        type: 'E-Book',
        image: 'https://images.unsplash.com/photo-1511108690759-009324a90311?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        viewed_at: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
        progress: 23
    }
]);

// Format relative time (time ago)
const formatTimeAgo = (dateString) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
    } catch (error) {
        return 'Unknown time';
    }
};

// Navigation function
const viewAllRecentlyViewed = () => {
    console.log('Viewing all recently viewed resources');
    // In a real app, this would navigate to a dedicated page
    // router.push('/student/recently-viewed');
};

// Function to navigate to featured resources
const browseFeaturedResources = () => {
    console.log('Browsing featured resources');
    // Scroll to featured resources section
    document.querySelector('.featured-resources-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
};
</script>
