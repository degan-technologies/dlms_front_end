<script setup>
import axiosInstance from '@/util/axios-config';
import { computed, onMounted, ref } from 'vue';

const messages = ref([]);
const replyInputs = ref({});
const replyMap = ref({}); // questionId => librarian reply
const loading = ref(true);

const fetchMessages = async () => {
    try {
        const { data } = await axiosInstance.get('/anonymous-chat');
        messages.value = data;

        // Initialize replyInputs for each visitor message
        replyInputs.value = {};
        data.forEach((msg) => {
            if (msg.sender === 'visitor') {
                replyInputs.value[msg.id] = '';
            }
        });

        buildReplyMap();
        loading.value = false;
    } catch (err) {
        console.error('Failed to fetch messages:', err);
    }
};

// Compute only visitor messages for display
const visitorMessages = computed(() => messages.value.filter((msg) => msg.sender === 'visitor'));

// Build reply map: pair each visitor question with the closest librarian reply that comes after it and hasn't been used
const buildReplyMap = () => {
    replyMap.value = {};

    const librarianReplies = messages.value.filter((msg) => msg.sender === 'librarian').slice();
    // Sort librarian replies by created_at ascending
    librarianReplies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const visitorQs = visitorMessages.value.slice();
    // Sort visitor questions by created_at ascending
    visitorQs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // For each question, find the earliest librarian reply after it that is unused
    for (const q of visitorQs) {
        const qTime = new Date(q.created_at);
        const idx = librarianReplies.findIndex((reply) => new Date(reply.created_at) > qTime);
        if (idx !== -1) {
            replyMap.value[q.id] = librarianReplies[idx];
            librarianReplies.splice(idx, 1); // remove to avoid reuse
        }
    }
};

const sendReply = async (question) => {
    const message = replyInputs.value[question.id];
    if (!message || !message.trim()) return;

    try {
        const { data } = await axiosInstance.post('/anonymous-chat/reply', {
            session_id: question.session_id,
            message
        });

        messages.value.push(data);
        replyInputs.value[question.id] = '';

        // Directly associate the new reply with the question
        replyMap.value[question.id] = data;
    } catch (err) {
        console.error('Reply error:', err);
    }
};

const formatDate = (dt) => new Date(dt).toLocaleString();

onMounted(fetchMessages);
</script>
<template>
    <div class="card p-4 sm:p-6 max-w-5xl mx-auto">
        <h1 class="text-2xl sm:text-3xl font-bold text-center mb-6 text-blue-800 flex items-center justify-center gap-2">
            <!-- Chat bubble pie icon -->
            <svg class="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h5m-5 4h10M21 12c0 4.418-4.03 8-9 8a9.967 9.967 0 01-4.75-1.16L3 20l1.26-3.77A8.973 8.973 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Librarian Chat Portal
        </h1>

        <div v-if="!loading">
            <div v-for="question in visitorMessages" :key="question.id" class="rounded-lg mb-6 p-4 border border-gray-200">
                <!-- Visitor Question -->
                <div class="flex flex-col sm:flex-row items-start gap-3 mb-2">
                    <div class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">V</div>
                    <div class="bg-gray-100 p-3 rounded-xl w-full sm:max-w-3xl">
                        <p class="text-gray-800">{{ question.message }}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            {{ formatDate(question.created_at) }}
                        </p>
                    </div>
                </div>

                <!-- Librarian Answer -->
                <div v-if="replyMap[question.id]" class="flex flex-col sm:flex-row items-start gap-3 sm:ml-12 mt-2">
                    <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">L</div>
                    <div class="bg-blue-600 text-white p-3 rounded-xl w-full sm:max-w-3xl">
                        <p>{{ replyMap[question.id].message }}</p>
                        <p class="text-xs text-blue-100 mt-1">
                            {{ formatDate(replyMap[question.id].created_at) }}
                        </p>
                    </div>
                </div>

                <!-- Reply Input -->
                <div class="sm:ml-12 mt-3 flex flex-col sm:flex-row gap-2">
                    <input v-model="replyInputs[question.id]" type="text" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring" placeholder="Write your reply..." />
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto" @click="sendReply(question)">Reply</button>
                </div>
            </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-else class="space-y-4">
            <div v-for="n in 3" :key="n" class="rounded-lg border p-4 animate-pulse">
                <div class="flex items-start gap-3 mb-2">
                    <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div class="bg-gray-200 h-4 w-3/4 rounded"></div>
                </div>
                <div class="ml-12 mt-2 bg-gray-100 h-4 w-1/2 rounded"></div>
            </div>
        </div>
    </div>
</template>
