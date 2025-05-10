<template>
    <div class="my-collection-page">
        <Toast />

        <div class="surface-section py-8">
            <div class="container mx-auto px-4">
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <div>
                        <h1 class="text-3xl font-bold mb-2">My Collection</h1>
                        <p class="text-color-secondary mb-4">Your personal curated resources</p>
                    </div>

                    <div class="mb-4 md:mb-0">
                        <Button label="Create New Collection" icon="pi pi-plus" @click="showCreateCollectionDialog" />
                    </div>
                </div>

                <!-- Search and filter controls -->
                <div class="flex flex-column md:flex-row gap-3 justify-content-between my-4">
                    <div class="p-inputgroup w-full md:w-6">
                        <InputText v-model="searchQuery" placeholder="Search collections..." />
                        <Button icon="pi pi-search" />
                    </div>

                    <div class="flex gap-2">
                        <Dropdown v-model="sortOption" :options="sortOptions" optionLabel="label" placeholder="Sort by" class="w-full md:w-10rem" />
                        <Button icon="pi pi-th-large" outlined :class="{ 'p-button-secondary': viewMode === 'grid' }" @click="viewMode = 'grid'" />
                        <Button icon="pi pi-list" outlined :class="{ 'p-button-secondary': viewMode === 'list' }" @click="viewMode = 'list'" />
                    </div>
                </div>

                <!-- Collections display -->
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
                    <!-- Grid View -->
                    <div v-if="viewMode === 'grid'" class="grid">
                        <div v-for="collection in filteredCollections" :key="collection.id" class="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
                            <div class="surface-card shadow-2 border-round h-full collection-card p-0 overflow-hidden">
                                <div class="collection-header p-4" :style="{ backgroundColor: collection.color || '#f0f7ff' }">
                                    <div class="flex align-items-center justify-content-between">
                                        <span class="font-semibold text-lg">{{ collection.name }}</span>
                                        <Menu :model="getCollectionMenuItems(collection)" :popup="true" :id="`collection_menu_${collection.id}`" />
                                        <Button icon="pi pi-ellipsis-v" @click="toggleMenu($event, `collection_menu_${collection.id}`)" text rounded />
                                    </div>
                                </div>

                                <div class="p-4">
                                    <div class="mb-3">
                                        <p class="text-color-secondary mb-3">{{ collection.description }}</p>
                                        <div class="flex align-items-center">
                                            <i class="pi pi-book mr-2 text-color-secondary"></i>
                                            <span>{{ collection.resourceCount }} resources</span>
                                        </div>
                                        <div class="flex align-items-center mt-2">
                                            <i class="pi pi-calendar mr-2 text-color-secondary"></i>
                                            <span>Updated {{ formatDate(collection.updatedAt) }}</span>
                                        </div>
                                    </div>

                                    <div class="collection-footer mt-3 pt-3 border-top-1 surface-border flex justify-content-between">
                                        <Button label="View" icon="pi pi-eye" text @click="viewCollection(collection)" />
                                        <Button label="Share" icon="pi pi-share-alt" text @click="shareCollection(collection)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- List View -->
                    <div v-else class="surface-card shadow-1 border-round my-2">
                        <DataTable :value="filteredCollections" stripedRows>
                            <Column field="name" header="Collection Name">
                                <template #body="{ data }">
                                    <div class="flex align-items-center">
                                        <div class="color-indicator mr-2" :style="{ backgroundColor: data.color || '#f0f7ff' }"></div>
                                        <span class="font-medium">{{ data.name }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="description" header="Description">
                                <template #body="{ data }">
                                    <span class="text-color-secondary">{{ data.description }}</span>
                                </template>
                            </Column>
                            <Column field="resourceCount" header="Resources">
                                <template #body="{ data }">
                                    <span>{{ data.resourceCount }}</span>
                                </template>
                            </Column>
                            <Column field="updatedAt" header="Last Updated">
                                <template #body="{ data }">
                                    <span>{{ formatDate(data.updatedAt) }}</span>
                                </template>
                            </Column>
                            <Column header="Actions">
                                <template #body="{ data }">
                                    <div class="flex gap-2">
                                        <Button icon="pi pi-eye" text rounded tooltip="View Collection" @click="viewCollection(data)" />
                                        <Button icon="pi pi-pencil" text rounded tooltip="Edit Collection" @click="editCollection(data)" />
                                        <Button icon="pi pi-trash" text rounded tooltip="Delete Collection" severity="danger" @click="confirmDeleteCollection(data)" />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>

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
import { maxLength, required } from '@vuelidate/validators';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

// Components
import Button from 'primevue/button';
import ColorPicker from 'primevue/colorpicker';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';

// UI Services
const confirm = useConfirm();
const toast = useToast();

// State
const loading = ref(true);
const collections = ref([]);
const searchQuery = ref('');
const sortOption = ref({ value: 'updatedAt', label: 'Last Updated' });
const sortOptions = ref([
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'resourceCount', label: 'Resource Count' }
]);
const viewMode = ref('grid');

// Collection dialog
const showDialog = ref(false);
const dialogMode = ref('create'); // 'create' or 'edit'
const collectionForm = ref({
    id: null,
    name: '',
    description: '',
    color: '#1976d2',
    visibility: 'private'
});
const selectedCollection = ref(null);

