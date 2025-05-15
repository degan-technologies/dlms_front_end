<template>
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
        <div class="bg-white border-round shadow-2 p-4 md:p-6">
            <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                <div>
                    <div class="text-900 font-bold text-3xl mb-1">My Notes</div>
                    <div class="text-500 mb-3 md:mb-0">Your reading notes and annotations</div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <span class="p-input-icon-left w-full md:w-auto">
                        <i class="pi pi-search"></i>
                        <InputText v-model="searchQuery" placeholder="Search notes" class="w-full" />
                    </span>
                    <Dropdown v-model="resourceFilter" :options="resourceTypes" optionLabel="name" placeholder="Filter by resource" class="w-full md:w-auto" />
                </div>
            </div>

            <div v-if="loading" class="flex justify-content-center py-8">
                <ProgressSpinner />
            </div>

            <div v-else>
                <div v-if="filteredNotes.length === 0" class="flex flex-column align-items-center p-6">
                    <i class="pi pi-book text-6xl text-primary mb-4"></i>
                    <h3 class="text-2xl text-900 mb-2">No Notes Found</h3>
                    <p class="text-600 mb-5">You haven't added any notes yet.</p>
                    <Button label="Browse Library" icon="pi pi-search" @click="goToLibrary" />
                </div>

                <div v-else>
                    <TabView>
                        <TabPanel header="All Notes">
                            <DataTable
                                :value="filteredNotes"
                                :paginator="true"
                                :rows="10"
                                :global-filter="searchQuery"
                                :row-hover="true"
                                v-model:filters="filters"
                                filterDisplay="menu"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                                :rows-per-page-options="[10, 20, 50]"
                            >
                                <Column field="title" header="Resource Title" :sortable="true">
                                    <template #body="slotProps">
                                        <div class="flex align-items-center">
                                            <img :src="resourceTypeImage(slotProps.data.resourceType)" :alt="slotProps.data.title" class="shadow-1 mr-3 border-circle" style="width: 40px; height: 40px; object-fit: cover" />
                                            <div>
                                                <span class="font-semibold mb-1 block">{{ slotProps.data.title }}</span>
                                                <span class="text-sm text-600">{{ slotProps.data.author }}</span>
                                            </div>
                                        </div>
                                    </template>
                                </Column>

                                <Column field="noteText" header="Note Contents" :sortable="false">
                                    <template #body="slotProps">
                                        <p class="line-clamp-2 m-0">{{ slotProps.data.noteText }}</p>
                                    </template>
                                </Column>

                                <Column field="createdAt" header="Created" :sortable="true">
                                    <template #body="slotProps">
                                        <div>
                                            <div class="font-semibold">{{ formatDate(slotProps.data.createdAt) }}</div>
                                            <small class="text-600">Page: {{ slotProps.data.page || 'N/A' }}</small>
                                        </div>
                                    </template>
                                </Column>

                                <Column :exportable="false" style="min-width: 12rem">
                                    <template #body="slotProps">
                                        <div class="flex justify-content-end gap-2">
                                            <Button icon="pi pi-eye" text rounded @click="viewResource(slotProps.data)" tooltip="View Resource" :tooltipOptions="{ position: 'top' }" />
                                            <Button icon="pi pi-pencil" text rounded @click="editNote(slotProps.data)" tooltip="Edit Note" :tooltipOptions="{ position: 'top' }" />
                                            <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDeleteNote(slotProps.data)" tooltip="Delete Note" :tooltipOptions="{ position: 'top' }" />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </TabPanel>

                        <TabPanel header="By Resource">
                            <div class="grid">
                                <div v-for="resource in groupedNotes" :key="resource.id" class="col-12 md:col-6 lg:col-4 xl:col-3 p-2">
                                    <div class="p-3 border-round shadow-2 h-full flex flex-column">
                                        <div class="flex mb-3">
                                            <img :src="resourceTypeImage(resource.resourceType)" :alt="resource.title" class="shadow-1 mr-3 border-round" style="width: 60px; height: 60px; object-fit: cover" />
                                            <div class="flex flex-column">
                                                <span class="font-semibold mb-1">{{ resource.title }}</span>
                                                <span class="text-sm text-600">{{ resource.author }}</span>
                                                <div class="mt-2">
                                                    <Tag :value="resource.resourceType" :severity="getTagSeverity(resource.resourceType)" />
                                                    <span class="ml-2 text-sm text-600">{{ resource.notes.length }} notes</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex gap-2 mt-auto">
                                            <Button icon="pi pi-eye" label="View Notes" @click="openResourceNotes(resource)" class="flex-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Note Dialog -->
    <Dialog v-model:visible="editNoteDialog" :header="editingNote ? 'Edit Note' : 'Add Note'" :modal="true" class="p-fluid" :style="{ width: '500px' }">
        <div class="field">
            <label for="noteText">Note</label>
            <Textarea v-model="editingNote.noteText" id="noteText" required rows="5" class="w-full" />
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" @click="cancelEdit" text />
            <Button label="Save" icon="pi pi-check" @click="saveNote" autofocus />
        </template>
    </Dialog>

    <!-- Resource Notes Dialog -->
    <Dialog v-model:visible="resourceNotesDialog" :header="currentResource?.title" :modal="true" :style="{ width: '90%', maxWidth: '700px' }">
        <div v-if="currentResource">
            <div class="flex align-items-center mb-4">
                <img :src="resourceTypeImage(currentResource.resourceType)" :alt="currentResource.title" class="shadow-1 mr-3 border-round" style="width: 50px; height: 50px; object-fit: cover" />
                <div>
                    <span class="font-bold text-lg">{{ currentResource.title }}</span>
                    <span class="block text-sm text-600">{{ currentResource.author }}</span>
                </div>
                <Button icon="pi pi-external-link" text class="ml-auto" @click="viewResource(currentResource)" tooltip="View Resource" :tooltipOptions="{ position: 'left' }" />
            </div>

            <Timeline :value="currentResource.notes" class="w-full">
                <template #content="slotProps">
                    <div class="surface-card p-3 shadow-2 border-round">
                        <div class="flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="text-900 font-medium mr-2">Page {{ slotProps.item.page || 'N/A' }}</span>
                                <span class="text-600 text-sm">{{ formatDate(slotProps.item.createdAt) }}</span>
                            </div>
                            <div>
                                <Button icon="pi pi-pencil" text rounded size="small" @click="editNote(slotProps.item)" />
                                <Button icon="pi pi-trash" text rounded severity="danger" size="small" @click="confirmDeleteNote(slotProps.item)" />
                            </div>
                        </div>
                        <p class="text-700 m-0">{{ slotProps.item.noteText }}</p>
                    </div>
                </template>
                <template #opposite>
                    <span></span>
                    <!-- Empty opposite content -->
                </template>
            </Timeline>
        </div>
    </Dialog>

    <!-- Delete Confirmation -->
    <Dialog v-model:visible="deleteNoteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3 text-2xl" style="color: var(--orange-500)" />
            <span>Are you sure you want to delete this note?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteNoteDialog = false" />
            <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteNote" />
        </template>
    </Dialog>
