<template>
    <div class="card">
        <Toast />
        <!-- Page Title -->
        <div class="flex flex-wrap justify-content-between align-items-center mb-5">
            <div>
                <h1 class="text-3xl font-bold m-0">My Notes</h1>
                <p class="text-color-secondary mt-2 mb-0">Your annotations and comments across library resources</p>
            </div>
            <div class="flex align-items-center">
                <span class="p-input-icon-left mr-3">
                    <i class="pi pi-search" />
                    <InputText v-model="searchTerm" placeholder="Search notes..." class="p-inputtext-sm" />
                </span>
                <Button icon="pi pi-sort-alt" class="p-button-outlined p-button-rounded p-button-sm" @click="showSortOptions = true" aria-label="Sort" aria-haspopup="true" />
                <Menu ref="sortMenu" :model="sortOptions" :popup="true" aria-label="Sort Options" />
            </div>
        </div>

        <!-- Note Filters by Type -->
        <div class="flex flex-wrap gap-2 mb-4">
            <Button :class="{ 'p-button-outlined': activeFilter !== 'all' }" @click="setFilter('all')" label="All Notes" icon="pi pi-pencil" size="small" />
            <Button :class="{ 'p-button-outlined': activeFilter !== 'pdf' }" @click="setFilter('pdf')" label="PDF Notes" icon="pi pi-file-pdf" size="small" />
            <Button :class="{ 'p-button-outlined': activeFilter !== 'ebook' }" @click="setFilter('ebook')" label="E-Book Notes" icon="pi pi-book" size="small" />
            <Button :class="{ 'p-button-outlined': activeFilter !== 'video' }" @click="setFilter('video')" label="Video Notes" icon="pi pi-video" size="small" />
            <Button :class="{ 'p-button-outlined': activeFilter !== 'audio' }" @click="setFilter('audio')" label="Audio Notes" icon="pi pi-volume-up" size="small" />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-content-center py-6">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="3" />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredNotes.length === 0" class="surface-ground border-round p-6 flex flex-column align-items-center justify-content-center gap-3">
            <i class="pi pi-pencil text-5xl text-color-secondary"></i>
            <h3 class="m-0">No notes found</h3>
            <p class="text-color-secondary text-center">
                {{ activeFilter === 'all' ? "You haven't created any notes yet. Open a resource and add notes while reading!" : `You don't have any notes for ${activeFilter} resources.` }}
            </p>
            <Button label="Browse Library" icon="pi pi-search" @click="navigateToLibrary" />
        </div>

        <!-- Notes List -->
        <div v-else class="grid">
            <div v-for="note in filteredNotes" :key="note.id" class="col-12 lg:col-6">
                <div class="surface-card p-4 border-round shadow-2 mb-3">
                    <!-- Note Header -->
                    <div class="flex align-items-center justify-content-between mb-3">
                        <div class="flex align-items-center">
                            <i :class="getIconForResourceType(note.resourceType)" class="mr-2 text-xl"></i>
                            <div>
                                <span class="font-semibold block">{{ note.resourceTitle }}</span>
                                <span class="text-sm text-color-secondary flex align-items-center gap-1"> <i class="pi pi-user text-sm"></i> {{ note.resourceAuthor }} </span>
                            </div>
                        </div>
                        <div>
                            <Button icon="pi pi-ellipsis-v" text rounded @click="openNoteMenu($event, note)" />
                            <Menu ref="noteMenu" :model="noteMenuItems" popup />
                        </div>
                    </div>

                    <!-- Note Info -->
                    <div class="flex align-items-center mb-3 text-sm text-color-secondary">
                        <div class="mr-4 flex align-items-center">
                            <i class="pi pi-calendar mr-1"></i>
                            <span>{{ formatDate(note.dateCreated) }}</span>
                        </div>

                        <div v-if="note.location" class="flex align-items-center">
                            <i :class="getLocationIcon(note.resourceType)" class="mr-1"></i>
                            <span>{{ formatLocation(note.location, note.resourceType) }}</span>
                        </div>
                    </div>

                    <!-- Note Content -->
                    <div class="surface-hover p-3 border-round mb-3">
                        <p class="line-height-3 m-0" :class="{ 'line-clamp-3': note.expanded !== true }">{{ note.content }}</p>
                        <div v-if="note.content.length > 300 && note.expanded !== true" class="text-center mt-2">
                            <Button label="Show More" text size="small" @click="note.expanded = true" />
                        </div>
                        <div v-else-if="note.expanded === true" class="text-center mt-2">
                            <Button label="Show Less" text size="small" @click="note.expanded = false" />
                        </div>
                    </div>

                    <!-- Note Footer -->
                    <div class="flex justify-content-between align-items-center">
                        <div>
                            <Tag v-if="note.tags && note.tags.length" :value="note.tags[0]" class="mr-2" />
                            <Tag v-if="note.tags && note.tags.length > 1" :value="`+${note.tags.length - 1}`" severity="secondary" />
                        </div>
                        <div class="flex">
                            <Button icon="pi pi-eye" label="View Resource" class="p-button-outlined p-button-sm" @click="viewResource(note)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Note Dialog -->
        <Dialog v-model:visible="editNoteDialogVisible" header="Edit Note" :style="{ width: '500px' }" modal>
            <div class="field mb-4">
                <label for="edit-note-content" class="font-medium block mb-2">Note Content</label>
                <Textarea id="edit-note-content" v-model="editingNote.content" rows="5" class="w-full" autoResize />
            </div>

            <div class="field mb-4">
                <label for="edit-note-tags" class="font-medium block mb-2">Tags (comma separated)</label>
                <Chips id="edit-note-tags" v-model="editingNote.tags" separator="," />
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="editNoteDialogVisible = false" class="p-button-text" />
                <Button label="Save" icon="pi pi-check" @click="saveEditedNote" autofocus />
            </template>
        </Dialog>

        <!-- Delete Confirmation -->
        <ConfirmDialog />
    </div>
