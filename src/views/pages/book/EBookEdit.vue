<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const ebookId = route.params.id;
const submitted = ref(false);
const loading = ref(false);
const fetchingData = ref(true);
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

const ebook = ref({
    // BookItem fields
    title: '',
    isbn: '',
    availability_status: 'available',
    author: '',
    publication_year: null,
    description: '',
    cover_image_url: '',
    metadata: {},
    language: '',
    library_branch_id: null,
    category_id: null,
    publisher_id: null,

    // EBook-specific fields
    file_url: '',
    file_format: '',
    file_size_mb: null,
    pages: null,
    is_downloadable: true,
    requires_authentication: true,
    drm_type: '',
    access_expires_at: null,
    max_downloads: null,
    reader_app: ''
});

// Form options
const branches = ref([]);
const categories = ref([]);
const publishers = ref([]);
const languages = ref([
    { name: 'English', code: 'en' },
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Chinese', code: 'zh' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Arabic', code: 'ar' }
]);
const fileFormats = ref([
    { name: 'PDF', code: 'PDF' },
    { name: 'EPUB', code: 'EPUB' },
    { name: 'MOBI', code: 'MOBI' },
    { name: 'AZW', code: 'AZW' },
    { name: 'HTML', code: 'HTML' },
    { name: 'TXT', code: 'TXT' }
]);
const drmTypes = ref([
    { name: 'None', code: 'none' },
    { name: 'Adobe DRM', code: 'adobe' },
    { name: 'Apple FairPlay', code: 'fairplay' },
    { name: 'Proprietary', code: 'proprietary' }
]);
const statusOptions = ref([
    { name: 'Available', code: 'available' },
    { name: 'Checked Out', code: 'checked_out' },
    { name: 'Reserved', code: 'reserved' },
    { name: 'Lost', code: 'lost' },
    { name: 'Damaged', code: 'damaged' }
]);

onMounted(() => {
    fetchFormData();
    fetchEbookDetails();
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

            categories.value = [
                { name: 'Fiction', id: 1 },
                { name: 'Science Fiction', id: 2 },
                { name: 'Mystery', id: 3 },
                { name: 'Biography', id: 4 },
                { name: 'History', id: 5 },
                { name: 'Science', id: 6 },
                { name: 'Technology', id: 7 },
                { name: 'Arts', id: 8 }
            ];

            publishers.value = [
                { name: 'Penguin Random House', id: 1 },
                { name: 'HarperCollins', id: 2 },
                { name: 'Simon & Schuster', id: 3 },
                { name: 'Macmillan Publishers', id: 4 },
                { name: 'Oxford University Press', id: 5 }
            ];
        }, 500);
    } catch (error) {
        console.error('Error fetching form data:', error);
    }
};

const fetchEbookDetails = async () => {
    fetchingData.value = true;
    try {
        // In a real app, this would be an API call to get e-book details
        setTimeout(() => {
            // Mock data
            ebook.value = {
                id: parseInt(ebookId),
                title: 'Digital Design Principles',
                isbn: '9781234567890',
                availability_status: 'available',
                author: 'Dr. Elizabeth Chen',
                publication_year: 2023,
                description:
                    'A comprehensive guide to modern digital design principles and practices. This book covers the fundamentals of digital systems, circuit design, and advanced topics in digital electronics.',
                cover_image_url: '/demo/images/product/product-placeholder.svg',
                metadata: {},
                language: 'en',
                library_branch_id: 1,
                category_id: 6,
                publisher_id: 5,

                // EBook-specific fields
                file_url: '/demo/data/sample.pdf',
                file_format: 'PDF',
                file_size_mb: 12.5,
                pages: 450,
                is_downloadable: true,
                requires_authentication: true,
                drm_type: 'none',
                access_expires_at: null,
                max_downloads: 5,
                reader_app: 'Adobe Reader'
            };
            fetchingData.value = false;
        }, 1000);
    } catch (error) {
        console.error('Error fetching e-book details:', error);
        fetchingData.value = false;
    }
};

