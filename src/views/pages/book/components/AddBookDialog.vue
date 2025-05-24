<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Add Physical Book" :modal="true" :closable="true" :style="{ width: '65rem' }" @show="clearFormErrors">
        <form @submit.prevent="addBook">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="mb-3">
                    <label for="edition" class="block text-sm font-medium mb-1">Edition</label>
                    <InputText id="edition" v-model="edition" placeholder="Edition" class="w-full" :class="{ 'p-invalid': (meta.touched.edition || meta.dirty) && (editionError || formErrors.edition) }" @input="() => clearFieldError('edition')" />
                    <div v-if="(meta.touched.edition || meta.dirty) && (editionError || formErrors.edition)" class="text-red-500 text-xs mt-1">
                        {{ editionError || formErrors.edition }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="isbn" class="block text-sm font-medium mb-1">ISBN</label>
                    <InputText id="isbn" v-model="isbn" placeholder="ISBN" class="w-full" :class="{ 'p-invalid': (meta.touched.isbn || meta.dirty) && (isbnError || formErrors.isbn) }" @input="() => clearFieldError('isbn')" />
                    <div v-if="(meta.touched.isbn || meta.dirty) && (isbnError || formErrors.isbn)" class="text-red-500 text-xs mt-1">
                        {{ isbnError || formErrors.isbn }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="title" class="block text-sm font-medium mb-1">Title</label>
                    <InputText id="title" v-model="title" placeholder="Title" class="w-full" :class="{ 'p-invalid': (meta.touched.title || meta.dirty) && (titleError || formErrors.title) }" @input="() => clearFieldError('title')" />
                    <div v-if="(meta.touched.title || meta.dirty) && (titleError || formErrors.title)" class="text-red-500 text-xs mt-1">
                        {{ titleError || formErrors.title }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="pages" class="block text-sm font-medium mb-1">Pages</label>
                    <InputNumber id="pages" v-model="pages" placeholder="Pages" class="w-full" :class="{ 'p-invalid': (meta.touched.pages || meta.dirty) && (pagesError || formErrors.pages) }" @input="() => clearFieldError('pages')" />
                    <div v-if="(meta.touched.pages || meta.dirty) && (pagesError || formErrors.pages)" class="text-red-500 text-xs mt-1">
                        {{ pagesError || formErrors.pages }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="isBorrowable" class="block text-sm font-medium mb-1">Borrowable</label>
                    <Dropdown
                        id="isBorrowable"
                        v-model="isBorrowable"
                        :options="borrowableOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Is Borrowable"
                        class="w-full"
                        :class="{ 'p-invalid': (meta.touched.is_borrowable || meta.dirty) && (isBorrowableError || formErrors.is_borrowable) }"
                        @change="() => clearFieldError('is_borrowable')"
                    />
                    <div v-if="(meta.touched.is_borrowable || meta.dirty) && (isBorrowableError || formErrors.is_borrowable)" class="text-red-500 text-xs mt-1">
                        {{ isBorrowableError || formErrors.is_borrowable }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="shelfId" class="block text-sm font-medium mb-1">Shelf</label>
                    <Dropdown
                        id="shelfId"
                        v-model="shelfId"
                        :options="filterOptions.shelves"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Shelf"
                        class="w-full"
                        :class="{ 'p-invalid': (meta.touched.shelf_id || meta.dirty) && (shelfIdError || formErrors.shelf_id) }"
                        @change="() => clearFieldError('shelf_id')"
                    />
                    <div v-if="(meta.touched.shelf_id || meta.dirty) && (shelfIdError || formErrors.shelf_id)" class="text-red-500 text-xs mt-1">
                        {{ shelfIdError || formErrors.shelf_id }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="libraryId" class="block text-sm font-medium mb-1">Library</label>
                    <Dropdown
                        id="libraryId"
                        v-model="libraryId"
                        :options="filterOptions.libraries"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Library"
                        class="w-full"
                        :class="{ 'p-invalid': (meta.touched.library_id || meta.dirty) && (libraryIdError || formErrors.library_id) }"
                        @change="() => clearFieldError('library_id')"
                    />
                    <div v-if="(meta.touched.library_id || meta.dirty) && (libraryIdError || formErrors.library_id)" class="text-red-500 text-xs mt-1">
                        {{ libraryIdError || formErrors.library_id }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="isReserved" class="block text-sm font-medium mb-1">Reserved</label>
                    <Dropdown
                        id="isReserved"
                        v-model="isReserved"
                        :options="reservedOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Is Reserved"
                        class="w-full"
                        :class="{ 'p-invalid': (meta.touched.is_reserved || meta.dirty) && (isReservedError || formErrors.is_reserved) }"
                        @change="() => clearFieldError('is_reserved')"
                    />
                    <div v-if="(meta.touched.is_reserved || meta.dirty) && (isReservedError || formErrors.is_reserved)" class="text-red-500 text-xs mt-1">
                        {{ isReservedError || formErrors.is_reserved }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="publicationYear" class="block text-sm font-medium mb-1">Publication Year</label>
                    <Dropdown
                        id="publicationYear"
                        v-model="publicationYear"
                        :options="publicationYearOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Publication Year"
                        class="w-full"
                        :class="{ 'p-invalid': (meta.touched.publication_year || meta.dirty) && (publicationYearError || formErrors.publication_year) }"
                        @change="() => clearFieldError('publication_year')"
                    />
                    <div v-if="(meta.touched.publication_year || meta.dirty) && (publicationYearError || formErrors.publication_year)" class="text-red-500 text-xs mt-1">
                        {{ publicationYearError || formErrors.publication_year }}
                    </div>
                </div>
                <div class="mb-3 md:col-span-2">
                    <label for="coverImage" class="block text-sm font-medium mb-1">Cover Image</label>
                    <FileUpload id="coverImage" mode="basic" name="cover_image" accept="image/*" :auto="false" chooseLabel="Select Cover Image" class="w-full" @select="onCoverImageSelect" :class="{ 'p-invalid': formErrors.cover_image }" />
                    <div v-if="formErrors.cover_image" class="text-red-500 text-xs mt-1">
                        {{ formErrors.cover_image }}
                    </div>
                    <div v-if="coverImagePreview" class="mt-2">
                        <img :src="coverImagePreview" class="max-h-40 border rounded" />
                    </div>
                </div>
            </div>
            <div class="flex justify-end gap-2 mt-4">
                <Button label="Cancel" text @click="closeDialog" />
                <Button label="Add Book" type="submit" :loading="isSubmitting" />
            </div>
        </form>
    </Dialog>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import { toTypedSchema } from '@vee-validate/zod';
import { useToast } from 'primevue/usetoast';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';
import { z } from 'zod';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    bookItemId: {
        type: [Number, String],
        required: true
    },
    filterOptions: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'book-added']);

const toast = useToast();

// Options
const borrowableOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
];

const reservedOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
];

const publicationYearOptions = Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { label: year.toString(), value: year };
});

// Form schema
const bookSchema = z.object({
    edition: z.string().min(1, 'Edition is required'),
    isbn: z.string().min(1, 'ISBN is required'),
    title: z.string().min(1, 'Title is required'),
    pages: z.number().min(1, 'Pages must be at least 1'),
    is_borrowable: z.boolean(),
    shelf_id: z.any().refine((val) => val !== null && val !== '', 'Shelf is required'),
    library_id: z.any().refine((val) => val !== null && val !== '', 'Library is required'),
    is_reserved: z.boolean(),
    publication_year: z.number().min(1900, 'Invalid publication year')
});

// Form state
const {
    handleSubmit,
    errors: formErrors,
    isSubmitting,
    setErrors,
    resetForm,
    meta
} = useForm({
    validationSchema: toTypedSchema(bookSchema),
    validateOnMount: false
});

// Form fields
const { value: edition, errorMessage: editionError } = useField('edition');
const { value: isbn, errorMessage: isbnError } = useField('isbn');
const { value: title, errorMessage: titleError } = useField('title');
const { value: pages, errorMessage: pagesError } = useField('pages');
const { value: isBorrowable, errorMessage: isBorrowableError } = useField('is_borrowable');
const { value: shelfId, errorMessage: shelfIdError } = useField('shelf_id');
const { value: libraryId, errorMessage: libraryIdError } = useField('library_id');
const { value: isReserved, errorMessage: isReservedError } = useField('is_reserved');
const { value: publicationYear, errorMessage: publicationYearError } = useField('publication_year');

// Additional fields not in the schema
const coverImageFile = ref(null);
const coverImagePreview = ref(null);

// Methods
const onCoverImageSelect = (event) => {
    const file = event.files[0];
    if (file) {
        coverImageFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            coverImagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const addBook = handleSubmit(async (values) => {
    try {
        const formData = new FormData();
        formData.append('book_item_id', props.bookItemId);
        formData.append('edition', values.edition);
        formData.append('isbn', values.isbn);
        formData.append('title', values.title);
        formData.append('pages', values.pages);
        formData.append('is_borrowable', values.is_borrowable);
        formData.append('shelf_id', values.shelf_id);
        formData.append('library_id', values.library_id);
        formData.append('is_reserved', values.is_reserved);
        formData.append('publication_year', values.publication_year);

        if (coverImageFile.value) {
            formData.append('cover_image', coverImageFile.value);
        }

        const response = await axiosInstance.post('/books', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.add({ severity: 'success', summary: 'Success', detail: 'Book added successfully', life: 3000 });
        emit('book-added', response.data);
        closeDialog();
    } catch (error) {
        if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
        }
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add book', life: 3000 });
    }
});

const clearFieldError = (fieldName) => {
    // Clear backend validation error
    if (formErrors.value && formErrors.value[fieldName]) {
        const newErrors = { ...formErrors.value };
        delete newErrors[fieldName];
        formErrors.value = newErrors;
    }
};

const clearFormErrors = () => {
    // Reset all errors and form state when dialog opens
    resetForm();
    setErrors({});
    edition.value = '';
    isbn.value = '';
    title.value = '';
    pages.value = null;
    isBorrowable.value = true;
    shelfId.value = '';
    libraryId.value = '';
    isReserved.value = false;
    publicationYear.value = new Date().getFullYear();
    coverImageFile.value = null;
    coverImagePreview.value = null;
};

const closeDialog = () => {
    emit('update:visible', false);
    clearFormErrors();
};
</script>
