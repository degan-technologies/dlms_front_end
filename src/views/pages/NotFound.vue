<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
</script>

<template>
    <FloatingConfigurator />
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <div class="flex flex-col items-center justify-center p-8 rounded-3xl shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
            <div class="mb-6">
                <!-- Modern expressive icon -->
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="38" stroke="var(--primary-color)" stroke-width="4" fill="var(--surface-0)" />
                    <ellipse cx="40" cy="52" rx="14" ry="6" fill="#E0E7FF" />
                    <circle cx="30" cy="36" r="4" fill="#6366F1" />
                    <circle cx="50" cy="36" r="4" fill="#6366F1" />
                    <path d="M34 48 Q40 54 46 48" stroke="#6366F1" stroke-width="2" fill="none" stroke-linecap="round"/>
                </svg>
            </div>
            <span class="text-primary font-extrabold text-6xl mb-2">404</span>
            <h1 class="text-surface-900 dark:text-surface-0 font-bold text-2xl lg:text-4xl mb-2 text-center">Oops! Page Not Found</h1>
            <div class="text-surface-600 dark:text-surface-200 mb-6 text-center max-w-md">
                The page you are looking for doesn't exist or has been moved.<br />
            </div>
            <router-link to="/" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition mb-4">
                <i class="pi pi-home text-xl"></i>
                <span class="font-semibold">Go to Dashboard</span>
            </router-link>
            <!-- <div class="flex flex-col gap-2 mt-4 w-full max-w-xs">
                <router-link to="/faq" class="flex items-center px-4 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition">
                    <i class="pi pi-question-circle text-primary text-xl mr-3"></i>
                    <span class="font-medium">Frequently Asked Questions</span>
                </router-link>
                <router-link to="/support" class="flex items-center px-4 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition">
                    <i class="pi pi-life-ring text-primary text-xl mr-3"></i>
                    <span class="font-medium">Contact Support</span>
                </router-link>
            </div> -->
        </div>
    </div>
</template>
