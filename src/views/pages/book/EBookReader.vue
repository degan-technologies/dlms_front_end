<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const ebookId = ref(route.params.id);
const ebook = ref(null);
const loading = ref(true);
const activeView = ref('pdf'); // 'pdf', 'epub', 'other'
const viewProgress = ref(0); // Track reading progress (0-100%)
const currentPage = ref(1);
const totalPages = ref(0);
const viewerScale = ref(100); // Zoom level percentage
const showControls = ref(true);
const bookmarks = ref([]);
const showNotes = ref(false);
const userNotes = ref([]);
const currentNote = ref('');
const showBookmarks = ref(false);
const showOutline = ref(false);
const darkMode = ref(false);
const fullTextSearchQuery = ref('');
const searchResults = ref([]);
const currentSearchIndex = ref(0);
const isFontMenuOpen = ref(false);
const fontSize = ref(16);
const fontFamily = ref('Arial');
const chaptersOutline = ref([]);
const currentTime = ref(new Date().toLocaleTimeString());
const lastSyncedProgress = ref(0);

// Timer for updating the time
const timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString();
}, 1000);

onUnmounted(() => {
    clearInterval(timeInterval);
});

onMounted(() => {
    loadEbookDetails();
    // Simulate view count increment
    incrementViewCount();
    loadUserPreferences();
    loadUserProgress();
    loadUserBookmarks();
    loadUserNotes();
    loadChaptersOutline();

    // Hide controls when idle
    let idleTimer;
    const resetIdleTimer = () => {
        clearTimeout(idleTimer);
        showControls.value = true;
        idleTimer = setTimeout(() => {
            showControls.value = false;
        }, 3000);
    };

    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);
    resetIdleTimer();

    // Add keyboard shortcuts for navigation
    document.addEventListener('keydown', handleKeyboardNavigation);

    return () => {
        document.removeEventListener('mousemove', resetIdleTimer);
        document.removeEventListener('keydown', resetIdleTimer);
        document.removeEventListener('keydown', handleKeyboardNavigation);
    };
});

// Automatically save progress when user navigates to different pages
watch(currentPage, (newPage) => {
    if (newPage !== lastSyncedProgress.value) {
        saveUserProgress();
        lastSyncedProgress.value = newPage;
    }
});

const handleKeyboardNavigation = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
        prevPage();
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        nextPage();
    } else if (e.key === 'f' || e.key === 'F') {
        toggleFullScreen();
    } else if (e.key === 'b' || e.key === 'B') {
        toggleBookmark();
    } else if (e.key === 'n' || e.key === 'N') {
        showNotes.value = !showNotes.value;
    } else if (e.key === '+') {
        zoomIn();
    } else if (e.key === '-') {
        zoomOut();
    } else if (e.key === 'd' || e.key === 'D') {
        darkMode.value = !darkMode.value;
        applyDarkMode();
    }
};

const loadEbookDetails = async () => {
    loading.value = true;

    try {
        // Simulate API call to fetch e-book details
        setTimeout(() => {
            ebook.value = {
                id: ebookId.value,
                title: 'Digital Design Principles',
                author: 'Dr. Elizabeth Chen',
                isbn: '9781234567890',
                publication_year: 2023,
                cover_image_url: '/demo/images/product/product-placeholder.svg',
                description: 'A comprehensive guide to modern digital design principles and practices. This book covers everything from basic concepts to advanced techniques.',
                category: { name: 'Technology' },
                publisher: { name: 'Digital Education Group' },
                file_format: 'PDF',
                file_size_mb: 12.5,
                pages: 450,
                file_url: '/demo/data/sample.pdf',
                is_downloadable: true,
                requires_authentication: true,
                download_count: 156,
                view_count: 432
            };

            totalPages.value = ebook.value.pages || 1;

            // Set appropriate view type based on file format
            if (ebook.value.file_format === 'PDF') {
                activeView.value = 'pdf';
            } else if (['EPUB', 'MOBI', 'AZW'].includes(ebook.value.file_format)) {
                activeView.value = 'epub';
            } else {
                activeView.value = 'other';
            }

            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('Failed to load e-book:', error);
        loading.value = false;
    }
};

const incrementViewCount = async () => {
    // In a real app, this would be an API call
    // await fetch(`/api/books/ebooks/${ebookId.value}/view`, { method: 'POST' });
    console.log('View count incremented');
};

const updateProgress = (newPage) => {
    currentPage.value = newPage;
    viewProgress.value = Math.round((currentPage.value / totalPages.value) * 100);

    // In a real app, save reading progress to backend
    // await fetch(`/api/books/ebooks/${ebookId.value}/progress`, {
    //    method: 'POST',
    //    headers: { 'Content-Type': 'application/json' },
    //    body: JSON.stringify({ page: currentPage.value, progress: viewProgress.value })
    // });
};

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        updateProgress(page);
        // In a real app, this would control the PDF viewer
    }
};

