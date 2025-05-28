<template>
    <section class="bg-slate-50 py-16 px-5">
        <div class="max-w-7xl mx-auto">
            <div class="mb-10">
                <div class="text-indigo-600 font-semibold mb-2 tracking-widest uppercase">QUICK ACCESS</div>
                <h2 class="text-3xl font-bold text-gray-900">Library Services</h2>
                <p class="text-gray-600 text-lg mt-2">Access all library features in one place</p>
            </div>

            <!-- Quick links grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="(link, index) in quickLinks" :key="index" @click="navigateToLink(link)" class="bg-white rounded-xl shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div class="h-2" :class="link.accentColor"></div>
                    <div class="p-6">
                        <div class="w-14 h-14 rounded-xl mb-4 flex items-center justify-center" :class="link.bgColor">
                            <i :class="[link.icon, 'text-white text-xl']"></i>
                        </div>
                        <h3 class="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">{{ link.title }}</h3>
                        <p class="text-gray-600 text-sm line-clamp-2 mb-4">{{ link.description }}</p>
                        <div class="flex items-center text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                            <span>Access now</span>
                            <i class="pi pi-arrow-right ml-2 text-xs"></i>
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
import { useChatStore } from '@/stores/chatStore';

const router = useRouter();
const chatStore = useChatStore();

// Quick links data
const quickLinks = ref([
    {
        title: 'Resource Request',
        description: 'Request new books or materials for the library collection',
        icon: 'pi pi-plus-circle',
        url: '/student/resource-request',
        bgColor: 'bg-blue-600',
        accentColor: 'bg-blue-500'
    },
    {
        title: 'Upcoming Events',
        description: 'View library workshops, book clubs, and other events',
        icon: 'pi pi-calendar',
        url: '/student/events',
        bgColor: 'bg-purple-600',
        accentColor: 'bg-purple-500'
    },
    {
        title: 'Ask a Librarian',
        description: 'Get personalized help with your research needs',
        icon: 'pi pi-comments',
        url: '/student/ask-librarian',
        bgColor: 'bg-pink-600',
        accentColor: 'bg-pink-500'
    },
    {
        title: 'My Account',
        description: 'Manage your loans, holds, and account settings',
        icon: 'pi pi-user',
        url: '/my-profile',
        bgColor: 'bg-green-600',
        accentColor: 'bg-green-500'
    }
]);

// Navigation function
const navigateToLink = (link) => {
    console.log('Navigating to:', link.title);
    
    // Special handling for "Ask a Librarian"
    if (link.title === 'Ask a Librarian') {
        chatStore.openChat();
        return;
    }
    
    // Regular navigation for other links
    router.push(link.url);
};
</script>
