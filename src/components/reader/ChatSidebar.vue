<template>
    <Sidebar v-model:visible="modelValue" position="right" class="w-full md:w-[650px] lg:w-[800px]">
        <template #header>
            <div class="flex items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700 w-full">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white mr-3">
                    <i class="pi pi-comments text-lg"></i>
                </div>
                <h3 class="m-0 text-xl font-bold text-gray-800 dark:text-gray-100">AI Assistant ({{ chatMessages.length }})</h3>
            </div>
        </template>
        <div class="p-4 h-full flex flex-col">
            <div class="flex items-center gap-2 mb-3">
                <label v-if="timerLabel" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ timerLabel }}:</label>
                <span v-if="timerValue" class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full font-mono font-medium">{{ timerValue }}</span>
                <slot name="extra-controls"></slot>
            </div>
            <Textarea v-model="chatContent" autoResize rows="3" class="w-full mb-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 p-3 text-base" placeholder="Ask about this..." />
            <div class="flex justify-between mt-2">
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="onCancel" />
                <Button label="Send" icon="pi pi-send" class="p-button-primary p-button-rounded px-5" @click="onSend" :disabled="!chatContent.trim()" />
            </div>

            <div v-if="chatMessages.length > 0" class="mt-6 flex-1 overflow-y-auto chat-messages">
                <div class="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <span>Conversation History</span>
                        <slot name="filter-controls"></slot>
                    </div>
                </div>

                <div v-if="filteredMessages.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
                    <div class="w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <i class="pi pi-comments text-3xl opacity-50"></i>
                    </div>
                    <p class="text-lg font-medium">No conversations yet</p>
                    <p class="text-sm text-center max-w-xs mt-2">Ask the AI about specific content to get expert insights and explanations.</p>
                </div>

                <div v-else class="space-y-8">
                    <div v-for="msg in filteredMessages" :key="msg.id" class="chat-message">
                        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <div class="flex items-center gap-2">
                                <span class="font-medium">{{ msg.user?.username || 'You' }}</span>
                                <span class="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full font-mono font-medium cursor-pointer" @click="onJumpTo(msg)">
                                    {{ msg.timerDisplay || (msg.timestamp ? formatTime(msg.timestamp) : msg.page_number ? 'Page ' + msg.page_number : '') }}
                                </span>
                            </div>
                            <span>{{ msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Just now' }}</span>
                        </div>

                        <div v-if="msg.highlight_text" class="mb-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border-l-4 border-yellow-400 text-sm">
                            <span class="text-gray-500 dark:text-gray-400 block mb-1 font-medium">Selected text:</span>
                            <span class="text-gray-800 dark:text-gray-200 italic">{{ msg.highlight_text }}</span>
                        </div>

                        <div class="mb-2 text-base text-gray-800 dark:text-gray-200">{{ msg.question }}</div>

                        <div class="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-gray-800 dark:text-gray-200 shadow-sm mt-2"><span class="font-semibold">AI:</span> {{ msg.ai_response }}</div>

                        <div class="flex justify-end mt-2">
                            <Button icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger p-button-rounded" @click="() => onDelete(msg.id)" v-tooltip.left="'Delete message'" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Sidebar>
</template>

<script setup>
import Button from 'primevue/button';
import Sidebar from 'primevue/sidebar';
import Textarea from 'primevue/textarea';
import { computed, ref, watch } from 'vue';

const props = defineProps({
    visible: Boolean,
    chatMessages: {
        type: Array,
        default: () => []
    },
    filteredMessages: {
        type: Array,
        default: null // Will fallback to chatMessages if not provided
    },
    timerLabel: String,
    timerValue: [String, Number],
    currentTime: {
        type: Number,
        default: 0
    },
    pageNumber: {
        type: Number,
        default: null
    },
    selectedText: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:visible', 'save-chat', 'delete', 'cancel', 'jump-to']);

const modelValue = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const chatContent = ref('');

// Show highlighted text in the input area if present
const highlightedText = computed(() => props.selectedText || '');

// Pre-fill chatContent with selectedText when sidebar opens
watch(
    () => props.visible,
    (val) => {
        if (val) {
            chatContent.value = props.selectedText;
        } else {
            chatContent.value = '';
        }
    }
);

function onSend() {
    const chatData = {
        question: chatContent.value,
        highlight_text: highlightedText.value || null,
        page_number: props.pageNumber || null
    };
    emit('save-chat', chatData);
    chatContent.value = '';
}

function onCancel() {
    emit('cancel');
    chatContent.value = '';
}

function onDelete(id) {
    emit('delete', id);
}

function onJumpTo(msg) {
    emit('jump-to', msg);
}

function formatTime(seconds) {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${mins}:${secs}`;
}

const chatMessagesArray = computed(() => {
    if (Array.isArray(props.chatMessages)) return props.chatMessages;
    if (props.chatMessages && Array.isArray(props.chatMessages.data)) return props.chatMessages.data;
    return [];
});

const filteredMessages = computed(() => {
    // Sort by created_at ascending (oldest first)
    return chatMessagesArray.value.slice().sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
});

// Clear content when sidebar closes
watch(
    () => props.visible,
    (val) => {
        if (!val) chatContent.value = '';
    }
);
</script>

<style scoped>
/* ChatGPT-like styling */
.chat-messages .chat-message {
    position: relative;
}

.chat-messages .chat-message:not(:last-child)::after {
    content: '';
    position: absolute;
    bottom: -1rem;
    left: 1.25rem;
    height: 0.75rem;
    border-left: 2px dashed rgba(156, 163, 175, 0.2);
}
</style>