const submitForm = async () => {
    submitted.value = true;

    // Form validation
    if (
        !ebook.value.title ||
        !ebook.value.availability_status ||
        !ebook.value.library_branch_id ||
        !ebook.value.category_id ||
        !ebook.value.file_url ||
        !ebook.value.file_format
    ) {
        return;
    }

    // Validate publication year
    if (
        ebook.value.publication_year &&
        (ebook.value.publication_year < 1000 || ebook.value.publication_year > currentYear)
    ) {
        return;
    }

    loading.value = true;

    try {
        // In a real app, this would be an API call to update the ebook
        // const response = await fetch(`/api/books/ebooks/${ebookId}`, {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(ebook.value)
        // });
        // const data = await response.json();

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Navigate to the e-books list page after successful update
        router.push('/books/ebooks');
    } catch (error) {
        console.error('Error updating e-book:', error);
    } finally {
        loading.value = false;
    }
};

const cancelForm = () => {
    router.push('/books/ebooks');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Edit E-Book</h5>
                <p class="text-gray-600 mb-4">
                    Update the details for this e-book in the digital library.
                </p>

                <div v-if="fetchingData" class="flex justify-content-center">
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
                                            v-model="ebook.title"
                                            :class="{ 'p-invalid': submitted && !ebook.title }"
                                            placeholder="Enter e-book title" />
                                        <small v-if="submitted && !ebook.title" class="p-error"
                                            >Title is required</small
                                        >
                                    </div>
                                </div>

                                <!-- ISBN -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="isbn" class="font-bold">ISBN</label>
                                        <InputText
                                            id="isbn"
                                            v-model="ebook.isbn"
                                            placeholder="Enter ISBN (optional)" />
                                    </div>
                                </div>

                                <!-- Author -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="author" class="font-bold">Author</label>
                                        <InputText
                                            id="author"
                                            v-model="ebook.author"
                                            placeholder="Author name" />
                                    </div>
                                </div>

                                <!-- Publication Year -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="publication_year" class="font-bold"
                                            >Publication Year</label
                                        >
                                        <InputNumber
                                            id="publication_year"
                                            v-model="ebook.publication_year"
                                            :min="1000"
                                            :max="currentYear"
                                            placeholder="Publication year" />
                                        <small
                                            v-if="
                                                ebook.publication_year &&
                                                (ebook.publication_year < 1000 ||
                                                    ebook.publication_year > currentYear)
                                            "
                                            class="p-error">
                                            Publication year must be between 1000 and
                                            {{ currentYear }}
                                        </small>
                                    </div>
                                </div>

                                <!-- Language -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="language" class="font-bold">Language</label>
                                        <Dropdown
                                            id="language"
                                            v-model="ebook.language"
                                            :options="languages"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select language" />
                                    </div>
                                </div>

                                <!-- Pages -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="pages" class="font-bold">Number of Pages</label>
                                        <InputNumber
                                            id="pages"
                                            v-model="ebook.pages"
                                            :min="1"
                                            placeholder="Number of pages" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- File Information -->
                        <div class="col-12 mb-4 pb-3 border-bottom-1 surface-border">
                            <h6 class="text-lg font-bold mb-3">File Information</h6>
                            <div class="grid">
                                <!-- File URL -->
                                <div class="col-12 mb-3">
                                    <div class="field">
                                        <label for="file_url" class="font-bold">File URL*</label>
                                        <InputText
                                            id="file_url"
                                            v-model="ebook.file_url"
                                            :class="{ 'p-invalid': submitted && !ebook.file_url }"
                                            placeholder="URL to the e-book file" />
                                        <small v-if="submitted && !ebook.file_url" class="p-error"
                                            >File URL is required</small
                                        >
                                    </div>
                                </div>

                                <!-- File Format -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="file_format" class="font-bold"
                                            >File Format*</label
                                        >
                                        <Dropdown
                                            id="file_format"
                                            v-model="ebook.file_format"
                                            :options="fileFormats"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select file format"
                                            :class="{
                                                'p-invalid': submitted && !ebook.file_format
                                            }" />
                                        <small
                                            v-if="submitted && !ebook.file_format"
                                            class="p-error"
                                            >File format is required</small
                                        >
                                    </div>
                                </div>

                                <!-- File Size (MB) -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="file_size_mb" class="font-bold"
                                            >File Size (MB)</label
                                        >
                                        <InputNumber
                                            id="file_size_mb"
                                            v-model="ebook.file_size_mb"
                                            :min="0.01"
                                            :minFractionDigits="2"
                                            :maxFractionDigits="2"
                                            placeholder="File size in megabytes" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Access & Rights -->
                        <div class="col-12 mb-4 pb-3 border-bottom-1 surface-border">
                            <h6 class="text-lg font-bold mb-3">Access & Digital Rights</h6>
                            <div class="grid">
                                <!-- Downloadable -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field-checkbox">
                                        <Checkbox
                                            id="is_downloadable"
                                            v-model="ebook.is_downloadable"
                                            :binary="true" />
                                        <label for="is_downloadable" class="ml-2 font-medium"
                                            >Allow Download</label
                                        >
                                    </div>
                                </div>

                                <!-- Requires Authentication -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field-checkbox">
                                        <Checkbox
                                            id="requires_authentication"
                                            v-model="ebook.requires_authentication"
                                            :binary="true" />
                                        <label
                                            for="requires_authentication"
                                            class="ml-2 font-medium"
                                            >Requires Authentication</label
                                        >
                                    </div>
                                </div>

                                <!-- DRM Type -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="drm_type" class="font-bold">DRM Type</label>
                                        <Dropdown
                                            id="drm_type"
                                            v-model="ebook.drm_type"
                                            :options="drmTypes"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select DRM type" />
                                    </div>
                                </div>

                                <!-- Max Downloads -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="max_downloads" class="font-bold"
                                            >Max Downloads (per user)</label
                                        >
                                        <InputNumber
                                            id="max_downloads"
                                            v-model="ebook.max_downloads"
                                            :min="1"
                                            placeholder="Maximum number of downloads"
                                            :disabled="!ebook.is_downloadable" />
                                    </div>
                                </div>

                                <!-- Access Expires Date -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="access_expires_at" class="font-bold"
                                            >Access Expiration Date</label
                                        >
                                        <Calendar
                                            id="access_expires_at"
                                            v-model="ebook.access_expires_at"
                                            dateFormat="mm/dd/yy"
                                            placeholder="When access expires (if applicable)"
                                            :minDate="new Date()"
                                            showIcon />
                                    </div>
                                </div>

                                <!-- Reader App -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="reader_app" class="font-bold"
                                            >Recommended Reader App</label
                                        >
                                        <InputText
                                            id="reader_app"
                                            v-model="ebook.reader_app"
                                            placeholder="e.g., Adobe Reader, Kindle" />
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
                                            v-model="ebook.library_branch_id"
                                            :options="branches"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Select library branch"
                                            :class="{
                                                'p-invalid': submitted && !ebook.library_branch_id
                                            }" />
                                        <small
                                            v-if="submitted && !ebook.library_branch_id"
                                            class="p-error"
                                            >Library branch is required</small
                                        >
                                    </div>
                                </div>

                                <!-- Category -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="category_id" class="font-bold">Category*</label>
                                        <Dropdown
                                            id="category_id"
                                            v-model="ebook.category_id"
                                            :options="categories"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Select category"
                                            :class="{
                                                'p-invalid': submitted && !ebook.category_id
                                            }" />
                                        <small
                                            v-if="submitted && !ebook.category_id"
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
                                            v-model="ebook.publisher_id"
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
                                            v-model="ebook.availability_status"
                                            :options="statusOptions"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select status"
                                            :class="{
                                                'p-invalid': submitted && !ebook.availability_status
                                            }" />
                                        <small
                                            v-if="submitted && !ebook.availability_status"
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
                                <!-- Cover Image URL -->
                                <div class="col-12 mb-3">
                                    <div class="field">
                                        <label for="cover_image_url" class="font-bold"
                                            >Cover Image URL</label
                                        >
                                        <InputText
                                            id="cover_image_url"
                                            v-model="ebook.cover_image_url"
                                            placeholder="URL to the book cover image" />
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
                                            v-model="ebook.description"
                                            rows="5"
                                            placeholder="E-book description" />
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
                                label="Update E-Book"
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
