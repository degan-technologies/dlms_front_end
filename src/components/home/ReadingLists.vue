<template>
    <section class="bg-white py-12 px-5">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <div class="text-indigo-600 font-semibold mb-1">CURATED KNOWLEDGE</div>
                    <h2 class="text-3xl font-bold">Reading Lists</h2>
                </div>
                <div class="mt-4 md:mt-0">
                    <button @click="viewAllReadingLists" class="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">View all collections <i class="pi pi-arrow-right"></i></button>
                </div>
            </div>

            <!-- Reading lists grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="list in readingLists" :key="list.id" @click="viewReadingList(list)" class="cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group">
                    <!-- Background gradient -->
                    <div class="absolute inset-0" :style="{ backgroundImage: `linear-gradient(135deg, ${list.gradientStart}, ${list.gradientEnd})` }"></div>

                    <!-- List content -->
                    <div class="relative p-5 text-white h-full flex flex-col justify-between">
                        <div>
                            <!-- List icon and badges -->
                            <div class="flex justify-between items-start mb-4">
                                <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                    <i :class="[list.icon, 'text-2xl']"></i>
                                </div>
                                <span class="px-3 py-1 bg-white/20 backdrop-blur-sm text-xs rounded-full">{{ list.type }}</span>
                            </div>

                            <!-- List title and description -->
                            <h3 class="text-xl font-bold mb-2">{{ list.name }}</h3>
                            <p class="text-white/80 text-sm line-clamp-2 mb-4">{{ list.description }}</p>
                        </div>

                        <!-- Preview images and count -->
                        <div class="flex items-center justify-between">
                            <div class="flex -space-x-2">
                                <div v-for="(img, index) in list.previewImages.slice(0, 3)" :key="index" class="w-7 h-7 rounded-full border border-white/30 overflow-hidden shadow-sm">
                                    <img :src="img" alt="Preview" class="w-full h-full object-cover" />
                                </div>
                                <div v-if="list.previewImages.length > 3" class="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-medium border border-white/30">+{{ list.previewImages.length - 3 }}</div>
                            </div>
                            <span class="text-sm font-medium">{{ list.itemCount }} items</span>
                        </div>

                        <!-- Hover overlay -->
                        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button class="px-4 py-2 bg-white text-indigo-700 rounded-md shadow-md flex items-center gap-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <i class="pi pi-eye"></i>
                                <span>View Collection</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Reading Lists / Curated Collections
const readingLists = ref([
    {
        id: 1,
        name: 'Classic Literature',
        description: 'Explore timeless works from renowned authors throughout history',
        itemCount: 12,
        type: 'Faculty Pick',
        gradientStart: '#3b82f6',
        gradientEnd: '#1e40af',
        icon: 'pi pi-book',
        previewImages: [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=100&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=100&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=100&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=100&auto=format&fit=crop'
        ]
    },
    {
        id: 2,
        name: 'Research Methods',
        description: 'Resources to help students with academic research and writing',
        itemCount: 9,
        type: 'Academic',
        gradientStart: '#8b5cf6',
        gradientEnd: '#4c1d95',
        icon: 'pi pi-search',
        previewImages: [
            'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?q=80&w=100&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=100&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1554494415-7909fc140c32?q=80&w=100&auto=format&fit=crop'
        ]
    },
    {
        id: 3,
        name: 'Science Fiction',
        description: 'Explore visionary worlds and scientific possibilities',
        itemCount: 14,
        type: 'Student Pick',
        gradientStart: '#ec4899',
        gradientEnd: '#831843',
        icon: 'pi pi-bolt',
        previewImages: [
            'https://images.unsplash.com/photo-1569856550115-22e712fb7753?q=80&w=100&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=100&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1629772806699-3b51a579a2f5?q=80&w=100&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=100&auto=format&fit=crop'
        ]
    },
    {
        id: 4,
        name: 'Exam Preparation',
        description: 'Essential resources for preparing for mid-term and final exams',
        itemCount: 8,
        type: 'Academic',
        gradientStart: '#10b981',
        gradientEnd: '#065f46',
        icon: 'pi pi-check-circle',
        previewImages: [
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=100&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=100&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=100&auto=format&fit=crop'
        ]
    }
]);

// Reading list functions
const viewAllReadingLists = () => {
    console.log('Viewing all reading lists');
    router.push('/student/reading-lists');
};

const viewReadingList = (list) => {
    console.log('Viewing reading list:', list.name);
    router.push(`/student/reading-lists/${list.id}`);
};
</script>
