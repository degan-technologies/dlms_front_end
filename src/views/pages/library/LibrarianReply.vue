<template>
    <div class="p-6 max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-center mb-6 text-blue-800">📚 Librarian Chat Portal</h1>

        <div v-for="question in visitorMessages" :key="question.id" class="bg-white shadow rounded-lg mb-6 p-4 border border-gray-200">
            <!-- Visitor Question -->
            <div class="flex items-start gap-3 mb-2">
                <div class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">V</div>
                <div class="bg-gray-100 p-3 rounded-xl max-w-3xl">
                    <p class="text-gray-800">{{ question.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ formatDate(question.created_at) }}</p>
                </div>
            </div>

            <!-- If Replied: Show Librarian Answer -->
            <div v-if="replyMap[question.id]" class="flex items-start gap-3 ml-12 mt-2">
                <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">L</div>
                <div class="bg-blue-600 text-white p-3 rounded-xl max-w-3xl">
                    <p>{{ replyMap[question.id].message }}</p>
                    <p class="text-xs text-blue-100 mt-1">{{ formatDate(replyMap[question.id].created_at) }}</p>
                </div>
            </div>

            <!-- Else: Show Reply Input -->
            <div v-else class="ml-12 mt-3 flex gap-2">
                <input v-model="replyInputs[question.id]" type="text" class="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring" placeholder="Write your reply..." />
                <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" @click="sendReply(question)">Reply</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import { computed, onMounted, ref } from 'vue';

const messages = ref([]);
const replyInputs = ref({});
const replyMap = ref({}); // questionId => librarian reply

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
