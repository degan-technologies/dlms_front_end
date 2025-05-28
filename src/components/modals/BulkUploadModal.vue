<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" header="Bulk Upload Resources" :modal="true" :closable="true" :style="{ width: '60rem' }" @show="resetUpload">
        <div class="mb-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 class="font-semibold text-blue-900 mb-2">How Bulk Upload Works</h4>
                <ul class="text-sm text-blue-800 space-y-1">
                    <li>• Upload multiple PDFs, videos, or other educational content</li>
                    <li>• Each file will create a new ebook entry</li>
                    <li>• You can assign them to existing book items or create new ones</li>
                    <li>• Supported formats: PDF, MP4, AVI, MOV, YouTube links</li>
                </ul>
            </div>

            <!-- Step 1: File Upload -->
            <div class="mb-8">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                    Select Files or Links
                </h3>

                <!-- File Upload Area -->
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors" @dragover.prevent @drop="handleDrop">
                    <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-4"></i>
                    <h4 class="text-lg font-medium text-gray-700 mb-2">Drop files here or click to browse</h4>
                    <p class="text-gray-500 mb-4">Supports PDF, video files, and other educational content</p>
                    <input ref="fileInput" type="file" multiple accept=".pdf,.mp4,.avi,.mov,.doc,.docx,.ppt,.pptx" @change="handleFileSelect" class="hidden" />
                    <Button label="Browse Files" icon="pi pi-upload" @click="$refs.fileInput.click()" />
                </div>

                <!-- YouTube Link Input -->
                <div class="mt-4">
                    <div class="flex gap-2">
                        <InputText v-model="youtubeLink" placeholder="Or paste YouTube video URL here..." class="flex-1" />
                        <Button label="Add Link" icon="pi pi-link" @click="addYoutubeLink" :disabled="!youtubeLink.trim()" />
                    </div>
                </div>
            </div>

            <!-- Selected Files/Links List -->
            <div v-if="selectedItems.length > 0" class="mb-8">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                    Review Selected Items ({{ selectedItems.length }})
                </h3>

                <div class="space-y-3 max-h-60 overflow-y-auto">
                    <div v-for="(item, index) in selectedItems" :key="index" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div class="flex-shrink-0">
                            <i :class="getFileIcon(item)" class="text-2xl"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-medium text-gray-900 truncate">{{ item.name }}</h4>
                            <p class="text-sm text-gray-500">{{ item.type }} • {{ formatFileSize(item.size) }}</p>
                        </div>
                        <div class="flex-shrink-0">
                            <Button icon="pi pi-times" text severity="danger" @click="removeItem(index)" class="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 3: Configure Upload -->
            <div v-if="selectedItems.length > 0" class="mb-8">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                    Configure Upload Settings
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Default Book Item</label>
                        <Dropdown v-model="selectedBookItem" :options="bookItemOptions" optionLabel="label" optionValue="value" placeholder="Select or create new" class="w-full" showClear />
                        <p class="text-xs text-gray-500 mt-1">Leave empty to create new book items</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Default Ebook Type</label>
                        <Dropdown v-model="selectedEbookType" :options="ebookTypeOptions" optionLabel="label" optionValue="value" placeholder="Select ebook type" class="w-full" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Category</label>
                        <Dropdown v-model="selectedCategory" :options="categoryOptions" optionLabel="label" optionValue="value" placeholder="Select category" class="w-full" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Subject</label>
                        <Dropdown v-model="selectedSubject" :options="subjectOptions" optionLabel="label" optionValue="value" placeholder="Select subject" class="w-full" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Grade</label>
                        <Dropdown v-model="selectedGrade" :options="gradeOptions" optionLabel="label" optionValue="value" placeholder="Select grade" class="w-full" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium mb-2">Language</label>
                        <Dropdown v-model="selectedLanguage" :options="languageOptions" optionLabel="label" optionValue="value" placeholder="Select language" class="w-full" />
                    </div>
                </div>

                <div class="mt-4">
                    <label class="flex items-center gap-2">
                        <Checkbox v-model="makeDownloadable" :binary="true" />
                        <span class="text-sm font-medium">Make all files downloadable</span>
                    </label>
                </div>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploading" class="mb-6">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">
                        <i class="pi pi-spin pi-spinner"></i>
                    </span>
                    Uploading Files...
                </h3>

                <div class="space-y-3">
                    <div v-for="(item, index) in selectedItems" :key="index" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium">{{ item.name }}</span>
                                <span class="text-xs text-gray-500">{{ uploadProgress[index] || 0 }}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-purple-600 h-2 rounded-full transition-all" :style="{ width: `${uploadProgress[index] || 0}%` }"></div>
                            </div>
                        </div>
                        <div>
                            <i :class="[uploadProgress[index] === 100 ? 'pi pi-check text-green-500' : uploadProgress[index] > 0 ? 'pi pi-spin pi-spinner text-purple-500' : 'pi pi-clock text-gray-400']"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-2">
            <Button label="Cancel" text @click="closeDialog" :disabled="uploading" />
            <Button v-if="!uploading" label="Start Upload" icon="pi pi-upload" @click="startBulkUpload" :disabled="selectedItems.length === 0" />
            <Button v-else label="Uploading..." icon="pi pi-spin pi-spinner" disabled />
        </div>
    </Dialog>
