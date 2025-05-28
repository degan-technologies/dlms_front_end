<template>
    <Dialog v-model:visible="isVisible" modal header="Add to Collection" :style="{ width: '32rem' }" :breakpoints="{ '960px': '75vw', '641px': '90vw' }" class="p-fluid" :draggable="false">
        <div class="flex flex-col gap-4">
            <!-- Ebook Info -->
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg flex items-center justify-center">
                    <i :class="getEbookTypeIcon(ebook)" class="text-lg text-purple-600"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 text-sm line-clamp-1">{{ ebook?.file_name || 'Untitled File' }}</h4>
                    <p class="text-xs text-gray-500">{{ ebook?.e_book_type?.name || 'File' }}</p>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="flex border-b border-gray-200">
                <button
                    @click="activeTab = 'existing'"
                    :class="[
                        'flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors',
                        activeTab === 'existing' ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    ]"
                >
                    <i class="pi pi-list mr-2"></i>
                    Existing Collections
                </button>
                <button
                    @click="activeTab = 'new'"
                    :class="['flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors', activeTab === 'new' ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
                >
                    <i class="pi pi-plus mr-2"></i>
                    Create New
                </button>
            </div>

            <!-- Existing Collections Tab -->
            <div v-if="activeTab === 'existing'" class="space-y-4">
                <!-- Search -->
                <div class="relative">
                    <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <InputText v-model="searchQuery" placeholder="Search collections..." class="w-full pl-10" />
                </div>

                <!-- Collections List -->
                <div v-if="loadingCollections" class="flex items-center justify-center py-8">
                    <i class="pi pi-spin pi-spinner text-xl text-purple-600"></i>
                    <span class="ml-2 text-gray-600">Loading collections...</span>
                </div>

                <div v-else-if="filteredCollections.length === 0" class="text-center py-8">
                    <i class="pi pi-folder text-3xl text-gray-300 mb-2"></i>
                    <p class="text-gray-500">{{ searchQuery ? 'No collections found' : 'No collections yet' }}</p>
                    <Button label="Create First Collection" icon="pi pi-plus" @click="activeTab = 'new'" class="p-button-text p-button-sm mt-2" />
                </div>

                <div v-else class="max-h-64 overflow-y-auto space-y-2">
                    <div
                        v-for="collection in filteredCollections"
                        :key="collection.id"
                        :class="[
                            'flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all',
                            selectedCollections.includes(collection.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        ]"
                        @click="toggleCollectionSelection(collection.id)"
                    >
                        <div class="flex items-center gap-3 flex-1">
                            <div class="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <i class="pi pi-folder text-purple-600 text-sm"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h5 class="font-medium text-gray-900 text-sm truncate">{{ collection.name }}</h5>
                                <p class="text-xs text-gray-500">{{ collection.ebooks_count?.total || 0 }} resources</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <!-- Already in collection indicator -->
                            <span v-if="isEbookInCollection(collection)" class="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"> Added </span>
                            <!-- Selection checkbox -->
                            <div :class="['w-5 h-5 border-2 rounded flex items-center justify-center', selectedCollections.includes(collection.id) ? 'border-purple-500 bg-purple-500' : 'border-gray-300']">
                                <i v-if="selectedCollections.includes(collection.id)" class="pi pi-check text-white text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create New Collection Tab -->
            <div v-if="activeTab === 'new'" class="space-y-4">
                <div class="field">
                    <label for="newCollectionName" class="block text-sm font-medium text-gray-700 mb-2">Collection Name</label>
                    <InputText id="newCollectionName" v-model="newCollectionForm.name" placeholder="Enter collection name" class="w-full" :class="{ 'p-invalid': nameError }" @input="nameError = ''" />
                    <small v-if="nameError" class="p-error">{{ nameError }}</small>
                </div>

                <div class="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <i class="pi pi-info-circle text-blue-600"></i>
                    <span class="text-sm text-blue-700">This ebook will be automatically added to your new collection.</span>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-4">
                <i class="pi pi-spin pi-spinner text-xl text-purple-600"></i>
                <span class="ml-2 text-gray-600">{{ activeTab === 'new' ? 'Creating collection...' : 'Adding to collections...' }}</span>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="Cancel" icon="pi pi-times" @click="closeModal" class="p-button-text" :disabled="loading" />
                <Button
                    v-if="activeTab === 'existing'"
                    :label="selectedCollections.length > 0 ? `Add to ${selectedCollections.length} Collection${selectedCollections.length > 1 ? 's' : ''}` : 'Select Collections'"
                    icon="pi pi-plus"
                    @click="addToExistingCollections"
                    :loading="loading"
                    :disabled="selectedCollections.length === 0"
                    class="p-button-primary"
                />
                <Button v-else label="Create & Add" icon="pi pi-plus" @click="createNewCollection" :loading="loading" class="p-button-primary" />
            </div>
        </template>
    </Dialog>

    <!-- Manage Collection Modal -->
    <Dialog v-model:visible="manageCollectionVisible" :header="header" modal :closable="true" :style="{ width: '40vw' }">
        <div class="p-4">
            <h3 class="text-lg font-semibold mb-4">Manage Collection</h3>
            <div class="mb-4">
                <label for="collectionName" class="block text-sm font-medium text-gray-700">Collection Name</label>
                <input id="collectionName" v-model="collectionName" type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div class="flex justify-end gap-2">
                <button @click="onCancel" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Cancel</button>
                <button @click="onSave" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    ebook: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'collectionAdded']);