const nextPage = () => goToPage(currentPage.value + 1);
const prevPage = () => goToPage(currentPage.value - 1);

const zoomIn = () => {
    if (viewerScale.value < 200) {
        viewerScale.value += 25;
        applyZoom();
    }
};

const zoomOut = () => {
    if (viewerScale.value > 50) {
        viewerScale.value -= 25;
        applyZoom();
    }
};

const applyZoom = () => {
    // In a real app, this would control the PDF viewer zoom level
    console.log(`Zoom set to ${viewerScale.value}%`);
};

const downloadEbook = async () => {
    if (!ebook.value || !ebook.value.is_downloadable) {
        return;
    }

    // In a real app, this would be an API call
    // const response = await fetch(`/api/books/ebooks/${ebookId.value}/download`);
    // const blob = await response.blob();
    // const url = window.URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.style.display = 'none';
    // a.href = url;
    // a.download = `${ebook.value.title}.${ebook.value.file_format.toLowerCase()}`;
    // document.body.appendChild(a);
    // a.click();
    // window.URL.revokeObjectURL(url);

    // Update download count locally
    ebook.value.download_count++;
    console.log(`Download count incremented: ${ebook.value.download_count}`);
};

const returnToDetails = () => {
    router.push(`/books/ebooks/${ebookId.value}`);
};

