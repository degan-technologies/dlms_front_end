<template>
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
        <div class="bg-white border-round shadow-2 p-4 md:p-6">
            <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                <div>
                    <div class="text-900 font-bold text-3xl mb-1">My Collection</div>
                    <div class="text-500 mb-3 md:mb-0">Your curated resource collections</div>
                </div>
                <div class="flex gap-2">
                    <Button label="Create New Collection" icon="pi pi-plus" @click="showCreateCollectionDialog" />
                </div>
            </div>

            <div v-if="loading" class="flex justify-content-center py-8">
                <ProgressSpinner />
            </div>

            <div v-else>
                <div v-if="collections.length === 0" class="flex flex-column align-items-center p-6">
                    <i class="pi pi-th-large text-6xl text-primary mb-4"></i>
                    <h3 class="text-2xl text-900 mb-2">No Collections Found</h3>
                    <p class="text-600 mb-5">Create your first collection to organize resources by subject or topic.</p>
                    <Button label="Create Collection" icon="pi pi-plus" @click="showCreateCollectionDialog" />
                </div>

                <div v-else class="grid">
                    <div v-for="collection in collections" :key="collection.id" class="col-12 md:col-6 lg:col-4 p-2">
                        <div class="border-round bg-white shadow-2 transition-all transition-duration-300 hover:shadow-5 h-full flex flex-column cursor-pointer" @click="viewCollection(collection)">
                            <div class="relative">
                                <img :src="collection.coverImage || defaultCollectionImage" :alt="collection.name" class="w-full border-round-top" style="height: 160px; object-fit: cover" />
                                <div class="absolute top-0 right-0 p-3 flex gap-2">
                                    <Button icon="pi pi-pencil" rounded text severity="secondary" class="p-button-sm bg-white bg-opacity-70" @click.stop="editCollection(collection)" tooltip="Edit Collection" :tooltipOptions="{ position: 'top' }" />
                                    <Button icon="pi pi-ellipsis-v" rounded text severity="secondary" class="p-button-sm bg-white bg-opacity-70" @click.stop="showCollectionMenu($event, collection)" />
                                </div>
                                <div class="absolute bottom-0 left-0 right-0 bg-black-alpha-70 p-3 text-white">
                                    <h3 class="text-xl font-semibold m-0 text-white">{{ collection.name }}</h3>
                                </div>
                            </div>
                            <div class="p-3 flex-1 flex flex-column">
                                <p class="text-600 line-clamp-2 mb-3">{{ collection.description }}</p>
                                <div class="mt-auto flex justify-content-between align-items-center">
                                    <div class="flex align-items-center">
                                        <i class="pi pi-book mr-2 text-600"></i>
                                        <span class="text-700">{{ collection.items.length }} Resources</span>
                                    </div>
                                    <div>
                                        <Tag :value="collection.isPublic ? 'Public' : 'Private'" :severity="collection.isPublic ? 'success' : 'info'" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Collection View Dialog -->
    <Dialog v-model:visible="collectionViewDialog" :header="currentCollection?.name" :modal="true" :style="{ width: '90%', maxWidth: '900px' }">
        <div v-if="currentCollection" class="p-3">
            <div class="flex flex-column md:flex-row mb-4 gap-4">
                <div class="relative md:w-4 lg:w-3">
                    <img :src="currentCollection.coverImage || defaultCollectionImage" :alt="currentCollection.name" class="w-full border-round" style="height: 180px; object-fit: cover" />
                </div>
                <div class="flex-1">
                    <div class="flex justify-content-between">
                        <h3 class="mt-0 mb-2">{{ currentCollection.name }}</h3>
                        <Tag :value="currentCollection.isPublic ? 'Public' : 'Private'" :severity="currentCollection.isPublic ? 'success' : 'info'" />
                    </div>
                    <p class="my-2 text-600">{{ currentCollection.description }}</p>
                    <div class="flex flex-wrap gap-2 mt-3">
                        <div v-for="tag in currentCollection.tags" :key="tag" class="bg-primary-50 text-primary border-round py-1 px-2 text-sm">
                            {{ tag }}
                        </div>
                    </div>
                    <div class="flex justify-content-between align-items-center mt-4">
                        <span class="font-semibold">Created: {{ formatDate(currentCollection.createdAt) }}</span>
                        <Button icon="pi pi-plus" label="Add Resource" severity="secondary" @click="showAddResourceDialog" />
                    </div>
                </div>
            </div>

            <Divider />

            <h4>Resources in Collection</h4>
            <DataView :value="currentCollection.items" layout="list" :paginator="true" :rows="5">
                <template #list="slotProps">
                    <div class="col-12">
                        <div class="flex p-3 w-full bg-gray-50 border-round mb-3" :class="{ 'surface-hover': hoveredItemId === slotProps.data.id }" @mouseenter="hoveredItemId = slotProps.data.id" @mouseleave="hoveredItemId = null">
                            <div class="mr-4" style="width: 100px; height: 70px">
                                <img :src="slotProps.data.thumbnailUrl || resourceTypeImage(slotProps.data.type)" :alt="slotProps.data.title" class="w-full h-full object-cover border-round shadow-1" />
                            </div>
                            <div class="flex-1">
                                <div class="flex justify-content-between">
                                    <div>
                                        <div class="font-semibold">{{ slotProps.data.title }}</div>
                                        <div class="text-sm text-600">{{ slotProps.data.author }}</div>
                                        <div class="flex align-items-center mt-2">
                                            <Tag :value="slotProps.data.type" severity="info" class="mr-2" />
                                            <span class="text-sm text-500">Added: {{ formatDate(slotProps.data.dateAdded) }}</span>
                                        </div>
                                    </div>
                                    <div class="flex align-self-start">
                                        <Button icon="pi pi-eye" rounded text @click="viewResource(slotProps.data)" tooltip="View Resource" :tooltipOptions="{ position: 'left' }" />
                                        <Button icon="pi pi-trash" rounded text severity="danger" @click="removeFromCollection(slotProps.data)" tooltip="Remove from Collection" :tooltipOptions="{ position: 'left' }" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template #empty>
                    <div class="flex flex-column align-items-center p-6">
                        <i class="pi pi-book text-4xl text-primary mb-4"></i>
                        <p class="text-700">No resources added to this collection yet.</p>
                    </div>
                </template>
            </DataView>
        </div>
    </Dialog>

    <!-- Create/Edit Collection Dialog -->
    <Dialog v-model:visible="collectionDialog" :header="editingCollection.id ? 'Edit Collection' : 'Create New Collection'" :modal="true" :style="{ width: '500px' }">
        <div class="p-fluid">
            <div class="field">
                <label for="name">Collection Name</label>
                <InputText id="name" v-model="editingCollection.name" required autofocus :class="{ 'p-invalid': submitted && !editingCollection.name }" />
                <small class="p-error" v-if="submitted && !editingCollection.name">Name is required.</small>
            </div>

            <div class="field">
                <label for="description">Description</label>
                <Textarea id="description" v-model="editingCollection.description" rows="3" />
            </div>

            <div class="field">
                <label for="coverImage">Cover Image URL</label>
                <InputText id="coverImage" v-model="editingCollection.coverImage" placeholder="https://example.com/image.jpg" />
                <small class="text-600">Leave empty for default image</small>
            </div>

            <div class="field">
                <label for="tags">Tags</label>
                <Chips v-model="editingCollection.tags" separator="," placeholder="Enter tags and press enter" />
            </div>

            <div class="field-checkbox">
                <Checkbox id="isPublic" v-model="editingCollection.isPublic" :binary="true" />
                <label for="isPublic" class="ml-2">Public Collection (visible to other users)</label>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="cancelCollectionEdit" />
            <Button label="Save" icon="pi pi-check" autofocus @click="saveCollection" />
        </template>
    </Dialog>

    <!-- Add Resource to Collection Dialog -->
    <Dialog v-model:visible="addResourceDialog" header="Add Resources to Collection" :modal="true" :style="{ width: '90%', maxWidth: '900px' }">
        <div class="p-fluid">
            <div class="mb-4">
                <span class="p-input-icon-left w-full">
                    <i class="pi pi-search"></i>
                    <InputText v-model="resourceSearchQuery" placeholder="Search resources..." class="w-full" />
                </span>
            </div>

            <DataView :value="filteredAvailableResources" :paginator="true" :rows="6" layout="grid">
                <template #grid="slotProps">
                    <div class="col-12 sm:col-6 lg:col-4 p-2">
                        <div class="p-3 border-round shadow-1 cursor-pointer" :class="{ 'surface-hover': selectedResources.includes(slotProps.data) }" @click="toggleResourceSelection(slotProps.data)">
                            <div class="relative mb-3">
                                <img :src="slotProps.data.thumbnailUrl || resourceTypeImage(slotProps.data.type)" :alt="slotProps.data.title" class="w-full h-36 object-cover border-round" />
                                <div class="absolute top-0 right-0 bg-primary text-white px-2 py-1 text-xs border-round-md m-1 font-semibold">
                                    {{ slotProps.data.type }}
                                </div>
                                <div v-if="selectedResources.includes(slotProps.data)" class="absolute top-0 left-0 m-2 w-6 h-6 border-circle bg-primary flex align-items-center justify-content-center">
                                    <i class="pi pi-check text-white text-xs"></i>
                                </div>
                            </div>
                            <div class="text-base font-semibold mb-2 line-clamp-1">{{ slotProps.data.title }}</div>
                            <div class="text-sm text-600 mb-2">{{ slotProps.data.author }}</div>
                        </div>
                    </div>
                </template>
                <template #empty>
                    <div class="flex flex-column align-items-center p-6">
                        <i class="pi pi-search text-4xl text-primary mb-4"></i>
                        <p class="text-700">No resources found. Try adjusting your search.</p>
                    </div>
                </template>
            </DataView>
        </div>

        <template #footer>
            <div class="flex justify-content-between align-items-center">
                <div v-if="selectedResources.length > 0" class="text-sm text-600">{{ selectedResources.length }} resource(s) selected</div>
                <div>
                    <Button label="Cancel" icon="pi pi-times" text @click="addResourceDialog = false" />
                    <Button label="Add to Collection" icon="pi pi-plus" :disabled="selectedResources.length === 0" @click="addResourcesToCollection" />
                </div>
            </div>
        </template>
    </Dialog>

    <!-- Collection Menu -->
    <Menu ref="collectionMenu" :model="collectionMenuItems" :popup="true" />

    <!-- Delete Confirmation -->
    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3 text-2xl" style="color: var(--orange-500)" />
            <span>Are you sure you want to delete this collection?</span>
        </div>
        <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteDialog = false" />
            <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteCollection" />
        </template>
    </Dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const collections = ref([]);
