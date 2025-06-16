<script setup>
import axiosInstance from '@/util/axios-config';
import { onMounted, ref } from 'vue';

const cards = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const { data } = await axiosInstance.get('/dashboard-stats');

        // Dynamically build card data based on role
        cards.value = Object.entries(data).map(([key, value]) => {
            return formatCard(key, value);
        });
        loading.value = false;
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
    }
});

// Map keys to user-friendly labels and icons
function formatCard(key, value) {
    const config = {
        total_branches: {
            label: 'Branches',
            icon: 'pi-building',
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-100 dark:bg-blue-400/10',
            footerHighlight: '',
            footerText: ''
        },
        total_libraries: {
            label: 'Libraries',
            icon: 'pi-book',
            iconColor: 'text-green-500',
            iconBg: 'bg-green-100 dark:bg-green-400/10',
            footerHighlight: '',
            footerText: ''
        },
        total_admins: {
            label: 'Admins',
            icon: 'pi-user',
            iconColor: 'text-purple-500',
            iconBg: 'bg-purple-100 dark:bg-purple-400/10',
            footerHighlight: '',
            footerText: ''
        },
        total_users: {
            label: 'Users',
            icon: 'pi-users',
            iconColor: 'text-cyan-500',
            iconBg: 'bg-cyan-100 dark:bg-cyan-400/10',
            footerHighlight: '',
            footerText: ''
        },
        total_books: {
            label: 'Books',
            icon: 'pi-book',
            iconColor: 'text-yellow-500',
            iconBg: 'bg-yellow-100 dark:bg-yellow-400/10',
            footerHighlight: '',
            footerText: ''
        },
        total_ebooks: {
            label: 'EBooks',
            icon: 'pi-tablet',
            iconColor: 'text-indigo-500',
            iconBg: 'bg-indigo-100 dark:bg-indigo-400/10',
            footerHighlight: '',
            footerText: ''
        },
        total_collections: {
            label: 'Collections',
            icon: 'pi-folder',
            iconColor: 'text-pink-500',
            iconBg: 'bg-pink-100 dark:bg-pink-400/10',
            footerHighlight: '',
            footerText: ''
        },
        total_borrowed_books: {
            label: 'Borrowed Books',
            icon: 'pi-bookmark',
            iconColor: 'text-red-500',
            iconBg: 'bg-red-100 dark:bg-red-400/10',
            footerHighlight: '',
            footerText: ''
        },
        total_categories: {
            label: 'Categories',
            icon: 'pi-tags',
            iconColor: 'text-amber-500',
            iconBg: 'bg-amber-100 dark:bg-amber-400/10',
            footerHighlight: '',
            footerText: ''
        },
        borrowed_books: {
            label: 'Borrowed',
            icon: 'pi-bookmark',
            iconColor: 'text-red-500',
            iconBg: 'bg-red-100 dark:bg-red-400/10',
            footerHighlight: '',
            footerText: 'books currently borrowed'
        },
        read_books: {
            label: 'Read History',
            icon: 'pi-eye',
            iconColor: 'text-gray-500',
            iconBg: 'bg-gray-100 dark:bg-gray-400/10',
            footerHighlight: '',
            footerText: 'books viewed'
        }
    };

    return {
        label: config[key]?.label || key,
        icon: config[key]?.icon || 'pi-info-circle',
        iconColor: config[key]?.iconColor || 'text-gray-500',
        iconBg: config[key]?.iconBg || 'bg-gray-100 dark:bg-gray-400/10',
        value,
        footerHighlight: config[key]?.footerHighlight || '',
        footerText: config[key]?.footerText || ''
    };
}
</script>
<template>
    <div class="card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Loading Skeletons -->
        <template v-if="loading">
            <div v-for="n in 4" :key="n" class="card border rounded mb-0 flex flex-col justify-between h-full min-h-[100px] animate-pulse bg-gray-100 dark:bg-gray-700">
                <div class="flex justify-between mb-4 p-4">
                    <div>
                        <div class="h-4 bg-gray-300 dark:bg-gray-600 mb-2 rounded w-3/4"></div>
                        <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                    <div class="rounded-full bg-gray-300 dark:bg-gray-600" style="width: 2.5rem; height: 2.5rem"></div>
                </div>
                <div class="p-4">
                    <div class="h-4 bg-gray-300 dark:bg-gray-600 mb-2 rounded w-1/3"></div>
                    <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
            </div>
        </template>

        <!-- Actual Cards -->
        <template v-else>
            <div v-for="(card, index) in cards" :key="index" class="card border rounded mb-0 flex flex-col justify-between h-full min-h-[100px]">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">{{ card.label }}</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">
                            {{ card.value }}
                        </div>
                    </div>
                    <div class="flex items-center justify-center rounded-border" :class="card.iconBg" style="width: 2.5rem; height: 2.5rem">
                        <i :class="['pi', card.icon, card.iconColor, '!text-xl']"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{ card.footerHighlight }}</span>
                <span class="text-muted-color">{{ card.footerText }}</span>
            </div>
        </template>
    </div>
</template>
