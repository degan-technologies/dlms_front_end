<template>
    <div class="ebook-reader-wrapper" :class="{ 'dark-theme': darkMode }">
        <div v-if="loading" class="ebook-loading flex align-items-center justify-content-center p-4">
            <ProgressSpinner strokeWidth="4" />
        </div>

        <div v-if="error" class="ebook-error flex flex-column align-items-center justify-content-center p-4">
            <i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mb-2"></i>
            <p class="text-center">{{ error }}</p>
            <Button label="Retry" icon="pi pi-refresh" class="mt-3" @click="loadEbook" />
        </div>

        <div class="ebook-container" ref="ebookContainer" v-show="!loading && !error">
            <div class="ebook-renderer" ref="renditionElement"></div>
        </div>

        <div class="ebook-controls" v-if="!loading && !error">
            <div class="ebook-navigation flex align-items-center justify-content-between p-3 border-top-1 surface-border bg-white">
                <Button icon="pi pi-chevron-left" :disabled="!canNavigatePrevious" @click="previousPage" aria-label="Previous page" />

                <div class="page-progress flex flex-column align-items-center">
                    <span class="page-info">
                        {{ currentLocation || 'Page 1' }}
                    </span>
                    <ProgressBar :value="readingProgress" style="height: 6px; width: 150px" class="mt-2" />
                </div>

                <div class="ebook-font-controls hidden md:flex align-items-center gap-2">
                    <Button icon="pi pi-minus" @click="decreaseFontSize" aria-label="Decrease font size" text />
                    <span class="mx-2 text-sm">Font</span>
                    <Button icon="pi pi-plus" @click="increaseFontSize" aria-label="Increase font size" text />
                </div>

                <Button icon="pi pi-chevron-right" :disabled="!canNavigateNext" @click="nextPage" aria-label="Next page" />
            </div>
        </div>

        <div class="ebook-toc-sidebar" v-if="showToc">
            <div class="toc-header flex align-items-center justify-content-between p-3 border-bottom-1 surface-border">
                <h3 class="m-0">Table of Contents</h3>
                <Button icon="pi pi-times" @click="toggleToc" text />
            </div>
            <div class="toc-content p-3">
                <ul class="toc-list">
                    <li v-for="(item, index) in toc" :key="index" class="mb-2">
                        <a href="#" @click.prevent="navigateToTocItem(item)" class="toc-link">
                            {{ item.label }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Floating TOC button -->
        <Button icon="pi pi-list" class="ebook-toc-button p-button-rounded p-button-secondary" @click="toggleToc" aria-label="Table of Contents" />
    </div>
</template>

<script setup>
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Import ePub reader library - in a real app you would need to install epubjs
// npm install epubjs
// import ePub from 'epubjs';

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

const emit = defineEmits(['page-change', 'loading-error', 'book-loaded']);

// State
const loading = ref(true);
const error = ref(null);
const ebookContainer = ref(null);
const renditionElement = ref(null);
const book = ref(null);
const rendition = ref(null);
const currentLocation = ref('');
const readingProgress = ref(0);
const fontSizeIndex = ref(2); // Default font size index
const fontSizes = ['80%', '90%', '100%', '110%', '120%', '130%'];
const toc = ref([]);
const showToc = ref(false);
const canNavigatePrevious = ref(false);
const canNavigateNext = ref(true);

// Load the ebook
const loadEbook = async () => {
    try {
        loading.value = true;
        error.value = null;

        // In a real implementation, we would use epubjs here:
        // book.value = ePub(props.resourceUrl);

        // For the demo, we'll mock the behavior
        await mockLoadEbook();
    } catch (err) {
        console.error('Error loading ebook:', err);
        error.value = 'Could not load the ebook. Please check if the file is valid.';
        emit('loading-error', error.value);
    } finally {
        loading.value = false;
    }
};

// Mock loading an ebook for demo
const mockLoadEbook = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate book data
            toc.value = [
                { label: 'Cover', href: 'cover.xhtml' },
                { label: 'Chapter 1: Introduction', href: 'ch01.xhtml' },
                { label: 'Chapter 2: Main Content', href: 'ch02.xhtml' },
                { label: 'Chapter 3: Advanced Topics', href: 'ch03.xhtml' },
                { label: 'Chapter 4: Conclusion', href: 'ch04.xhtml' }
            ];

            currentLocation.value = 'Chapter 1';
            readingProgress.value = 5;

            // Normally we would render the book using epubjs
            // rendition.value = book.value.renderTo(renditionElement.value, {
            //   width: '100%',
            //   height: '100%'
            // });
            // rendition.value.display();

            // Instead, we'll just show a placeholder in the renderer element
            if (renditionElement.value) {
                renditionElement.value.innerHTML = `
          <div style="padding: 2rem; text-align: center;">
            <h2>Sample Ebook Content</h2>
            <p>This is a placeholder for the actual ebook content.</p>
            <p>In a real implementation, this would be rendered using epubjs library.</p>
          </div>
        `;
            }

            emit('book-loaded', {
                title: 'Sample Ebook',
                author: 'John Doe',
                totalPages: 120
            });

            resolve();
        }, 1000);
    });
};

