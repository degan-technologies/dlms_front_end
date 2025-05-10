<template>
    <div class="pdf-reader-wrapper" :class="{ dark: darkMode }">
        <div v-if="loading" class="pdf-loading flex align-items-center justify-content-center p-4">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <div v-if="error" class="pdf-error flex flex-column align-items-center justify-content-center p-4">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mb-2"></i>
            <p class="text-center">{{ error }}</p>
            <Button label="Retry" icon="pi pi-refresh" class="mt-3" @click="loadPDF" />
        </div>

        <div class="pdf-container" ref="pdfContainer" v-show="!loading && !error">
            <!-- PDF.js will render the document here -->
        </div>

        <div class="pdf-controls" v-if="numPages > 0">
            <div class="pdf-pagination flex align-items-center justify-content-between p-3 border-top-1 surface-border bg-white">
                <Button icon="pi pi-chevron-left" :disabled="currentPage <= 1" @click="prevPage" aria-label="Previous page" />

                <span class="page-info"> Page {{ currentPage }} of {{ numPages }} </span>

                <div class="pdf-zoom-controls flex align-items-center">
                    <Button icon="pi pi-minus" :disabled="zoom <= minZoom" @click="zoomOut" aria-label="Zoom out" text />
                    <span class="mx-2">{{ Math.round(zoom * 100) }}%</span>
                    <Button icon="pi pi-plus" :disabled="zoom >= maxZoom" @click="zoomIn" aria-label="Zoom in" text />
                </div>

                <Button icon="pi pi-chevron-right" :disabled="currentPage >= numPages" @click="nextPage" aria-label="Next page" />
            </div>
        </div>
    </div>
</template>

<script setup>
import pdfjsLib from 'pdfjs-dist';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const props = defineProps({
    resourceUrl: {
        type: String,
        required: true
    },
    darkMode: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['page-change', 'loading-error', 'document-loaded']);

// State
const loading = ref(true);
const error = ref(null);
const pdfContainer = ref(null);
const pdfDoc = ref(null);
const currentPage = ref(1);
const numPages = ref(0);
const zoom = ref(1);
const minZoom = 0.5;
const maxZoom = 2.5;

// Load PDF document
const loadPDF = async () => {
    try {
        loading.value = true;
        error.value = null;

        // Load the PDF
        const loadingTask = pdfjsLib.getDocument(props.resourceUrl);
        pdfDoc.value = await loadingTask.promise;
        numPages.value = pdfDoc.value.numPages;

        // Render first page
        renderPage(1);

        // Emit loaded event
        emit('document-loaded', {
            pages: numPages.value,
            title: await extractDocumentTitle()
        });
    } catch (err) {
        console.error('Error loading PDF:', err);
        error.value = 'Could not load the PDF document. Please check if the file is valid.';
        emit('loading-error', error.value);
    } finally {
        loading.value = false;
    }
};

// Extract document information
const extractDocumentTitle = async () => {
    try {
        if (pdfDoc.value) {
            const metadata = await pdfDoc.value.getMetadata();
            return metadata.info?.Title || 'Untitled Document';
        }
        return 'Untitled Document';
    } catch (err) {
        console.error('Error extracting metadata:', err);
        return 'Untitled Document';
    }
};

// Render a specific page
const renderPage = async (pageNum) => {
    try {
        if (!pdfDoc.value) return;

        const page = await pdfDoc.value.getPage(pageNum);

        // Clear previous content
        if (pdfContainer.value) {
            while (pdfContainer.value.firstChild) {
                pdfContainer.value.removeChild(pdfContainer.value.firstChild);
            }
        }

        // Calculate scale based on container width
        const viewport = page.getViewport({ scale: zoom.value });

        // Prepare canvas for rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page to canvas
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;

        // Add canvas to container
        pdfContainer.value.appendChild(canvas);

        // Update current page
        currentPage.value = pageNum;
        emit('page-change', pageNum);
    } catch (err) {
        console.error('Error rendering page:', err);
        error.value = `Error rendering page ${pageNum}.`;
    }
};

// Navigation functions
const prevPage = () => {
    if (currentPage.value > 1) {
        renderPage(currentPage.value - 1);
    }
};

const nextPage = () => {
    if (currentPage.value < numPages.value) {
        renderPage(currentPage.value + 1);
    }
};

// Zoom functions
const zoomIn = () => {
    if (zoom.value < maxZoom) {
        zoom.value += 0.25;
        renderPage(currentPage.value);
    }
};

const zoomOut = () => {
    if (zoom.value > minZoom) {
        zoom.value -= 0.25;
        renderPage(currentPage.value);
    }
};

// Clean up on component unmount
onBeforeUnmount(() => {
    if (pdfDoc.value) {
        pdfDoc.value.destroy();
    }
});

// Watch for URL changes
watch(
    () => props.resourceUrl,
    () => {
        loadPDF();
    },
    { immediate: false }
);

// Watch for dark mode changes
watch(
    () => props.darkMode,
    () => {
        // We don't need to rerender, CSS will handle the styling
    },
    { immediate: false }
);

// Initialize on mount
onMounted(() => {
    loadPDF();
});
</script>

<style scoped>
.pdf-reader-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.pdf-container {
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    padding: 1rem;
    background-color: #f5f5f5;
}

.pdf-loading,
.pdf-error {
    min-height: 200px;
}

.pdf-controls {
    background-color: white;
    border-top: 1px solid #ddd;
}

.page-info {
    font-size: 0.9rem;
}

/* Dark mode styles */
.dark .pdf-container {
    background-color: #333;
}

.dark .pdf-controls {
    background-color: #262626;
    border-color: #444;
    color: #f0f0f0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .page-info {
        font-size: 0.8rem;
    }

    .pdf-zoom-controls {
        margin: 0 0.5rem;
    }

    .pdf-pagination {
        padding: 0.5rem;
    }
}
</style>