</template>

<script setup>
import { format } from 'date-fns';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Component setup
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const sortMenu = ref();
const noteMenu = ref();

// State
const notes = ref([]);
const loading = ref(true);
const activeFilter = ref('all');
const searchTerm = ref('');
const showSortOptions = ref(false);
const editNoteDialogVisible = ref(false);
const editingNote = ref({});
const selectedNote = ref(null);

// Sort options for the dropdown menu
const sortOptions = [
    {
        label: 'Date Created (Newest First)',
        icon: 'pi pi-sort-amount-down',
        command: () => sortNotes('dateCreated', -1)
    },
    {
        label: 'Date Created (Oldest First)',
        icon: 'pi pi-sort-amount-up',
        command: () => sortNotes('dateCreated', 1)
    },
    {
        label: 'Resource Title (A-Z)',
        icon: 'pi pi-sort-alpha-down',
        command: () => sortNotes('resourceTitle', 1)
    },
    {
        label: 'Resource Title (Z-A)',
        icon: 'pi pi-sort-alpha-up',
        command: () => sortNotes('resourceTitle', -1)
    }
];

// Note menu items
const noteMenuItems = ref([
    {
        label: 'Edit Note',
        icon: 'pi pi-pencil',
        command: () => editNote(selectedNote.value)
    },
    {
        label: 'Delete Note',
        icon: 'pi pi-trash',
        command: () => confirmDelete(selectedNote.value)
    },
    {
        label: 'Copy Text',
        icon: 'pi pi-copy',
        command: () => copyNoteText(selectedNote.value)
    }
]);

// Computed properties
const filteredNotes = computed(() => {
    let filtered = notes.value;

    // Apply type filter
    if (activeFilter.value !== 'all') {
        filtered = filtered.filter((note) => note.resourceType.toLowerCase() === activeFilter.value);
    }

    // Apply search filter
    if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        filtered = filtered.filter((note) => note.content.toLowerCase().includes(term) || note.resourceTitle.toLowerCase().includes(term) || (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(term))));
    }

    return filtered;
});

