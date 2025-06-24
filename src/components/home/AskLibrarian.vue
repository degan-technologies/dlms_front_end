<script setup>
import { useChatStore } from '@/stores/chatStore';
import axiosInstance from '@/util/axios-config';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Get chat store
const chatStore = useChatStore();

const messages = ref([]);
const newMessage = ref('');
const chatBox = ref(null);
const isTyping = ref(false);
const loading = ref(false);
// Unique session ID per visitor
const sessionId = ref(localStorage.getItem('chat_session_id') || crypto.randomUUID());
if (!localStorage.getItem('chat_session_id')) {
    localStorage.setItem('chat_session_id', sessionId.value);
}

const formatDateTime = (time) => {
    if (!time) return '';
    const d = new Date(time);
    return `${d.toLocaleDateString()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const scrollToBottom = () => {
    nextTick(() => {
        if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight;
    });
};

const fetchMessages = async () => {
    try {
        const { data } = await axiosInstance.get('/anonymous-chat', {
            params: { session_id: sessionId.value }
        });

        // Pair questions with their replies using the parent_id relationship
        const visitorMessages = data.filter((msg) => msg.sender === 'visitor');
        const pairs = visitorMessages.map((question) => ({
            question,
            answer: data.find((msg) => msg.parent_id === question.id) || null
        }));

        messages.value = pairs;
        scrollToBottom();
    } catch (err) {
        console.error('Error fetching chat messages:', err);
    }
};

const sendMessage = async () => {
    if (!newMessage.value.trim()) return;

    loading.value = true;

    try {
        const { data } = await axiosInstance.post('/anonymous-chat', {
            session_id: sessionId.value,
            message: newMessage.value
        });

        messages.value.push({ question: data, answer: null });
        newMessage.value = '';
        simulateTyping();
    } catch (err) {
        console.error('Error sending message:', err);
    } finally {
        loading.value = false;
    }
};

const simulateTyping = () => {
    isTyping.value = true;
    setTimeout(fetchMessages, 1500);
    setTimeout(() => {
        isTyping.value = false;
        scrollToBottom();
    }, 1600);
};

// Initialize Tawk.to script injection
let tawkScriptInjected = false;

const initializeTawk = () => {
    if (tawkScriptInjected) return;

    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/6830a9ba12ae50190a96f480/1irv1e0vk';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);
    tawkScriptInjected = true;

    // Initially hide Tawk widget
    setTimeout(() => {
        if (window.Tawk_API?.hideWidget) {
            window.Tawk_API.hideWidget();
        }
    }, 1000);
};

onMounted(() => {
    initializeTawk();
    // Fetch messages when chat is opened
    if (chatStore.isChatOpen) {
        fetchMessages();
    }
});
watch(
    () => chatStore.isChatOpen,
    (newVal) => {
        if (newVal) fetchMessages();
    }
);

onBeforeUnmount(() => {
    // Clean up if needed
});
</script>

<template>
    <div class="fixed bottom-6 right-6 flex flex-col items-end z-50 space-y-2">
        <transition name="slide-fade">
            <section v-if="chatStore.isChatOpen" class="mt-4 w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl shadow-xl border border-indigo-100 flex flex-col">
                <header class="flex items-center justify-between bg-indigo-600 text-white rounded-t-xl px-4 py-3">
                    <h2 class="font-semibold text-lg select-none">Ask a Librarian</h2>
                    <button @click="chatStore.closeChat" aria-label="Close chat" class="hover:text-indigo-300 transition">
                        <i class="pi pi-times"></i>
                    </button>
                </header>

                <div ref="chatBox" class="flex-1 overflow-y-auto p-4 space-y-4 bg-indigo-50 min-h-[40vh] max-h-[60vh]">
                    <div v-for="(pair, index) in messages" :key="index" class="space-y-3">
                        <!-- Question from visitor -->
                        <div class="flex justify-start">
                            <div class="max-w-[75%] px-4 py-2 rounded-lg text-sm shadow bg-white text-gray-800 border border-gray-200">
                                <p class="whitespace-pre-wrap break-words">{{ pair.question.message }}</p>
                                <span class="block mt-1 text-[10px] text-gray-400 text-left select-none">
                                    {{ formatDateTime(pair.question.created_at) }}
                                </span>
                            </div>
                        </div>

                        <!-- Answer from librarian -->
                        <div class="flex justify-end" v-if="pair.answer">
                            <div class="max-w-[75%] px-4 py-2 rounded-lg text-sm shadow bg-indigo-600 text-white">
                                <p class="whitespace-pre-wrap break-words">{{ pair.answer.message }}</p>
                                <span class="block mt-1 text-[10px] text-gray-300 text-right select-none">
                                    {{ formatDateTime(pair.answer.created_at) }}
                                </span>
                            </div>
                        </div>
                        <div class="flex justify-end italic text-gray-500" v-else>
                            <div class="max-w-[75%] px-4 py-2 rounded-lg text-sm shadow bg-indigo-100 text-indigo-700">No answer yet.</div>
                        </div>
                    </div>

                    <div v-if="isTyping" class="flex justify-start">
                        <div class="bg-white border rounded-full px-4 py-1 text-sm text-gray-500 animate-pulse select-none">Librarian is typing...</div>
                    </div>
                </div>

                <form @submit.prevent="sendMessage" class="flex flex-wrap items-center gap-2 p-4 border-t border-indigo-100 bg-white rounded-b-xl">
                    <input
                        v-model="newMessage"
                        :disabled="loading"
                        type="text"
                        placeholder="Type your message..."
                        class="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        @keydown.enter.exact.prevent="sendMessage"
                    />
                    <button type="submit" :disabled="loading || !newMessage.trim()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">Send</button>
                </form>
            </section>
        </transition>
    </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>
