<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const submitted = ref(false);
const loading = ref(false);
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

const book = ref({
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

    // Book-specific fields
    edition: '',
    pages: null,
    cover_type: '',
    dimensions: '',
    weight_grams: null,
    barcode: '',
    shelf_location_detail: '',
    reference_only: false
});

// Form options
const branches = ref([]);
const shelves = ref([]);
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
const coverTypes = ref([
    { name: 'Hardcover', code: 'hardcover' },
    { name: 'Paperback', code: 'paperback' },
    { name: 'Spiral-bound', code: 'spiral' },
    { name: 'Leather-bound', code: 'leather' },
    { name: 'Board book', code: 'board' }
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
                { name: 'Fiction Section A', id: 1 },
                { name: 'Non-Fiction Section B', id: 2 },
                { name: 'Reference Section', id: 3 },
                { name: 'Children Section', id: 4 }
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

const submitForm = async () => {
    submitted.value = true;

    // Form validation
    if (
        !book.value.title ||
        !book.value.availability_status ||
        !book.value.library_branch_id ||
        !book.value.category_id
    ) {
        return;
    }

    // Validate publication year
    if (
        book.value.publication_year &&
        (book.value.publication_year < 1000 || book.value.publication_year > currentYear)
    ) {
        return;
    }

    loading.value = true;

    try {
        // In a real app, this would be an API call to save the book
        // const response = await fetch('/api/books/physical', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(book.value)
        // });
        // const data = await response.json();

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Navigate to the books list page after successful creation
        router.push('/books');
    } catch (error) {
        console.error('Error creating book:', error);
    } finally {
        loading.value = false;
    }
};

const cancelForm = () => {
    router.push('/books');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Add New Physical Book</h5>
                <p class="text-gray-600 mb-4">
                    Enter details for a new physical book in the library.
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
                                            v-model="book.title"
                                            :class="{ 'p-invalid': submitted && !book.title }"
                                            placeholder="Enter book title" />
                                        <small v-if="submitted && !book.title" class="p-error"
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
                                            v-model="book.isbn"
                                            placeholder="Enter ISBN (optional)" />
                                    </div>
                                </div>

                                <!-- Author -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="author" class="font-bold">Author</label>
                                        <InputText
                                            id="author"
                                            v-model="book.author"
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
                                            v-model="book.publication_year"
                                            :min="1000"
                                            :max="currentYear"
                                            placeholder="Publication year" />
                                        <small
                                            v-if="
                                                book.publication_year &&
                                                (book.publication_year < 1000 ||
                                                    book.publication_year > currentYear)
                                            "
                                            class="p-error">
                                            Publication year must be between 1000 and
                                            {{ currentYear }}
                                        </small>
                                    </div>
                                </div>

                                <!-- Edition -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="edition" class="font-bold">Edition</label>
                                        <InputText
                                            id="edition"
                                            v-model="book.edition"
                                            placeholder="e.g., 2nd Edition" />
                                    </div>
                                </div>

                                <!-- Language -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="language" class="font-bold">Language</label>
                                        <Dropdown
                                            id="language"
                                            v-model="book.language"
                                            :options="languages"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select language" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Physical Details -->
                        <div class="col-12 mb-4 pb-3 border-bottom-1 surface-border">
                            <h6 class="text-lg font-bold mb-3">Physical Details</h6>
                            <div class="grid">
                                <!-- Cover Type -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="cover_type" class="font-bold">Cover Type</label>
                                        <Dropdown
                                            id="cover_type"
                                            v-model="book.cover_type"
                                            :options="coverTypes"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select cover type" />
                                    </div>
                                </div>

                                <!-- Pages -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="pages" class="font-bold">Number of Pages</label>
                                        <InputNumber
                                            id="pages"
                                            v-model="book.pages"
                                            :min="1"
                                            placeholder="Number of pages" />
                                    </div>
                                </div>

                                <!-- Dimensions -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="dimensions" class="font-bold">Dimensions</label>
                                        <InputText
                                            id="dimensions"
                                            v-model="book.dimensions"
                                            placeholder="e.g., 8.5 x 11 inches" />
                                    </div>
                                </div>

                                <!-- Weight -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="weight_grams" class="font-bold"
                                            >Weight (grams)</label
                                        >
                                        <InputNumber
                                            id="weight_grams"
                                            v-model="book.weight_grams"
                                            :min="1"
                                            placeholder="Weight in grams" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Library Information -->
                        <div class="col-12 mb-4 pb-3 border-bottom-1 surface-border">
                            <h6 class="text-lg font-bold mb-3">Library Information</h6>
                            <div class="grid">
                                <!-- Barcode -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="barcode" class="font-bold">Barcode</label>
                                        <InputText
                                            id="barcode"
                                            v-model="book.barcode"
                                            placeholder="Book barcode" />
                                    </div>
                                </div>

                                <!-- Shelf Location -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="shelf_location_detail" class="font-bold"
                                            >Shelf Location</label
                                        >
                                        <InputText
                                            id="shelf_location_detail"
                                            v-model="book.shelf_location_detail"
                                            placeholder="e.g., A3-45" />
                                    </div>
                                </div>

                                <!-- Library Branch -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="library_branch_id" class="font-bold"
                                            >Library Branch*</label
                                        >
                                        <Dropdown
                                            id="library_branch_id"
                                            v-model="book.library_branch_id"
                                            :options="branches"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Select library branch"
                                            :class="{
                                                'p-invalid': submitted && !book.library_branch_id
                                            }" />
                                        <small
                                            v-if="submitted && !book.library_branch_id"
                                            class="p-error"
                                            >Library branch is required</small
                                        >
                                    </div>
                                </div>

                                <!-- Shelf -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="shelf_id" class="font-bold"
                                            >Shelf Section</label
                                        >
                                        <Dropdown
                                            id="shelf_id"
                                            v-model="book.shelf_id"
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
                                            v-model="book.category_id"
                                            :options="categories"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Select category"
                                            :class="{
                                                'p-invalid': submitted && !book.category_id
                                            }" />
                                        <small v-if="submitted && !book.category_id" class="p-error"
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
                                            v-model="book.publisher_id"
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
                                            v-model="book.availability_status"
                                            :options="statusOptions"
                                            optionLabel="name"
                                            optionValue="code"
                                            placeholder="Select status"
                                            :class="{
                                                'p-invalid': submitted && !book.availability_status
                                            }" />
                                        <small
                                            v-if="submitted && !book.availability_status"
                                            class="p-error"
                                            >Status is required</small
                                        >
                                    </div>
                                </div>

                                <!-- Reference Only -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field-checkbox">
                                        <Checkbox
                                            id="reference_only"
                                            v-model="book.reference_only"
                                            :binary="true" />
                                        <label for="reference_only" class="ml-2 font-medium"
                                            >Reference Only (Cannot be checked out)</label
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
                                            v-model="book.cover_image_url"
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
                                            v-model="book.description"
                                            rows="5"
                                            placeholder="Book description" />
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
                                label="Save Book"
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