// Methods
const fetchNotes = async () => {
    loading.value = true;
    try {
        // In a real app, you would fetch notes from an API
        // For now, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API delay

        notes.value = [
            {
                id: '1',
                resourceId: '101',
                resourceTitle: 'Introduction to Computer Science',
                resourceAuthor: 'Dr. John Smith',
                resourceType: 'PDF',
                content: "The explanation of Big O notation on page 45 is particularly clear. It helps understand algorithm complexity in a way that's accessible to beginners.",
                dateCreated: new Date('2023-09-05'),
                location: { page: 45 },
                tags: ['important', 'algorithms'],
                expanded: false
            },
            {
                id: '2',
                resourceId: '102',
                resourceTitle: 'Advanced Data Structures',
                resourceAuthor: 'Jane Doe',
                resourceType: 'Ebook',
                content: 'The comparison between different tree implementations (B-trees vs Red-Black trees) provides great insights into when to use each structure based on the specific requirements of your application.',
                dateCreated: new Date('2023-08-22'),
                location: { chapter: 4, position: 0.35 },
                tags: ['trees', 'data structures', 'performance'],
                expanded: false
            },
            {
                id: '3',
                resourceId: '103',
                resourceTitle: 'Machine Learning Fundamentals',
                resourceAuthor: 'Prof. Alex Johnson',
                resourceType: 'Video',
                content: 'The explanation of gradient descent at 14:25 uses a great visual metaphor that makes the concept easy to understand. The professor shows how the algorithm finds the local minimum by using a ball rolling down a hill.',
                dateCreated: new Date('2023-09-10'),
                location: { timestamp: '14:25' },
                tags: ['algorithms', 'machine learning'],
                expanded: false
            },
            {
                id: '4',
                resourceId: '104',
                resourceTitle: 'History of Ancient Egypt',
                resourceAuthor: 'Dr. Maria Garcia',
                resourceType: 'Audio',
                content: 'The connection made between Egyptian architectural techniques and their religious beliefs is fascinating. It explains why pyramids were built with such precise astronomical alignment.',
                dateCreated: new Date('2023-07-15'),
                location: { timestamp: '23:45' },
                tags: ['egypt', 'architecture', 'religion'],
                expanded: false
            },
            {
                id: '5',
                resourceId: '101',
                resourceTitle: 'Introduction to Computer Science',
                resourceAuthor: 'Dr. John Smith',
                resourceType: 'PDF',
                content:
                    'The recursion examples on page 78 are excellent for understanding how to construct elegant solutions to complex problems. The factorial and Fibonacci implementations show both the simplicity and potential pitfalls of recursive approaches.',
                dateCreated: new Date('2023-09-08'),
                location: { page: 78 },
                tags: ['recursion', 'programming techniques'],
                expanded: false
            }
        ];
    } catch (error) {
        console.error('Error fetching notes:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load notes. Please try again later.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const setFilter = (filter) => {
    activeFilter.value = filter;
};

const sortNotes = (field, direction) => {
    notes.value.sort((a, b) => {
        if (a[field] < b[field]) return -1 * direction;
        if (a[field] > b[field]) return 1 * direction;
        return 0;
    });
};

const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM d, yyyy');
};

const getIconForResourceType = (type) => {
    const typeMap = {
        PDF: 'pi pi-file-pdf text-red-500',
        Ebook: 'pi pi-book text-blue-500',
        Video: 'pi pi-video text-purple-500',
        Audio: 'pi pi-volume-up text-orange-500'
    };

    return typeMap[type] || 'pi pi-file text-gray-500';
};

const getLocationIcon = (type) => {
    const typeMap = {
        PDF: 'pi pi-file',
        Ebook: 'pi pi-bookmark',
        Video: 'pi pi-clock',
        Audio: 'pi pi-clock'
    };

    return typeMap[type] || 'pi pi-map-marker';
};

const formatLocation = (location, type) => {
    if (!location) return '';

    if (type === 'PDF' && location.page) {
        return `Page ${location.page}`;
    } else if (type === 'Ebook') {
        if (location.chapter) {
            return `Chapter ${location.chapter}${location.position ? ` (${Math.round(location.position * 100)}%)` : ''}`;
        } else if (location.position) {
            return `Position ${Math.round(location.position * 100)}%`;
        }
    } else if ((type === 'Video' || type === 'Audio') && location.timestamp) {
        return `At ${location.timestamp}`;
    }

    return '';
};

const viewResource = (note) => {
    router.push({
        name: 'universal-reader',
        params: { id: note.resourceId },
        query: {
            type: note.resourceType.toLowerCase(),
            noteId: note.id,
            location: JSON.stringify(note.location)
        }
    });
};

const openNoteMenu = (event, note) => {
    selectedNote.value = note;
    noteMenu.value.toggle(event);
};

const editNote = (note) => {
    editingNote.value = JSON.parse(JSON.stringify(note));
    editNoteDialogVisible.value = true;
};

const saveEditedNote = () => {
    if (!editingNote.value.content.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Note content cannot be empty',
            life: 3000
        });
        return;
    }

    // In a real app, you would save this to an API
    const noteIndex = notes.value.findIndex((n) => n.id === editingNote.value.id);
    if (noteIndex >= 0) {
        notes.value[noteIndex] = { ...notes.value[noteIndex], ...editingNote.value };
    }

    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Note updated successfully',
        life: 3000
    });

    editNoteDialogVisible.value = false;
};

const confirmDelete = (note) => {
    confirm.require({
        message: 'Are you sure you want to delete this note?',
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => deleteNote(note),
        reject: () => {}
    });
};

const deleteNote = (note) => {
    // In a real app, you would call an API to delete the note
    notes.value = notes.value.filter((n) => n.id !== note.id);

    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Note deleted successfully',
        life: 3000
    });
};

const copyNoteText = (note) => {
    navigator.clipboard
        .writeText(note.content)
        .then(() => {
            toast.add({
                severity: 'info',
                summary: 'Copied',
                detail: 'Note copied to clipboard',
                life: 2000
            });
        })
        .catch((err) => {
            console.error('Failed to copy note:', err);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to copy to clipboard',
                life: 3000
            });
        });
};

const navigateToLibrary = () => {
    router.push('/');
};

// Watch for sort options menu click
watch(showSortOptions, (newVal) => {
    if (newVal) {
        sortMenu.value.toggle(event);
        showSortOptions.value = false;
    }
});

// Lifecycle hooks
onMounted(() => {
    fetchNotes();
});
</script>

<style scoped>
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
