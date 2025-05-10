<template>
    <div class="audiobook-player-wrapper" :class="{ 'dark-mode': darkMode }">
        <div v-if="loading" class="audiobook-loading flex align-items-center justify-content-center p-4">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <div v-if="error" class="audiobook-error flex flex-column align-items-center justify-content-center p-4">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mb-3"></i>
            <p class="text-center">{{ error }}</p>
            <Button label="Retry" icon="pi pi-refresh" class="mt-3" @click="loadAudiobook" />
        </div>

        <div class="audiobook-container" v-show="!loading && !error">
            <div class="flex flex-column md:flex-row gap-4">
                <div class="audiobook-cover flex-shrink-0">
                    <img :src="coverUrl || defaultCover" :alt="title || 'Audiobook cover'" class="border-round shadow-2" style="width: 200px; height: auto" />

                    <div class="chapters-panel mt-4">
                        <h3 class="text-lg font-semibold mb-2">Chapters</h3>
                        <div class="chapters-list" style="max-height: 300px; overflow-y: auto">
                            <ul class="list-none p-0 m-0">
                                <li v-for="(chapter, index) in chapters" :key="index" @click="jumpToChapter(index)" class="p-2 cursor-pointer border-bottom-1 surface-border" :class="{ 'surface-hover': currentChapter === index }">
                                    <div class="flex justify-content-between align-items-center">
                                        <span :class="{ 'font-medium': currentChapter === index }">
                                            {{ chapter.title || `Chapter ${index + 1}` }}
                                        </span>
                                        <span class="text-sm text-color-secondary">{{ formatDuration(chapter.duration) }}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="audiobook-player flex-grow-1">
                    <div class="player-info mb-4">
                        <h2 class="text-2xl font-semibold mb-1">{{ title || 'Unknown Title' }}</h2>
                        <p class="text-color-secondary mb-3">{{ author || 'Unknown Author' }}</p>

                        <div class="current-chapter mb-3">
                            <span class="text-color-secondary">Current Chapter: </span>
                            <span class="font-medium">{{ currentChapterTitle }}</span>
                        </div>
                    </div>

                    <audio
                        ref="audioElement"
                        :src="currentAudioSrc"
                        @timeupdate="onTimeUpdate"
                        @loadedmetadata="onAudioLoaded"
                        @ended="onAudioEnded"
                        @error="onAudioError"
                        @waiting="onAudioBuffering"
                        @canplay="onAudioCanPlay"
                        controls
                        style="width: 100%"
                    ></audio>

                    <div class="player-controls mt-4">
                        <div class="progress-container mb-2">
                            <div class="time-display flex justify-content-between mb-1">
                                <small>{{ formatDuration(currentTime) }}</small>
                                <small>{{ formatDuration(duration) }}</small>
                            </div>
                            <Slider v-model="sliderPosition" :step="0.1" :min="0" :max="100" @change="onProgressChange" class="w-full" />
                        </div>

                        <div class="controls-buttons flex justify-content-center align-items-center gap-3 mt-4">
                            <Button icon="pi pi-step-backward" rounded text @click="previousChapter" />
                            <Button icon="pi pi-backward" rounded text @click="skip(-30)" tooltip="-30 seconds" tooltipOptions="{ position: 'bottom' }" />
                            <Button :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'" rounded class="p-button-lg" @click="togglePlay" />
                            <Button icon="pi pi-forward" rounded text @click="skip(30)" tooltip="+30 seconds" tooltipOptions="{ position: 'bottom' }" />
                            <Button icon="pi pi-step-forward" rounded text @click="nextChapter" />
                        </div>

                        <div class="playback-speed flex align-items-center justify-content-center gap-2 mt-4">
                            <Button v-for="speed in playbackSpeeds" :key="speed" :label="`${speed}x`" :class="{ 'p-button-outlined': currentPlaybackSpeed !== speed }" size="small" @click="setPlaybackSpeed(speed)" />
                        </div>
                    </div>

                    <div class="bookmarks-panel mt-6">
                        <div class="flex justify-content-between align-items-center mb-3">
                            <h3 class="text-lg font-semibold m-0">Bookmarks</h3>
                            <Button icon="pi pi-plus" label="Add Bookmark" size="small" @click="addBookmark" />
                        </div>

                        <div v-if="bookmarks.length === 0" class="text-center p-3 surface-ground border-round">
                            <p class="text-color-secondary m-0">No bookmarks yet</p>
                        </div>

                        <ul v-else class="list-none p-0 m-0">
                            <li v-for="(bookmark, index) in bookmarks" :key="index" class="flex justify-content-between align-items-center p-2 mb-2 border-round surface-ground">
                                <div>
                                    <div class="font-medium">{{ bookmark.title || `Bookmark ${index + 1}` }}</div>
                                    <div class="text-color-secondary text-sm">{{ formatDuration(bookmark.time) }}</div>
                                </div>
                                <div class="flex gap-2">
                                    <Button icon="pi pi-play" text rounded @click="jumpToBookmark(bookmark)" tooltip="Play from here" tooltipOptions="{ position: 'bottom' }" />
                                    <Button icon="pi pi-trash" text rounded severity="danger" @click="deleteBookmark(index)" tooltip="Delete" tooltipOptions="{ position: 'bottom' }" />
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Bookmark Dialog -->
        <Dialog v-model:visible="showBookmarkDialog" header="Add Bookmark" :style="{ width: '450px' }" modal>
            <div class="p-fluid">
                <div class="field mb-4">
                    <label for="bookmarkTitle" class="font-medium">Title</label>
                    <InputText id="bookmarkTitle" v-model="newBookmark.title" placeholder="Enter bookmark title" />
                </div>
                <div class="field mb-4">
                    <label for="bookmarkNotes" class="font-medium">Notes</label>
                    <Textarea id="bookmarkNotes" v-model="newBookmark.notes" rows="3" placeholder="Enter optional notes" autoResize />
                </div>
                <div class="field">
                    <label class="font-medium">Position</label>
                    <div class="text-color-secondary">{{ formatDuration(newBookmark.time) }}</div>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="cancelBookmarkDialog" text />
                <Button label="Save" icon="pi pi-check" @click="saveBookmark" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import Slider from 'primevue/slider';