const toggleFullScreen = () => {
    const docElement = document.documentElement;

    if (!document.fullscreenElement) {
        if (docElement.requestFullscreen) {
            docElement.requestFullscreen();
        } else if (docElement.mozRequestFullScreen) {
            // Firefox
            docElement.mozRequestFullScreen();
        } else if (docElement.webkitRequestFullscreen) {
            // Chrome, Safari and Opera
            docElement.webkitRequestFullscreen();
        } else if (docElement.msRequestFullscreen) {
            // IE/Edge
            docElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
};

// New functionality for bookmarks
const isCurrentPageBookmarked = computed(() => {
    return bookmarks.value.some((b) => b.page === currentPage.value);
});

const toggleBookmark = () => {
    if (isCurrentPageBookmarked.value) {
        bookmarks.value = bookmarks.value.filter((b) => b.page !== currentPage.value);
    } else {
        bookmarks.value.push({
            page: currentPage.value,
            timestamp: new Date().toISOString(),
            pageTitle: `Page ${currentPage.value}`,
            preview: `Preview of content on page ${currentPage.value}...`
        });
    }
    saveUserBookmarks();
};

const goToBookmark = (page) => {
    goToPage(page);
    showBookmarks.value = false;
};

// Notes functionality
const addNote = () => {
    if (currentNote.value.trim()) {
        userNotes.value.push({
            id: Date.now(),
            page: currentPage.value,
            content: currentNote.value,
            timestamp: new Date().toISOString()
        });
        currentNote.value = '';
        saveUserNotes();
    }
};

const deleteNote = (noteId) => {
    userNotes.value = userNotes.value.filter((note) => note.id !== noteId);
    saveUserNotes();
};

// Get notes for the current page
const currentPageNotes = computed(() => {
    return userNotes.value.filter((note) => note.page === currentPage.value);
});

// Function to toggle dark mode
const applyDarkMode = () => {
    if (darkMode.value) {
        document.querySelector('.e-reader-container').classList.add('dark-mode');
    } else {
        document.querySelector('.e-reader-container').classList.remove('dark-mode');
    }
    saveUserPreferences();
};

// Search functionality
const performSearch = () => {
    if (!fullTextSearchQuery.value.trim()) return;

    // In a real implementation, this would search within the actual document
    // For this mock, we'll just generate fake results
    searchResults.value = [
        { page: 10, snippet: `...contains "${fullTextSearchQuery.value}" in chapter 1...` },
        { page: 42, snippet: `...mentions "${fullTextSearchQuery.value}" in discussion of key concepts...` },
        { page: 78, snippet: `...explains "${fullTextSearchQuery.value}" in detail with examples...` },
        { page: 103, snippet: `...references "${fullTextSearchQuery.value}" in the context of applications...` }
    ];
    currentSearchIndex.value = 0;
};

const goToSearchResult = (page) => {
    goToPage(page);
};

const nextSearchResult = () => {
    if (searchResults.value.length === 0) return;
    currentSearchIndex.value = (currentSearchIndex.value + 1) % searchResults.value.length;
    goToPage(searchResults.value[currentSearchIndex.value].page);
};

const previousSearchResult = () => {
    if (searchResults.value.length === 0) return;
    currentSearchIndex.value = (currentSearchIndex.value - 1 + searchResults.value.length) % searchResults.value.length;
    goToPage(searchResults.value[currentSearchIndex.value].page);
};

// Font settings
const changeFontSize = (size) => {
    fontSize.value = size;
    applyFontSettings();
};

const changeFontFamily = (font) => {
    fontFamily.value = font;
    applyFontSettings();
};

const applyFontSettings = () => {
    // In a real implementation, this would apply to the actual document viewer
    console.log(`Font changed to ${fontSize.value}px ${fontFamily.value}`);
    saveUserPreferences();
};

// Load and save user preferences
const loadUserPreferences = () => {
    try {
        const preferences = JSON.parse(localStorage.getItem(`ebook-prefs-${ebookId.value}`)) || {};
        darkMode.value = preferences.darkMode || false;
        fontSize.value = preferences.fontSize || 16;
        fontFamily.value = preferences.fontFamily || 'Arial';

        // Apply loaded preferences
        setTimeout(() => {
            applyDarkMode();
            applyFontSettings();
        }, 100);
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
};

const saveUserPreferences = () => {
    try {
        localStorage.setItem(
            `ebook-prefs-${ebookId.value}`,
            JSON.stringify({
                darkMode: darkMode.value,
                fontSize: fontSize.value,
                fontFamily: fontFamily.value
            })
        );
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
};

const loadUserProgress = () => {
    try {
        const progress = JSON.parse(localStorage.getItem(`ebook-progress-${ebookId.value}`)) || {};
        if (progress.page) {
            currentPage.value = progress.page;
            lastSyncedProgress.value = progress.page;
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
};

const saveUserProgress = () => {
    try {
        localStorage.setItem(
            `ebook-progress-${ebookId.value}`,
            JSON.stringify({
                page: currentPage.value,
                percentage: viewProgress.value
            })
        );
    } catch (error) {
        console.error('Error saving progress:', error);
    }
};

const loadUserBookmarks = () => {
    try {
        bookmarks.value = JSON.parse(localStorage.getItem(`ebook-bookmarks-${ebookId.value}`)) || [];
    } catch (error) {
        console.error('Error loading bookmarks:', error);
    }
};

const saveUserBookmarks = () => {
    try {
        localStorage.setItem(`ebook-bookmarks-${ebookId.value}`, JSON.stringify(bookmarks.value));
    } catch (error) {
        console.error('Error saving bookmarks:', error);
    }
};

const loadUserNotes = () => {
    try {
        userNotes.value = JSON.parse(localStorage.getItem(`ebook-notes-${ebookId.value}`)) || [];
    } catch (error) {
        console.error('Error loading notes:', error);
    }
};

const saveUserNotes = () => {
    try {
        localStorage.setItem(`ebook-notes-${ebookId.value}`, JSON.stringify(userNotes.value));
    } catch (error) {
        console.error('Error saving notes:', error);
    }
};

const loadChaptersOutline = () => {
    // In a real app, this would be loaded from the document's structure
    chaptersOutline.value = [
        { id: 1, title: 'Introduction', page: 1 },
        { id: 2, title: 'Chapter 1: Basic Concepts', page: 10 },
        { id: 3, title: 'Chapter 2: Design Principles', page: 45 },
        { id: 4, title: 'Chapter 3: Implementation', page: 87 },
        { id: 5, title: 'Chapter 4: Advanced Techniques', page: 120 },
        { id: 6, title: 'Chapter 5: Case Studies', page: 156 },
        { id: 7, title: 'Chapter 6: Future Directions', page: 198 },
        { id: 8, title: 'Appendix A: Resources', page: 240 },
        { id: 9, title: 'Index', page: 260 }
    ];
};

const goToChapter = (page) => {
    goToPage(page);
    showOutline.value = false;
};
</script>

<template>
    <div class="e-reader-container" :class="{ 'dark-mode': darkMode }">
        <!-- Loading spinner -->
        <div v-if="loading" class="e-reader-loading flex align-items-center justify-content-center">
            <ProgressSpinner />
        </div>

        <!-- E-book viewer -->
        <div v-else class="e-reader-view">
            <!-- Top controls bar (visible on hover or when controls are active) -->
            <div class="e-reader-top-controls" :class="{ visible: showControls }">
                <div class="flex justify-content-between align-items-center p-3">
                    <div class="left-controls flex align-items-center">
                        <Button icon="pi pi-arrow-left" class="p-button-text p-button-rounded" @click="returnToDetails" tooltip="Back to Details" tooltipOptions="{ position: 'bottom' }" />
                        <span class="ml-2 font-bold">{{ ebook.title }}</span>
                    </div>

                    <div class="middle-controls hidden md:flex">
                        <span class="text-sm">{{ currentTime }}</span>
                    </div>

                    <div class="right-controls flex align-items-center">
                        <Button
                            icon="pi pi-search"
                            class="p-button-text p-button-rounded mr-2"
                            @click="
                                showOutline = false;
                                showBookmarks = false;
                                showNotes = false;
                                fullTextSearchQuery = '';
                            "
                            tooltip="Search"
                            tooltipOptions="{ position: 'bottom' }"
                        />
                        <Button
                            icon="pi pi-list"
                            class="p-button-text p-button-rounded mr-2"
                            :class="{ 'p-button-outlined': showOutline }"
                            @click="
                                showOutline = !showOutline;
                                showBookmarks = false;
                                showNotes = false;
                            "
                            tooltip="Contents"
                            tooltipOptions="{ position: 'bottom' }"
                        />
                        <Button
                            icon="pi pi-bookmark"
                            class="p-button-text p-button-rounded mr-2"
                            :class="{ 'p-button-outlined': showBookmarks }"
                            @click="
                                showBookmarks = !showBookmarks;
                                showOutline = false;
                                showNotes = false;
                            "
                            tooltip="Bookmarks"
                            tooltipOptions="{ position: 'bottom' }"
                        />
                        <Button
                            icon="pi pi-pencil"
                            class="p-button-text p-button-rounded mr-2"
                            :class="{ 'p-button-outlined': showNotes }"
                            @click="
                                showNotes = !showNotes;
                                showOutline = false;
                                showBookmarks = false;
                            "
                            tooltip="Notes"
                            tooltipOptions="{ position: 'bottom' }"
                        />
                        <Button
                            icon="pi pi-moon"
                            v-if="!darkMode"
                            class="p-button-text p-button-rounded mr-2"
                            @click="
                                darkMode = true;
                                applyDarkMode();
                            "
                            tooltip="Dark Mode"
                            tooltipOptions="{ position: 'bottom' }"
                        />
                        <Button
                            icon="pi pi-sun"
                            v-else
                            class="p-button-text p-button-rounded mr-2"
                            @click="
                                darkMode = false;
                                applyDarkMode();
                            "
                            tooltip="Light Mode"
                            tooltipOptions="{ position: 'bottom' }"
                        />
                        <Button icon="pi pi-cog" class="p-button-text p-button-rounded mr-2" @click="isFontMenuOpen = !isFontMenuOpen" tooltip="Settings" tooltipOptions="{ position: 'bottom' }" />
                        <Button v-if="ebook.is_downloadable" icon="pi pi-download" class="p-button-text p-button-rounded mr-2" @click="downloadEbook" tooltip="Download" tooltipOptions="{ position: 'bottom' }" />
                        <Button icon="pi pi-arrows-alt" class="p-button-text p-button-rounded" @click="toggleFullScreen" tooltip="Fullscreen" tooltipOptions="{ position: 'bottom' }" />
                    </div>
                </div>

                <!-- Search panel -->
                <div v-if="fullTextSearchQuery" class="search-panel p-3 border-top-1 surface-border">
                    <div class="p-inputgroup">
                        <InputText v-model="fullTextSearchQuery" placeholder="Search in book..." @keyup.enter="performSearch" />
                        <Button icon="pi pi-search" @click="performSearch" />
                    </div>
                    <div v-if="searchResults.length > 0" class="mt-2">
                        <div class="flex justify-content-between align-items-center mb-2">
                            <small>{{ searchResults.length }} results found</small>
                            <div>
                                <Button icon="pi pi-chevron-left" class="p-button-sm p-button-text" @click="previousSearchResult" />
                                <Button icon="pi pi-chevron-right" class="p-button-sm p-button-text" @click="nextSearchResult" />
                            </div>
                        </div>
                        <ul class="search-results-list p-0 m-0">
                            <li v-for="(result, index) in searchResults" :key="index" class="p-2 cursor-pointer hover:surface-200" :class="{ 'surface-hover': index === currentSearchIndex }" @click="goToSearchResult(result.page)">
                                <div class="flex align-items-center">
                                    <Badge :value="result.page" severity="info" class="mr-2" />
                                    <span v-html="result.snippet"></span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Font settings menu -->
                <div v-if="isFontMenuOpen" class="font-settings-panel p-3 border-top-1 surface-border">
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <h6 class="mt-0">Font Size</h6>
                            <div class="flex align-items-center">
                                <Button icon="pi pi-minus" class="p-button-sm p-button-text" @click="changeFontSize(Math.max(fontSize - 2, 12))" />
                                <span class="mx-2">{{ fontSize }}px</span>
                                <Button icon="pi pi-plus" class="p-button-sm p-button-text" @click="changeFontSize(Math.min(fontSize + 2, 24))" />
                            </div>
                        </div>
                        <div class="col-12 md:col-6">
                            <h6 class="mt-0">Font Family</h6>
                            <div class="p-field">
                                <Dropdown v-model="fontFamily" :options="['Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Courier New']" @change="applyFontSettings" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Side panel for outline, bookmarks, notes -->
            <div class="e-reader-side-panel" :class="{ visible: showOutline || showBookmarks || showNotes }">
                <div v-if="showOutline" class="p-3">
                    <h5>Table of Contents</h5>
                    <ul class="outline-list p-0">
                        <li v-for="chapter in chaptersOutline" :key="chapter.id" class="p-2 cursor-pointer hover:surface-hover" :class="{ 'surface-200': chapter.page === currentPage }" @click="goToChapter(chapter.page)">
                            {{ chapter.title }}
                        </li>
                    </ul>
                </div>

                <div v-if="showBookmarks" class="p-3">
                    <h5>Bookmarks</h5>
                    <div v-if="bookmarks.length === 0" class="p-3 text-center text-500">No bookmarks yet. Press B or click the bookmark icon while reading to add one.</div>
                    <ul v-else class="bookmarks-list p-0">
                        <li v-for="bookmark in bookmarks" :key="bookmark.page" class="p-2 cursor-pointer hover:surface-hover" :class="{ 'surface-200': bookmark.page === currentPage }">
                            <div class="flex justify-content-between align-items-center" @click="goToBookmark(bookmark.page)">
                                <div>
                                    <div>{{ bookmark.pageTitle }}</div>
                                    <small class="text-500">{{ bookmark.preview }}</small>
                                </div>
                                <Button
                                    icon="pi pi-trash"
                                    class="p-button-text p-button-rounded p-button-sm"
                                    @click.stop="
                                        bookmarks = bookmarks.filter((b) => b.page !== bookmark.page);
                                        saveUserBookmarks();
                                    "
                                />
                            </div>
                        </li>
                    </ul>
                </div>

                <div v-if="showNotes" class="p-3">
                    <h5>Notes for Page {{ currentPage }}</h5>
                    <div class="mb-3">
                        <Textarea v-model="currentNote" rows="3" placeholder="Add a note for this page..." class="w-full" />
                        <Button label="Add Note" icon="pi pi-plus" @click="addNote" class="mt-2" />
                    </div>

                    <div v-if="currentPageNotes.length === 0" class="p-3 text-center text-500">No notes for this page yet.</div>
                    <ul v-else class="notes-list p-0">
                        <li v-for="note in currentPageNotes" :key="note.id" class="p-2 mb-2 surface-card border-round">
                            <div class="flex justify-content-between align-items-start">
                                <div class="flex-grow-1">
                                    <p class="m-0">{{ note.content }}</p>
                                    <small class="text-500">{{ new Date(note.timestamp).toLocaleString() }}</small>
                                </div>
                                <Button icon="pi pi-trash" class="p-button-text p-button-rounded p-button-sm" @click="deleteNote(note.id)" />
                            </div>
                        </li>
                    </ul>

                    <h6 class="mt-4">All Notes</h6>
                    <ul class="all-notes-list p-0">
                        <li v-for="note in userNotes" :key="note.id" class="p-2 cursor-pointer hover:surface-hover mb-1" :class="{ 'surface-200': note.page === currentPage }" @click="goToPage(note.page)">
                            <div class="flex justify-content-between align-items-start">
                                <div>
                                    <div class="flex align-items-center">
                                        <Badge :value="`P${note.page}`" severity="info" class="mr-2" />
                                        <span>{{ note.content.length > 30 ? note.content.substring(0, 30) + '...' : note.content }}</span>
                                    </div>
                                    <small class="text-500">{{ new Date(note.timestamp).toLocaleString() }}</small>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Main content -->
            <div class="e-reader-content" :class="{ 'with-side-panel': showOutline || showBookmarks || showNotes }">
                <!-- PDF Viewer (mock) -->
                <div v-if="activeView === 'pdf'" class="pdf-viewer">
                    <div class="pdf-mock-page flex align-items-center justify-content-center" :style="{ fontSize: `${fontSize}px`, fontFamily }">
                        <div class="text-center">
                            <i class="pi pi-file-pdf text-4xl"></i>
                            <h3>PDF Viewer</h3>
                            <p>Page {{ currentPage }} of {{ totalPages }}</p>
                            <p class="mt-3 text-500">In a real application, an actual PDF viewer would be integrated here.</p>
                            <p class="mt-2 text-500">(using pdf.js or a similar library)</p>
                            <div class="mt-4">
                                <Button icon="pi pi-bookmark" :class="isCurrentPageBookmarked ? 'p-button-success' : 'p-button-outlined'" label="Bookmark" @click="toggleBookmark()" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- EPUB Viewer (mock) -->
                <div v-else-if="activeView === 'epub'" class="epub-viewer">
                    <div class="epub-mock-page flex align-items-center justify-content-center" :style="{ fontSize: `${fontSize}px`, fontFamily }">
                        <div class="text-center">
                            <i class="pi pi-book text-4xl"></i>
                            <h3>EPUB Viewer</h3>
                            <p>Page {{ currentPage }} of {{ totalPages }}</p>
                            <p class="mt-3 text-500">In a real application, an EPUB reader would be integrated here.</p>
                            <p class="mt-2 text-500">(using libraries like epub.js)</p>
                            <div class="mt-4">
                                <Button icon="pi pi-bookmark" :class="isCurrentPageBookmarked ? 'p-button-success' : 'p-button-outlined'" label="Bookmark" @click="toggleBookmark()" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Other format viewer -->
                <div v-else class="other-viewer">
                    <div class="other-mock-page flex align-items-center justify-content-center">
                        <div class="text-center">
                            <i class="pi pi-file text-4xl"></i>
                            <h3>File Format Not Directly Viewable</h3>
                            <p>This {{ ebook.file_format }} file requires download to view.</p>
                            <Button v-if="ebook.is_downloadable" icon="pi pi-download" label="Download File" class="mt-3" @click="downloadEbook" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom controls bar -->
            <div class="e-reader-bottom-controls" :class="{ visible: showControls }">
                <div class="flex justify-content-between align-items-center p-3">
                    <div class="zoom-controls hidden sm:flex">
                        <Button icon="pi pi-minus" class="p-button-text p-button-rounded" @click="zoomOut" />
                        <span class="mx-2">{{ viewerScale }}%</span>
                        <Button icon="pi pi-plus" class="p-button-text p-button-rounded" @click="zoomIn" />
                    </div>

                    <div class="page-controls flex align-items-center">
                        <Button icon="pi pi-angle-left" class="p-button-text p-button-rounded" :disabled="currentPage <= 1" @click="prevPage" />
                        <InputNumber v-model="currentPage" :min="1" :max="totalPages" class="mx-2 w-5rem" @update:modelValue="goToPage" />
                        <span>of {{ totalPages }}</span>
                        <Button icon="pi pi-angle-right" class="p-button-text p-button-rounded ml-2" :disabled="currentPage >= totalPages" @click="nextPage" />
                    </div>

                    <div class="progress-indicator hidden sm:block">
                        <ProgressBar :value="viewProgress" :showValue="true" style="width: 100px" />
                    </div>
                </div>

                <!-- Mobile controls - only visible on small screens -->
                <div class="mobile-controls flex justify-content-between align-items-center p-2 sm:hidden border-top-1 surface-border">
                    <Button icon="pi pi-search" class="p-button-text p-button-sm" @click="fullTextSearchQuery = ''" />
                    <Button
                        icon="pi pi-list"
                        class="p-button-text p-button-sm"
                        :class="{ 'p-button-outlined': showOutline }"
                        @click="
                            showOutline = !showOutline;
                            showBookmarks = false;
                            showNotes = false;
                        "
                    />
                    <Button
                        icon="pi pi-bookmark"
                        class="p-button-text p-button-sm"
                        :class="{ 'p-button-outlined': showBookmarks }"
                        @click="
                            showBookmarks = !showBookmarks;
                            showOutline = false;
                            showNotes = false;
                        "
                    />
                    <Button
                        icon="pi pi-pencil"
                        class="p-button-text p-button-sm"
                        :class="{ 'p-button-outlined': showNotes }"
                        @click="
                            showNotes = !showNotes;
                            showOutline = false;
                            showBookmarks = false;
                        "
                    />
                    <Button
                        :icon="darkMode ? 'pi pi-sun' : 'pi pi-moon'"
                        class="p-button-text p-button-sm"
                        @click="
                            darkMode = !darkMode;
                            applyDarkMode();
                        "
                    />
                    <Button icon="pi pi-download" v-if="ebook.is_downloadable" class="p-button-text p-button-sm" @click="downloadEbook" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.e-reader-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f8f9fa; /* Light background for the reader */
    overflow: hidden;
    color: #212529;
}

.e-reader-container.dark-mode {
    background: #121212;
    color: #e0e0e0;
}

.dark-mode .e-reader-top-controls,
.dark-mode .e-reader-bottom-controls,
.dark-mode .e-reader-side-panel {
    background-color: rgba(33, 33, 33, 0.95);
    color: #e0e0e0;
    border-color: #444 !important;
}

.dark-mode .search-panel,
.dark-mode .font-settings-panel {
    border-color: #444 !important;
}

.dark-mode .pdf-mock-page,
.dark-mode .epub-mock-page,
.dark-mode .other-mock-page {
    background-color: #1e1e1e;
    color: #e0e0e0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
}

.e-reader-loading {
    height: 100%;
    width: 100%;
}

.e-reader-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
}

.e-reader-content {
    flex: 1;
    overflow: auto;
    background-color: #e9ecef;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: margin-left 0.3s;
}

.dark-mode .e-reader-content {
    background-color: #1a1a1a;
}

.e-reader-content.with-side-panel {
    margin-left: 300px;
}

.e-reader-top-controls,
.e-reader-bottom-controls {
    background-color: rgba(255, 255, 255, 0.95);
    transition:
        opacity 0.3s,
        transform 0.3s;
    opacity: 0;
    z-index: 10;
}

.e-reader-top-controls {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    border-bottom: 1px solid #dee2e6;
    transform: translateY(-100%);
}

.e-reader-bottom-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #dee2e6;
    transform: translateY(100%);
}

.e-reader-top-controls.visible,
.e-reader-bottom-controls.visible {
    opacity: 1;
    transform: translateY(0);
}

.e-reader-side-panel {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    background-color: rgba(255, 255, 255, 0.95);
    border-right: 1px solid #dee2e6;
    transform: translateX(-100%);
    transition: transform 0.3s;
    overflow-y: auto;
    z-index: 9;
}

.e-reader-side-panel.visible {
    transform: translateX(0);
}

.pdf-viewer,
.epub-viewer,
.other-viewer {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.pdf-mock-page,
.epub-mock-page,
.other-mock-page {
    width: 80%;
    height: 90%;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    overflow: auto;
}

/* Simulate book content */
.pdf-mock-page,
.epub-mock-page {
    padding: 40px;
    line-height: 1.8;
}

.outline-list li,
.bookmarks-list li,
.notes-list li,
.all-notes-list li,
.search-results-list li {
    list-style: none;
    border-radius: 4px;
    transition: background-color 0.2s;
}

@media (max-width: 768px) {
    .pdf-mock-page,
    .epub-mock-page {
        width: 95%;
        height: 95%;
        padding: 20px;
    }

    .e-reader-content.with-side-panel {
        margin-left: 0;
    }

    .e-reader-side-panel {
        width: 80%;
        z-index: 11;
    }

    .e-reader-bottom-controls .progress-indicator {
        display: none;
    }
}
</style>