// Navigation functions
const nextPage = () => {
    // In a real implementation:
    // rendition.value.next();

    // For the demo:
    readingProgress.value = Math.min(100, readingProgress.value + 10);
    updateNavigationState();
    updateCurrentLocation();

    emit('page-change', Math.floor(readingProgress.value / 10) + 1);
};

const previousPage = () => {
    // In a real implementation:
    // rendition.value.prev();

    // For the demo:
    readingProgress.value = Math.max(0, readingProgress.value - 10);
    updateNavigationState();
    updateCurrentLocation();

    emit('page-change', Math.floor(readingProgress.value / 10) + 1);
};

// Update mock location based on progress
const updateCurrentLocation = () => {
    const progress = readingProgress.value;

    if (progress < 20) {
        currentLocation.value = 'Chapter 1';
    } else if (progress < 40) {
        currentLocation.value = 'Chapter 2';
    } else if (progress < 70) {
        currentLocation.value = 'Chapter 3';
    } else {
        currentLocation.value = 'Chapter 4';
    }
};

// Update navigation buttons state
const updateNavigationState = () => {
    canNavigatePrevious.value = readingProgress.value > 0;
    canNavigateNext.value = readingProgress.value < 100;
};

// Font size controls
const increaseFontSize = () => {
    if (fontSizeIndex.value < fontSizes.length - 1) {
        fontSizeIndex.value++;
        applyFontSize();
    }
};

const decreaseFontSize = () => {
    if (fontSizeIndex.value > 0) {
        fontSizeIndex.value--;
        applyFontSize();
    }
};

const applyFontSize = () => {
    // In a real implementation with epubjs:
    // rendition.value.themes.fontSize(fontSizes[fontSizeIndex.value]);

    // For the demo:
    if (renditionElement.value) {
        renditionElement.value.style.fontSize = fontSizes[fontSizeIndex.value];
    }
};

// TOC functions
const toggleToc = () => {
    showToc.value = !showToc.value;
};

const navigateToTocItem = (item) => {
    // In a real implementation:
    // rendition.value.display(item.href);

    // For the demo:
    console.log('Navigate to:', item.label);
    showToc.value = false;

    // Simulate jumping to different sections
    switch (item.label) {
        case 'Cover':
            readingProgress.value = 0;
            break;
        case 'Chapter 1: Introduction':
            readingProgress.value = 10;
            break;
        case 'Chapter 2: Main Content':
            readingProgress.value = 30;
            break;
        case 'Chapter 3: Advanced Topics':
            readingProgress.value = 60;
            break;
        case 'Chapter 4: Conclusion':
            readingProgress.value = 80;
            break;
    }

    updateNavigationState();
    updateCurrentLocation();
    emit('page-change', Math.floor(readingProgress.value / 10) + 1);
};

// Watch for URL changes
watch(
    () => props.resourceUrl,
    () => {
        loadEbook();
    },
    { immediate: false }
);

// Watch for dark mode changes
watch(
    () => props.darkMode,
    () => {
        // In a real implementation, we would update the theme
        // if (rendition.value) {
        //   rendition.value.themes.register('dark', { body: { color: '#fff', background: '#333' } });
        //   rendition.value.themes.register('light', { body: { color: '#000', background: '#fff' } });
        //   rendition.value.themes.select(props.darkMode ? 'dark' : 'light');
        // }
    },
    { immediate: false }
);

// Initialize on mount
onMounted(() => {
    loadEbook();
});

// Clean up on unmount
onBeforeUnmount(() => {
    // In a real implementation:
    // if (book.value) {
    //   book.value.destroy();
    // }
});
</script>

<style scoped>
.ebook-reader-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
}

.ebook-container {
    flex: 1;
    overflow: auto;
    position: relative;
}

.ebook-renderer {
    min-height: 100%;
    background-color: #fff;
    padding: 1rem;
}

.ebook-loading,
.ebook-error {
    min-height: 200px;
}

.ebook-controls {
    background-color: white;
    border-top: 1px solid #ddd;
}

.ebook-toc-sidebar {
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    max-width: 90vw;
    height: calc(100% - 60px); /* Adjust based on control bar height */
    background-color: white;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 10;
    display: flex;
    flex-direction: column;
}

.toc-content {
    flex: 1;
    overflow-y: auto;
}

.toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.toc-link {
    color: #333;
    text-decoration: none;
    display: block;
    padding: 0.5rem 0;
}

.toc-link:hover {
    color: var(--primary-color);
}

.ebook-toc-button {
    position: absolute;
    bottom: 70px;
    right: 20px;
}

/* Dark theme */
.dark-theme .ebook-renderer {
    background-color: #262626;
    color: #f0f0f0;
}

.dark-theme .ebook-controls,
.dark-theme .ebook-toc-sidebar {
    background-color: #333;
    border-color: #555;
    color: #f0f0f0;
}

.dark-theme .toc-link {
    color: #f0f0f0;
}

.dark-theme .toc-header {
    border-color: #555;
}

/* Responsive styles */
@media (max-width: 640px) {
    .ebook-navigation {
        padding: 0.5rem;
    }

    .page-info {
        font-size: 0.8rem;
    }

    .page-progress {
        margin: 0 0.5rem;
    }
}
</style>