</template>

<script setup>
import axiosInstance from '@/util/axios-config';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'bulk-upload-complete']);

const toast = useToast();

// State
const selectedItems = ref([]);
const youtubeLink = ref('');
const uploading = ref(false);
const uploadProgress = ref({});

// Form data
const selectedBookItem = ref(null);
const selectedEbookType = ref(null);
const selectedCategory = ref(null);
const selectedSubject = ref(null);
const selectedGrade = ref(null);
const selectedLanguage = ref(null);
const makeDownloadable = ref(true);

// Options
const bookItemOptions = ref([]);
const ebookTypeOptions = ref([]);
const categoryOptions = ref([]);
const subjectOptions = ref([]);
const gradeOptions = ref([]);
const languageOptions = ref([]);

// Methods
const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    addFiles(files);
};

const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    addFiles(files);
};

const addFiles = (files) => {
    files.forEach((file) => {
        selectedItems.value.push({
            name: file.name,
            size: file.size,
            type: getFileType(file),
            file: file,
            isFile: true
        });
    });
};

const addYoutubeLink = () => {
    if (youtubeLink.value.trim()) {
        selectedItems.value.push({
            name: extractVideoTitle(youtubeLink.value),
            size: 0,
            type: 'YouTube Video',
            url: youtubeLink.value.trim(),
            isFile: false
        });
        youtubeLink.value = '';
    }
};

const removeItem = (index) => {
    selectedItems.value.splice(index, 1);
};

const getFileType = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const typeMap = {
        pdf: 'PDF Document',
        mp4: 'Video File',
        avi: 'Video File',
        mov: 'Video File',
        doc: 'Word Document',
        docx: 'Word Document',
        ppt: 'PowerPoint',
        pptx: 'PowerPoint'
    };
    return typeMap[extension] || 'File';
};

const getFileIcon = (item) => {
    if (!item.isFile) return 'pi pi-youtube text-red-500';

    const extension = item.name.split('.').pop().toLowerCase();
    const iconMap = {
        pdf: 'pi pi-file-pdf text-red-500',
        mp4: 'pi pi-video text-blue-500',
        avi: 'pi pi-video text-blue-500',
        mov: 'pi pi-video text-blue-500',
        doc: 'pi pi-file-word text-blue-600',
        docx: 'pi pi-file-word text-blue-600',
        ppt: 'pi pi-file text-orange-500',
        pptx: 'pi pi-file text-orange-500'
    };
    return iconMap[extension] || 'pi pi-file text-gray-500';
};

const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const extractVideoTitle = (url) => {
    // Simple extraction from URL, you might want to fetch actual title
    return `YouTube Video: ${url.split('/').pop().split('?')[0] || 'Video'}`;
};

