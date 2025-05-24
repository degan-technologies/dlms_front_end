<template>
    <div class="relative w-full h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
        <!-- Loading State -->
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <div class="text-center">
                <div class="w-12 h-12 border-4 border-t-red-500 border-gray-200 rounded-full animate-spin mb-4 mx-auto"></div>
                <p class="text-gray-700 dark:text-gray-300">Loading video...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <div class="text-center max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="pi pi-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load video</h3>
                <p class="text-gray-700 dark:text-gray-300 mb-4">{{ error }}</p>
                <button @click="initPlayer" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Try Again</button>
            </div>
        </div>

        <!-- Main Content -->
        <div v-show="!loading && !error" class="flex-1 overflow-auto relative">
            <!-- Video Player Container -->
            <div class="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800">
                <!-- Player wrapper with controls overlay -->
                <div class="w-full max-w-4xl shadow-lg rounded-lg overflow-hidden aspect-video relative bg-black">
                    <div :id="playerId" class="w-full h-full"></div>

                    <!-- Quick action buttons overlay -->
                    <div v-if="isPlaying" class="absolute bottom-4 right-4 flex gap-2 bg-black/60 rounded-full p-2 backdrop-blur-sm">
                        <button @click="quickAddNote" class="p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-white transition-colors" title="Add note at current timestamp">
                            <i class="pi pi-pencil text-sm"></i>
                        </button>
                        <button @click="askAIAboutCurrentSegment" class="p-2 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white transition-colors" title="Ask AI about this moment">
                            <i class="pi pi-comments text-sm"></i>
                        </button>
                    </div>

                    <!-- Timestamp markers for existing notes and chats -->
                    <div class="absolute bottom-0 left-0 right-0 h-2 bg-transparent">
                        <!-- Note markers -->
                        <div
                            v-for="note in props.notes"
                            :key="`note-${note.id}`"
                            class="absolute h-full w-1 bg-amber-500 cursor-pointer hover:bg-amber-400 transition-colors"
                            :style="{ left: `${(note.timestamp / videoMeta.duration) * 100}%` }"
                            @click="goToTimestamp(note.timestamp)"
                            :title="`Note: ${formatDuration(note.timestamp)}`"
                        ></div>
                        <!-- Chat markers -->
                        <div
                            v-for="chat in props.chatMessages"
                            :key="`chat-${chat.id}`"
                            class="absolute h-full w-1 bg-indigo-500 cursor-pointer hover:bg-indigo-400 transition-colors"
                            :style="{ left: `${(chat.timestamp / videoMeta.duration) * 100}%` }"
                            @click="goToTimestamp(chat.timestamp)"
                            :title="`Chat: ${formatDuration(chat.timestamp)}`"
                        ></div>
                    </div>
                </div>

                <!-- Video Info Section -->
                <div class="w-full max-w-4xl mt-4 p-5 bg-white dark:bg-gray-700 rounded-lg shadow-md" v-if="videoMeta.title">
                    <h3 class="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3">{{ videoMeta.title }}</h3>

                    <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div v-if="videoMeta.author" class="flex items-center gap-2">
                            <i class="pi pi-user"></i>
                            <span>{{ videoMeta.author }}</span>
                        </div>
                        <div v-if="videoMeta.duration" class="flex items-center gap-2">
                            <i class="pi pi-clock"></i>
                            <span>{{ formatDuration(videoMeta.duration) }}</span>
                        </div>
                    </div>

                    <!-- Custom Progress Bar -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>{{ formatDuration(currentTime) }}</span>
                            <span>{{ formatDuration(videoMeta.duration) }}</span>
                        </div>
                        <div class="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden relative cursor-pointer" @click="seekToPosition">
                            <div class="h-full bg-red-500 dark:bg-red-600 transition-all duration-300" :style="{ width: `${(currentTime / videoMeta.duration) * 100}%` }"></div>

                            <!-- Note markers on progress bar -->
                            <div
                                v-for="note in props.notes"
                                :key="`progress-note-${note.id}`"
                                class="absolute top-0 bottom-0 w-1 bg-amber-500"
                                :style="{ left: `${(note.timestamp / videoMeta.duration) * 100}%` }"
                                @click.stop="goToTimestamp(note.timestamp)"
                                :title="`Note: ${formatDuration(note.timestamp)}`"
                            ></div>

                            <!-- Chat markers on progress bar -->
                            <div
                                v-for="chat in props.chatMessages"
                                :key="`progress-chat-${chat.id}`"
                                class="absolute top-0 bottom-0 w-1 bg-indigo-500"
                                :style="{ left: `${(chat.timestamp / videoMeta.duration) * 100}%` }"
                                @click.stop="goToTimestamp(chat.timestamp)"
                                :title="`Chat: ${formatDuration(chat.timestamp)}`"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Floating Action Buttons -->
            <div class="fixed right-4 bottom-4 z-30 flex flex-col gap-3 sm:top-1/2 sm:transform sm:-translate-y-1/2 sm:bottom-auto">
                <!-- Notes Button -->
                <div class="relative group">
                    <button
                        @click="notesSidebar = true"
                        class="w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110"
                        title="View Notes"
                    >
                        <i class="pi pi-book text-lg"></i>
                        <span v-if="props.notes.length" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {{ props.notes.length > 99 ? '99+' : props.notes.length }}
                        </span>
                    </button>
                    <!-- Tooltip -->
                    <div class="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Notes ({{ props.notes.length }})
                        <div class="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-y-4 border-y-transparent"></div>
                    </div>
                </div>

                <!-- Chat Button -->
                <div class="relative group">
                    <button
                        @click="chatSidebar = true"
                        class="w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110"
                        title="View Chat Messages"
                    >
                        <i class="pi pi-comments text-lg"></i>
                        <span v-if="props.chatMessages.length" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {{ props.chatMessages.length > 99 ? '99+' : props.chatMessages.length }}
                        </span>
                    </button>
                    <!-- Tooltip -->
                    <div class="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Chat Messages ({{ props.chatMessages.length }})
                        <div class="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-y-4 border-y-transparent"></div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Note Sidebar -->
        <NoteSidebar v-model:visible="notesSidebar" :notes="filteredNotes" :current-time="currentTime" timer-label="Timestamp" :timer-value="formatDuration(currentTime)" @save-note="addNoteWithTimestamp" @delete="deleteNote" @jump-to="jumpToNote" />

        <!-- Chat Sidebar -->
        <ChatSidebar
            v-model:visible="chatSidebar"
            :chat-messages="filteredChatMessages"
            :current-time="currentTime"
            timer-label="Timestamp"
            :timer-value="formatDuration(currentTime)"
            @save-chat="sendChatWithTimestamp"
            @delete="deleteChatMessage"
            @jump-to="jumpToChat"
        />
    </div>
