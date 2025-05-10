<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const submitted = ref(false);
const loading = ref(false);
const loadingAsset = ref(true);
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const assetId = route.params.id;

const asset = ref({
    // BookItem fields
    title: '',
    isbn: '',
    availability_status: '',
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
    physical_condition: '',
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
    { name: 'Video', id: 1 },
    { name: 'Audio', id: 2 },
    { name: 'Interactive Material', id: 3 },
    { name: 'Educational Kit', id: 4 },
    { name: 'Worksheet', id: 5 },
    { name: 'Lab Equipment', id: 6 },
    { name: 'Map', id: 7 },
    { name: 'Model', id: 8 }
]);
const mediaTypes = ref([
    { name: 'DVD', code: 'DVD' },
    { name: 'CD', code: 'CD' },
    { name: 'Blu-ray', code: 'Blu-ray' },
    { name: 'USB Drive', code: 'USB' },
    { name: 'Physical Object', code: 'Physical' },
    { name: 'Digital File', code: 'Digital' }
]);
const physicalConditions = ref([
    { name: 'New', code: 'New' },
    { name: 'Excellent', code: 'Excellent' },
    { name: 'Good', code: 'Good' },
    { name: 'Fair', code: 'Fair' },
    { name: 'Poor', code: 'Poor' },
    { name: 'Damaged', code: 'Damaged' }
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
const statusOptions = ref([
    { name: 'Available', code: 'available' },
    { name: 'Checked Out', code: 'checked_out' },
    { name: 'Reserved', code: 'reserved' },
    { name: 'Lost', code: 'lost' },
    { name: 'Damaged', code: 'damaged' }
]);

onMounted(() => {
    fetchAssetDetails();
    fetchFormData();
});

const fetchAssetDetails = async () => {
    loadingAsset.value = true;
    try {
        // In a real app, this would be an API call to get asset details
        setTimeout(() => {
            // Mock data
            asset.value = {
                // BookItem fields
                title: 'Human Anatomy Model Kit',
                isbn: '',
                availability_status: 'available',
                author: 'Edu Sciences Inc.',
                publication_year: 2022,
                description:
                    'A detailed human anatomy model kit for educational purposes, including removable organs, muscle structures, and a detailed instruction guide.',
                cover_image_url: '/demo/images/product/product-placeholder.svg',
                metadata: {},
                language: 'en',
                library_branch_id: 1, // Main Branch
                shelf_id: 5, // Educational Resources
                category_id: 9, // Science
                publisher_id: 6, // Educational Resources Ltd.

                // OtherAsset-specific fields
                asset_type_id: 4, // Educational Kit
                asset_type: 'Educational Kit',
                media_type: 'Physical',
                unique_id: 'ANAT-2022-001',
                duration_minutes: null,
                manufacturer: 'MediModels Inc.',
                physical_condition: 'Good',
                location_details: 'Science Section, Cabinet 3',
                acquisition_date: new Date(2022, 5, 15),
                usage_instructions:
                    'Handle with care. All parts must be returned in the storage case. Report any damaged or missing pieces.',
                restricted_access: true
            };
            loadingAsset.value = false;
        }, 1000);
    } catch (error) {
        console.error('Failed to fetch asset details:', error);
        loadingAsset.value = false;
    }
};

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
                { name: 'General Collection', id: 1 },
                { name: 'Reference Section', id: 2 },
                { name: 'Special Collections', id: 3 },
                { name: 'Media Section', id: 4 },
                { name: 'Educational Resources', id: 5 }
            ];

            categories.value = [
                { name: 'Fiction', id: 1 },
                { name: 'Science Fiction', id: 2 },
                { name: 'Mystery', id: 3 },
                { name: 'Biography', id: 4 },
                { name: 'History', id: 5 },
                { name: 'Science', id: 9 },
                { name: 'Technology', id: 7 },
                { name: 'Arts', id: 8 },
                { name: 'Education', id: 10 }
            ];

            publishers.value = [
                { name: 'Penguin Random House', id: 1 },
                { name: 'HarperCollins', id: 2 },
                { name: 'Simon & Schuster', id: 3 },
                { name: 'Macmillan Publishers', id: 4 },
                { name: 'Oxford University Press', id: 5 },
                { name: 'Educational Resources Ltd.', id: 6 }
            ];
        }, 500);
    } catch (error) {
        console.error('Error fetching form data:', error);
    }
};

const submitForm = async () => {
    submitted.value = true;

    // Form validation
    if (
        !asset.value.title ||
        !asset.value.availability_status ||
        !asset.value.library_branch_id ||
        !asset.value.category_id
    ) {
        return;
    }

    // Validate publication year
    if (
        asset.value.publication_year &&
        (asset.value.publication_year < 1000 || asset.value.publication_year > currentYear)
    ) {
        return;
    }

    loading.value = true;

    try {
        // In a real app, this would be an API call to update the asset
        // const response = await fetch(`/api/books/assets/${assetId}`, {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(asset.value)
        // });
        // const data = await response.json();

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Navigate back to the asset details page after successful update
        router.push(`/books/assets/${assetId}`);
    } catch (error) {
        console.error('Error updating asset:', error);
    } finally {
        loading.value = false;
    }
};

