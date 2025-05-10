<template>
    <div class="my-collection-page">
        <Toast />

        <div class="surface-section explorer-layout">
            <!-- Main header with title and actions -->
            <div class="explorer-header p-3 border-bottom-1 surface-border">
                <div class="container">
                    <div class="flex justify-content-between align-items-center">
                        <div class="flex align-items-center">
                            <i class="pi pi-folder-open text-primary text-2xl mr-2"></i>
                            <div>
                                <h1 class="text-xl font-bold m-0">My Collection</h1>
                                <p class="text-color-secondary m-0 text-sm">Your personal curated resources</p>
                            </div>
                        </div>
                        <div>
                            <Button label="Create New Collection" icon="pi pi-plus" @click="showCreateCollectionDialog" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Explorer Navigation Bar - like Windows address bar -->
            <div class="explorer-navbar p-2 border-bottom-1 surface-border bg-gray-50">
                <div class="container">
                    <div class="flex align-items-center">
                        <Button icon="pi pi-arrow-left" text rounded class="mr-1" />
                        <Button icon="pi pi-arrow-right" text rounded class="mr-3" disabled />

                        <!-- Breadcrumb navigation -->
                        <div class="explorer-breadcrumb flex-grow-1 mr-3">
                            <Breadcrumb :model="breadcrumbItems" />
                        </div>

                        <!-- Search bar -->
                        <div class="p-inputgroup" style="max-width: 400px">
                            <InputText v-model="searchQuery" placeholder="Search collections..." />
                            <Button icon="pi pi-search" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main explorer content area -->
            <div class="explorer-content container">
                <div class="grid">
                    <!-- Left sidebar - like Windows navigation pane -->
                    <div class="col-12 md:col-3 lg:col-2">
                        <div class="explorer-sidebar p-3">
                            <div class="sidebar-section mb-4">
                                <h3 class="text-sm uppercase font-semibold text-color-secondary mb-2">Quick access</h3>
                                <ul class="list-none p-0 m-0">
                                    <li class="mb-1">
                                        <a class="flex align-items-center p-2 border-round cursor-pointer hover:surface-hover no-underline text-color">
                                            <i class="pi pi-star-fill mr-2 text-yellow-500"></i>
                                            <span>Favorites</span>
                                        </a>
                                    </li>
                                    <li class="mb-1">
                                        <a class="flex align-items-center p-2 border-round cursor-pointer hover:surface-hover no-underline text-color">
                                            <i class="pi pi-clock mr-2 text-blue-500"></i>
                                            <span>Recent</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div class="sidebar-section mb-4">
                                <h3 class="text-sm uppercase font-semibold text-color-secondary mb-2">Libraries</h3>
                                <ul class="list-none p-0 m-0">
                                    <li class="mb-1">
                                        <a class="flex align-items-center p-2 border-round cursor-pointer bg-primary-50 border-left-2 border-primary no-underline text-color">
                                            <i class="pi pi-folder mr-2 text-primary"></i>
                                            <span class="font-medium">My Collections</span>
                                            <Badge :value="collections.length" class="ml-auto" />
                                        </a>
                                    </li>
                                    <li class="mb-1">
                                        <a class="flex align-items-center p-2 border-round cursor-pointer hover:surface-hover no-underline text-color">
                                            <i class="pi pi-file-pdf mr-2 text-orange-500"></i>
                                            <span>PDFs</span>
                                        </a>
                                    </li>
                                    <li class="mb-1">
                                        <a class="flex align-items-center p-2 border-round cursor-pointer hover:surface-hover no-underline text-color">
                                            <i class="pi pi-video mr-2 text-purple-500"></i>
                                            <span>Videos</span>
                                        </a>
                                    </li>
                                    <li class="mb-1">
                                        <a class="flex align-items-center p-2 border-round cursor-pointer hover:surface-hover no-underline text-color">
                                            <i class="pi pi-volume-up mr-2 text-teal-500"></i>
                                            <span>Audio</span>
                                        </a>
                                    </li>
                                    <li class="mb-1">
                                        <a class="flex align-items-center p-2 border-round cursor-pointer hover:surface-hover no-underline text-color">
                                            <i class="pi pi-book mr-2 text-cyan-500"></i>
                                            <span>E-Books</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div class="sidebar-section">
                                <h3 class="text-sm uppercase font-semibold text-color-secondary mb-2">Tags</h3>
                                <div class="flex flex-wrap gap-1">
                                    <Chip v-for="tag in popularTags" :key="tag.name" :label="tag.name" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right content area - like Windows file view -->
                    <div class="col-12 md:col-9 lg:col-10">
                        <div class="explorer-files-area p-3">
                            <!-- Toolbar with actions and view options -->
                            <div class="explorer-toolbar flex justify-content-between align-items-center mb-3 p-2 surface-ground border-round">
                                <div class="flex gap-2">
                                    <Button icon="pi pi-refresh" text rounded tooltip="Refresh" tooltipOptions="{ position: 'bottom' }" />
                                    <Button icon="pi pi-upload" text rounded tooltip="Import" tooltipOptions="{ position: 'bottom' }" />
                                </div>
                                <div class="flex gap-2">
                                    <Dropdown v-model="sortOption" :options="sortOptions" optionLabel="label" placeholder="Sort by" class="w-full md:w-10rem" />
                                    <Button icon="pi pi-th-large" outlined :class="{ 'p-button-secondary': viewMode === 'grid' }" @click="viewMode = 'grid'" tooltip="Grid view" tooltipOptions="{ position: 'bottom' }" />
                                    <Button icon="pi pi-list" outlined :class="{ 'p-button-secondary': viewMode === 'list' }" @click="viewMode = 'list'" tooltip="List view" tooltipOptions="{ position: 'bottom' }" />
                                </div>
                            </div>

                            <!-- Collections display area -->
                            <div v-if="loading" class="flex justify-content-center py-6">
                                <ProgressSpinner />
                            </div>

                            <div v-else-if="collections.length === 0" class="surface-card p-8 shadow-2 border-round text-center my-6">
                                <i class="pi pi-folder-open text-6xl text-color-secondary mb-4"></i>
                                <h2 class="text-2xl font-semibold mb-2">No collections yet</h2>
                                <p class="text-color-secondary mb-4">You haven't created any collections yet. Collections help you organize resources by topic, project, or course.</p>
                                <Button label="Create Your First Collection" icon="pi pi-plus" @click="showCreateCollectionDialog" />
                            </div>

                            <div v-else>
                                <!-- Grid View - like Windows icon view -->
                                <div v-if="viewMode === 'grid'" class="grid">
                                    <div v-for="collection in filteredCollections" :key="collection.id" class="col-12 sm:col-6 lg:col-3 xl:col-2 p-2">
                                        <div
                                            class="explorer-item surface-card border-round cursor-pointer hover:surface-hover transition-colors transition-duration-150"
                                            @click="viewCollection(collection)"
                                            @contextmenu.prevent="showContextMenu($event, collection)"
                                        >
                                            <div class="explorer-icon-container flex align-items-center justify-content-center" :style="{ backgroundColor: collection.color || '#f0f7ff' }">
                                                <i class="pi pi-folder-open text-4xl"></i>
                                            </div>
                                            <div class="explorer-item-label p-2 text-center">
                                                <div class="text-sm font-medium text-overflow-ellipsis" :title="collection.name">{{ collection.name }}</div>
                                                <div class="text-xs text-color-secondary">{{ collection.resourceCount }} items</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- List View - like Windows details view -->
                                <div v-else>
                                    <DataTable :value="filteredCollections" stripedRows removableSort class="explorer-table p-datatable-sm" :rowHover="true" @row-click="(e) => viewCollection(e.data)">
                                        <Column field="name" header="Name">
                                            <template #body="{ data }">
                                                <div class="flex align-items-center">
                                                    <div class="explorer-item-icon mr-2 flex align-items-center justify-content-center" :style="{ backgroundColor: data.color || '#f0f7ff' }">
                                                        <i class="pi pi-folder text-lg"></i>
                                                    </div>
                                                    <span class="font-medium">{{ data.name }}</span>
                                                </div>
                                            </template>
                                        </Column>
                                        <Column field="resourceCount" header="Items" :sortable="true">
                                            <template #body="{ data }">
                                                <span>{{ data.resourceCount }}</span>
                                            </template>
                                        </Column>
                                        <Column field="visibility" header="Visibility" :sortable="true">
                                            <template #body="{ data }">
                                                <Tag :value="data.visibility" :severity="data.visibility === 'public' ? 'success' : 'info'" />
                                            </template>
                                        </Column>
                                        <Column field="updatedAt" header="Date modified" :sortable="true">
                                            <template #body="{ data }">
                                                <span>{{ formatDate(data.updatedAt) }}</span>
                                            </template>
                                        </Column>
                                        <Column header="Actions">
                                            <template #body="{ data }">
                                                <div class="flex gap-2">
                                                    <Button icon="pi pi-eye" text rounded tooltip="View" tooltipOptions="{ position: 'bottom' }" @click.stop="viewCollection(data)" />
                                                    <Button icon="pi pi-pencil" text rounded tooltip="Edit" tooltipOptions="{ position: 'bottom' }" @click.stop="editCollection(data)" />
                                                    <Button icon="pi pi-trash" text rounded tooltip="Delete" tooltipOptions="{ position: 'bottom' }" severity="danger" @click.stop="confirmDeleteCollection(data)" />
                                                </div>
                                            </template>
                                        </Column>
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Context Menu -->
        <ContextMenu ref="contextMenu" :model="contextMenuItems" />

        <!-- Create/Edit Collection Dialog -->
        <Dialog v-model:visible="showDialog" :header="dialogMode === 'create' ? 'Create New Collection' : 'Edit Collection'" :style="{ width: '450px' }" modal>
            <div class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="font-medium">Collection Name</label>
                    <InputText id="name" v-model="collectionForm.name" type="text" placeholder="Enter collection name" :class="{ 'p-invalid': v$.collectionForm.name.$invalid && v$.collectionForm.name.$dirty }" />
                    <small v-if="v$.collectionForm.name.$invalid && v$.collectionForm.name.$dirty" class="p-error">{{ v$.collectionForm.name.$errors[0].$message }}</small>
                </div>

                <div class="field mb-4">
                    <label for="description" class="font-medium">Description</label>
                    <Textarea id="description" v-model="collectionForm.description" rows="3" placeholder="Enter collection description" autoResize />
                </div>

                <div class="field mb-4">
                    <label for="color" class="font-medium">Color</label>
                    <ColorPicker v-model="collectionForm.color" :inline="false" />
                </div>

                <div class="field mb-4">
                    <label for="visibility" class="font-medium">Visibility</label>
                    <Dropdown id="visibility" v-model="collectionForm.visibility" :options="visibilityOptions" optionLabel="label" optionValue="value" />
                </div>

                <div class="field mb-4">
                    <label class="font-medium mb-2">Tags</label>
                    <div class="flex flex-wrap gap-2">
                        <Chip v-for="tag in collectionForm.tags" :key="tag" :label="tag" :removable="true" @remove="removeTag(tag)" />
                    </div>
                    <div class="p-inputgroup mt-2">
                        <InputText v-model="newTag" placeholder="Add tag..." @keydown.enter.prevent="addTag" />
                        <Button icon="pi pi-plus" @click="addTag" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="hideDialog" text />
                <Button :label="dialogMode === 'create' ? 'Create' : 'Save'" icon="pi pi-check" @click="saveCollection" />
            </template>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup>
