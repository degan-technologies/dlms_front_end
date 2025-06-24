<script setup>
import axiosInstance from '@/util/axios-config';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const confirm = useConfirm();
const isAtBottom = ref(false);
const toast = useToast();

const messages = ref([]);
const replyInputs = ref({});
const editInputs = ref({});
const loading = ref(true);
const editingQuestionId = ref(null);
const editingAnswerId = ref(null);

const fetchMessages = async () => {
    try {
        const { data } = await axiosInstance.get('/anonymous-chat');
        messages.value = data;

        // Initialize inputs
        data.forEach((msg) => {
            if (msg.sender === 'visitor') {
                replyInputs.value[msg.id] = msg.reply?.message || '';
                editInputs.value[msg.id] = msg.message;
            }
            if (msg.sender === 'librarian') {
                editInputs.value[msg.id] = msg.message;
            }
        });

        loading.value = false;
    } catch (err) {
        console.error('Failed to fetch messages:', err);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load messages',
            life: 3000
        });
    }
};

const visitorMessages = computed(() => messages.value.filter((msg) => msg.sender === 'visitor'));

const sendReply = async (question) => {
    const message = replyInputs.value[question.id];
    if (!message?.trim()) return;

    try {
        await axiosInstance.post('/anonymous-chat/reply', {
            session_id: question.session_id,
            message: message,
            parent_id: question.id
        });

        await fetchMessages();
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Reply sent successfully',
            life: 3000
        });
    } catch (err) {
        console.error('Reply error:', err);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to send reply',
            life: 3000
        });
    }
};

const deleteMessage = async (id) => {
    try {
        await axiosInstance.delete(`/anonymous-chat/${id}`);
        await fetchMessages();
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Message deleted successfully',
            life: 3000
        });
    } catch (err) {
        console.error('Delete error:', err);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete message',
            life: 3000
        });
    }
};