const loading = ref(true);
const collectionViewDialog = ref(false);
const collectionDialog = ref(false);
const addResourceDialog = ref(false);
const deleteDialog = ref(false);
const currentCollection = ref(null);
const editingCollection = ref({
    name: '',
    description: '',
    coverImage: '',
    tags: [],
    isPublic: false
});
const submitted = ref(false);
const collectionMenu = ref();
const collectionMenuItems = ref([]);
const collectionToDelete = ref(null);
const hoveredItemId = ref(null);
const resourceSearchQuery = ref('');
const selectedResources = ref([]);
const availableResources = ref([]);
const defaultCollectionImage = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';

const filteredAvailableResources = computed(() => {
    if (!resourceSearchQuery.value.trim()) {
        return availableResources.value;
    }

    const query = resourceSearchQuery.value.toLowerCase();
    return availableResources.value.filter((resource) => resource.title.toLowerCase().includes(query) || (resource.author && resource.author.toLowerCase().includes(query)));
});

// Initialize mock data
onMounted(() => {
    loading.value = true;

    setTimeout(() => {
        collections.value = [
            {
                id: 1,
                name: 'Machine Learning Essentials',
                description: 'Core resources for learning machine learning concepts and algorithms.',
                coverImage: 'https://images.unsplash.com/photo-1620207418302-439b387441b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
                tags: ['ML', 'AI', 'Data Science'],
                isPublic: true,
                createdAt: '2025-04-10T15:30:00',
                items: [
                    {
                        id: 101,
                        title: 'Advanced Machine Learning Techniques',
                        author: 'Dr. Sarah Johnson',
                        type: 'ebook',
                        thumbnailUrl: 'https://images.unsplash.com/photo-1620207418302-439b387441b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                        dateAdded: '2025-04-15T10:30:00'
                    },
                    {
                        id: 105,
                        title: 'Neural Networks and Deep Learning',
                        author: 'Prof. Andrew Chang',
                        type: 'video',
                        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                        dateAdded: '2025-04-12T14:20:00'
                    }
                ]
            },
            {
                id: 2,
                name: 'Literature Classics',
                description: 'A collection of classical literature works from around the world.',
                coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
                tags: ['Literature', 'Classics', 'Fiction'],
                isPublic: false,
                createdAt: '2025-03-22T09:15:00',
                items: [
                    {
                        id: 103,
                        title: 'World Literature Classics',
                        author: 'Emily Bronson',
                        type: 'ebook',
                        thumbnailUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                        dateAdded: '2025-03-25T16:45:00'
                    }
                ]
            },
            {
                id: 3,
                name: 'Medical Studies References',
                description: 'Essential medical references and study materials for anatomy and physiology.',
                coverImage: 'https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
                tags: ['Medical', 'Anatomy', 'Biology'],
                isPublic: true,
                createdAt: '2025-02-15T11:20:00',
                items: [
                    {
                        id: 104,
                        title: 'The Human Body: An Illustrated Guide',
                        author: 'Dr. Michael Torres',
                        type: 'pdf',
                        thumbnailUrl: 'https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                        dateAdded: '2025-02-17T09:30:00'
                    },
                    {
                        id: 106,
                        title: 'Fundamentals of Physiology',
                        author: 'Dr. Elena Rodriguez',
                        type: 'pdf',
                        thumbnailUrl: null,
                        dateAdded: '2025-02-20T14:15:00'
                    }
                ]
            }
        ];

        availableResources.value = [
            {
                id: 101,
                title: 'Advanced Machine Learning Techniques',
                author: 'Dr. Sarah Johnson',
                type: 'ebook',
                thumbnailUrl: 'https://images.unsplash.com/photo-1620207418302-439b387441b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
            },
            {
                id: 102,
                title: 'Introduction to Quantum Computing',
                author: 'Prof. Richard Meyer',
                type: 'pdf',
                thumbnailUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
            },
            {
                id: 103,
                title: 'World Literature Classics',
                author: 'Emily Bronson',
                type: 'ebook',
                thumbnailUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
            },
            {
                id: 104,
                title: 'The Human Body: An Illustrated Guide',
                author: 'Dr. Michael Torres',
                type: 'pdf',
                thumbnailUrl: 'https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
            },
            {
                id: 105,
                title: 'Neural Networks and Deep Learning',
                author: 'Prof. Andrew Chang',
                type: 'video',
                thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
            },
            {
                id: 106,
                title: 'Fundamentals of Physiology',
                author: 'Dr. Elena Rodriguez',
                type: 'pdf',
                thumbnailUrl: null
            },
            {
                id: 107,
                title: 'Environmental Science Today',
                author: 'Prof. Laura Simmons',
                type: 'ebook',
                thumbnailUrl: 'https://images.unsplash.com/photo-1440778303588-435521a205bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
            },
            {
                id: 108,
                title: 'Introduction to Differential Equations',
                author: 'Prof. Amanda Chen',
                type: 'video',
                thumbnailUrl: null
            },
            {
                id: 109,
                title: 'Organic Chemistry Fundamentals',
                author: 'Dr. James Wilson',
                type: 'pdf',
                thumbnailUrl: null
            }
        ];

        loading.value = false;
    }, 500);

    // Setup collection menu items
    collectionMenuItems.value = [
        {
            label: 'Share Collection',
            icon: 'pi pi-share-alt',
            command: () => shareCollection(collectionToDelete.value)
        },
        {
            label: 'Duplicate Collection',
            icon: 'pi pi-copy',
            command: () => duplicateCollection(collectionToDelete.value)
        },
        {
            separator: true
        },
        {
            label: 'Delete Collection',
            icon: 'pi pi-trash',
            command: () => confirmDeleteCollection(collectionToDelete.value)
        }
    ];
});

