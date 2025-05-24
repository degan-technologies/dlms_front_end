<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Add Ebook" :modal="true" :closable="true" :style="{ width: '65rem' }" @show="clearEbookErrors">
        <form @submit.prevent="addEbook">
            <div class="mb-3">
                <InputText v-model="fileName" placeholder="File Name" class="w-full" :class="{ 'p-invalid': (meta.touched.file_name || meta.dirty) && (fileNameError || ebookErrors.file_name) }" @input="() => clearFieldError('file_name')" />
                <div v-if="(meta.touched.file_name || meta.dirty) && (fileNameError || ebookErrors.file_name)" class="text-red-500 text-xs mt-1">
                    {{ fileNameError || ebookErrors.file_name }}
                </div>
            </div>
            <div class="mb-3">
                <Dropdown
                    v-model="ebookTypeId"
                    :options="ebookTypes"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="EBook Type"
                    class="w-full"
                    :class="{ 'p-invalid': (meta.touched.e_book_type_id || meta.dirty) && (ebookTypeIdError || ebookErrors.e_book_type_id) }"
                    @change="() => clearFieldError('e_book_type_id')"
                />
                <div v-if="(meta.touched.e_book_type_id || meta.dirty) && (ebookTypeIdError || ebookErrors.e_book_type_id)" class="text-red-500 text-xs mt-1">
                    {{ ebookTypeIdError || ebookErrors.e_book_type_id }}
                </div>
            </div>
            <div class="mb-3">
                <Dropdown
                    v-model="isDownloadable"
                    :options="downloadableOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Downloadable"
                    class="w-full"
                    :class="{ 'p-invalid': (meta.touched.is_downloadable || meta.dirty) && (isDownloadableError || ebookErrors.is_downloadable) }"
                    @change="() => clearFieldError('is_downloadable')"
                />
                <div v-if="(meta.touched.is_downloadable || meta.dirty) && (isDownloadableError || ebookErrors.is_downloadable)" class="text-red-500 text-xs mt-1">
                    {{ isDownloadableError || ebookErrors.is_downloadable }}
                </div>
            </div>
            <div class="mb-3" v-if="isPdfType">
                <FileUpload mode="basic" name="pdf_file" accept="application/pdf" :auto="false" chooseLabel="Upload PDF" class="w-full" @select="onPdfFileSelect" />
                <div v-if="pdfPreview" class="mt-2">
                    <iframe :src="`${pdfPreview}#toolbar=0&navpanes=0&scrollbar=0`" style="width: 100%; height: 400px; border: 1px solid #ccc" frameborder="0"></iframe>
                </div>
            </div>
            <div class="mb-3" v-else>
                <InputText
                    v-model="filePath"
                    placeholder="YouTube Embed Link or Video URL"
                    class="w-full"
                    :class="{ 'p-invalid': (meta.touched.file_path || meta.dirty) && (filePathError || ebookErrors.file_path) }"
                    @input="() => clearFieldError('file_path')"
                />
                <div v-if="(meta.touched.file_path || meta.dirty) && (filePathError || ebookErrors.file_path)" class="text-red-500 text-xs mt-1">
                    {{ filePathError || ebookErrors.file_path }}
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <Button label="Cancel" text @click="closeDialog" />
                <Button label="Add" type="submit" :loading="isSubmitting" />
            </div>
        </form>
    </Dialog>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import { toTypedSchema } from '@vee-validate/zod';
import { useToast } from 'primevue/usetoast';
import { useField, useForm } from 'vee-validate';
import { computed, ref, watch } from 'vue';
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
    ebookTypes: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'ebook-added']);

const toast = useToast();

// Form schema
const ebookSchema = z.object({
    file_name: z.string().min(1, 'File name is required'),
    e_book_type_id: z.any().refine((val) => val !== null && val !== '', 'EBook type is required'),
    is_downloadable: z.boolean(),
    file_path: z.string().optional()
});

// Form state
const {
    handleSubmit,
    errors: ebookErrors,
    isSubmitting,
    setErrors,
    resetForm,
    meta
} = useForm({
    validationSchema: toTypedSchema(ebookSchema),
    validateOnMount: false
});

// Form fields
const { value: fileName, errorMessage: fileNameError } = useField('file_name');
const { value: ebookTypeId, errorMessage: ebookTypeIdError } = useField('e_book_type_id');
const { value: isDownloadable, errorMessage: isDownloadableError } = useField('is_downloadable');
const { value: filePath, errorMessage: filePathError } = useField('file_path');

// Default options
const downloadableOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
];

// Helpers
const pdfFile = ref(null);
const pdfPreview = ref(null);

const isPdfType = computed(() => {
    return props.ebookTypes.find((t) => t.value === ebookTypeId.value)?.label === 'PDF';
});

// Methods
const onPdfFileSelect = (event) => {
    const file = event.files[0];
    if (file) {
        pdfFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            pdfPreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const addEbook = handleSubmit(async (values) => {
    try {
        const ebookType = props.ebookTypes.find((t) => t.value === values.e_book_type_id)?.label;

        // Check if PDF (send file) or other type (send file_path)
        if (ebookType === 'PDF' && pdfFile.value) {
            // For PDF, create FormData and send the actual file
            const formData = new FormData();
            formData.append('book_item_id', props.bookItemId);
            formData.append('file_name', values.file_name);
            formData.append('is_downloadable', Boolean(values.is_downloadable));
            formData.append('e_book_type_id', values.e_book_type_id);
            formData.append('pdf_file', pdfFile.value);

            // Send POST request with the file
            await axiosInstance.post(`/ebooks`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            // For non-PDF types, just send JSON data with file_path
            const ebookData = {
                book_item_id: props.bookItemId,
                file_name: values.file_name,
                is_downloadable: Boolean(values.is_downloadable),
                e_book_type_id: values.e_book_type_id,
                file_path: values.file_path
            };

            // Send POST request with JSON
            await axiosInstance.post(`/ebooks`, ebookData);
        }

        toast.add({ severity: 'success', summary: 'Success', detail: 'Ebook added successfully', life: 3000 });
        emit('ebook-added');
        closeDialog();
    } catch (error) {
        if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
        }
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add ebook', life: 3000 });
    }
});

const clearFieldError = (fieldName) => {
    // Clear backend validation error
    if (ebookErrors.value && ebookErrors.value[fieldName]) {
        const newErrors = { ...ebookErrors.value };
        delete newErrors[fieldName];
        ebookErrors.value = newErrors;
    }
};

const clearEbookErrors = () => {
    // Reset all errors and form state when dialog opens
    resetForm();
    setErrors({});
    fileName.value = '';
    ebookTypeId.value = '';
    isDownloadable.value = true;
    filePath.value = '';
    pdfFile.value = null;
    pdfPreview.value = null;
};

const closeDialog = () => {
    emit('update:visible', false);
};

// Reset form when visibility changes
watch(
    () => props.visible,
    (newValue) => {
        if (!newValue) {
            clearEbookErrors();
        }
    }
);
</script>
