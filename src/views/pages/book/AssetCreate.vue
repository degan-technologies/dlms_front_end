<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const submitted = ref(false);
const loading = ref(false);
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

const asset = ref({
    // BookItem fields
    title: '',
    isbn: '',
    availability_status: 'available', // default to available
    author: '',
    publication_year: null,
    description: '',
    cover_image_url: '',
    metadata: {},
    language: '',
    library_branch_id: null,
    shelf_id: null,
    category_id: null,
    publisher_id: null,

    // OtherAsset-specific fields
    asset_type_id: null,
    asset_type: '',
    media_type: '',
    unique_id: '',
    duration_minutes: null,
    manufacturer: '',
    physical_condition: 'new',
    location_details: '',
    acquisition_date: null,
    usage_instructions: '',
    restricted_access: false
});

// Form options
const branches = ref([]);
const shelves = ref([]);
const categories = ref([]);
const publishers = ref([]);
const assetTypes = ref([
    { name: 'Video', code: 'video' },
    { name: 'Audio', code: 'audio' },
    { name: 'Worksheet', code: 'worksheet' },
    { name: 'Presentation', code: 'presentation' },
    { name: 'Research Paper', code: 'research_paper' },
    { name: 'Dataset', code: 'dataset' },
    { name: 'Software', code: 'software' },
    { name: 'Other', code: 'other' }
]);
const mediaTypes = ref([
    { name: 'MP4 Video', code: 'mp4', assetType: 'video' },
    { name: 'WebM Video', code: 'webm', assetType: 'video' },
    { name: 'AVI Video', code: 'avi', assetType: 'video' },
    { name: 'MOV Video', code: 'mov', assetType: 'video' },
    { name: 'MP3 Audio', code: 'mp3', assetType: 'audio' },
    { name: 'WAV Audio', code: 'wav', assetType: 'audio' },
    { name: 'OGG Audio', code: 'ogg', assetType: 'audio' },
    { name: 'PDF Document', code: 'pdf', assetType: 'worksheet' },
    { name: 'Word Document', code: 'docx', assetType: 'worksheet' },
    { name: 'Excel Spreadsheet', code: 'xlsx', assetType: 'worksheet' },
    { name: 'PowerPoint', code: 'pptx', assetType: 'presentation' },
    { name: 'Google Slides', code: 'slides', assetType: 'presentation' },
    { name: 'CSV Data', code: 'csv', assetType: 'dataset' },
    { name: 'JSON Data', code: 'json', assetType: 'dataset' },
    { name: 'ZIP Archive', code: 'zip', assetType: 'software' },
    { name: 'Executable', code: 'exe', assetType: 'software' },
    { name: 'Other', code: 'other', assetType: 'other' }
]);
const languages = ref([
    { name: 'English', code: 'en' },
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Chinese', code: 'zh' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Arabic', code: 'ar' }
]);
const conditionOptions = ref([
    { name: 'New', code: 'new' },
    { name: 'Excellent', code: 'excellent' },
    { name: 'Good', code: 'good' },
    { name: 'Fair', code: 'fair' },
    { name: 'Poor', code: 'poor' }
]);
const statusOptions = ref([
    { name: 'Available', code: 'available' },
    { name: 'Checked Out', code: 'checked_out' },
    { name: 'Reserved', code: 'reserved' },
    { name: 'Lost', code: 'lost' },
    { name: 'Damaged', code: 'damaged' }
]);

// Filtered media types based on selected asset type
const filteredMediaTypes = ref([]);

onMounted(() => {
    fetchFormData();
});