import { useVuelidate } from '@vuelidate/core';
import { minLength, required } from '@vuelidate/validators';
import { format } from 'date-fns';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Router for navigation
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

// State
const collections = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const viewMode = ref('grid');
const showDialog = ref(false);
const dialogMode = ref('create');
const selectedCollection = ref(null);
const contextMenu = ref(null);
const newTag = ref('');

// Collection form with validation
const collectionForm = ref({
    id: null,
    name: '',
    description: '',
    color: '#f0f7ff',
    visibility: 'private',
    tags: []
});

// Form validation rules
const rules = {
    collectionForm: {
        name: { required, minLength: minLength(3) }
    }
};

const v$ = useVuelidate(rules, { collectionForm });

// Sort options
const sortOption = ref(null);
const sortOptions = [
    { label: 'Name (A to Z)', value: 'nameAsc' },
    { label: 'Name (Z to A)', value: 'nameDesc' },
    { label: 'Newest first', value: 'newest' },
    { label: 'Oldest first', value: 'oldest' },
    { label: 'Most resources', value: 'mostResources' }
];

// Context menu items
const contextMenuItems = ref([
    {
        label: 'View Collection',
        icon: 'pi pi-eye',
        command: () => viewCollection(selectedCollection.value)
    },
    {
        label: 'Edit Collection',
        icon: 'pi pi-pencil',
        command: () => editCollection(selectedCollection.value)
    },
    {
        label: 'Share',
        icon: 'pi pi-share-alt',
        command: () => shareCollection(selectedCollection.value)
    },
    {
        separator: true
    },
    {
        label: 'Delete Collection',
        icon: 'pi pi-trash',
        class: 'p-error',
        command: () => confirmDeleteCollection(selectedCollection.value)
    }
]);