</template>

<script setup>
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ChatSidebar from './ChatSidebar.vue';
import NoteSidebar from './NoteSidebar.vue';

const props = defineProps({
    videoId: {
        type: String,
        required: true
    },
    bookItemId: {
        type: [Number, String],
        default: null
    },
    ebookId: {
        type: [Number, String],
        default: null
    },
    darkMode: {
        type: Boolean,
        default: false
    },
    autoplay: {
        type: Boolean,
        default: false
    },
    notes: {
        type: Array,
        default: () => []
    },
    chatMessages: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['loading-error', 'video-loaded', 'timeupdate', 'add-note', 'delete-note', 'go-back', 'ask-ai-about-timestamp', 'add-chat-message', 'delete-chat-message']);

// Core refs
const toast = useToast();
const player = ref(null);
const playerId = ref(`youtube-player-${Date.now()}`);

// State
const loading = ref(true);
const error = ref(null);
const scriptLoaded = ref(false);
const isPlaying = ref(false);
const currentTime = ref(0);

// Video metadata
const videoMeta = ref({
    title: '',
    author: '',
    duration: 0
});

// Sidebars
const notesSidebar = ref(false);
const chatSidebar = ref(false);

// Filter options for notes and chats
const filterNearbyNotes = ref(true);
const filterNearbyChatMessages = ref(true);
const selectedFilterTime = ref(60); // Default to 60 seconds range

// Computed property for filtered notes
const filteredNotes = computed(() => {
    if (!props.notes) return [];

    let result = props.notes;
    if (filterNearbyNotes.value) {
        result = result.filter((note) => {
            const timestamp = note.timestamp || 0;
            return Math.abs(timestamp - currentTime.value) <= selectedFilterTime.value;
        });
    }

    // Format each note with a properly formatted timestamp string
    result = result.map((note) => {
        return {
            ...note,
            formatted_time: note.formatted_time || formatDuration(note.timestamp || 0)
        };
    });

    // Sort by timestamp
    return result.slice().sort((a, b) => {
        const timestampA = a.timestamp || 0;
        const timestampB = b.timestamp || 0;
        return timestampA - timestampB;
    });
});

// Computed property for filtered chat messages
const filteredChatMessages = computed(() => {
    if (!props.chatMessages) return [];

    let result = props.chatMessages;
    if (filterNearbyChatMessages.value) {
        result = result.filter((msg) => {
            const timestamp = msg.timestamp || 0;
            return Math.abs(timestamp - currentTime.value) <= selectedFilterTime.value;
        });
    }

    // Format each message with a properly formatted timestamp string
    result = result.map((msg) => {
        return {
            ...msg,
            formatted_time: formatDuration(msg.timestamp || 0),
            creation_date: msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Just now'
        };
    });

    // Sort by timestamp when filtering by nearby messages, or by creation date when showing all
    if (filterNearbyChatMessages.value) {
        result = result.slice().sort((a, b) => {
            const timestampA = a.timestamp || 0;
            const timestampB = b.timestamp || 0;
            return timestampA - timestampB;
        });
    } else {
        result = result.slice().sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateA - dateB;
        });
    }

    return result;
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

        console.log('Initializing YouTube player with video ID:', props.videoId);

        if (!props.videoId || props.videoId.trim() === '') {
            error.value = 'Invalid video ID provided. Please try a different resource.';
            loading.value = false;
            return;
        }

        if (!scriptLoaded.value) {
            await loadYouTubeAPI();
        }

        // Create player
        player.value = new window.YT.Player(playerId.value, {
            videoId: props.videoId.trim(),
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

        // Setup time update interval for bookmarks and notes
        setInterval(() => {
            if (player.value && typeof player.value.getCurrentTime === 'function') {
                currentTime.value = player.value.getCurrentTime();
                emit('timeupdate', currentTime.value);
            }
        }, 1000);

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
    // Update playing state based on player state
    // States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 1) {
        isPlaying.value = true;
    } else if (event.data === 2) {
        isPlaying.value = false;
    }
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

// AI Integration
const askAIAboutCurrentSegment = () => {
    if (!player.value) return;
    const time = player.value.getCurrentTime();
    const formattedTime = formatDuration(time);

    // Pause the video when asking about a specific timestamp
    player.value.pauseVideo();
    chatSidebar.value = true;

    // Provide visual feedback
    toast.add({
        severity: 'info',
        summary: 'Ask AI',
        detail: `Asking about timestamp ${formattedTime}`,
        life: 2000
    });
};

// Quick actions for notes and AI at specific timestamps
const quickAddNote = () => {
    if (!player.value) return;

    // Pause the video when adding a note
    player.value.pauseVideo();

    // Get current timestamp
    const time = player.value.getCurrentTime();
    const formattedTime = formatDuration(time);

    // Open note sidebar with the current timestamp
    notesSidebar.value = true;

    // Provide visual feedback
    toast.add({
        severity: 'info',
        summary: 'Add Note',
        detail: `Adding note at ${formattedTime}`,
        life: 2000
    });
};

// Seek to position functionality
const seekToPosition = (event) => {
    if (!player.value || !videoMeta.value.duration) return;

    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * videoMeta.value.duration;

    player.value.seekTo(seekTime, true);
    player.value.playVideo();
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

// Go to timestamp functionality
const goToTimestamp = (timestamp) => {
    if (player.value && timestamp) {
        player.value.seekTo(timestamp, true);
        player.value.playVideo();

        toast.add({
            severity: 'info',
            summary: 'Navigation',
            detail: `Jumped to ${formatDuration(timestamp)}`,
            life: 2000
        });
    }
};

// Note handling functions
const addNoteWithTimestamp = (noteData) => {
    if (!noteData.content || !noteData.content.trim()) return;

    // The noteData already contains the timestamp from the sidebar
    emit('add-note', {
        content: noteData.content,
        timestamp: noteData.timestamp || currentTime.value
    });

    toast.add({
        severity: 'success',
        summary: 'Note Added',
        detail: `Note created at ${formatDuration(noteData.timestamp || currentTime.value)}`,
        life: 3000
    });
};

const deleteNote = (noteId) => {
    emit('delete-note', noteId);
};

const jumpToNote = (note) => {
    if (note && note.timestamp) {
        goToTimestamp(note.timestamp);
    }
};

// Chat handling functions
const sendChatWithTimestamp = (chatData) => {
    if (!chatData.question || !chatData.question.trim()) return;

    const time = chatData.timestamp || currentTime.value;
    const formattedTime = formatDuration(time);

    const questionWithContext = `At timestamp ${formattedTime}: ${chatData.question}`;

    emit('add-chat-message', {
        question: questionWithContext,
        timestamp: time,
        is_anonymous: false
    });

    toast.add({
        severity: 'success',
        summary: 'Message Sent',
        detail: 'Your question has been sent successfully',
        life: 3000
    });
};

const deleteChatMessage = (messageId) => {
    emit('delete-chat-message', messageId);
};

const jumpToChat = (msg) => {
    if (msg && msg.timestamp) {
        goToTimestamp(msg.timestamp);
    }
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
/* YouTube Player styles - Consistent with PDFReader */
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

.player-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
}

/* Floating action buttons mobile responsiveness */
@media (max-width: 768px) {
    .fixed.right-4 {
        right: 1rem;
        bottom: 1rem;
    }

    /* Stack buttons horizontally on mobile */
    .fixed.right-4.flex-col {
        flex-direction: row-reverse;
        left: 50%;
        transform: translateX(-50%);
        right: auto;
        bottom: 1rem;
        top: auto;
    }
}

@media (max-width: 640px) {
    .fixed.right-4 {
        right: 0.5rem;
    }

    /* Smaller buttons on very small screens */
    .fixed .w-14 {
        width: 3rem;
        height: 3rem;
    }
}

/* Smooth transitions for buttons */
.transition-all {
    transition: all 0.3s ease;
}

/* Loading animation enhancement */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}

/* Dark mode enhancements */
.dark .video-info {
    background-color: #1f2937;
    color: #f3f4f6;
}

/* Consistent button styling with PDFReader */
.group-hover\:scale-110:hover {
    transform: scale(1.1);
}

/* Progress bar enhancements */
.cursor-pointer:hover {
    cursor: pointer;
}

/* Enhanced shadow for video container */
.shadow-lg {
    box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\:shadow-xl:hover {
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