// Visibility options
const visibilityOptions = ref([
    { value: 'private', label: 'Private (Only you can see)' },
    { value: 'public', label: 'Public (Anyone can view)' }
]);

// Form validation
const rules = {
    collectionForm: {
        name: { required, maxLength: maxLength(50) }
    }
};
const v$ = useVuelidate(rules, { collectionForm });

// Filter collections based on search query
const filteredCollections = computed(() => {
    if (!searchQuery.value) return collections.value;

    const query = searchQuery.value.toLowerCase();
    return collections.value.filter((collection) => collection.name.toLowerCase().includes(query) || collection.description.toLowerCase().includes(query));
});

// Format date for display
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(date);
};

// Toggle menu
const toggleMenu = (event, menuId) => {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.__vueParentComponent.exposed.toggle(event);
    }
};

// Get menu items for collection actions
const getCollectionMenuItems = (collection) => {
    return [
        {
            label: 'View',
            icon: 'pi pi-eye',
            command: () => viewCollection(collection)
        },
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => editCollection(collection)
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => confirmDeleteCollection(collection)
        },
        {
            separator: true
        },
        {
            label: 'Share',
            icon: 'pi pi-share-alt',
            command: () => shareCollection(collection)
        }
    ];
};

// Create collection dialog
const showCreateCollectionDialog = () => {
    dialogMode.value = 'create';
    collectionForm.value = {
        id: null,
        name: '',
        description: '',
        color: '#1976d2',
        visibility: 'private'
    };
    showDialog.value = true;
};

// Edit collection dialog
const editCollection = (collection) => {
    dialogMode.value = 'edit';
    selectedCollection.value = collection;
    collectionForm.value = {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        color: collection.color || '#1976d2',
        visibility: collection.visibility || 'private'
    };
    showDialog.value = true;
};

// Hide dialog
const hideDialog = () => {
    showDialog.value = false;
};

// Save collection
const saveCollection = async () => {
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    try {
        // In a real app, call API to save the collection
        if (dialogMode.value === 'create') {
            // Mock creating a collection
            const newCollection = {
                id: Date.now().toString(),
                ...collectionForm.value,
                resourceCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            collections.value.unshift(newCollection);
            toast.add({ severity: 'success', summary: 'Success', detail: 'Collection created successfully', life: 3000 });
        } else {
            // Mock updating a collection
            const index = collections.value.findIndex((c) => c.id === collectionForm.value.id);
            if (index !== -1) {
                collections.value[index] = {
                    ...collections.value[index],
                    ...collectionForm.value,
                    updatedAt: new Date().toISOString()
                };
            }

            toast.add({ severity: 'success', summary: 'Success', detail: 'Collection updated successfully', life: 3000 });
        }

        hideDialog();
    } catch (error) {
        console.error('Error saving collection:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save collection', life: 3000 });
    }
};

// View collection
const viewCollection = (collection) => {
    // In a real app, navigate to collection details page
    console.log('View collection:', collection);
};

// Share collection
const shareCollection = (collection) => {
    // In a real app, show share dialog/options
    console.log('Share collection:', collection);

    toast.add({
        severity: 'info',
        summary: 'Share Collection',
        detail: 'Sharing options would appear here',
        life: 3000
    });
};

// Confirm delete collection
const confirmDeleteCollection = (collection) => {
    confirm.require({
        message: `Are you sure you want to delete the collection "${collection.name}"?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => deleteCollection(collection),
        reject: () => {}
    });
};

// Delete collection
const deleteCollection = (collection) => {
    try {
        // In a real app, call API to delete the collection
        collections.value = collections.value.filter((c) => c.id !== collection.id);

        toast.add({ severity: 'success', summary: 'Success', detail: 'Collection deleted successfully', life: 3000 });
    } catch (error) {
        console.error('Error deleting collection:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete collection', life: 3000 });
    }
};

// Fetch data on component mount
onMounted(async () => {
    try {
        // In a real app, fetch collections from API
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

        // Mock data
        collections.value = [
            {
                id: '1',
                name: 'Data Science Resources',
                description: 'Materials for the Data Science certificate program',
                resourceCount: 12,
                color: '#2196F3',
                visibility: 'private',
                updatedAt: '2023-06-15T10:30:00Z'
            },
            {
                id: '2',
                name: 'Literature Classics',
                description: 'Collection of classic literature resources for English Literature course',
                resourceCount: 8,
                color: '#4CAF50',
                visibility: 'public',
                updatedAt: '2023-07-02T14:45:00Z'
            },
            {
                id: '3',
                name: 'Research Methodology',
                description: 'Resources for research paper writing and methodology',
                resourceCount: 5,
                color: '#FF9800',
                visibility: 'private',
                updatedAt: '2023-07-10T09:15:00Z'
            }
        ];
    } catch (error) {
        console.error('Error loading collections:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load collections', life: 3000 });
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.collection-card {
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}

.collection-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.color-indicator {
    width: 16px;
    height: 16px;
    border-radius: 4px;
}

.collection-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
