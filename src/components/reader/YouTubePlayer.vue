<template>
    <div class="youtube-player-wrapper" :class="{ 'dark-mode': darkMode }">
        <div v-if="loading" class="youtube-loading flex align-items-center justify-content-center p-4">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <div v-if="error" class="youtube-error flex flex-column align-items-center justify-content-center p-4">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mb-3"></i>
            <p class="text-center">{{ error }}</p>
            <Button label="Retry" icon="pi pi-refresh" class="mt-3" @click="initPlayer" />
        </div>

        <div class="youtube-container" v-show="!loading && !error">
            <div :id="playerId" class="w-full border-round" style="aspect-ratio: 16/9"></div>

            <div class="video-info mt-4" v-if="videoMeta.title">
                <div class="flex flex-column gap-2">
                    <h3 class="mt-0 mb-2">{{ videoMeta.title }}</h3>
                    <div class="flex align-items-center gap-2" v-if="videoMeta.duration">
                        <span class="font-semibold">Duration:</span>
                        <span>{{ formatDuration(videoMeta.duration) }}</span>
                    </div>
                    <div class="flex align-items-center gap-2" v-if="videoMeta.author">
                        <span class="font-semibold">Channel:</span>
                        <span>{{ videoMeta.author }}</span>
                    </div>
                </div>
            </div>
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
import ProgressSpinner from 'primevue/progressspinner';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
    videoId: {
        type: String,
        required: true
    },
    darkMode: {
        type: Boolean,
        default: false
    },
    autoplay: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['loading-error', 'video-loaded']);

// State
const loading = ref(true);
const error = ref(null);
const player = ref(null);
const playerId = ref(`youtube-player-${Date.now()}`);
const scriptLoaded = ref(false);
const currentPlaybackRate = ref(1);
const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const videoMeta = ref({
    title: '',
    author: '',
    duration: 0
});

// Load YouTube API
const loadYouTubeAPI = () => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.YT && window.YT.Player) {
            scriptLoaded.value = true;
            resolve();
            return;
        }

        // Create script element
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        tag.id = 'youtube-api';

        // Set callbacks
        window.onYouTubeIframeAPIReady = () => {
            scriptLoaded.value = true;
            resolve();
        };

        // Handle errors
        tag.onerror = () => {
            error.value = 'Failed to load YouTube API';
            emit('loading-error', 'Failed to load YouTube API');
            loading.value = false;
            reject(new Error('Failed to load YouTube API'));
        };

        // Add to DOM
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    });
};

// Initialize player
const initPlayer = async () => {
    try {
        loading.value = true;
        error.value = null;

        if (!scriptLoaded.value) {
            await loadYouTubeAPI();
        }

        // Create player
        player.value = new window.YT.Player(playerId.value, {
            videoId: props.videoId,
            playerVars: {
                autoplay: props.autoplay ? 1 : 0,
                controls: 1,
                rel: 0,
                modestbranding: 1,
                playsinline: 1
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
                onError: onPlayerError
            }
        });
    } catch (err) {
        console.error('YouTube player initialization failed:', err);
        error.value = 'Failed to initialize YouTube player';
        emit('loading-error', 'Failed to initialize YouTube player');
        loading.value = false;
    }
};

// Event handlers
const onPlayerReady = (event) => {
    loading.value = false;

    // Get video metadata
    try {
        const playerInstance = event.target;
        const videoData = playerInstance.getVideoData();
        const durationSecs = playerInstance.getDuration();

        videoMeta.value = {
            title: videoData.title,
            author: videoData.author,
            duration: durationSecs
        };

        emit('video-loaded', {
            title: videoData.title,
            author: videoData.author,
            duration: durationSecs
        });
    } catch (err) {
        console.warn('Could not get video metadata:', err);
    }
};

const onPlayerStateChange = (event) => {
    // You can handle player state changes here
    // States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
};

const onPlayerError = (event) => {
    console.error('YouTube player error:', event);
    let errorMessage = 'An error occurred while playing the video';

    // YouTube error codes
    switch (event.data) {
        case 2:
            errorMessage = 'Invalid video ID';
            break;
        case 5:
            errorMessage = 'HTML5 player error';
            break;
        case 100:
            errorMessage = 'Video not found or removed';
            break;
        case 101:
        case 150:
            errorMessage = 'Video cannot be played in embedded player';
            break;
    }

    error.value = errorMessage;
    emit('loading-error', errorMessage);
};

// Set playback rate
const setPlaybackRate = (rate) => {
    if (player.value) {
        player.value.setPlaybackRate(rate);
        currentPlaybackRate.value = rate;
    }
};

// Format duration from seconds to MM:SS or HH:MM:SS
const formatDuration = (seconds) => {
    if (!seconds) return '00:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    return hrs > 0 ? `${hrs}:${formattedMins}:${formattedSecs}` : `${formattedMins}:${formattedSecs}`;
};

// Watch for videoId changes
watch(
    () => props.videoId,
    (newId, oldId) => {
        if (newId !== oldId && player.value) {
            player.value.loadVideoById(newId);
        }
    }
);

// Cleanup
onBeforeUnmount(() => {
    if (player.value) {
        try {
            player.value.destroy();
        } catch (err) {
            console.warn('Error destroying YouTube player:', err);
        }
    }
});

// Initialize
onMounted(() => {
    initPlayer();
});
</script>

<style scoped>
.youtube-player-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.youtube-container {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

.dark-mode {
    background-color: #1e1e1e;
    color: #f0f0f0;
}

.dark-mode .video-info {
    color: #f0f0f0;
}
</style>
