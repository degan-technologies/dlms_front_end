<template>
    <div class="audio-player-wrapper" :class="{ 'dark-mode': darkMode }">
        <div v-if="loading" class="audio-loading flex align-items-center justify-content-center p-4">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <div v-if="error" class="audio-error flex flex-column align-items-center justify-content-center p-4">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mb-2"></i>
            <p class="text-center">{{ error }}</p>
            <Button label="Retry" icon="pi pi-refresh" class="mt-3" @click="loadAudio" />
        </div>

        <div class="audio-container" v-show="!loading && !error">
            <!-- Audio visualizer canvas -->
            <div class="visualizer-container mb-3" v-show="showVisualizer">
                <canvas ref="visualizerCanvas" class="w-full border-round-lg"></canvas>
            </div>

            <!-- Audio element -->
            <audio ref="audioElement" class="w-full" controls preload="metadata" @error="handleAudioError" @loadedmetadata="handleAudioLoaded" @timeupdate="updateProgress" @play="startVisualizer" @pause="stopVisualizer">
                <source :src="resourceUrl" :type="audioType" />
                Your browser does not support HTML5 audio.
            </audio>

            <!-- Custom controls -->
            <div class="custom-controls mt-4">
                <div class="time-progress flex justify-content-between mb-2">
                    <span class="current-time">{{ formatTime(currentTime) }}</span>
                    <span class="total-time">{{ formatTime(duration) }}</span>
                </div>
                <Slider v-model="seekPosition" class="mb-4" @change="handleSeek" />

                <div class="flex justify-content-between align-items-center">
                    <div class="playback-controls flex align-items-center">
                        <Button icon="pi pi-step-backward" text rounded @click="skipBackward" />
                        <Button :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'" class="p-button-rounded p-button-primary" @click="togglePlay" />
                        <Button icon="pi pi-step-forward" text rounded @click="skipForward" />
                    </div>

                    <div class="flex align-items-center">
                        <Button :icon="muted ? 'pi pi-volume-off' : 'pi pi-volume-up'" text rounded @click="toggleMute" />
                        <Slider v-model="volume" class="ml-2" style="width: 100px" @change="updateVolume" />
                    </div>
                </div>

                <div class="extra-controls mt-3 flex justify-content-between">
                    <div class="flex gap-2">
                        <Button v-for="rate in playbackRates" :key="rate" :label="`${rate}x`" :class="{ 'p-button-outlined': currentPlaybackRate !== rate }" @click="setPlaybackRate(rate)" size="small" />
                    </div>

                    <ToggleButton v-model="showVisualizer" onLabel="Hide Visualizer" offLabel="Show Visualizer" class="p-button-sm" />
                </div>
            </div>

            <!-- Chapters or tracks (if available) -->
            <div class="audio-chapters mt-4" v-if="chapters.length > 0">
                <h3 class="mb-3">Chapters</h3>
                <ul class="list-none p-0 m-0">
                    <li v-for="(chapter, index) in chapters" :key="index" class="mb-2">
                        <Button :label="chapter.title" :class="{ 'p-button-outlined': currentChapter !== index }" icon="pi pi-play" class="w-full text-left" @click="jumpToChapter(chapter, index)" />
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Slider from 'primevue/slider';
import ToggleButton from 'primevue/togglebutton';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
    resourceUrl: {
        type: String,
        required: true
    },
    darkMode: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['loading-error', 'audio-loaded']);

// State
const loading = ref(true);
const error = ref(null);
const audioElement = ref(null);
const visualizerCanvas = ref(null);
const isPlaying = ref(false);
const duration = ref(0);
const currentTime = ref(0);
const seekPosition = ref(0);
const volume = ref(80);
const muted = ref(false);
const currentPlaybackRate = ref(1);
const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
const showVisualizer = ref(true);
const audioContext = ref(null);
const analyser = ref(null);
const visualizerAnimationFrame = ref(null);
const chapters = ref([]);
const currentChapter = ref(0);