// Breadcrumb items
const breadcrumbItems = ref([{ label: 'Home', to: '/' }, { label: 'My Collections' }]);

// Popular tags for sidebar
const popularTags = ref([
    { name: 'Important', count: 8 },
    { name: 'Programming', count: 12 },
    { name: 'Design', count: 7 },
    { name: 'Marketing', count: 5 },
    { name: 'Business', count: 10 }
]);

// Filter collections based on search query
const filteredCollections = computed(() => {
    if (!searchQuery.value.trim()) {
        return sortCollections(collections.value);
    }

    const query = searchQuery.value.toLowerCase();
    const filtered = collections.value.filter((c) => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query) || (c.tags && c.tags.some((tag) => tag.toLowerCase().includes(query))));

    return sortCollections(filtered);
});

// Sort collections based on selected option
const sortCollections = (items) => {
    if (!sortOption.value) return items;

    return [...items].sort((a, b) => {
        switch (sortOption.value.value) {
            case 'nameAsc':
                return a.name.localeCompare(b.name);
            case 'nameDesc':
                return b.name.localeCompare(a.name);
            case 'newest':
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            case 'oldest':
                return new Date(a.updatedAt) - new Date(b.updatedAt);
            case 'mostResources':
                return b.resourceCount - a.resourceCount;
            default:
                return 0;
        }
    });
};