import Textarea from 'primevue/textarea';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
    // The main audiobook URL or ID
    audiobookId: {
        type: String,
        required: true
    },
    // Object with audiobook metadata
    metadata: {
        type: Object,
        default: () => ({
            title: '',
            author: '',
            coverUrl: '',
            chapters: [] // Array of { title, src, duration } objects
        })
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

const emit = defineEmits(['loading-error', 'audiobook-loaded', 'chapter-change', 'bookmark-added', 'bookmark-deleted']);

// State refs
const loading = ref(true);
const error = ref(null);
const audioElement = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const sliderPosition = ref(0);
const currentChapter = ref(0);
const chapters = ref([]);
const title = ref('');
const author = ref('');
const coverUrl = ref('');
const playbackSpeeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
const currentPlaybackSpeed = ref(1);
const bookmarks = ref([]);
const showBookmarkDialog = ref(false);
const newBookmark = ref({
    title: '',
    notes: '',
    time: 0,
    chapter: 0
});

// Default placeholder cover
const defaultCover = 'https://via.placeholder.com/300x300?text=Audiobook';

// Computed properties
const currentAudioSrc = computed(() => {
    if (chapters.value.length === 0) return '';
    return chapters.value[currentChapter.value]?.src || '';
});

const currentChapterTitle = computed(() => {
    if (chapters.value.length === 0) return 'Unknown Chapter';
    return chapters.value[currentChapter.value]?.title || `Chapter ${currentChapter.value + 1}`;
});

// Methods
const loadAudiobook = async () => {
    try {
        loading.value = true;
        error.value = null;

        // Set metadata from props
        title.value = props.metadata.title || 'Unknown Title';
        author.value = props.metadata.author || 'Unknown Author';
        coverUrl.value = props.metadata.coverUrl || '';

        // Set up chapters
        if (props.metadata.chapters && props.metadata.chapters.length > 0) {
            chapters.value = [...props.metadata.chapters];
        } else {
            // If no chapters provided, create a single chapter with the main URL
            chapters.value = [
                {
                    title: 'Full Audiobook',
                    src: props.audiobookId,
                    duration: 0
                }
            ];
        }

        // Try to load previously saved bookmarks
        loadBookmarks();

        loading.value = false;

        // If autoplay is enabled, start playing once loaded
        if (props.autoplay && audioElement.value) {
            audioElement.value
                .play()
                .then(() => {
                    isPlaying.value = true;
                })
                .catch((err) => {
                    console.warn('Autoplay prevented:', err);
                });
        }
    } catch (err) {
        console.error('Failed to load audiobook:', err);
        error.value = 'Failed to load the audiobook. Please try again.';
        loading.value = false;
        emit('loading-error', 'Failed to load the audiobook');
    }
};

// Player controls
const togglePlay = () => {
    if (!audioElement.value) return;

    if (isPlaying.value) {
        audioElement.value.pause();
        isPlaying.value = false;
    } else {
        audioElement.value
            .play()
            .then(() => {
                isPlaying.value = true;
            })
            .catch((err) => {
                console.error('Error playing audio:', err);
            });
    }
};

const onTimeUpdate = () => {
    if (!audioElement.value) return;

    currentTime.value = audioElement.value.currentTime;
    if (duration.value > 0) {
        sliderPosition.value = (currentTime.value / duration.value) * 100;
    }
};

const onProgressChange = () => {
    if (!audioElement.value || duration.value === 0) return;

    const newTime = (sliderPosition.value / 100) * duration.value;
    audioElement.value.currentTime = newTime;
    currentTime.value = newTime;
};

const onAudioLoaded = () => {
    if (!audioElement.value) return;

    duration.value = audioElement.value.duration;

    // Update chapter duration if it wasn't known before
    if (chapters.value[currentChapter.value] && !chapters.value[currentChapter.value].duration) {
        chapters.value[currentChapter.value].duration = duration.value;
    }

    emit('audiobook-loaded', {
        title: title.value,
        author: author.value,
        chapter: currentChapterTitle.value,
        duration: duration.value
    });
};

const onAudioEnded = () => {
    isPlaying.value = false;

    // Auto-advance to next chapter
    if (currentChapter.value < chapters.value.length - 1) {
        nextChapter();
    }
};

const onAudioError = (e) => {
    console.error('Audio playback error:', e);
    error.value = 'Failed to play this audiobook chapter';
    isPlaying.value = false;
    emit('loading-error', 'Failed to play audiobook chapter');
};

const onAudioBuffering = () => {
    // Handle buffering state
};

const onAudioCanPlay = () => {
    // Audio is ready to play
};

const skip = (seconds) => {
    if (!audioElement.value) return;

    audioElement.value.currentTime += seconds;
    currentTime.value = audioElement.value.currentTime;
};

const previousChapter = () => {
    if (currentChapter.value > 0) {
        changeChapter(currentChapter.value - 1);
    } else {
        // If at first chapter, just restart it
        if (audioElement.value) {
            audioElement.value.currentTime = 0;
            currentTime.value = 0;
        }
    }
};

const nextChapter = () => {
    if (currentChapter.value < chapters.value.length - 1) {
        changeChapter(currentChapter.value + 1);
    }
};

const jumpToChapter = (chapterIndex) => {
    if (chapterIndex >= 0 && chapterIndex < chapters.value.length) {
        changeChapter(chapterIndex);
    }
};

const changeChapter = (newChapterIndex) => {
    currentChapter.value = newChapterIndex;
    currentTime.value = 0;
    sliderPosition.value = 0;

    // Need to wait for the audio element to update with new src
    setTimeout(() => {
        if (audioElement.value) {
            audioElement.value.currentTime = 0;

            if (isPlaying.value) {
                audioElement.value.play().catch((err) => {
                    console.error('Error playing new chapter:', err);
                });
            }
        }
    }, 50);

    emit('chapter-change', {
        index: newChapterIndex,
        title: chapters.value[newChapterIndex]?.title || `Chapter ${newChapterIndex + 1}`
    });
};

const setPlaybackSpeed = (speed) => {
    if (!audioElement.value) return;

    audioElement.value.playbackRate = speed;
    currentPlaybackSpeed.value = speed;
};

// Bookmarks functionality
const loadBookmarks = () => {
    try {
        const savedBookmarks = localStorage.getItem(`audiobook-bookmarks-${props.audiobookId}`);
        if (savedBookmarks) {
            bookmarks.value = JSON.parse(savedBookmarks);
        }
    } catch (err) {
        console.warn('Failed to load bookmarks:', err);
        bookmarks.value = [];
    }
};

const saveBookmarksToStorage = () => {
    try {
        localStorage.setItem(`audiobook-bookmarks-${props.audiobookId}`, JSON.stringify(bookmarks.value));
    } catch (err) {
        console.warn('Failed to save bookmarks:', err);
    }
};

const addBookmark = () => {
    if (!audioElement.value) return;

    newBookmark.value = {
        title: `Bookmark at ${formatDuration(currentTime.value)}`,
        notes: '',
        time: currentTime.value,
        chapter: currentChapter.value
    };

    showBookmarkDialog.value = true;
};

const saveBookmark = () => {
    bookmarks.value.push({ ...newBookmark.value });
    saveBookmarksToStorage();
    emit('bookmark-added', newBookmark.value);
    showBookmarkDialog.value = false;
};

const cancelBookmarkDialog = () => {
    showBookmarkDialog.value = false;
};

const jumpToBookmark = (bookmark) => {
    if (!audioElement.value) return;

    // If bookmark is in different chapter, change chapter first
    if (bookmark.chapter !== currentChapter.value) {
        changeChapter(bookmark.chapter);

        // Need to wait for chapter change before setting time
        setTimeout(() => {
            audioElement.value.currentTime = bookmark.time;
            currentTime.value = bookmark.time;
        }, 100);
    } else {
        audioElement.value.currentTime = bookmark.time;
        currentTime.value = bookmark.time;
    }

    // Start playing
    if (!isPlaying.value) {
        audioElement.value
            .play()
            .then(() => {
                isPlaying.value = true;
            })
            .catch((err) => {
                console.error('Error playing from bookmark:', err);
            });
    }
};

const deleteBookmark = (index) => {
    bookmarks.value.splice(index, 1);
    saveBookmarksToStorage();
    emit('bookmark-deleted', index);
};

// Format time display
const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    return hrs > 0 ? `${hrs}:${formattedMins}:${formattedSecs}` : `${formattedMins}:${formattedSecs}`;
};

// Watch for changes in playing state
watch(isPlaying, (newVal) => {
    if (newVal && audioElement.value) {
        audioElement.value.play().catch((err) => {
            console.error('Error on play state change:', err);
            isPlaying.value = false;
        });
    } else if (audioElement.value) {
        audioElement.value.pause();
    }
});

// Initialize
onMounted(() => {
    loadAudiobook();
});

// Cleanup
onBeforeUnmount(() => {
    if (audioElement.value) {
        audioElement.value.pause();
    }
});
</script>

<style scoped>
.audiobook-player-wrapper {
    width: 100%;
    padding: 1rem;
    border-radius: 8px;
}

.audiobook-container {
    width: 100%;
}

.dark-mode {
    background-color: #262626;
    color: #f0f0f0;
}

.dark-mode .text-color-secondary {
    color: #c0c0c0 !important;
}

.dark-mode .surface-ground {
    background-color: #333 !important;
}

.chapters-list li:hover {
    background-color: var(--surface-hover);
}

@media (max-width: 768px) {
    .audiobook-cover {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 2rem;
    }
}
</style>
