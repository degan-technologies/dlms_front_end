<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const assets = ref([]);
const loading = ref(true);
const filters = ref({
    global: { value: null, matchMode: 'contains' }
});
const totalRecords = ref(0);
const selectedAssets = ref([]);
const lazyParams = ref({
    first: 0,
    rows: 10,
    sortField: 'title',
    sortOrder: 1,
    filters: {}
});
const pdfPreviewDialog = ref(false);
const selectedPdfAsset = ref(null);

// Asset type filter options
const assetTypes = ref([
    { label: 'All Types', value: '' },
    { label: 'Video', value: 'video' },
    { label: 'Audio', value: 'audio' },
    { label: 'Worksheet', value: 'worksheet' },
    { label: 'Presentation', value: 'presentation' },
    { label: 'Research Paper', value: 'research_paper' },
    { label: 'Other', value: 'other' }
]);
const selectedAssetType = ref('');

onMounted(() => {
    fetchAssets();
});

const fetchAssets = async () => {
    loading.value = true;
    try {
        // Simulated API call - replace with actual API call
        setTimeout(() => {
            // Mock data with enhanced PDF content and preview URLs
            assets.value = [
                {
                    id: 1,
                    title: 'Introduction to Programming',
                    author: 'Prof. John Smith',
                    publication_year: 2022,
                    category: 'Computer Science',
                    availability_status: 'available',
                    cover_image_url: 'https://img.youtube.com/vi/zOjov-2OZ0E/maxresdefault.jpg',
                    description: 'A comprehensive video course introducing programming concepts for beginners.',
                    asset_type: 'video',
                    media_type: 'mp4',
                    media_url: 'https://www.youtube.com/embed/zOjov-2OZ0E',
                    duration_minutes: 120,
                    restricted_access: false,
                    isbn: '9781234567890',
                    shelf_id: 'DIG-V001'
                },
                {
                    id: 2,
                    title: 'Classical Music Compilation',
                    author: 'Various Artists',
                    publication_year: 2021,
                    category: 'Music',
                    availability_status: 'available',
                    cover_image_url: 'https://m.media-amazon.com/images/I/61yqXWBQStL._UF1000,1000_QL80_.jpg',
                    description: 'A collection of classical music pieces for educational purposes.',
                    asset_type: 'audio',
                    media_type: 'mp3',
                    duration_minutes: 85,
                    restricted_access: false,
                    isbn: '9781234567891',
                    shelf_id: 'DIG-A003'
                },
                {
                    id: 3,
                    title: 'Advanced Mathematics Worksheet',
                    author: 'Dr. Sarah Johnson',
                    publication_year: 2023,
                    category: 'Mathematics',
                    availability_status: 'available',
                    cover_image_url: 'https://m.media-amazon.com/images/I/61ItRb1o7nL._AC_UF1000,1000_QL80_.jpg',
                    description: 'Practice problems for advanced calculus and linear algebra.',
                    asset_type: 'worksheet',
                    media_type: 'pdf',
                    media_url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
                    restricted_access: false,
                    isbn: '9780987654321',
                    shelf_id: 'DIG-P025',
                    preview_available: true
                },
                {
                    id: 4,
                    title: 'History of Art Presentation',
                    author: 'Prof. Michael Williams',
                    publication_year: 2022,
                    category: 'Arts',
                    availability_status: 'available',
                    cover_image_url: 'https://m.media-amazon.com/images/I/91-v+CyYAeL._AC_UF1000,1000_QL80_.jpg',
                    description: 'A slide presentation covering the major art movements throughout history.',
                    asset_type: 'presentation',
                    media_type: 'pdf',
                    media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    restricted_access: true,
                    isbn: '9780987654322',
                    shelf_id: 'DIG-P026',
                    preview_available: true
                },
                {
                    id: 5,
                    title: 'Research Paper on Climate Change',
                    author: 'Dr. Emily Chen',
                    publication_year: 2023,
                    category: 'Environmental Science',
                    availability_status: 'available',
                    cover_image_url: 'https://m.media-amazon.com/images/I/71zWJMkcCQL._AC_UF1000,1000_QL80_.jpg',
                    description: 'A comprehensive research paper on climate change effects and potential solutions.',
                    asset_type: 'research_paper',
                    media_type: 'pdf',
                    media_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    restricted_access: false,
                    isbn: '9780987654323',
                    shelf_id: 'DIG-P027',
                    preview_available: true
                }
            ];
            totalRecords.value = assets.value.length;
            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('Failed to fetch assets:', error);
    } finally {
        loading.value = false;
    }
};

const isPdf = computed(() => {
    return (asset) => asset.media_type === 'pdf';
});

// Enhanced PDF preview with more features
const previewPdf = (asset) => {
    selectedPdfAsset.value = asset;
    pdfPreviewDialog.value = true;

    // Increment view count for analytics
    const index = assets.value.findIndex((a) => a.id === asset.id);
    if (index !== -1 && assets.value[index].view_count !== undefined) {
        assets.value[index].view_count++;
    }
};

// Function to view details - Modified to directly open PDF viewer for PDFs and YouTube for videos
const viewDetails = (asset) => {
    // Clear any existing viewer session flags first
    sessionStorage.removeItem('openPdfViewer');
    sessionStorage.removeItem('openVideoPlayer');

    if (asset.media_type === 'pdf' || asset.asset_type === 'worksheet' || asset.asset_type === 'research_paper' || asset.asset_type === 'presentation') {
        // For PDF assets, store the flag to auto-open PDF viewer
        sessionStorage.setItem('openPdfViewer', 'true');
        sessionStorage.setItem('assetType', 'pdf');
    } else if (asset.media_type === 'mp4' || asset.asset_type === 'video') {
        // For video assets, store the flag to auto-open video player
        sessionStorage.setItem('openVideoPlayer', 'true');
        sessionStorage.setItem('assetType', 'video');
    }

    router.push(`/books/assets/${asset.id}`);
};

const openPdfReader = (asset) => {
    router.push(`/books/assets/${asset.id}`);
};

const onPage = (event) => {
    lazyParams.value = { ...lazyParams.value, ...event };
    fetchAssets();
};

const onSort = (event) => {
    lazyParams.value = { ...lazyParams.value, ...event };
    fetchAssets();
};

const onFilter = () => {
    lazyParams.value.first = 0;
    fetchAssets();
};

const filterByAssetType = () => {
    // In a real app, this would update the fetch parameters
    fetchAssets();
};

const editAsset = (asset) => {
    router.push(`/books/assets/edit/${asset.id}`);
};

const createAsset = () => {
    router.push('/books/assets/create');
};

const downloadAsset = (asset) => {
    // In a real app, this would initiate a download from the server
    alert(`Downloading ${asset.title}.${asset.media_type}`);
};

const confirmDeleteAsset = (asset) => {
    if (confirm(`Are you sure you want to delete "${asset.title}"?`)) {
        deleteAsset(asset.id);
    }
};

const deleteAsset = async (id) => {
    try {
        // Simulated API call
        assets.value = assets.value.filter((asset) => asset.id !== id);
        totalRecords.value--;
    } catch (error) {
        console.error(`Failed to delete asset with ID ${id}:`, error);
    }
};

const getAssetIcon = (assetType) => {
    switch (assetType) {
        case 'video':
            return 'pi pi-video';
        case 'audio':
            return 'pi pi-volume-up';
        case 'worksheet':
            return 'pi pi-file-pdf';
        case 'presentation':
            return 'pi pi-images';
        case 'research_paper':
            return 'pi pi-file-o';
        default:
            return 'pi pi-file';
    }
};

const getAssetSeverity = (assetType) => {
    switch (assetType) {
        case 'video':
            return 'info';
        case 'audio':
            return 'success';
        case 'worksheet':
            return 'warning';
        case 'presentation':
            return 'help';
        case 'research_paper':
            return 'danger';
        default:
            return null;
    }
};

const exportCSV = () => {
    // Will use PrimeVue's DataTable export feature
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5 class="m-0">Digital Assets Collection</h5>
                <p class="mt-2 mb-4 text-gray-600">Browse, search, and manage the digital assets available in the library.</p>

                <div class="flex flex-column md:flex-row md:justify-content-between mb-4">
                    <div class="flex gap-3 mb-3 md:mb-0">
                        <div>
                            <label for="assetType" class="block text-sm font-medium text-gray-700 mb-1"> Filter by Asset Type </label>
                            <Dropdown id="assetType" v-model="selectedAssetType" :options="assetTypes" optionLabel="label" optionValue="value" placeholder="Select Asset Type" class="w-full md:w-14rem" @change="filterByAssetType" />
                        </div>
                    </div>
                </div>

                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <Button label="New Asset" icon="pi pi-plus" severity="success" class="mr-2" @click="createAsset" />
                        <Button label="Delete Selected" icon="pi pi-trash" severity="danger" :disabled="!selectedAssets.length" />
                    </template>
                    <template v-slot:end>
                        <div class="flex flex-wrap gap-2">
                            <Button icon="pi pi-file-excel" severity="success" @click="exportCSV" />
                            <Button icon="pi pi-filter" severity="info" />
                            <span class="p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters.global.value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>
                </Toolbar>

                <DataTable
                    v-model:selection="selectedAssets"
                    :value="assets"
                    :paginator="true"
                    :rows="10"
                    :loading="loading"
                    :lazy="true"
                    :total-records="totalRecords"
                    :row-hover="true"
                    paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    current-page-report-template="Showing {first} to {last} of {totalRecords} assets"
                    responsive-layout="scroll"
                    :global-filter-fields="['title', 'author', 'category', 'asset_type']"
                    v-model:filters="filters"
                    @page="onPage($event)"
                    @sort="onSort($event)"
                    @filter="onFilter()"
                    style-class="p-datatable-gridlines p-datatable-sm"
                >
                    <template #empty> No assets found. </template>
                    <template #loading> Loading assets data. Please wait. </template>

                    <Column selectionMode="multiple" style="width: 3rem"></Column>

                    <Column field="title" header="Title" sortable>
                        <template #body="{ data }">
                            <div class="flex align-items-center">
                                <span class="mr-2">
                                    <i :class="getAssetIcon(data.asset_type)" style="font-size: 1.5rem"></i>
                                </span>
                                <span>{{ data.title }}</span>
                            </div>
                        </template>
                    </Column>

                    <Column field="author" header="Author" sortable></Column>
                    <Column field="category" header="Category" sortable></Column>

                    <Column field="asset_type" header="Asset Type" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.asset_type" :severity="getAssetSeverity(data.asset_type)" :icon="getAssetIcon(data.asset_type)" />
                        </template>
                    </Column>

                    <Column field="media_type" header="Format" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.media_type.toUpperCase()" />
                        </template>
                    </Column>

                    <Column field="restricted_access" header="Access" sortable>
                        <template #body="{ data }">
                            <Tag :value="data.restricted_access ? 'Restricted' : 'Open'" :severity="data.restricted_access ? 'danger' : 'success'" />
                        </template>
                    </Column>

                    <Column style="min-width: 12rem">
                        <template #header>Actions</template>
                        <template #body="{ data }">
                            <div class="flex justify-content-center gap-2">
                                <Button icon="pi pi-eye" tooltip="View Details" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-info p-button-sm" @click="viewDetails(data)" />
                                <Button v-if="isPdf(data)" icon="pi pi-file-pdf" tooltip="Preview PDF" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-warning p-button-sm" @click="previewPdf(data)" />
                                <Button icon="pi pi-download" tooltip="Download" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-warning p-button-sm" @click="downloadAsset(data)" />
                                <Button icon="pi pi-pencil" tooltip="Edit" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-success p-button-sm" @click="editAsset(data)" />
                                <Button icon="pi pi-trash" tooltip="Delete" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-danger p-button-sm" @click="confirmDeleteAsset(data)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="pdfPreviewDialog" header="PDF Preview" :modal="true" :closable="true" :style="{ width: '80vw' }">
                    <iframe v-if="selectedPdfAsset" :src="selectedPdfAsset.media_url" style="width: 100%; height: 500px" frameborder="0"></iframe>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped>
.p-datatable ::v-deep(.p-datatable-tbody > tr > td) {
    padding: 0.75rem;
}
</style>
