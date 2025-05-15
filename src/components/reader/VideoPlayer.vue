<template>
    <div class="video-player-wrapper" :class="{ 'dark-mode': darkMode }">
        <div v-if="loading" class="video-loading flex align-items-center justify-content-center p-4">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <div v-if="error" class="video-error flex flex-column align-items-center justify-content-center p-4">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mb-3"></i>
            <p class="text-center">{{ error }}</p>
            <Button label="Retry" icon="pi pi-refresh" class="mt-3" @click="loadVideo" />
        </div>

        <div class="video-container" v-show="!loading && !error">
            <video ref="videoElement" class="w-full h-auto border-round" controls autoplay controlsList="nodownload" @error="handleVideoError" @loadedmetadata="handleVideoLoaded">
                <source :src="resourceUrl" :type="videoType" />
                Your browser does not support HTML5 video.
            </video>

            <div class="video-info mt-4" v-if="videoMeta.duration">
                <div class="flex flex-column gap-2">
                    <div class="flex align-items-center gap-2">
                        <span class="font-semibold">Duration:</span>
                        <span>{{ formatDuration(videoMeta.duration) }}</span>
                    </div>
                    <div class="flex align-items-center gap-2" v-if="videoMeta.resolution">
                        <span class="font-semibold">Resolution:</span>
                        <span>{{ videoMeta.resolution }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Video quality selector for streaming videos with multiple qualities -->
        <div class="quality-selector mt-3" v-if="qualityOptions.length > 1">
            <Dropdown v-model="selectedQuality" :options="qualityOptions" optionLabel="label" placeholder="Select Quality" class="w-full md:w-14rem" @change="changeQuality" />
        </div>

        <!-- Playback speed control -->
        <div class="speed-control mt-3">
            <div class="flex align-items-center gap-3">
                <span class="font-semibold">Speed:</span>
                <div class="flex gap-1">
                    <Button v-for="rate in playbackRates" :key="rate" :label="`${rate}x`" :class="{ 'p-button-outlined': currentPlaybackRate !== rate }" @click="setPlaybackRate(rate)" size="small" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import ProgressSpinner from 'primevue/progressspinner';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
    resourceUrl: {
        type: String,
        required: true
    },
    resourceType: {
        type: String,
        default: 'video'
    },
    darkMode: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['loading-error', 'video-loaded']);

// State
const loading = ref(true);
const error = ref(null);
const videoElement = ref(null);
const videoMeta = ref({
    duration: 0,
    resolution: ''
});
const qualityOptions = ref([]);
const selectedQuality = ref(null);
const playbackRates = [0.5, 1, 1.25, 1.5, 2];
const currentPlaybackRate = ref(1);

// Compute video type based on URL or provided type
const videoType = computed(() => {
    const url = props.resourceUrl;

    if (url.includes('.mp4')) return 'video/mp4';
    if (url.includes('.webm')) return 'video/webm';
    if (url.includes('.ogg')) return 'video/ogg';
    if (url.includes('.mov')) return 'video/quicktime';

    // Default to mp4 if we can't determine
    return 'video/mp4';
});

// Load the video
const loadVideo = () => {
    loading.value = true;
    error.value = null;

    // In a real implementation, we might need to fetch video information
    // from an API before loading the actual video

    // Simulate API call for video info
    setTimeout(() => {
        loading.value = false;

        // For demo, add quality options
        qualityOptions.value = [
            { label: 'Auto', value: 'auto' },
            { label: '1080p', value: '1080' },
            { label: '720p', value: '720' },
            { label: '480p', value: '480' }
        ];
        selectedQuality.value = qualityOptions.value[0];
    }, 800);
};

// Handle video errors
const handleVideoError = (e) => {
    console.error('Video error:', e);
    error.value = 'Failed to load video. The file may be corrupted or not supported.';
    loading.value = false;
    emit('loading-error', error.value);
};

// Handle video loaded
const handleVideoLoaded = () => {
    if (videoElement.value) {
        const video = videoElement.value;

        videoMeta.value = {
            duration: video.duration,
            resolution: `${video.videoWidth}x${video.videoHeight}`
        };

        emit('video-loaded', {
            duration: video.duration,
            resolution: `${video.videoWidth}x${video.videoHeight}`,
            src: props.resourceUrl
        });
    }
};

// Format video duration to HH:MM:SS
const formatDuration = (seconds) => {
    if (!seconds) return '00:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hrs > 0) {
        parts.push(String(hrs).padStart(2, '0'));
    }

    parts.push(String(mins).padStart(2, '0'));
    parts.push(String(secs).padStart(2, '0'));

    return parts.join(':');
};

// Change video quality
const changeQuality = () => {
    // In a real implementation, this would switch the video source
    // based on the selected quality
    console.log('Changing quality to:', selectedQuality.value.label);

    // We would update the video source here
    // videoElement.value.src = getUrlForQuality(selectedQuality.value.value);
};

// Set playback rate
const setPlaybackRate = (rate) => {
    if (videoElement.value) {
        videoElement.value.playbackRate = rate;
        currentPlaybackRate.value = rate;
    }
};

// Watch for URL changes
watch(
    () => props.resourceUrl,
    () => {
        loadVideo();
    },
    { immediate: false }
);

// Initialize on mount
onMounted(() => {
    loadVideo();
});

// Clean up on unmount
onBeforeUnmount(() => {
    if (videoElement.value) {
        videoElement.value.pause();
        videoElement.value.src = '';
        videoElement.value.load();
    }
});
</script>

<style scoped>
.video-player-wrapper {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    min-height: 300px;
}

.video-container {
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
}

.video-loading,
.video-error {
    min-height: 200px;
}

.dark-mode {
    background-color: #262626;
    color: #f0f0f0;
}

@media (max-width: 640px) {
    .speed-control .flex {
        flex-wrap: wrap;
    }
}
</style>