const fetchFormData = async () => {
    try {
        // Simulate API calls to get form data
        setTimeout(() => {
            branches.value = [
                { name: 'Main Branch', id: 1 },
                { name: 'North Campus', id: 2 },
                { name: 'South Campus', id: 3 },
                { name: 'West Wing', id: 4 }
            ];

            shelves.value = [
                { name: 'Digital Media Section', id: 1 },
                { name: 'Audio Visual Room', id: 2 },
                { name: 'Educational Resources', id: 3 },
                { name: 'Multimedia Collection', id: 4 }
            ];

            categories.value = [
                { name: 'Educational', id: 1 },
                { name: 'Entertainment', id: 2 },
                { name: 'Research', id: 3 },
                { name: 'Reference', id: 4 },
                { name: 'Tutorial', id: 5 },
                { name: 'Documentary', id: 6 },
                { name: 'Historical', id: 7 }
            ];

            publishers.value = [
                { name: 'Educational Media Inc.', id: 1 },
                { name: 'Learning Resources Ltd.', id: 2 },
                { name: 'Academic Productions', id: 3 },
                { name: 'University Press', id: 4 },
                { name: 'Digital Education Group', id: 5 }
            ];
        }, 500);
    } catch (error) {
        console.error('Error fetching form data:', error);
    }
};

const updateMediaTypes = () => {
    if (asset.value.asset_type) {
        filteredMediaTypes.value = mediaTypes.value.filter(
            (mt) => mt.assetType === asset.value.asset_type || mt.assetType === 'other'
        );
        // Clear the media type if it doesn't match the new asset type
        const validMediaType = filteredMediaTypes.value.find(
            (mt) => mt.code === asset.value.media_type
        );
        if (!validMediaType) {
            asset.value.media_type = '';
        }
    } else {
        filteredMediaTypes.value = mediaTypes.value;
    }
};

// Watch for changes in asset type
const handleAssetTypeChange = () => {
    updateMediaTypes();
};

const submitForm = async () => {
    submitted.value = true;

    // Form validation
    if (
        !asset.value.title ||
        !asset.value.availability_status ||
        !asset.value.library_branch_id ||
        !asset.value.category_id ||
        !asset.value.asset_type
    ) {
        return;
    }

    loading.value = true;

    try {
        // In a real app, this would be an API call to save the asset
        // const response = await fetch('/api/books/assets', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(asset.value)
        // });
        // const data = await response.json();

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Navigate to the assets list page after successful creation
        router.push('/books/assets');
    } catch (error) {
        console.error('Error creating asset:', error);
    } finally {
        loading.value = false;
    }
};