</template>

<script setup>
import { FilterMatchMode } from 'primevue/api';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const notes = ref([]);
const searchQuery = ref('');
const resourceFilter = ref(null);
const loading = ref(true);
const editNoteDialog = ref(false);
const editingNote = ref(null);
const noteToDelete = ref(null);
const deleteNoteDialog = ref(false);
const resourceNotesDialog = ref(false);
const currentResource = ref(null);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const resourceTypes = [
    { name: 'All Types', code: null },
    { name: 'E-Books', code: 'ebook' },
    { name: 'PDF Documents', code: 'pdf' },
    { name: 'Videos', code: 'video' },
    { name: 'Audio', code: 'audio' }
];

// Mock data - In real app you'd fetch this from an API
onMounted(() => {
    loading.value = true;
    setTimeout(() => {
        notes.value = [
            {
                id: 1,
                resourceId: 101,
                title: 'Advanced Machine Learning Techniques',
                author: 'Dr. Sarah Johnson',
                resourceType: 'ebook',
                page: 42,
                noteText: 'The explanation of neural network backpropagation is exceptionally clear. Important to remember the chain rule application in this context.',
                createdAt: '2025-05-01T14:30:00'
            },
            {
                id: 2,
                resourceId: 101,
                title: 'Advanced Machine Learning Techniques',
                author: 'Dr. Sarah Johnson',
                resourceType: 'ebook',
                page: 87,
                noteText: 'Excellent comparison between decision trees and random forests. The visualization helps understand the ensemble advantage.',
                createdAt: '2025-05-02T10:15:00'
            },
            {
                id: 3,
                resourceId: 102,
                title: 'Introduction to Quantum Computing',
                author: 'Prof. Richard Meyer',
                resourceType: 'pdf',
                page: 23,
                noteText: 'The explanation of qubits vs classical bits is fundamental to understanding subsequent concepts.',
                createdAt: '2025-04-28T09:45:00'
            },
            {
                id: 4,
                resourceId: 103,
                title: 'World Literature Classics',
                author: 'Emily Bronson',
                resourceType: 'ebook',
                page: 156,
                noteText: 'The analysis of how cultural context influenced modernist literature is particularly insightful.',
                createdAt: '2025-04-25T16:20:00'
            },
            {
                id: 5,
                resourceId: 104,
                title: 'Introduction to Differential Equations',
                author: 'Prof. Amanda Chen',
                resourceType: 'video',
                page: null,
                noteText: 'At timestamp 14:35, the explanation of separation of variables technique is very clear and worth reviewing.',
                createdAt: '2025-04-20T11:05:00'
            },
            {
                id: 6,
                resourceId: 104,
                title: 'Introduction to Differential Equations',
                author: 'Prof. Amanda Chen',
                resourceType: 'video',
                page: null,
                noteText: 'The examples at 32:10 are helpful for understanding application in real-world physics problems.',
                createdAt: '2025-04-20T11:40:00'
            }
        ];
        loading.value = false;
    }, 500);
});