const fetchOptions = async () => {
    try {
        // Fetch book items
        const bookItemsResponse = await axiosInstance.get('/teacher-book-items', {
            params: { per_page: 100, fields: 'id,title' }
        });
        bookItemOptions.value = (bookItemsResponse.data.data || []).map((item) => ({
            label: item.title,
            value: item.id
        }));

        // Fetch constants
        const constantsResponse = await axiosInstance.get('/constants/all');
        const data = constantsResponse.data;

        ebookTypeOptions.value = (data.ebook_types?.data || []).map((t) => ({ label: t.name, value: t.id }));
        categoryOptions.value = (data.categories?.data || []).map((c) => ({ label: c.name, value: c.id }));
        subjectOptions.value = (data.subjects?.data || []).map((s) => ({ label: s.name, value: s.id }));
        gradeOptions.value = (data.grades?.data || []).map((g) => ({ label: g.name, value: g.id }));
        languageOptions.value = (data.languages?.data || []).map((l) => ({ label: l.name, value: l.id }));
    } catch (error) {
        console.error('Error fetching options:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch options', life: 3000 });
    }
};

const startBulkUpload = async () => {
    if (selectedItems.value.length === 0) return;

    uploading.value = true;
    uploadProgress.value = {};

    try {
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < selectedItems.value.length; i++) {
            const item = selectedItems.value[i];
            uploadProgress.value[i] = 0;

            try {
                let bookItemId = selectedBookItem.value;

                // Create new book item if none selected
                if (!bookItemId) {
                    const bookItemData = {
                        title: item.name.replace(/\.[^/.]+$/, ''), // Remove extension
                        author: 'Unknown',
                        description: `Uploaded via bulk upload: ${item.name}`,
                        category_id: selectedCategory.value,
                        subject_id: selectedSubject.value,
                        grade_id: selectedGrade.value,
                        language_id: selectedLanguage.value,
                        library_id: 1 // Default library
                    };

                    const bookItemResponse = await axiosInstance.post('/book-items', bookItemData);
                    bookItemId = bookItemResponse.data.data.id;
                }

                uploadProgress.value[i] = 50;

                // Create ebook
                if (item.isFile) {
                    // Upload file
                    const formData = new FormData();
                    formData.append('book_item_id', bookItemId);
                    formData.append('file_name', item.name);
                    formData.append('is_downloadable', makeDownloadable.value);
                    formData.append('e_book_type_id', selectedEbookType.value || 1);
                    formData.append('pdf_file', item.file);

                    await axiosInstance.post('/ebooks', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    // Add YouTube link
                    const ebookData = {
                        book_item_id: bookItemId,
                        file_name: item.name,
                        is_downloadable: false,
                        e_book_type_id: selectedEbookType.value || 2, // Assume 2 is video type
                        file_path: item.url
                    };

                    await axiosInstance.post('/ebooks', ebookData);
                }

                uploadProgress.value[i] = 100;
                successCount++;
            } catch (error) {
                console.error(`Error uploading ${item.name}:`, error);
                uploadProgress.value[i] = -1; // Error state
                errorCount++;
            }
        }

        toast.add({
            severity: successCount > 0 ? 'success' : 'error',
            summary: 'Bulk Upload Complete',
            detail: `${successCount} uploaded successfully, ${errorCount} failed`,
            life: 5000
        });

        if (successCount > 0) {
            emit('bulk-upload-complete');
        }

        // Close dialog after a delay
        setTimeout(() => {
            closeDialog();
        }, 2000);
    } catch (error) {
        console.error('Bulk upload error:', error);
        toast.add({ severity: 'error', summary: 'Upload Failed', detail: 'Bulk upload failed', life: 3000 });
    } finally {
        uploading.value = false;
    }
};

const resetUpload = () => {
    selectedItems.value = [];
    youtubeLink.value = '';
    uploading.value = false;
    uploadProgress.value = {};
    selectedBookItem.value = null;
    selectedEbookType.value = null;
    selectedCategory.value = null;
    selectedSubject.value = null;
    selectedGrade.value = null;
    selectedLanguage.value = null;
    makeDownloadable.value = true;
};

const closeDialog = () => {
    emit('update:visible', false);
    resetUpload();
};

onMounted(() => {
    fetchOptions();
});
</script>
