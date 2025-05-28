<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Create New Collection" :modal="true" :closable="true" :style="{ width: '30rem' }" @show="resetForm">
        <form @submit.prevent="createCollection">
            <div class="mb-6">
                <label for="collectionName" class="block text-sm font-medium mb-2 text-gray-700">Collection Name</label>
                <InputText
                    id="collectionName"
                    v-model="collectionName"
                    placeholder="Enter collection name"
                    class="w-full"
                    :class="{ 'p-invalid': (meta.touched.name || meta.dirty) && (nameError || formErrors.name) }"
                    @input="() => clearFieldError('name')"
                />
                <div v-if="(meta.touched.name || meta.dirty) && (nameError || formErrors.name)" class="text-red-500 text-xs mt-1">
                    {{ nameError || formErrors.name }}
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <Button label="Cancel" text @click="closeDialog" />
                <Button label="Create Collection" type="submit" :loading="isSubmitting" icon="pi pi-plus" />
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
    }
});

const emit = defineEmits(['update:visible', 'collection-created']);

const toast = useToast();

// Form schema
const collectionSchema = z.object({
    name: z.string().min(1, 'Collection name is required').max(255, 'Name is too long')
});

// Form state
const {
    handleSubmit,
    errors: formErrors,
    isSubmitting,
    setErrors,
    resetForm: resetVeeForm,
    meta
} = useForm({
    validationSchema: toTypedSchema(collectionSchema),
    validateOnMount: false
});

// Form fields
const { value: collectionName, errorMessage: nameError } = useField('name');

const createCollection = handleSubmit(async (values) => {
    try {
        const collectionData = {
            name: values.name
        };
        const response = await axiosInstance.post('/collections', collectionData);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Collection created successfully',
            life: 3000
        });
        emit('collection-created', response.data);
        closeDialog();
    } catch (error) {
        console.error('Error creating collection:', error);
        if (error.response?.data?.errors) {
            setErrors(error.response.data.errors);
        }
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Failed to create collection',
            life: 4000
        });
    }
});

const clearFieldError = (fieldName) => {
    if (formErrors.value && formErrors.value[fieldName]) {
        const newErrors = { ...formErrors.value };
        delete newErrors[fieldName];
        formErrors.value = newErrors;
    }
};

const resetForm = () => {
    resetVeeForm();
    setErrors({});
    collectionName.value = '';
};

const closeDialog = () => {
    emit('update:visible', false);
    resetForm();
};
</script>