const toast = useToast();

// Local state
const loading = ref(false);
const loadingCollections = ref(false);
const activeTab = ref('existing');
const searchQuery = ref('');
const nameError = ref('');
const collections = ref([]);
const selectedCollections = ref([]);
const manageCollectionVisible = ref(false);
const header = ref('Collection');
const collectionName = ref('');

const newCollectionForm = ref({
    name: ''
});

// Computed
const isVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const filteredCollections = computed(() => {
    if (!searchQuery.value) return collections.value;
    return collections.value.filter((collection) => collection.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

// Helper function to get ebook type icon
const getEbookTypeIcon = (ebook) => {
    const type = ebook?.e_book_type?.name?.toLowerCase() || '';
    if (type.includes('pdf')) return 'pi pi-file-pdf';
    if (type.includes('video')) return 'pi pi-video';
    if (type.includes('audio')) return 'pi pi-volume-up';
    return 'pi pi-file';
};

// Check if ebook is already in collection
const isEbookInCollection = (collection) => {
    if (!props.ebook?.collections) return false;
    return props.ebook.collections.some((c) => c.id === collection.id);
};

// Toggle collection selection
const toggleCollectionSelection = (collectionId) => {
    const collection = collections.value.find((c) => c.id === collectionId);
    if (isEbookInCollection(collection)) return; // Don't allow selection if already in collection

    const index = selectedCollections.value.indexOf(collectionId);
    if (index > -1) {
        selectedCollections.value.splice(index, 1);
    } else {
        selectedCollections.value.push(collectionId);
    }
};

// Fetch user collections
const fetchCollections = async () => {
    loadingCollections.value = true;
    try {
        const response = await axiosInstance.get('/my-collections', {
            params: {
                per_page: 100,
                with: 'ebooks'
            }
        });
        collections.value = response.data.data || [];
    } catch (error) {
        console.error('Error fetching collections:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load collections',
            life: 3000
        });
    } finally {
        loadingCollections.value = false;
    }
};

// Add to existing collections
const addToExistingCollections = async () => {
    if (selectedCollections.value.length === 0) return;

    loading.value = true;
    try {
        const promises = selectedCollections.value.map((collectionId) =>
            axiosInstance.post(`/collections/${collectionId}/add-ebook`, {
                e_book_id: props.ebook.id
            })
        );

        await Promise.all(promises);

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Added to ${selectedCollections.value.length} collection${selectedCollections.value.length > 1 ? 's' : ''}`,
            life: 3000
        });

        emit('collectionAdded', selectedCollections.value);
        closeModal();
    } catch (error) {
        console.error('Error adding to collections:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to add to collections',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

// Create new collection
const createNewCollection = async () => {
    if (!newCollectionForm.value.name.trim()) {
        nameError.value = 'Collection name is required';
        return;
    }

    loading.value = true;
    try {
        const response = await axiosInstance.post('/collections', {
            name: newCollectionForm.value.name.trim(),
            e_book_ids: [props.ebook.id]
        });

        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Collection created and ebook added successfully',
            life: 3000
        });

        emit('collectionAdded', [response.data.data.id]);
        closeModal();
    } catch (error) {
        console.error('Error creating collection:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to create collection',
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

// Close modal
const closeModal = () => {
    isVisible.value = false;
    newCollectionForm.value.name = '';
    nameError.value = '';
    selectedCollections.value = [];
    searchQuery.value = '';
    activeTab.value = 'existing';
};

// Manage Collection Modal
const openManageCollection = (collection) => {
    collectionName.value = collection.name;
    manageCollectionVisible.value = true;
};

const onCancel = () => {
    manageCollectionVisible.value = false;
};

const onSave = () => {
    // Emit save event with collection name
    manageCollectionVisible.value = false;
};

// Watch for modal visibility changes
watch(isVisible, (visible) => {
    if (visible) {
        fetchCollections();
    }
});

onMounted(() => {
    if (props.visible) {
        fetchCollections();
    }
});
</script>

<style scoped></style>