// Date formatting helper
const formatDate = (dateString) => {
    try {
        return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
        return dateString;
    }
};

// Tag management
const addTag = () => {
    if (!newTag.value.trim() || collectionForm.value.tags.includes(newTag.value.trim())) {
        return;
    }

    collectionForm.value.tags.push(newTag.value.trim());
    newTag.value = '';
};

const removeTag = (tag) => {
    collectionForm.value.tags = collectionForm.value.tags.filter((t) => t !== tag);
};

// Show context menu for collection item
const showContextMenu = (event, collection) => {
    selectedCollection.value = collection;
    contextMenu.value.show(event);
};

// Dialog management
const showCreateCollectionDialog = () => {
    collectionForm.value = {
        id: null,
        name: '',
        description: '',
        color: '#f0f7ff',
        visibility: 'private',
        tags: []
    };
    dialogMode.value = 'create';
    showDialog.value = true;
};

const editCollection = (collection) => {
    collectionForm.value = { ...collection };
    // Ensure tags is an array
    if (!collectionForm.value.tags) {
        collectionForm.value.tags = [];
    }
    dialogMode.value = 'edit';
    showDialog.value = true;
};

const hideDialog = () => {
    showDialog.value = false;
};

// Collection CRUD actions
const saveCollection = async () => {
    const isValid = await v$.value.$validate();

    if (!isValid) {
        return;
    }

    try {
        if (dialogMode.value === 'create') {
            // Simulate API call to create collection
            const newCollection = {
                id: Math.floor(Math.random() * 1000),
                ...collectionForm.value,
                resourceCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            collections.value.push(newCollection);

            toast.add({
                severity: 'success',
                summary: 'Collection Created',
                detail: `${newCollection.name} has been created successfully`,
                life: 3000
            });
        } else {
            // Simulate API call to update collection
            const index = collections.value.findIndex((c) => c.id === collectionForm.value.id);
            if (index !== -1) {
                collections.value[index] = {
                    ...collections.value[index],
                    ...collectionForm.value,
                    updatedAt: new Date().toISOString()
                };

                toast.add({
                    severity: 'success',
                    summary: 'Collection Updated',
                    detail: `${collectionForm.value.name} has been updated`,
                    life: 3000
                });
            }
        }

        hideDialog();
    } catch (error) {
        console.error('Error saving collection:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save collection',
            life: 3000
        });
    }
};

