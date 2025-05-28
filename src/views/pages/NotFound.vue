<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
  <FloatingConfigurator />
  <div class="flex items-center justify-center min-h-screen bg-white from-pink-100 via-purple-100 to-blue-100 dark:from-gray-900 dark:to-gray-800">
    <div class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full animate-fade-in">
      <div class="mb-6">
        <!-- Fun Icon: Colorful Confused Emoji -->
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" fill="#F472B6" stroke="#6366F1" stroke-width="4"/>
          <ellipse cx="28" cy="36" rx="5" ry="7" fill="#fff"/>
          <ellipse cx="52" cy="36" rx="5" ry="7" fill="#fff"/>
          <ellipse cx="28" cy="38" rx="2" ry="3" fill="#6366F1"/>
          <ellipse cx="52" cy="38" rx="2" ry="3" fill="#6366F1"/>
          <path d="M30 56 Q40 62 50 56" stroke="#6366F1" stroke-width="3" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
      <div class="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">404</div>
      <div class="text-xl font-semibold text-gray-800 dark:text-white mb-2 text-center">Page Not Found</div>
      <div class="text-gray-500 dark:text-gray-300 mb-6 text-center">Sorry, we couldn't find what you were looking for.</div>
      <button @click="router.back()" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
        <span class="mr-2">Back</span>
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1);
}
</style>