// Format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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

// View collection
const viewCollection = (collection) => {
    currentCollection.value = { ...collection };
    collectionViewDialog.value = true;
};

// Show collection menu
const showCollectionMenu = (event, collection) => {
    collectionToDelete.value = collection;
    collectionMenu.value.show(event);
};

// Show create collection dialog
const showCreateCollectionDialog = () => {
    editingCollection.value = {
        name: '',
        description: '',
        coverImage: '',
        tags: [],
        isPublic: false
    };
    submitted.value = false;
    collectionDialog.value = true;
};

// Edit collection
const editCollection = (collection) => {
    editingCollection.value = { ...collection };
    submitted.value = false;
    collectionDialog.value = true;
};

// Cancel collection edit
const cancelCollectionEdit = () => {
    collectionDialog.value = false;
    submitted.value = false;
};

// Save collection
const saveCollection = () => {
    submitted.value = true;

    if (!editingCollection.value.name.trim()) {
        return;
    }

    if (editingCollection.value.id) {
        // Update existing collection
        const index = collections.value.findIndex((c) => c.id === editingCollection.value.id);
        if (index !== -1) {
            collections.value[index] = { ...collections.value[index], ...editingCollection.value };
        }
    } else {
        // Create new collection
        const newCollection = {
            ...editingCollection.value,
            id: collections.value.length + 1,
            createdAt: new Date().toISOString(),
            items: []
        };
        collections.value.push(newCollection);
    }

    collectionDialog.value = false;
    submitted.value = false;
};