// Computed audio type
const audioType = computed(() => {
    const url = props.resourceUrl;

    if (url.includes('.mp3')) return 'audio/mp3';
    if (url.includes('.wav')) return 'audio/wav';
    if (url.includes('.ogg')) return 'audio/ogg';
    if (url.includes('.aac')) return 'audio/aac';

    // Default to mp3 if we can't determine
    return 'audio/mp3';
});

// Load audio
const loadAudio = () => {
    loading.value = true;
    error.value = null;

    // In a real implementation, we might need to fetch audio metadata
    // from an API before loading the actual audio file

    // For the demo, we'll just simulate loading
    setTimeout(() => {
        loading.value = false;

        // Mock chapters for demo
        chapters.value = [
            { title: 'Introduction', startTime: 0 },
            { title: 'Chapter 1: Main Theme', startTime: 60 },
            { title: 'Chapter 2: Development', startTime: 180 },
            { title: 'Chapter 3: Conclusion', startTime: 300 }
        ];
    }, 800);
};

// Handle audio errors
const handleAudioError = (e) => {
    console.error('Audio error:', e);
    error.value = 'Failed to load audio. The file may be corrupted or not supported.';
    loading.value = false;
    emit('loading-error', error.value);
};

// Handle audio loaded
const handleAudioLoaded = () => {
    if (audioElement.value) {
        const audio = audioElement.value;
        duration.value = audio.duration;

        // Set initial volume
        audio.volume = volume.value / 100;

        emit('audio-loaded', {
            duration: audio.duration,
            src: props.resourceUrl
        });
    }
};

// Format time to MM:SS or HH:MM:SS
const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';

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

// Update progress and seek position
const updateProgress = () => {
    if (audioElement.value) {
        currentTime.value = audioElement.value.currentTime;

        // Update seek position (0-100)
        if (duration.value) {
            seekPosition.value = (currentTime.value / duration.value) * 100;
        }

        // Update current chapter
        updateCurrentChapter();
    }
};

// Update current chapter based on playback position
const updateCurrentChapter = () => {
    if (chapters.value.length > 0) {
        for (let i = chapters.value.length - 1; i >= 0; i--) {
            if (currentTime.value >= chapters.value[i].startTime) {
                currentChapter.value = i;
                break;
            }
        }
    }
};

// Handle seek
const handleSeek = () => {
    if (audioElement.value && duration.value) {
        const newTime = (seekPosition.value / 100) * duration.value;
        audioElement.value.currentTime = newTime;
        currentTime.value = newTime;
    }
};

// Toggle play/pause
const togglePlay = () => {
    if (audioElement.value) {
        if (audioElement.value.paused) {
            audioElement.value.play();
            isPlaying.value = true;
        } else {
            audioElement.value.pause();
            isPlaying.value = false;
        }
    }
};

// Toggle mute
const toggleMute = () => {
    if (audioElement.value) {
        audioElement.value.muted = !audioElement.value.muted;
        muted.value = audioElement.value.muted;
    }
};

// Update volume
const updateVolume = () => {
    if (audioElement.value) {
        audioElement.value.volume = volume.value / 100;

        // Unmute if volume is changed while muted
        if (muted.value && volume.value > 0) {
            audioElement.value.muted = false;
            muted.value = false;
        }
    }
};

// Set playback rate
const setPlaybackRate = (rate) => {
    if (audioElement.value) {
        audioElement.value.playbackRate = rate;
        currentPlaybackRate.value = rate;
    }
};

// Skip forward/backward
const skipForward = () => {
    if (audioElement.value) {
        audioElement.value.currentTime = Math.min(audioElement.value.currentTime + 10, audioElement.value.duration);
    }
};

const skipBackward = () => {
    if (audioElement.value) {
        audioElement.value.currentTime = Math.max(audioElement.value.currentTime - 10, 0);
    }
};