// Filtered notes based on search query and resource filter
const filteredNotes = computed(() => {
    return notes.value.filter((note) => {
        const matchesSearch =
            !searchQuery.value ||
            note.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            note.noteText.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            (note.author && note.author.toLowerCase().includes(searchQuery.value.toLowerCase()));

        const matchesType = !resourceFilter.value?.code || note.resourceType === resourceFilter.value.code;

        return matchesSearch && matchesType;
    });
});

// Group notes by resource
const groupedNotes = computed(() => {
    const groups = {};

    filteredNotes.value.forEach((note) => {
        if (!groups[note.resourceId]) {
            groups[note.resourceId] = {
                id: note.resourceId,
                title: note.title,
                author: note.author,
                resourceType: note.resourceType,
                notes: []
            };
        }
        groups[note.resourceId].notes.push(note);
    });

    // Sort notes within each group by date (newest first)
    Object.values(groups).forEach((group) => {
        group.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });

    return Object.values(groups);
});

// Format date to readable format
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Get default image based on resource type
const resourceTypeImage = (type) => {
    switch (type.toLowerCase()) {
        case 'ebook':
            return 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
        case 'pdf':
            return 'https://images.unsplash.com/photo-1537640685229-4a8c0c4354dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
        case 'video':
            return 'https://images.unsplash.com/photo-1611162618479-ee3d24aaef2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
        case 'audio':
            return 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
        default:
            return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    }
};

// Get tag severity based on resource type
const getTagSeverity = (type) => {
    switch (type.toLowerCase()) {
        case 'ebook':
            return 'info';
        case 'pdf':
            return 'success';
        case 'video':
            return 'warning';
        case 'audio':
            return 'help';
        default:
            return 'info';
    }
};

// View resource
const viewResource = (resource) => {
    console.log('Viewing resource:', resource);
    router.push(`/resource/${resource.resourceId}`);
};

// Edit note
const editNote = (note) => {
    editingNote.value = { ...note };
    editNoteDialog.value = true;
};

// Cancel edit
const cancelEdit = () => {
    editingNote.value = null;
    editNoteDialog.value = false;
};

// Save note
const saveNote = () => {
    if (!editingNote.value.noteText.trim()) {
        return;
    }

    const index = notes.value.findIndex((note) => note.id === editingNote.value.id);
    if (index !== -1) {
        notes.value[index] = { ...editingNote.value };
    }

    editNoteDialog.value = false;
    editingNote.value = null;
};

// Confirm delete note
const confirmDeleteNote = (note) => {
    noteToDelete.value = note;
    deleteNoteDialog.value = true;
};

// Delete note
const deleteNote = () => {
    notes.value = notes.value.filter((note) => note.id !== noteToDelete.value.id);
    deleteNoteDialog.value = false;
    noteToDelete.value = null;

    // Also close resource notes dialog if it's open
    if (resourceNotesDialog.value) {
        openResourceNotes(currentResource.value);
    }
};

// Open resource notes
const openResourceNotes = (resource) => {
    currentResource.value = {
        ...resource,
        notes: resource.notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };
    resourceNotesDialog.value = true;
};

// Navigate to library
const goToLibrary = () => {
    router.push('/');
};
</script>

<style scoped>
.line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

:deep(.p-timeline) {
    .p-timeline-event-opposite {
        flex: 0;
    }

    .p-timeline-event-content {
        padding: 0 1rem;
    }
}
</style>
