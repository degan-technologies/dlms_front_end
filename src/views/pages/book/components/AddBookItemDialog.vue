<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Add Book Item" :modal="true" :closable="true" :style="{ width: '65rem' }" @show="clearFormErrors">
        <form @submit.prevent="addBookItem">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="mb-3">
                    <label for="title" class="block text-sm font-medium mb-1">Title</label>
                    <InputText id="title" v-model="title" placeholder="Title" class="w-full" :class="{ 'p-invalid': (meta.touched.title || meta.dirty) && (titleError || formErrors.title) }" @input="() => clearFieldError('title')" />
                    <div v-if="(meta.touched.title || meta.dirty) && (titleError || formErrors.title)" class="text-red-500 text-xs mt-1">
                        {{ titleError || formErrors.title }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="author" class="block text-sm font-medium mb-1">Author</label>
                    <InputText id="author" v-model="author" placeholder="Author" class="w-full" :class="{ 'p-invalid': (meta.touched.author || meta.dirty) && (authorError || formErrors.author) }" @input="() => clearFieldError('author')" />
                    <div v-if="(meta.touched.author || meta.dirty) && (authorError || formErrors.author)" class="text-red-500 text-xs mt-1">
                        {{ authorError || formErrors.author }}
                    </div>
                </div>
                <div class="mb-3 md:col-span-2">
                    <label for="description" class="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                        id="description"
                        v-model="description"
                        placeholder="Description"
                        rows="3"
                        class="w-full"
                        :class="{ 'p-invalid': (meta.touched.description || meta.dirty) && (descriptionError || formErrors.description) }"
                        @input="() => clearFieldError('description')"
                    />
                    <div v-if="(meta.touched.description || meta.dirty) && (descriptionError || formErrors.description)" class="text-red-500 text-xs mt-1">
                        {{ descriptionError || formErrors.description }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="languageId" class="block text-sm font-medium mb-1">Language</label>
                    <Dropdown
                        id="languageId"
                        v-model="languageId"
                        :options="filterOptions.languages"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Language"
                        class="w-full"
                        :class="{ 'p-invalid': (meta.touched.language_id || meta.dirty) && (languageIdError || formErrors.language_id) }"
                        @change="() => clearFieldError('language_id')"
                    />
                    <div v-if="(meta.touched.language_id || meta.dirty) && (languageIdError || formErrors.language_id)" class="text-red-500 text-xs mt-1">
                        {{ languageIdError || formErrors.language_id }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="categoryId" class="block text-sm font-medium mb-1">Category</label>
                    <Dropdown
                        id="categoryId"
                        v-model="categoryId"
                        :options="filterOptions.categories"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Category"
                        class="w-full"
                        :class="{ 'p-invalid': (meta.touched.category_id || meta.dirty) && (categoryIdError || formErrors.category_id) }"
                        @change="() => clearFieldError('category_id')"
                    />
                    <div v-if="(meta.touched.category_id || meta.dirty) && (categoryIdError || formErrors.category_id)" class="text-red-500 text-xs mt-1">
                        {{ categoryIdError || formErrors.category_id }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="subjectId" class="block text-sm font-medium mb-1">Subject</label>
                    <Dropdown
                        id="subjectId"
                        v-model="subjectId"
                        :options="filterOptions.subjects"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Subject"
                        class="w-full"
                        :class="{ 'p-invalid': (meta.touched.subject_id || meta.dirty) && (subjectIdError || formErrors.subject_id) }"
                        @change="() => clearFieldError('subject_id')"
                    />
                    <div v-if="(meta.touched.subject_id || meta.dirty) && (subjectIdError || formErrors.subject_id)" class="text-red-500 text-xs mt-1">
                        {{ subjectIdError || formErrors.subject_id }}
                    </div>
                </div>
                <div class="mb-3">
                    <label for="gradeId" class="block text-sm font-medium mb-1">Grade</label>
                    <Dropdown
                        id="gradeId"
                        v-model="gradeId"
                        :options="filterOptions.grades"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select Grade"
                        class="w-full"
                        :class="{ 'p-invalid': (meta.touched.grade_id || meta.dirty) && (gradeIdError || formErrors.grade_id) }"
                        @change="() => clearFieldError('grade_id')"
                    />
                    <div v-if="(meta.touched.grade_id || meta.dirty) && (gradeIdError || formErrors.grade_id)" class="text-red-500 text-xs mt-1">
                        {{ gradeIdError || formErrors.grade_id }}
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
                <Button label="Add Book Item" type="submit" :loading="isSubmitting" />
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
    filterOptions: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'book-item-added']);

const toast = useToast();

// Form schema
const bookItemSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    description: z.string().min(1, 'Description is required'),
    language_id: z.any().refine((val) => val !== null && val !== '', 'Language is required'),
    category_id: z.any().refine((val) => val !== null && val !== '', 'Category is required'),
    subject_id: z.any().refine((val) => val !== null && val !== '', 'Subject is required'),
    grade_id: z.any().refine((val) => val !== null && val !== '', 'Grade is required'),
    library_id: z.any().refine((val) => val !== null && val !== '', 'Library is required')
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
    validationSchema: toTypedSchema(bookItemSchema),
    validateOnMount: false
});

// Form fields
const { value: title, errorMessage: titleError } = useField('title');
const { value: author, errorMessage: authorError } = useField('author');
const { value: description, errorMessage: descriptionError } = useField('description');
const { value: languageId, errorMessage: languageIdError } = useField('language_id');
const { value: categoryId, errorMessage: categoryIdError } = useField('category_id');
const { value: subjectId, errorMessage: subjectIdError } = useField('subject_id');
const { value: gradeId, errorMessage: gradeIdError } = useField('grade_id');
const { value: libraryId, errorMessage: libraryIdError } = useField('library_id');

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

const addBookItem = handleSubmit(async (values) => {
    try {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('author', values.author);
        formData.append('description', values.description);
        formData.append('language_id', values.language_id);
        formData.append('category_id', values.category_id);
        formData.append('subject_id', values.subject_id);
        formData.append('grade_id', values.grade_id);
        formData.append('library_id', values.library_id);

        if (coverImageFile.value) {
            formData.append('cover_image', coverImageFile.value);
        }

        const response = await axiosInstance.post('/book-items', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.add({ severity: 'success', summary: 'Success', detail: 'Book item added successfully', life: 3000 });
        emit('book-item-added', response.data);
        closeDialog();
    } catch (error) {
        if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
        }
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add book item', life: 3000 });
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
    title.value = '';
    author.value = '';
    description.value = '';
    languageId.value = '';
    categoryId.value = '';
    subjectId.value = '';
    gradeId.value = '';
    libraryId.value = '';
    coverImageFile.value = null;
    coverImagePreview.value = null;
};

const closeDialog = () => {
    emit('update:visible', false);
    clearFormErrors();
};
</script>