const cancelForm = () => {
    router.push(`/books/assets/${assetId}`);
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Edit Asset</h5>
                <p class="text-gray-600 mb-4">Update details for this library asset.</p>

                <div v-if="loadingAsset" class="flex justify-content-center">
                    <ProgressSpinner />
                </div>

                <form v-else @submit.prevent="submitForm" class="p-fluid">
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

                                <!-- Author/Creator -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="author" class="font-bold">Creator/Author</label>
                                        <InputText
                                            id="author"
                                            v-model="asset.author"
                                            placeholder="Creator or author name" />
                                    </div>
                                </div>

                                <!-- Publication/Creation Year -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="publication_year" class="font-bold"
                                            >Year of Creation</label
                                        >
                                        <InputNumber
                                            id="publication_year"
                                            v-model="asset.publication_year"
                                            :min="1000"
                                            :max="currentYear"
                                            placeholder="Year of creation" />
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

                        <!-- Asset Type Information -->
                        <div class="col-12 mb-4 pb-3 border-bottom-1 surface-border">
                            <h6 class="text-lg font-bold mb-3">Asset Information</h6>
                            <div class="grid">
                                <!-- Asset Type -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="asset_type_id" class="font-bold"
                                            >Asset Type</label
                                        >
                                        <Dropdown
                                            id="asset_type_id"
                                            v-model="asset.asset_type_id"
                                            :options="assetTypes"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Select asset type" />
                                    </div>
                                </div>

                                <!-- Media Type -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="media_type" class="font-bold">Media Type</label>
                                        <Dropdown
                                            id="media_type"
                                            v-model="asset.media_type"
                                            :options="mediaTypes"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select media type" />
                                    </div>
                                </div>

                                <!-- Unique ID -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="unique_id" class="font-bold"
                                            >Unique ID/Serial Number</label
                                        >
                                        <InputText
                                            id="unique_id"
                                            v-model="asset.unique_id"
                                            placeholder="Unique identifier" />
                                    </div>
                                </div>

                                <!-- Duration (for video/audio) -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="duration_minutes" class="font-bold"
                                            >Duration (minutes)</label
                                        >
                                        <InputNumber
                                            id="duration_minutes"
                                            v-model="asset.duration_minutes"
                                            :min="1"
                                            placeholder="Duration in minutes"
                                            :disabled="
                                                !['1', '2', 1, 2].includes(asset.asset_type_id)
                                            " />
                                        <small class="text-gray-500"
                                            >For video/audio assets only</small
                                        >
                                    </div>
                                </div>

                                <!-- Manufacturer -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="manufacturer" class="font-bold"
                                            >Manufacturer</label
                                        >
                                        <InputText
                                            id="manufacturer"
                                            v-model="asset.manufacturer"
                                            placeholder="Manufacturer name" />
                                    </div>
                                </div>

                                <!-- Physical Condition -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="physical_condition" class="font-bold"
                                            >Physical Condition</label
                                        >
                                        <Dropdown
                                            id="physical_condition"
                                            v-model="asset.physical_condition"
                                            :options="physicalConditions"
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
                                            placeholder="When item was acquired"
                                            :maxDate="new Date()"
                                            showIcon />
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
                                            placeholder="Select shelf/section" />
                                    </div>
                                </div>

                                <!-- Location Details -->
                                <div class="col-12 mb-3">
                                    <div class="field">
                                        <label for="location_details" class="font-bold"
                                            >Detailed Location</label
                                        >
                                        <InputText
                                            id="location_details"
                                            v-model="asset.location_details"
                                            placeholder="Detailed location within the library" />
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
                                            >Publisher</label
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

                                <!-- Restricted Access -->
                                <div class="col-12 md:col-6 mb-3">
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

                        <!-- Additional Information -->
                        <div class="col-12">
                            <h6 class="text-lg font-bold mb-3">Additional Information</h6>
                            <div class="grid">
                                <!-- Usage Instructions -->
                                <div class="col-12 mb-3">
                                    <div class="field">
                                        <label for="usage_instructions" class="font-bold"
                                            >Usage Instructions</label
                                        >
                                        <Textarea
                                            id="usage_instructions"
                                            v-model="asset.usage_instructions"
                                            rows="3"
                                            placeholder="Instructions for using this asset" />
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
                                            rows="5"
                                            placeholder="Detailed description of the asset" />
                                    </div>
                                </div>

                                <!-- Cover Image URL -->
                                <div class="col-12 mb-3">
                                    <div class="field">
                                        <label for="cover_image_url" class="font-bold"
                                            >Cover Image URL</label
                                        >
                                        <InputText
                                            id="cover_image_url"
                                            v-model="asset.cover_image_url"
                                            placeholder="URL to the asset's cover image" />
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
                                label="Save Changes"
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