const confirmDeleteCollection = (collection) => {
    confirm.require({
        message: `Are you sure you want to delete the collection "${collection.name}"?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => deleteCollection(collection),
        reject: () => {
            /* do nothing */
        }
    });
};

const deleteCollection = (collection) => {
    try {
        // Simulate API call to delete collection
        collections.value = collections.value.filter((c) => c.id !== collection.id);

        toast.add({
            severity: 'success',
            summary: 'Collection Deleted',
            detail: `${collection.name} has been deleted`,
            life: 3000
        });
    } catch (error) {
        console.error('Error deleting collection:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete collection',
            life: 3000
        });
    }
};

const viewCollection = (collection) => {
    // Navigate to collection detail view
    router.push(`/collection/${collection.id}`);
};

const shareCollection = (collection) => {
    toast.add({
        severity: 'info',
        summary: 'Share Feature',
        detail: `Sharing options for "${collection.name}" would appear here`,
        life: 3000
    });
};

// Load initial data
onMounted(async () => {
    try {
        loading.value = true;

        // Simulate API call with delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        collections.value = [
            {
                id: 1,
                name: 'Programming Resources',
                description: 'Collection of programming tutorials and references',
                color: '#e6f7ff',
                resourceCount: 28,
                visibility: 'private',
                tags: ['Programming', 'Coding', 'Development'],
                createdAt: '2023-08-15T10:30:00Z',
                updatedAt: '2023-09-22T14:45:00Z'
            },
            {
                id: 2,
                name: 'Design Inspiration',
                description: 'UI/UX design resources and inspiration',
                color: '#fff0f6',
                resourceCount: 15,
                visibility: 'public',
                tags: ['Design', 'UI', 'UX'],
                createdAt: '2023-07-20T08:15:00Z',
                updatedAt: '2023-09-18T11:20:00Z'
            },
            {
                id: 3,
                name: 'Business Books',
                description: 'Must-read business and entrepreneurship books',
                color: '#f6ffed',
                resourceCount: 8,
                visibility: 'private',
                tags: ['Business', 'Books', 'Entrepreneurship'],
                createdAt: '2023-09-01T16:40:00Z',
                updatedAt: '2023-09-15T09:30:00Z'
            },
            {
                id: 4,
                name: 'Marketing Strategy',
                description: 'Digital marketing resources and case studies',
                color: '#fffbe6',
                resourceCount: 12,
                visibility: 'public',
                tags: ['Marketing', 'Digital'],
                createdAt: '2023-08-05T13:20:00Z',
                updatedAt: '2023-09-10T15:50:00Z'
            },
            {
                id: 5,
                name: 'Personal Development',
                description: 'Resources for personal growth and productivity',
                color: '#f0f5ff',
                resourceCount: 18,
                visibility: 'private',
                tags: ['Self-help', 'Productivity'],
                createdAt: '2023-06-12T09:10:00Z',
                updatedAt: '2023-09-05T10:15:00Z'
            },
            {
                id: 6,
                name: 'Data Science',
                description: 'Machine learning and data analysis resources',
                color: '#f9f0ff',
                resourceCount: 22,
                visibility: 'private',
                tags: ['Data', 'ML', 'AI'],
                createdAt: '2023-07-30T11:45:00Z',
                updatedAt: '2023-08-28T16:20:00Z'
            }
        ];

        loading.value = false;
    } catch (error) {
        console.error('Error loading collections:', error);
        loading.value = false;
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load collections',
            life: 3000
        });
    }
});
</script>

<style scoped>
.explorer-layout {
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
}

.explorer-content {
    flex: 1;
    overflow: auto;
    padding-top: 1rem;
    padding-bottom: 1rem;
}

.explorer-sidebar {
    height: 100%;
    border-right: 1px solid var(--surface-border);
}

.explorer-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    transition: all 0.2s;
}

.explorer-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.explorer-icon-container {
    width: 100%;
    height: 80px;
    border-top-left-radius: 0.375rem;
    border-top-right-radius: 0.375rem;
}

.explorer-item-icon {
    width: 36px;
    height: 36px;
    border-radius: 4px;
}

.explorer-item-label {
    width: 100%;
    overflow: hidden;
}

.text-overflow-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Table styling to match Windows Explorer */
.explorer-table {
    border: 1px solid var(--surface-border);
}

.explorer-table .p-datatable-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid var(--surface-border);
}

/* Color indicator for list view */
.color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
    .explorer-sidebar {
        border-right: none;
        border-bottom: 1px solid var(--surface-border);
        margin-bottom: 1rem;
    }

    .explorer-layout {
        height: auto;
    }
}
</style>