const cancelForm = () => {
    router.push('/books/assets');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Add New Digital Asset</h5>
                <p class="text-gray-600 mb-4">
                    Enter details for a new digital asset in the library.
                </p>

                <form @submit.prevent="submitForm" class="p-fluid">
                    <div class="grid formgrid">
                        <!-- Basic Information -->
                        <div class="col-12 mb-4 pb-3 border-bottom-1 surface-border">
                            <h6 class="text-lg font-bold mb-3">Basic Information</h6>
                            <div class="grid">
                                <!-- Title -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="title" class="font-bold">Title*</label>
                                        <InputText
                                            id="title"
                                            v-model="asset.title"
                                            :class="{ 'p-invalid': submitted && !asset.title }"
                                            placeholder="Enter asset title" />
                                        <small v-if="submitted && !asset.title" class="p-error"
                                            >Title is required</small
                                        >
                                    </div>
                                </div>

                                <!-- Asset Type -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="asset_type" class="font-bold"
                                            >Asset Type*</label
                                        >
                                        <Dropdown
                                            id="asset_type"
                                            v-model="asset.asset_type"
                                            :options="assetTypes"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select asset type"
                                            :class="{ 'p-invalid': submitted && !asset.asset_type }"
                                            @change="handleAssetTypeChange" />
                                        <small v-if="submitted && !asset.asset_type" class="p-error"
                                            >Asset type is required</small
                                        >
                                    </div>
                                </div>

                                <!-- Media Type -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="media_type" class="font-bold"
                                            >Media Format</label
                                        >
                                        <Dropdown
                                            id="media_type"
                                            v-model="asset.media_type"
                                            :options="filteredMediaTypes"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select media format"
                                            :disabled="!asset.asset_type" />
                                    </div>
                                </div>

                                <!-- Author/Creator -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="author" class="font-bold">Author/Creator</label>
                                        <InputText
                                            id="author"
                                            v-model="asset.author"
                                            placeholder="Creator name" />
                                    </div>
                                </div>

                                <!-- Publication/Creation Year -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="publication_year" class="font-bold"
                                            >Creation Year</label
                                        >
                                        <InputNumber
                                            id="publication_year"
                                            v-model="asset.publication_year"
                                            :min="1000"
                                            :max="currentYear"
                                            placeholder="Creation year" />
                                        <small
                                            v-if="
                                                asset.publication_year &&
                                                (asset.publication_year < 1000 ||
                                                    asset.publication_year > currentYear)
                                            "
                                            class="p-error">
                                            Year must be between 1000 and {{ currentYear }}
                                        </small>
                                    </div>
                                </div>

                                <!-- Language -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="language" class="font-bold">Language</label>
                                        <Dropdown
                                            id="language"
                                            v-model="asset.language"
                                            :options="languages"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select language" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Asset Details -->
                        <div class="col-12 mb-4 pb-3 border-bottom-1 surface-border">
                            <h6 class="text-lg font-bold mb-3">Asset Details</h6>
                            <div class="grid">
                                <!-- Duration (for media) -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="duration_minutes" class="font-bold"
                                            >Duration (minutes)</label
                                        >
                                        <InputNumber
                                            id="duration_minutes"
                                            v-model="asset.duration_minutes"
                                            :min="1"
                                            placeholder="Length in minutes (for media)"
                                            :disabled="
                                                !['video', 'audio', 'presentation'].includes(
                                                    asset.asset_type
                                                )
                                            " />
                                    </div>
                                </div>

                                <!-- Unique ID -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="unique_id" class="font-bold">Unique ID</label>
                                        <InputText
                                            id="unique_id"
                                            v-model="asset.unique_id"
                                            placeholder="Asset identifier" />
                                    </div>
                                </div>

                                <!-- Manufacturer -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="manufacturer" class="font-bold"
                                            >Manufacturer/Producer</label
                                        >
                                        <InputText
                                            id="manufacturer"
                                            v-model="asset.manufacturer"
                                            placeholder="Producer or manufacturer" />
                                    </div>
                                </div>

                                <!-- Physical Condition -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="physical_condition" class="font-bold"
                                            >Condition</label
                                        >
                                        <Dropdown
                                            id="physical_condition"
                                            v-model="asset.physical_condition"
                                            :options="conditionOptions"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select condition" />
                                    </div>
                                </div>

                                <!-- Acquisition Date -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="acquisition_date" class="font-bold"
                                            >Acquisition Date</label
                                        >
                                        <Calendar
                                            id="acquisition_date"
                                            v-model="asset.acquisition_date"
                                            dateFormat="mm/dd/yy"
                                            placeholder="When the asset was acquired"
                                            :maxDate="new Date()"
                                            showIcon />
                                    </div>
                                </div>

                                <!-- Location Details -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="location_details" class="font-bold"
                                            >Location Details</label
                                        >
                                        <InputText
                                            id="location_details"
                                            v-model="asset.location_details"
                                            placeholder="Specific location details" />
                                    </div>
                                </div>

                                <!-- Restricted Access -->
                                <div class="col-12 mb-3">
                                    <div class="field-checkbox">
                                        <Checkbox
                                            id="restricted_access"
                                            v-model="asset.restricted_access"
                                            :binary="true" />
                                        <label for="restricted_access" class="ml-2 font-medium"
                                            >Restricted Access</label
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Library Information -->
                        <div class="col-12 mb-4 pb-3 border-bottom-1 surface-border">
                            <h6 class="text-lg font-bold mb-3">Library Information</h6>
                            <div class="grid">
                                <!-- Library Branch -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="library_branch_id" class="font-bold"
                                            >Library Branch*</label
                                        >
                                        <Dropdown
                                            id="library_branch_id"
                                            v-model="asset.library_branch_id"
                                            :options="branches"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Select library branch"
                                            :class="{
                                                'p-invalid': submitted && !asset.library_branch_id
                                            }" />
                                        <small
                                            v-if="submitted && !asset.library_branch_id"
                                            class="p-error"
                                            >Library branch is required</small
                                        >
                                    </div>
                                </div>

                                <!-- Shelf -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="shelf_id" class="font-bold"
                                            >Shelf/Section</label
                                        >
                                        <Dropdown
                                            id="shelf_id"
                                            v-model="asset.shelf_id"
                                            :options="shelves"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Select shelf" />
                                    </div>
                                </div>

                                <!-- Category -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="category_id" class="font-bold">Category*</label>
                                        <Dropdown
                                            id="category_id"
                                            v-model="asset.category_id"
                                            :options="categories"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Select category"
                                            :class="{
                                                'p-invalid': submitted && !asset.category_id
                                            }" />
                                        <small
                                            v-if="submitted && !asset.category_id"
                                            class="p-error"
                                            >Category is required</small
                                        >
                                    </div>
                                </div>

                                <!-- Publisher -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="publisher_id" class="font-bold"
                                            >Publisher/Distributor</label
                                        >
                                        <Dropdown
                                            id="publisher_id"
                                            v-model="asset.publisher_id"
                                            :options="publishers"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Select publisher" />
                                    </div>
                                </div>

                                <!-- Status -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="availability_status" class="font-bold"
                                            >Availability Status*</label
                                        >
                                        <Dropdown
                                            id="availability_status"
                                            v-model="asset.availability_status"
                                            :options="statusOptions"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select status"
                                            :class="{
                                                'p-invalid': submitted && !asset.availability_status
                                            }" />
                                        <small
                                            v-if="submitted && !asset.availability_status"
                                            class="p-error"
                                            >Status is required</small
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Additional Information -->
                        <div class="col-12">
                            <h6 class="text-lg font-bold mb-3">Additional Information</h6>
                            <div class="grid">
                                <!-- Cover/Thumbnail Image URL -->
                                <div class="col-12 mb-3">
                                    <div class="field">
                                        <label for="cover_image_url" class="font-bold"
                                            >Thumbnail Image URL</label
                                        >
                                        <InputText
                                            id="cover_image_url"
                                            v-model="asset.cover_image_url"
                                            placeholder="URL to the asset thumbnail or image" />
                                    </div>
                                </div>

                                <!-- Description -->
                                <div class="col-12 mb-3">
                                    <div class="field">
                                        <label for="description" class="font-bold"
                                            >Description</label
                                        >
                                        <Textarea
                                            id="description"
                                            v-model="asset.description"
                                            rows="4"
                                            placeholder="Asset description" />
                                    </div>
                                </div>

                                <!-- Usage Instructions -->
                                <div class="col-12 mb-3">
                                    <div class="field">
                                        <label for="usage_instructions" class="font-bold"
                                            >Usage Instructions</label
                                        >
                                        <Textarea
                                            id="usage_instructions"
                                            v-model="asset.usage_instructions"
                                            rows="4"
                                            placeholder="Instructions for using this asset" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Form Buttons -->
                        <div class="col-12 mt-4 flex justify-content-end">
                            <Button
                                label="Cancel"
                                icon="pi pi-times"
                                class="p-button-outlined p-button-secondary mr-2"
                                @click="cancelForm"
                                type="button" />
                            <Button
                                label="Save Asset"
                                icon="pi pi-check"
                                class="p-button-primary"
                                type="submit"
                                :loading="loading" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
