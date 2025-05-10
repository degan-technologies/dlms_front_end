<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const bookId = route.params.id;
const submitted = ref(false);
const loading = ref(true);
const saveLoading = ref(false);
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

const book = ref({
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
    { name: 'Leather Bound', code: 'leather_bound' },
    { name: 'Spiral Bound', code: 'spiral_bound' }
]);
const statusOptions = ref([
    { name: 'Available', code: 'available' },
    { name: 'Checked Out', code: 'checked_out' },
    { name: 'Reserved', code: 'reserved' },
    { name: 'Lost', code: 'lost' },
    { name: 'Damaged', code: 'damaged' }
]);

onMounted(() => {
    fetchBookDetails();
    fetchFormData();
});

const fetchBookDetails = async () => {
    try {
        // In a real app, this would be an API call to fetch book details
        // const response = await fetch(`/api/books/physical/${bookId}`);
        // const data = await response.json();

        // Simulate API call with mock data
        setTimeout(() => {
            // Mock data for demonstration
            const mockBook = {
                id: parseInt(bookId),
                title: 'The Art of Programming',
                isbn: '9780123456789',
                availability_status: 'available',
                author: 'John Smith',
                publication_year: 2020,
                description: 'A comprehensive guide to programming principles and practices.',
                cover_image_url: '/demo/images/product/product-placeholder.svg',
                metadata: {},
                language: 'en',
                library_branch_id: 1,
                shelf_id: 1,
                category_id: 1,
                publisher_id: 1,
                edition: '3rd Edition',
                pages: 450,
                cover_type: 'hardcover',
                dimensions: '9 x 6 x 1 inches',
                weight_grams: 800,
                barcode: '12345678',
                shelf_location_detail: 'A3-45',
                reference_only: false
            };

            // Populate form with book data
            book.value = { ...mockBook };
            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('Error fetching book details:', error);
        loading.value = false;
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
                { name: 'Fiction - A-F', id: 1 },
                { name: 'Fiction - G-M', id: 2 },
                { name: 'Fiction - N-Z', id: 3 },
                { name: 'Non-Fiction - Science', id: 4 },
                { name: 'Non-Fiction - History', id: 5 },
                { name: 'Reference Section', id: 6 }
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

    saveLoading.value = true;

    try {
        // In a real app, this would be an API call to update the book
        // const response = await fetch(`/api/books/physical/${bookId}`, {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(book.value)
        // });
        // const data = await response.json();

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Navigate back to the book details page after successful update
        router.push(`/books/physical/${bookId}`);
    } catch (error) {
        console.error('Error updating book:', error);
    } finally {
        saveLoading.value = false;
    }
};

const cancelEdit = () => {
    router.push(`/books/physical/${bookId}`);
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Edit Physical Book</h5>
                <p class="text-gray-600 mb-4">Update details for this physical book.</p>

                <div v-if="loading" class="flex justify-content-center">
                    <ProgressSpinner />
                </div>

                <form v-else @submit.prevent="submitForm" class="p-fluid">
                    <div class="grid formgrid">
                        <!-- Split the form into sections -->
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
                                            placeholder="Book edition" />
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

                        <!-- Physical Characteristics -->
                        <div class="col-12 mb-4 pb-3 border-bottom-1 surface-border">
                            <h6 class="text-lg font-bold mb-3">Physical Characteristics</h6>
                            <div class="grid">
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

                                <!-- Dimensions -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="dimensions" class="font-bold">Dimensions</label>
                                        <InputText
                                            id="dimensions"
                                            v-model="book.dimensions"
                                            placeholder="e.g., 9 x 6 x 1 inches" />
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
                                        <label for="shelf_id" class="font-bold">Shelf</label>
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

                                <!-- Shelf Location Detail -->
                                <div class="col-12 md:col-6 mb-3">
                                    <div class="field">
                                        <label for="shelf_location_detail" class="font-bold"
                                            >Shelf Location Detail</label
                                        >
                                        <InputText
                                            id="shelf_location_detail"
                                            v-model="book.shelf_location_detail"
                                            placeholder="e.g., Row 3, Position 12" />
                                    </div>
                                </div>

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
                                <div class="col-12 mb-3">
                                    <div class="field-checkbox">
                                        <Checkbox
                                            id="reference_only"
                                            v-model="book.reference_only"
                                            :binary="true" />
                                        <label for="reference_only" class="ml-2"
                                            >Reference Only (Not for borrowing)</label
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
                                @click="cancelEdit"
                                type="button" />
                            <Button
                                label="Save Changes"
                                icon="pi pi-check"
                                class="p-button-primary"
                                type="submit"
                                :loading="saveLoading" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
