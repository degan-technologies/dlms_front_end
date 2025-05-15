<template>
    <section class="bg-white py-12 px-5">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <div class="text-indigo-600 font-semibold mb-1">FRESH CONTENT</div>
                    <h2 class="text-3xl font-bold">New Arrivals</h2>
                </div>
                <div class="mt-4 md:mt-0">
                    <button class="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">View all new arrivals <i class="pi pi-arrow-right"></i></button>
                </div>
            </div>

            <!-- Book Carousel using PrimeVue -->
            <div class="card">
                <Carousel :value="newArrivals" :numVisible="4" :numScroll="1" :responsiveOptions="responsiveOptions" circular>
                    <template #item="slotProps">
                        <div class="border border-surface-200 dark:border-surface-700 rounded m-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1" @click="viewBook(slotProps.data)">
                            <div class="mb-2">
                                <div class="relative">
                                    <img :src="slotProps.data.cover" :alt="slotProps.data.title" class="w-full h-64 object-cover rounded-t" />
                                    <div class="absolute top-3 right-3 bg-indigo-600 text-white text-xs px-2 py-1 rounded-md">New</div>
                                </div>
                            </div>
                            <div class="p-4">
                                <h3 class="font-semibold mb-1 line-clamp-1">{{ slotProps.data.title }}</h3>
                                <p class="text-gray-500 text-sm line-clamp-1">{{ slotProps.data.author || 'Unknown Author' }}</p>
                            </div>
                        </div>
                    </template>
                </Carousel>
            </div>
        </div>
    </section>
</template>

<script setup>
import { useHomeStore } from '@/stores/homeStore';
import Carousel from 'primevue/carousel';
import { ref } from 'vue';

const homeStore = useHomeStore();
const { viewBook } = homeStore;

// Responsive options for the carousel
const responsiveOptions = ref([
    {
        breakpoint: '1400px',
        numVisible: 4,
        numScroll: 1
    },
    {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
]);

// New arrivals data
const newArrivals = ref([
    {
        id: 1,
        title: 'The Quantum Physics Handbook',
        author: 'Dr. Richard Meyer',
        cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 2,
        title: 'Machine Learning: A Modern Approach',
        author: 'Sarah Johnson PhD',
        cover: 'https://images.unsplash.com/photo-1620207418302-439b387441b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 3,
        title: 'World Literature Classics',
        author: 'Emily Bronson',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 4,
        title: 'The Human Body: An Illustrated Guide',
        author: 'Dr. Michael Torres',
        cover: 'https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 5,
        title: 'Environmental Science Today',
        author: 'Prof. Laura Simmons',
        cover: 'https://images.unsplash.com/photo-1440778303588-435521a205bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    }
]);

// Optional: Fetch new arrivals from an API when component is mounted
// This would replace the static mock data above
// onMounted(() => {
//     fetchNewArrivals();
// });

// const fetchNewArrivals = async () => {
//     try {
//         // API call would go here
//         // newArrivals.value = await someApiService.getNewArrivals();
//     } catch (error) {
//         console.error('Failed to fetch new arrivals:', error);
//     }
// };
</script>

<style scoped>
/* PrimeVue Carousel customization */
:deep(.p-carousel) {
    padding-bottom: 1.5rem;
}

:deep(.p-carousel-indicators) {
    margin-top: 1rem;
}

:deep(.p-carousel-indicator > button) {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

:deep(.p-carousel-prev),
:deep(.p-carousel-next) {
    background-color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-top: -1.25rem;
}

:deep(.p-carousel-prev:hover),
:deep(.p-carousel-next:hover) {
    background-color: #f3f4f6;
}
</style>
