<script setup>
import { computed } from 'vue';

const props = defineProps({
    type: {
        type: String,
        default: 'default', // 'pdf', 'youtube', 'audio', 'default'
        validator: (value) => ['pdf', 'youtube', 'audio', 'default'].includes(value)
    },
    title: {
        type: String,
        default: 'Loading...'
    },
    description: {
        type: String,
        default: 'Please wait while we prepare your content.'
    },
    subtitle: {
        type: String,
        default: null
    },
    progress: {
        type: Object,
        default: null
    }
});

// Dynamic styles based on content type
const iconClass = computed(() => {
    const baseClass = 'text-gray-400 dark:text-gray-500';
    switch (props.type) {
        case 'pdf':
            return `pi pi-file-pdf text-red-500 dark:text-red-400`;
        case 'youtube':
            return `pi pi-youtube text-red-600 dark:text-red-500`;
        case 'audio':
            return `pi pi-volume-up text-green-500 dark:text-green-400`;
        default:
            return `pi pi-file ${baseClass}`;
    }
});

const spinnerClass = computed(() => {
    switch (props.type) {
        case 'pdf':
            return 'border-t-red-500';
        case 'youtube':
            return 'border-t-red-600';
        case 'audio':
            return 'border-t-green-500';
        default:
            return 'border-t-indigo-600';
    }
});

const progressClass = computed(() => {
    switch (props.type) {
        case 'pdf':
            return 'bg-red-500';
        case 'youtube':
            return 'bg-red-600';
        case 'audio':
            return 'bg-green-500';
        default:
            return 'bg-indigo-600';
    }
});

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
</script>
<template>
    <div class="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 z-50">
        <div class="text-center max-w-md p-6">
            <!-- Loading Animation -->
            <div class="relative mb-6">
                <div class="w-16 h-16 mx-auto">
                    <!-- Outer rotating ring -->
                    <div class="w-16 h-16 border-4 border-gray-200 dark:border-gray-600 rounded-full absolute animate-spin" :class="spinnerClass"></div>
                    <!-- Inner content icon -->
                    <div class="w-16 h-16 flex items-center justify-center">
                        <i class="text-2xl" :class="iconClass"></i>
                    </div>
                </div>
            </div>

            <!-- Loading Text -->
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {{ title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
                {{ description }}
            </p>

            <!-- Progress Bar (if available) -->
            <div v-if="progress && progress.total > 0" class="mb-4">
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-300" :class="progressClass" :style="{ width: `${Math.round((progress.loaded / progress.total) * 100)}%` }"></div>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ Math.round((progress.loaded / progress.total) * 100) }}% ({{ formatBytes(progress.loaded) }} / {{ formatBytes(progress.total) }})</p>
            </div>

            <!-- Additional Info -->
            <div v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400">
                {{ subtitle }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* Enhanced loading animation */
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
</style>
