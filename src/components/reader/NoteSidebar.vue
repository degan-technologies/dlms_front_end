<template>
    <Drawer v-model:visible="modelValue" position="right" class="!w-[90%] lg:!w-[50%]">
        <template #header>
            <div class="flex items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700 w-full">
                <div class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center text-white mr-3">
                    <i class="pi pi-book text-lg"></i>
                </div>
                <h3 class="m-0 text-xl font-bold text-gray-800 dark:text-gray-100">Notes ({{ notes.length }})</h3>
            </div>
        </template>
        <div class="p-4 h-full flex flex-col">
            <div class="flex items-center gap-2 mb-3">
                <label v-if="timerLabel" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ timerLabel }}:</label>
                <span v-if="timerValue" class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full font-mono font-medium">{{ timerValue }}</span>
                <slot name="extra-controls"></slot>
            </div>
            <Textarea v-model="noteContent" autoResize rows="4" class="w-full mb-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 p-3 text-base" placeholder="Write your note..." :disabled="false" autofocus />
            <div class="flex justify-between mt-2">
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="onCancel" />
                <Button label="Save" icon="pi pi-check" class="p-button-warning p-button-rounded px-5" @click="onSave" :disabled="!noteContent.trim()" />
            </div>

            <div v-if="notes.length > 0" class="mt-6 flex-1 overflow-y-auto">
                <div class="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <span>Your Notes</span>
                        <slot name="filter-controls"></slot>
                    </div>
                </div>

                <div v-if="filteredNotes.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-400">
                    <div class="w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <i class="pi pi-book text-3xl opacity-50"></i>
                    </div>
                    <p class="text-lg font-medium">No notes yet</p>
                    <p class="text-sm text-center max-w-xs mt-2">Add notes to organize your thoughts and insights.</p>
                </div>

                <ul v-else class="space-y-4">
                    <li v-for="note in filteredNotes" :key="note.id" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-700 transition-all">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium cursor-pointer" @click="onJumpTo(note)">
                                    {{ note.timerDisplay || (note.timestamp ? formatTime(note.timestamp) : note.page_number ? `Page ${note.page_number}` : '') }}
                                </span>
                                <span class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ note.created_at ? new Date(note.created_at).toLocaleString() : 'Just now' }}
                                </span>
                            </div>
                            <Button icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm p-button-rounded" @click="() => onDelete(note.id)" v-tooltip.left="'Delete note'" />
                        </div>
                        <div v-if="note.highlight_text" class="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border-l-4 border-yellow-400 text-sm font-medium text-gray-800 dark:text-gray-200">
                            <span class="italic">{{ note.highlight_text }}</span>
                        </div>
                        <div class="mt-3 text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ note.content }}</div>
                    </li>
                </ul>
            </div>
        </div>
    </Drawer>
</template>

<script setup>
import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import Textarea from 'primevue/textarea';
import { computed, ref, watch } from 'vue';

const props = defineProps({
    visible: Boolean,
    notes: {
        type: Array,
        default: () => []
    },
    filteredNotes: {
        type: Array,
        default: null // Will fallback to notes if not provided
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

const emit = defineEmits(['update:visible', 'save-note', 'delete', 'cancel', 'jump-to']);

const modelValue = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const noteContent = ref('');

// Show highlighted text in the input area if present
const highlightedText = computed(() => props.selectedText || '');

// Only pre-fill note content when sidebar opens, don't clear if user is typing
watch(
    () => props.visible,
    (val, oldVal) => {
        if (val && !oldVal) {
            // Only set if there's selected text, otherwise leave empty for user input
            if (props.selectedText) {
                noteContent.value = props.selectedText;
            }
            // Don't set to empty string if no selected text - let user type freely
        }
        if (!val) {
            noteContent.value = '';
        }
    }
);

function onSave() {
    const noteData = {
        content: noteContent.value,
        highlight_text: highlightedText.value || null,
        page_number: props.pageNumber || null,
        timestamp: props.currentTime || null,
        sent_at: formatTimeForBackend(props.currentTime)
    };
    emit('save-note', noteData);
    noteContent.value = '';
}
function formatTimeForBackend(seconds) {
    if (!seconds && seconds !== 0) return null;

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function onCancel() {
    emit('cancel');
    noteContent.value = '';
}

function onDelete(id) {
    emit('delete', id);
}

function onJumpTo(note) {
    emit('jump-to', note);
}

function formatTime(seconds) {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${mins}:${secs}`;
}

// Defensive computed to always get the notes array
const notesArray = computed(() => {
    if (Array.isArray(props.notes)) return props.notes;
    if (props.notes && Array.isArray(props.notes.data)) return props.notes.data;
    return [];
});

// Always display all notes in chronological order
const filteredNotes = computed(() => {
    return notesArray.value.slice().sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
});

// Clear content when sidebar closes
watch(
    () => props.visible,
    (val) => {
        if (!val) noteContent.value = '';
    }
);
</script>