// Confirm delete collection
const confirmDeleteCollection = (collection) => {
    collectionToDelete.value = collection;
    deleteDialog.value = true;
};

// Delete collection
const deleteCollection = () => {
    collections.value = collections.value.filter((c) => c.id !== collectionToDelete.value.id);
    deleteDialog.value = false;
    collectionToDelete.value = null;
};

// Share collection
const shareCollection = (collection) => {
    // In a real app, this would open a dialog to share the collection
    console.log('Sharing collection:', collection);
};

// Duplicate collection
const duplicateCollection = (collection) => {
    const duplicate = {
        ...collection,
        id: collections.value.length + 1,
        name: `${collection.name} (Copy)`,
        createdAt: new Date().toISOString()
    };
    collections.value.push(duplicate);
};

// Show add resource dialog
const showAddResourceDialog = () => {
    // Reset selected resources
    selectedResources.value = [];
    resourceSearchQuery.value = '';
    addResourceDialog.value = true;
};

// Toggle resource selection
const toggleResourceSelection = (resource) => {
    const index = selectedResources.value.findIndex((r) => r.id === resource.id);
    if (index !== -1) {
        selectedResources.value.splice(index, 1);
    } else {
        selectedResources.value.push(resource);
    }
};

// Add resources to collection
const addResourcesToCollection = () => {
    if (!currentCollection.value || selectedResources.value.length === 0) {
        return;
    }

    // Get current resource IDs in the collection
    const existingIds = currentCollection.value.items.map((item) => item.id);

    // Add only resources that aren't already in the collection
    const newResources = selectedResources.value
        .filter((resource) => !existingIds.includes(resource.id))
        .map((resource) => ({
            ...resource,
            dateAdded: new Date().toISOString()
        }));

    if (newResources.length > 0) {
        // Update the current collection
        currentCollection.value.items.push(...newResources);

        // Update the collection in the collections array
        const index = collections.value.findIndex((c) => c.id === currentCollection.value.id);
        if (index !== -1) {
            collections.value[index] = { ...currentCollection.value };
        }
    }

    addResourceDialog.value = false;
    selectedResources.value = [];
};

// Remove resource from collection
const removeFromCollection = (resource) => {
    if (!currentCollection.value) {
        return;
    }

    currentCollection.value.items = currentCollection.value.items.filter((item) => item.id !== resource.id);

    // Update the collection in the collections array
    const index = collections.value.findIndex((c) => c.id === currentCollection.value.id);
    if (index !== -1) {
        collections.value[index] = { ...currentCollection.value };
    }
};

// View resource
const viewResource = (resource) => {
    console.log('Viewing resource:', resource);
    router.push(`/resource/${resource.id}`);
};
</script>

<style scoped>
.line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
}

.line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}
</style>