const confirmDelete = (id, type) => {
    confirm.require({
        message: `Are you sure you want to delete this ${type}?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteMessage(id),
        reject: () => {}
    });
};

const startEditingAnswer = (question) => {
    if (question.reply) {
        editingAnswerId.value = question.reply.id;
        editInputs.value[question.reply.id] = question.reply.message;
    }
};

const cancelEditing = () => {
    editingQuestionId.value = null;
    editingAnswerId.value = null;
};

const updateMessage = async (id) => {
    const message = editInputs.value[id];
    if (!message?.trim()) return;

    try {
        await axiosInstance.put(`/anonymous-chat/${id}`, {
            message: message
        });

        await fetchMessages();
        cancelEditing();
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Message updated successfully',
            life: 3000
        });
    } catch (err) {
        console.error('Update error:', err);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update message',
            life: 3000
        });
    }
};

const handleScrollToggle = () => {
    if (isAtBottom.value) {
        scrollToTop();
    } else {
        scrollToBottom();
    }
};
const handleScrollCheck = () => {
    const distanceFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    isAtBottom.value = distanceFromBottom < 50;
};
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

const scrollToBottom = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
};

const formatDate = (dt) => new Date(dt).toLocaleString();

onMounted(() => {
    fetchMessages();
    window.addEventListener('scroll', handleScrollCheck);
    handleScrollCheck();
});
onUnmounted(() => {
    window.removeEventListener('scroll', handleScrollCheck);
});
</script>

<template>
    <div class="card p-4 sm:p-6 max-w-5xl mx-auto">
        <ConfirmDialog></ConfirmDialog>
        <Toast />

        <h1 class="text-2xl sm:text-3xl font-bold text-center mb-6 text-blue-800 flex items-center justify-center gap-2">
            <svg class="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h5m-5 4h10M21 12c0 4.418-4.03 8-9 8a9.967 9.967 0 01-4.75-1.16L3 20l1.26-3.77A8.973 8.973 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Librarian Chat Portal
        </h1>

        <div v-if="!loading">
            <div v-for="question in visitorMessages" :key="question.id" class="rounded-lg mb-6 p-4 border border-gray-200">
                <!-- Visitor Question -->
                <div class="flex justify-between items-start">
                    <div class="flex flex-col sm:flex-row items-start gap-3 mb-2 flex-1">
                        <div class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">V</div>
                        <div class="bg-gray-100 p-3 rounded-xl w-full sm:max-w-3xl">
                            <template v-if="editingQuestionId === question.id">
                                <textarea v-model="editInputs[question.id]" class="w-full p-2 border rounded focus:outline-none focus:ring" rows="3"></textarea>
                                <div class="flex gap-2 mt-2">
                                    <button @click="updateMessage(question.id)" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Save</button>
                                    <button @click="cancelEditing" class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">Cancel</button>
                                </div>
                            </template>
                            <template v-else>
                                <p class="text-gray-800">{{ question.message }}</p>
                                <p class="text-xs text-gray-500 mt-1">
                                    {{ formatDate(question.created_at) }}
                                </p>
                            </template>
                        </div>
                    </div>
                    <div class="flex gap-2 ml-2">
                        <!-- // -->
                        <button @click="confirmDelete(question.id, 'question')" class="text-red-500 hover:text-red-700" title="Delete question">
                            <i class="pi pi-trash"></i>
                        </button>
                    </div>
                </div>

                <!-- Librarian Answer -->
                <div v-if="question.reply" class="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 sm:ml-12 mt-2">
                    <!-- Answer Content -->
                    <div class="flex flex-col xs:flex-row items-start gap-3 w-full">
                        <!-- Librarian Icon (always shown) -->
                        <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">L</div>

                        <!-- Message Container -->
                        <div class="bg-blue-600 text-white p-3 rounded-xl w-full max-w-full">
                            <template v-if="editingAnswerId === question.reply.id">
                                <!-- Edit Mode -->
                                <textarea v-model="editInputs[question.reply.id]" class="w-full p-2 border rounded focus:outline-none focus:ring text-black" rows="5"></textarea>
                                <div class="flex flex-wrap gap-2 mt-2">
                                    <button @click="updateMessage(question.reply.id)" class="bg-green-600 text-white px-3 py-2 sm:py-1 rounded hover:bg-green-700 text-sm sm:text-base">Save</button>
                                    <button @click="cancelEditing" class="bg-gray-500 text-white px-3 py-2 sm:py-1 rounded hover:bg-gray-600 text-sm sm:text-base">Cancel</button>
                                </div>
                            </template>
                            <template v-else>
                                <!-- View Mode -->
                                <p class="break-words whitespace-pre-wrap">{{ question.reply.message }}</p>
                                <p class="text-xs text-blue-100 mt-1">
                                    {{ formatDate(question.reply.created_at) }}
                                </p>
                            </template>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2 ml-0 sm:ml-2 mt-2 sm:mt-0 self-end sm:self-start">
                        <button v-if="editingAnswerId !== question.reply.id" @click="startEditingAnswer(question)" class="text-blue-300 hover:text-blue-100 p-2 sm:p-1" title="Edit answer">
                            <i class="pi pi-pencil text-base sm:text-lg"></i>
                        </button>
                        <button @click="confirmDelete(question.reply.id, 'answer')" class="text-red-300 hover:text-red-100 p-2 sm:p-1" title="Delete answer">
                            <i class="pi pi-trash text-base sm:text-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- Reply Input -->
                <div v-if="!question.reply" class="sm:ml-12 mt-3 flex flex-col sm:flex-row gap-2">
                    <input v-model="replyInputs[question.id]" type="text" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring" placeholder="Write your reply..." />
                    <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto" @click="sendReply(question)">Reply</button>
                </div>
            </div>
            <!-- Toggle Scroll Button -->
            <button
                @click="handleScrollToggle"
                class="fixed right-6 bottom-6 z-50 bg-blue-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all"
                :title="isAtBottom ? 'Scroll to top' : 'Scroll to bottom'"
            >
                <i :class="isAtBottom ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-lg"></i>
            </button>
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
