<script setup>
import { useHomeStore } from '@/stores/homeStore';
import { storeToRefs } from 'pinia';

const homeStore = useHomeStore();
const { searchQuery } = storeToRefs(homeStore);
const { searchResources, quickSearch } = homeStore;
</script>

<template>
    <section class="relative py-20 overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-600 text-white">
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-no-repeat bg-center bg-cover"></div>

        <!-- Floating book elements -->
        <div class="hidden md:block absolute -top-10 -left-20 w-40 h-48 rotate-12 opacity-20">
            <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e" alt="Book" class="w-full h-full object-cover rounded shadow-lg" />
        </div>
        <div class="hidden md:block absolute bottom-10 -right-10 w-32 h-44 -rotate-6 opacity-20">
            <img src="https://images.unsplash.com/photo-1541963463532-d68292c34b19" alt="Book" class="w-full h-full object-cover rounded shadow-lg" />
        </div>

        <!-- Hero content -->
        <div class="relative z-10 max-w-6xl mx-auto">
            <div class="text-center mb-10">
                <p class="text-lg md:text-xl mb-10 font-light max-w-2xl mx-auto text-white/90 leading-relaxed">Where every page turns into an adventure and every resource unlocks new possibilities</p>
            </div>

            <!-- Search panel -->
            <div class="max-w-3xl mx-auto">
                <div class="flex flex-col md:flex-row bg-white/95 rounded-lg shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
                    <div class="relative flex-1">
                        <input type="text" placeholder="What knowledge are you seeking today?" v-model="searchQuery" class="w-full py-5 px-6 focus:outline-none focus:ring-2 focus:ring-sky-300 text-gray-700 text-base" />
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-light">Press Enter ↵</span>
                    </div>
                    <button @click="searchResources" class="bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-8 py-5 hover:from-sky-600 hover:to-indigo-700 transition-all flex items-center gap-2 font-medium">
                        <i class="pi pi-search"></i>
                        <span>Explore</span>
                    </button>
                </div>

                <!-- Popular topics chips -->
                <div class="mt-6 flex flex-wrap justify-center gap-3">
                    <span class="bg-white/20 px-4 py-2 rounded-md backdrop-blur-sm text-sm font-medium">Popular Topics:</span>
                    <button
                        v-for="(topic, index) in ['Physics', 'Mathematics', 'Literature', 'Computer Science', 'Biology']"
                        :key="index"
                        @click="quickSearch(topic)"
                        class="bg-white/10 hover:bg-white/30 px-4 py-2 rounded-md transition-colors backdrop-blur-sm text-sm hover:shadow-lg"
                    >
                        {{ topic }}
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>