// Jump to chapter
const jumpToChapter = (chapter, index) => {
    if (audioElement.value) {
        audioElement.value.currentTime = chapter.startTime;
        currentChapter.value = index;

        // Start playing if paused
        if (audioElement.value.paused) {
            audioElement.value.play();
            isPlaying.value = true;
        }
    }
};

// Visualizer setup
const setupVisualizer = () => {
    if (!visualizerCanvas.value || !audioElement.value) return;

    try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            console.warn('AudioContext not supported in this browser');
            return;
        }

        audioContext.value = new AudioContext();
        analyser.value = audioContext.value.createAnalyser();

        // Create source from audio element
        const source = audioContext.value.createMediaElementSource(audioElement.value);
        source.connect(analyser.value);
        analyser.value.connect(audioContext.value.destination);

        // Configure analyser
        analyser.value.fftSize = 256;
    } catch (err) {
        console.error('Error setting up audio visualizer:', err);
        // Disable visualizer if there's an error
        showVisualizer.value = false;
    }
};

// Draw visualizer
const drawVisualizer = () => {
    if (!visualizerCanvas.value || !analyser.value) return;

    const canvas = visualizerCanvas.value;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Get frequency data
    const bufferLength = analyser.value.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.value.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set bar width based on canvas size and buffer length
    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;

    // Choose color based on dark mode
    const barColor = props.darkMode ? '#5e9ed6' : '#1976d2';

    // Draw bars
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        ctx.fillStyle = barColor;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }

    visualizerAnimationFrame.value = requestAnimationFrame(drawVisualizer);
};

// Start visualizer animation
const startVisualizer = () => {
    if (showVisualizer.value && analyser.value) {
        // Set canvas dimensions
        if (visualizerCanvas.value) {
            visualizerCanvas.value.width = visualizerCanvas.value.offsetWidth;
            visualizerCanvas.value.height = 100;
        }

        drawVisualizer();
    }
};

// Stop visualizer animation
const stopVisualizer = () => {
    if (visualizerAnimationFrame.value) {
        cancelAnimationFrame(visualizerAnimationFrame.value);
    }
};

// Watch for URL changes
watch(
    () => props.resourceUrl,
    () => {
        loadAudio();
    },
    { immediate: false }
);

// Watch for visualizer toggle
watch(showVisualizer, (newVal) => {
    if (newVal && isPlaying.value) {
        startVisualizer();
    } else {
        stopVisualizer();
    }
});

// Initialize on mount
onMounted(() => {
    loadAudio();

    // Setup visualizer after a short delay to ensure DOM is ready
    setTimeout(() => {
        setupVisualizer();
    }, 500);

    // Set canvas dimensions
    if (visualizerCanvas.value) {
        visualizerCanvas.value.width = visualizerCanvas.value.offsetWidth;
        visualizerCanvas.value.height = 100;
    }
});

// Clean up on unmount
onBeforeUnmount(() => {
    stopVisualizer();

    if (audioElement.value) {
        audioElement.value.pause();
    }

    if (audioContext.value) {
        audioContext.value.close();
    }
});
</script>

<style scoped>
.audio-player-wrapper {
    padding: 1rem;
    border-radius: 8px;
    background-color: #f9f9f9;
    width: 100%;
}

.audio-loading,
.audio-error {
    min-height: 100px;
}

.visualizer-container {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    height: 100px;
    overflow: hidden;
}

.custom-controls {
    user-select: none;
}

.time-progress {
    font-size: 0.85rem;
    color: #666;
}

/* Dark mode */
.dark-mode {
    background-color: #262626;
    color: #f0f0f0;
}

.dark-mode .time-progress {
    color: #aaa;
}

.dark-mode .visualizer-container {
    background-color: rgba(255, 255, 255, 0.05);
}

/* Responsive styles */
@media (max-width: 640px) {
    .extra-controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .playback-controls {
        margin-bottom: 0.5rem;
    }
}
</style>
