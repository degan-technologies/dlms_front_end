<script setup>
import { VPdfViewer } from '@vue-pdf-viewer/viewer';
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const asset = ref(null);
const loading = ref(true);
const assetId = route.params.id;
const showMediaPlayer = ref(false);
const showPdfViewer = ref(false);
const pdfViewerScale = ref(1);
const pdfCurrentPage = ref(1);
const pdfTotalPages = ref(0);
const videoVolume = ref(50);
const isMuted = ref(false);
const fullScreen = ref(false);
const playing = ref(true); // Changed to true for better UX
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);
const annotationMode = ref(false);
const annotations = ref([]);
const showAnnotations = ref(true);
const bookmarkedPages = ref([]);
const bookmarkDialogVisible = ref(false);
const bookmarkNote = ref('');
const youtubePlayerOptions = ref({
    quality: 'auto',
    autoplay: 1,
    related: 0, // Don't show related videos
    modestbranding: 1 // Hide YouTube logo
});

// New PDF reader enhancements
const isFullScreenPdf = ref(false);
const searchText = ref('');
const searchResults = ref([]);
const currentSearchIndex = ref(0);
const showSearchPanel = ref(false);
const showStudyTools = ref(false);
const showAnnotationPanel = ref(false);
const textHighlights = ref([]);
const notes = ref([]);
const studyMode = ref(false);
const pageLayout = ref('single'); // single, double, continuous
const pdfRotation = ref(0);
const darkMode = ref(false);
const textSelection = ref(null);
const searchInProgress = ref(false);
const pdfElementRef = ref(null);

// PDF.js integration references
const pdfDocument = shallowRef(null);
const pdfInstance = shallowRef(null);
const pdfPageInstance = shallowRef(null);
const pdfCanvas = ref(null);
const pdfCanvasContext = ref(null);
const pdfLoading = ref(false);
const pdfLoadingError = ref(false);
const pdfScriptLoaded = ref(false);

// Study tools
const studyNotes = ref([]);
const currentStudyNote = ref('');
const showNotesPanel = ref(false);
const studyTimer = ref(0);
const studyTimerActive = ref(false);
const studyTimerInterval = ref(null);
const readingSpeed = ref('medium'); // slow, medium, fast

// Microsoft Word-style ribbon interface
const activeTab = ref('home');
const tabOptions = [
    { name: 'home', label: 'Home', icon: 'pi pi-home' },
    { name: 'view', label: 'View', icon: 'pi pi-eye' },
    { name: 'study', label: 'Study', icon: 'pi pi-book' },
    { name: 'tools', label: 'Tools', icon: 'pi pi-cog' }
];

// Advanced annotation tools
const drawingMode = ref(false);
const drawingTool = ref('pen'); // pen, highlighter, eraser
const drawingColor = ref('#ff0000'); // red
const drawingThickness = ref(2);
const drawingAnnotations = ref([]);

// Text formatting tools
const fontFamily = ref('Arial');
const fontSize = ref('12pt');
const textColor = ref('#000000');
const textHighlightColor = ref('#ffff00');
const fontStyles = ref({ bold: false, italic: false, underline: false });

// Table tools
const tableDialogVisible = ref(false);
const tableRows = ref(3);
const tableColumns = ref(3);
const tables = ref([]);

// View settings
const viewMode = ref('page'); // page, continuous, two-page
const zoomPresets = [50, 75, 100, 125, 150, 200, 300, 400];
const zoomLevel = ref(100);
const showRulers = ref(false);
const showGridlines = ref(false);
const showOutline = ref(false);
const showThumbnails = ref(false);

// Comment system
const comments = ref([]);
const newComment = ref('');
const commentDialogVisible = ref(false);
const selectedTextForComment = ref('');
const replyingToCommentId = ref(null);

// Dictionary & terminology tools
const dictionaryDialogVisible = ref(false);
const selectedWordForLookup = ref('');
const dictionaryResults = ref(null);
const isSearchingDictionary = ref(false);

// Study aids
const flashcards = ref([]);
const newFlashcard = ref({ question: '', answer: '' });
const flashcardDialogVisible = ref(false);
const showingFlashcards = ref(false);
const currentFlashcardIndex = ref(0);
const showingFlashcardAnswer = ref(false);
const quickNoteDialogVisible = ref(false);
const quickNoteText = ref('');

onMounted(() => {
    fetchAssetDetails();

    // Set up event listener for fullscreen change
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Initialize study timer if in study mode
    if (studyMode.value) {
        startStudyTimer();
    }
});

// Watch for asset loading completion to check if we need to open specific viewer
watch(
    asset,
    (newValue) => {
        if (!newValue) return;

        // Get stored viewer type from session storage
        const shouldOpenPdfViewer = sessionStorage.getItem('openPdfViewer') === 'true';
        const shouldOpenVideoPlayer = sessionStorage.getItem('openVideoPlayer') === 'true';
        const assetType = sessionStorage.getItem('assetType');

        // Clear session storage flags
        sessionStorage.removeItem('openPdfViewer');
        sessionStorage.removeItem('openVideoPlayer');
        sessionStorage.removeItem('assetType');

        // Determine which viewer to open based on asset type and session flags
        if (
            (shouldOpenPdfViewer && isPdf.value) ||
            (assetType === 'pdf' &&
                (newValue.media_type === 'pdf' ||
                    newValue.asset_type === 'worksheet' ||
                    newValue.asset_type === 'research_paper' ||
                    newValue.asset_type === 'presentation'))
        ) {
            showPdfViewer.value = true;
            showMediaPlayer.value = false;
            asset.value.view_count++;
            // We'll initialize the PDF viewer in the next tick after the UI has updated
            setTimeout(() => {
                initPdfViewer();
            }, 100);
        } else if (
            (shouldOpenVideoPlayer && isYouTube.value) ||
            (assetType === 'video' &&
                (newValue.media_type === 'mp4' || newValue.asset_type === 'video'))
        ) {
            showMediaPlayer.value = true;
            showPdfViewer.value = false;
            asset.value.view_count++;
        }
    },
    { immediate: true }
);

// Clean up event listeners when component is unmounted
onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);

    if (studyTimerInterval.value) {
        clearInterval(studyTimerInterval.value);
    }
});

const fetchAssetDetails = async () => {
    try {
        setTimeout(() => {
            asset.value = {
                id: parseInt(assetId),
                title: 'Introduction to Programming',
                author: 'Prof. John Smith',
                publication_year: 2022,
                category: { id: 1, name: 'Computer Science' },
                publisher: { id: 1, name: 'Educational Media Inc.' },
                availability_status: 'available',
                cover_image_url:
                    'https://via.placeholder.com/800x1200.png?text=Introduction+to+Programming', // Fixed image URL
                description:
                    'A comprehensive video course introducing programming concepts for beginners.',
                asset_type: 'video',
                source_type: 'youtube',
                media_url: 'https://www.youtube.com/embed/zOjov-2OZ0E',
                media_type: 'mp4',
                unique_id: 'VID-2022-001',
                duration_minutes: 120,
                manufacturer: 'EdTech Productions',
                physical_condition: 'Excellent',
                location_details: 'Digital Media Section, Server 2',
                acquisition_date: '2022-06-15',
                usage_instructions:
                    "Video can be streamed directly from the library's digital platform. Requires a modern web browser with HTML5 support.",
                restricted_access: false,
                language: 'en',
                library_branch: { id: 1, name: 'Main Branch' },
                shelf: { id: 1, name: 'Digital Media Section' },
                view_count: 35,
                download_count: 12,
                file_size_mb: 450,
                isbn: '9781234567890',
                shelf_id: 'DIG-V001'
            };

            if (parseInt(assetId) % 2 === 0) {
                asset.value = {
                    ...asset.value,
                    title: 'Advanced Python Programming Handbook',
                    author: 'Dr. Emily Richards',
                    asset_type: 'worksheet',
                    source_type: 'pdf',
                    media_url:
                        'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf', // Fixed PDF URL
                    media_type: 'pdf',
                    cover_image_url:
                        'https://via.placeholder.com/800x1200.png?text=Python+Programming+Handbook', // Fixed image URL
                    description:
                        'A comprehensive guide to advanced Python programming techniques including design patterns, optimization and more.',
                    isbn: '9780987654321',
                    shelf_id: 'DIG-P025'
                };
            }

            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('Failed to fetch asset details:', error);
        loading.value = false;
    }
};

const isPdf = computed(() => {
    return asset.value?.source_type === 'pdf' || asset.value?.media_type === 'pdf';
});

const isYouTube = computed(() => {
    return asset.value?.source_type === 'youtube';
});

const isHostedVideo = computed(() => {
    return asset.value?.asset_type === 'video' && !isYouTube.value;
});

const youtubeEmbedUrl = computed(() => {
    if (!isYouTube.value || !asset.value?.media_url) return '';

    let videoId = '';
    const url = asset.value.media_url;

    if (url.includes('embed/')) {
        videoId = url.split('embed/')[1].split('?')[0];
    } else if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else {
        videoId = url;
    }

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&fs=1&color=white`;
});

const editAsset = () => {
    router.push(`/books/assets/edit/${assetId}`);
};

const downloadAsset = async () => {
    alert(`Downloading ${asset.value.title}.${asset.value.media_type}`);
    asset.value.download_count++;
};

const toggleMediaPlayer = () => {
    if (isPdf.value) {
        showPdfViewer.value = !showPdfViewer.value;
        if (showPdfViewer.value) {
            asset.value.view_count++;
            initPdfViewer();
        }
    } else {
        showMediaPlayer.value = !showMediaPlayer.value;
        if (showMediaPlayer.value) {
            asset.value.view_count++;
            playing.value = true;
        } else {
            playing.value = false;
        }
    }
};

const formatFileSize = (sizeInMB) => {
    if (sizeInMB < 1) {
        return `${Math.round(sizeInMB * 1024)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
};

const getAssetIcon = (assetType) => {
    switch (assetType) {
        case 'video':
            return 'pi pi-video';
        case 'audio':
            return 'pi pi-volume-up';
        case 'worksheet':
            return 'pi pi-file-pdf';
        case 'presentation':
            return 'pi pi-images';
        case 'research_paper':
            return 'pi pi-file-o';
        case 'dataset':
            return 'pi pi-database';
        case 'software':
            return 'pi pi-cog';
        default:
            return 'pi pi-file';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const goBack = () => {
    router.push('/books/assets');
};

// Load PDF.js script dynamically
const loadPdfScript = () => {
    if (pdfScriptLoaded.value) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
        script.async = true;
        script.onload = () => {
            // Set the worker source correctly
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            pdfScriptLoaded.value = true;
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Initialize PDF viewer with custom controls
const initPdfViewer = async () => {
    if (!asset.value?.media_url || !isPdf.value) return;

    pdfLoading.value = true;

    try {
        await loadPdfScript();

        // We need to make sure pdfjsLib is properly loaded
        if (!window.pdfjsLib) {
            throw new Error('PDF.js library not loaded');
        }

        // Load the document using non-reactive reference with shallowRef
        const loadingTask = window.pdfjsLib.getDocument(asset.value.media_url);
        const pdfDoc = await loadingTask.promise;
        pdfDocument.value = pdfDoc; // Assign to shallowRef
        pdfTotalPages.value = pdfDoc.numPages;

        // Set initial page
        await renderPage(pdfCurrentPage.value);

        pdfLoading.value = false;
    } catch (error) {
        console.error('Error loading PDF:', error);
        pdfLoadingError.value = true;
        pdfLoading.value = false;
    }
};

// Render a specific page of the PDF
const renderPage = async (pageNumber) => {
    if (!pdfDocument.value) return;

    try {
        // Get the page
        const page = await pdfDocument.value.getPage(pageNumber);
        pdfPageInstance.value = page;

        // Get the PDF canvas element
        const canvas = document.getElementById('pdf-canvas');
        if (!canvas) return;

        pdfCanvas.value = canvas;
        pdfCanvasContext.value = canvas.getContext('2d');

        // Calculate scale based on viewport
        const viewport = page.getViewport({
            scale: pdfViewerScale.value,
            rotation: pdfRotation.value
        });

        // Adjust canvas dimensions to match viewport
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the page
        const renderContext = {
            canvasContext: pdfCanvasContext.value,
            viewport: viewport
        };

        const renderTask = page.render(renderContext);
        await renderTask.promise;

        // After rendering, update the search results position if any
        if (
            searchResults.value.length > 0 &&
            pdfCurrentPage.value === searchResults.value[currentSearchIndex.value]?.pageNumber
        ) {
            highlightSearchResult(currentSearchIndex.value);
        }
    } catch (error) {
        console.error('Error rendering page:', error);
    }
};

// Enhanced page navigation
const goToPage = async (pageNum) => {
    const targetPage = Math.max(1, Math.min(pageNum, pdfTotalPages.value));
    if (targetPage === pdfCurrentPage.value) return;

    pdfCurrentPage.value = targetPage;
    await renderPage(targetPage);
};

const nextPage = async () => {
    if (pdfCurrentPage.value < pdfTotalPages.value) {
        pdfCurrentPage.value++;
        await renderPage(pdfCurrentPage.value);
    }
};

const prevPage = async () => {
    if (pdfCurrentPage.value > 1) {
        pdfCurrentPage.value--;
        await renderPage(pdfCurrentPage.value);
    }
};

// Enhanced zoom functions
const zoomIn = async () => {
    const newScale = Math.min(pdfViewerScale.value + 0.25, 3);
    if (newScale === pdfViewerScale.value) return;

    pdfViewerScale.value = newScale;
    zoomLevel.value = Math.round(pdfViewerScale.value * 100);
    await renderPage(pdfCurrentPage.value);
};

const zoomOut = async () => {
    const newScale = Math.max(pdfViewerScale.value - 0.25, 0.5);
    if (newScale === pdfViewerScale.value) return;

    pdfViewerScale.value = newScale;
    zoomLevel.value = Math.round(pdfViewerScale.value * 100);
    await renderPage(pdfCurrentPage.value);
};

const setZoom = async (zoomPercent) => {
    const newScale = zoomPercent / 100;
    if (newScale === pdfViewerScale.value) return;

    pdfViewerScale.value = newScale;
    zoomLevel.value = zoomPercent;
    await renderPage(pdfCurrentPage.value);
};

// Enhanced search functionality
const searchInPdf = async () => {
    if (!searchText.value.trim() || !pdfDocument.value) return;

    searchInProgress.value = true;
    searchResults.value = [];
    showSearchPanel.value = true;
    currentSearchIndex.value = 0;

    try {
        // Search through all pages
        for (let i = 1; i <= pdfTotalPages.value; i++) {
            const page = await pdfDocument.value.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map((item) => item.str).join(' ');

            // Simple search - in a real app, use more sophisticated regex or string matching
            if (text.toLowerCase().includes(searchText.value.toLowerCase())) {
                // Find all occurrences
                const regex = new RegExp(
                    searchText.value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),
                    'gi'
                );
                let match;

                while ((match = regex.exec(text)) !== null) {
                    searchResults.value.push({
                        pageNumber: i,
                        text: match[0],
                        index: match.index,
                        position: calculatePositionFromIndex(textContent, match.index)
                    });
                }
            }
        }

        searchInProgress.value = false;

        if (searchResults.value.length > 0) {
            await goToSearchResult(0);
        }
    } catch (error) {
        console.error('Error searching PDF:', error);
        searchInProgress.value = false;
    }
};

// Helper function to estimate position based on text index
const calculatePositionFromIndex = (textContent, targetIndex) => {
    let currentIndex = 0;

    for (const item of textContent.items) {
        if (currentIndex + item.str.length > targetIndex) {
            // Found the item containing the match
            return {
                left: item.transform[4],
                top: item.transform[5],
                height: item.height || 10,
                width: item.width || item.str.length * 6 // Approximate width if not provided
            };
        }

        currentIndex += item.str.length + 1; // +1 for space
    }

    // Default position if not found
    return { left: 100, top: 100, height: 10, width: 50 };
};

const highlightSearchResult = (index) => {
    if (!searchResults.value[index]) return;

    const result = searchResults.value[index];

    // Create or update highlight element
    let highlight = document.getElementById('search-highlight');
    if (!highlight) {
        highlight = document.createElement('div');
        highlight.id = 'search-highlight';
        highlight.className = 'search-highlight-element';
        document.querySelector('.pdf-viewer-frame').appendChild(highlight);
    }

    // Position the highlight based on the search result
    highlight.style.left = `${result.position.left}px`;
    highlight.style.top = `${result.position.top}px`;
    highlight.style.width = `${result.position.width}px`;
    highlight.style.height = `${result.position.height}px`;
    highlight.style.display = 'block';

    // Scroll to the highlight
    highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const goToSearchResult = async (index) => {
    if (searchResults.value.length === 0) return;

    const result = searchResults.value[index];
    currentSearchIndex.value = index;

    // If we need to change page
    if (result.pageNumber !== pdfCurrentPage.value) {
        await goToPage(result.pageNumber);
    } else {
        // If already on the correct page, just highlight
        highlightSearchResult(index);
    }
};

// Enhanced rotation functionality
const rotatePdf = async (degrees) => {
    pdfRotation.value = (pdfRotation.value + degrees) % 360;
    await renderPage(pdfCurrentPage.value);
};

// Set page layout
const setPageLayout = async (layout) => {
    pageLayout.value = layout;

    // Apply layout changes
    const container = document.querySelector('.pdf-viewer-frame');
    if (!container) return;

    if (layout === 'continuous') {
        // Continuous layout would render multiple pages
        // This is a simplified version
        container.classList.add('continuous-scroll');
    } else {
        container.classList.remove('continuous-scroll');
    }

    await renderPage(pdfCurrentPage.value);
};

// Watch for page changes
watch(pdfCurrentPage, async (newPage, oldPage) => {
    if (newPage !== oldPage && pdfDocument.value) {
        await renderPage(newPage);
    }
});

const toggleAnnotationMode = () => {
    annotationMode.value = !annotationMode.value;
};

const togglePlay = () => {
    playing.value = !playing.value;
};

const toggleMute = () => {
    isMuted.value = !isMuted.value;
};

const toggleFullScreen = () => {
    fullScreen.value = !fullScreen.value;
};

const updateProgress = (event) => {
    currentTime.value = event.target.currentTime;
    duration.value = event.target.duration;
    progress.value = (currentTime.value / duration.value) * 100;
};

const seekMedia = (event) => {
    const seekPos = (event.offsetX / event.target.offsetWidth) * duration.value;
    currentTime.value = seekPos;
};

const formatTime = (time) => {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
};

const addBookmark = () => {
    if (isPdf.value) {
        bookmarkDialogVisible.value = true;
    }
};

const saveBookmark = () => {
    bookmarkedPages.value.push({
        page: pdfCurrentPage.value,
        note: bookmarkNote.value,
        timestamp: new Date().toISOString()
    });
    bookmarkNote.value = '';
    bookmarkDialogVisible.value = false;
};

const jumpToBookmark = (bookmark) => {
    if (isPdf.value) {
        pdfCurrentPage.value = bookmark.page;
    }
};

// PDF Fullscreen functionality
const toggleFullScreenPdf = async () => {
    if (!isFullScreenPdf.value) {
        const pdfContainer = document.querySelector('.pdf-container');
        if (pdfContainer) {
            if (pdfContainer.requestFullscreen) {
                await pdfContainer.requestFullscreen();
            } else if (pdfContainer.mozRequestFullScreen) {
                await pdfContainer.mozRequestFullScreen();
            } else if (pdfContainer.webkitRequestFullscreen) {
                await pdfContainer.webkitRequestFullscreen();
            } else if (pdfContainer.msRequestFullscreen) {
                await pdfContainer.msRequestFullscreen();
            }
            isFullScreenPdf.value = true;
        }
    } else {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
        }
        isFullScreenPdf.value = false;
    }
};

const handleFullscreenChange = () => {
    isFullScreenPdf.value = !!document.fullscreenElement;
};

// Study tools functions
const toggleStudyMode = () => {
    studyMode.value = !studyMode.value;
    if (studyMode.value) {
        startStudyTimer();
        activeTab.value = 'study'; // Switch to study tab
        showStudyTools.value = true; // Show study tools by default when entering study mode
    } else {
        stopStudyTimer();
    }
};

const startStudyTimer = () => {
    studyTimerActive.value = true;
    studyTimerInterval.value = setInterval(() => {
        studyTimer.value++;
    }, 1000);
};

const pauseStudyTimer = () => {
    studyTimerActive.value = false;
    if (studyTimerInterval.value) {
        clearInterval(studyTimerInterval.value);
    }
};

const stopStudyTimer = () => {
    studyTimerActive.value = false;
    if (studyTimerInterval.value) {
        clearInterval(studyTimerInterval.value);
    }
    studyTimer.value = 0;
};

const formatStudyTime = () => {
    const hours = Math.floor(studyTimer.value / 3600);
    const minutes = Math.floor((studyTimer.value % 3600) / 60);
    const seconds = studyTimer.value % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const addStudyNote = () => {
    if (!currentStudyNote.value.trim()) return;

    studyNotes.value.push({
        id: Date.now(),
        text: currentStudyNote.value,
        pageNumber: pdfCurrentPage.value,
        timestamp: new Date().toISOString()
    });

    currentStudyNote.value = '';
};

const addQuickNote = () => {
    quickNoteDialogVisible.value = true;
    quickNoteText.value = '';
};

const saveQuickNote = () => {
    if (!quickNoteText.value.trim()) return;

    studyNotes.value.push({
        id: Date.now(),
        text: quickNoteText.value,
        pageNumber: pdfCurrentPage.value,
        timestamp: new Date().toISOString()
    });

    quickNoteText.value = '';
    quickNoteDialogVisible.value = false;

    // Show study tools panel to see the newly added note
    showStudyTools.value = true;
};

// Text highlight functionality
const addTextHighlight = () => {
    if (!pdfDocument.value) return;

    // In a real implementation, this would get the selected text from the PDF
    // For now, we'll just simulate adding a highlight
    textHighlights.value.push({
        id: Date.now(),
        pageNumber: pdfCurrentPage.value,
        text: 'Selected text would appear here',
        color: textHighlightColor.value,
        position: { x: 150, y: 150, width: 200, height: 20 }
    });

    // Toggle annotation mode
    annotationMode.value = true;
};

// Microsoft Word-style ribbon interface handlers
const setActiveTab = (tabName) => {
    activeTab.value = tabName;
};

// Text formatting functions
const applyFontStyle = (style) => {
    fontStyles.value[style] = !fontStyles.value[style];
    // In a real implementation, this would apply styles to selected text
};

// Table functions
const openTableDialog = () => {
    tableDialogVisible.value = true;
};

const insertTable = () => {
    tables.value.push({
        id: Date.now(),
        rows: tableRows.value,
        columns: tableColumns.value,
        pageNumber: pdfCurrentPage.value,
        position: { x: 100, y: 100 }
    });
    tableDialogVisible.value = false;
};

// Dictionary lookup
const openDictionary = (word = '') => {
    selectedWordForLookup.value = word || '';
    dictionaryDialogVisible.value = true;
    lookupWord();
};

const lookupWord = () => {
    if (!selectedWordForLookup.value.trim()) return;

    isSearchingDictionary.value = true;

    // Simulate API call to dictionary
    setTimeout(() => {
        dictionaryResults.value = {
            word: selectedWordForLookup.value,
            phonetic: '/wɜːd/',
            meanings: [
                {
                    partOfSpeech: 'noun',
                    examples: ['The document contains approximately 5,000 words.']
                }
            ]
        };
        isSearchingDictionary.value = false;
    }, 500);
};

// Drawing tools
const setDrawingTool = (tool) => {
    drawingTool.value = tool;
    drawingMode.value = true;
    annotationMode.value = true;
};

// Comment functions
const addComment = () => {
    if (selectedTextForComment.value) {
        commentDialogVisible.value = true;
    } else {
        // Create a comment at cursor position
        comments.value.push({
            id: Date.now(),
            text: '',
            pageNumber: pdfCurrentPage.value,
            position: { x: 150, y: 150 },
            timestamp: new Date().toISOString(),
            isEditing: true,
            replies: []
        });
    }
};

const saveComment = () => {
    if (!newComment.value.trim()) return;

    if (replyingToCommentId.value) {
        // Add reply to existing comment
        const parentComment = comments.value.find((c) => c.id === replyingToCommentId.value);
        if (parentComment) {
            parentComment.replies.push({
                id: Date.now(),
                text: newComment.value,
                timestamp: new Date().toISOString()
            });
        }
    } else {
        // Add new comment
        comments.value.push({
            id: Date.now(),
            text: newComment.value,
            pageNumber: pdfCurrentPage.value,
            selectedText: selectedTextForComment.value,
            position: { x: 150, y: 150 },
            timestamp: new Date().toISOString(),
            replies: []
        });
    }

    newComment.value = '';
    commentDialogVisible.value = false;
    selectedTextForComment.value = '';
    replyingToCommentId.value = null;
};

// Flashcard functions
const openFlashcardDialog = () => {
    flashcardDialogVisible.value = true;
};

const addFlashcard = () => {
    if (!newFlashcard.value.question.trim() || !newFlashcard.value.answer.trim()) return;

    flashcards.value.push({
        id: Date.now(),
        question: newFlashcard.value.question,
        answer: newFlashcard.value.answer,
        pageNumber: pdfCurrentPage.value,
        timestamp: new Date().toISOString()
    });

    newFlashcard.value = { question: '', answer: '' };
    flashcardDialogVisible.value = false;
};

const startFlashcardReview = () => {
    if (flashcards.value.length === 0) return;

    showingFlashcards.value = true;
    currentFlashcardIndex.value = 0;
    showingFlashcardAnswer.value = false;
};

const nextFlashcard = () => {
    if (currentFlashcardIndex.value < flashcards.value.length - 1) {
        currentFlashcardIndex.value++;
        showingFlashcardAnswer.value = false;
    } else {
        // End of flashcards
        showingFlashcards.value = false;
    }
};

const prevFlashcard = () => {
    if (currentFlashcardIndex.value > 0) {
        currentFlashcardIndex.value--;
        showingFlashcardAnswer.value = false;
    }
};

// View settings
const setViewMode = (mode) => {
    viewMode.value = mode;
};

const toggleRulers = () => {
    showRulers.value = !showRulers.value;
};

const toggleGridlines = () => {
    showGridlines.value = !showGridlines.value;
};

const toggleOutline = () => {
    showOutline.value = !showOutline.value;
};

const toggleThumbnails = () => {
    showThumbnails.value = !showThumbnails.value;
};

const toggleDarkMode = () => {
    darkMode.value = !darkMode.value;
};
</script>

<template>
    <div class="card">
        <div class="flex align-items-center mb-4">
            <Button
                icon="pi pi-arrow-left"
                class="p-button-text p-button-rounded mr-2"
                @click="goBack" />
            <h5 class="m-0" v-if="asset">{{ asset.title }}</h5>
            <h5 class="m-0" v-else>Digital Asset Details</h5>
        </div>

        <div v-if="loading" class="flex justify-content-center">
            <ProgressSpinner />
        </div>

        <div v-else-if="asset && !showMediaPlayer && !showPdfViewer" class="grid">
            <!-- Asset details view -->
            <div class="col-12 md:col-4 flex flex-column align-items-center">
                <div class="asset-thumbnail-container mb-4">
                    <i
                        :class="[getAssetIcon(asset.asset_type), 'asset-type-icon']"
                        v-if="!asset.cover_image_url"></i>
                    <img
                        v-else
                        :src="asset.cover_image_url"
                        :alt="asset.title"
                        class="asset-thumbnail shadow-4" />
                </div>

                <div class="w-full">
                    <div class="flex justify-content-center gap-2 mb-4">
                        <Button
                            v-if="isPdf"
                            label="Open PDF"
                            icon="pi pi-file-pdf"
                            severity="warning"
                            @click="toggleMediaPlayer" />
                        <Button
                            v-else-if="
                                ['video', 'audio', 'presentation'].includes(asset.asset_type)
                            "
                            label="Play/View"
                            icon="pi pi-play"
                            severity="info"
                            @click="toggleMediaPlayer" />
                        <Button
                            label="Download"
                            icon="pi pi-download"
                            severity="secondary"
                            @click="downloadAsset" />
                    </div>

                    <!-- ISBN and Shelf ID Display -->
                    <div
                        class="flex flex-column align-items-center gap-2 mt-4 mb-4 p-3 surface-50 border-round">
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-book text-primary" style="font-size: 1.2rem"></i>
                            <span class="font-bold">ISBN:</span>
                            <Tag severity="info" :value="asset.isbn" />
                        </div>
                        <div class="flex align-items-center gap-2">
                            <i class="pi pi-map-marker text-primary" style="font-size: 1.2rem"></i>
                            <span class="font-bold">Shelf ID:</span>
                            <Tag severity="success" :value="asset.shelf_id" />
                        </div>
                    </div>

                    <div class="flex justify-content-center mb-4">
                        <Button
                            icon="pi pi-pencil"
                            label="Edit"
                            class="p-button-outlined"
                            @click="editAsset" />
                    </div>

                    <div v-if="asset.restricted_access" class="flex justify-content-center mb-4">
                        <Tag severity="warning" value="Restricted Access" icon="pi pi-lock" />
                    </div>

                    <div class="flex justify-content-center gap-4 mt-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold">{{ asset.view_count }}</div>
                            <div class="text-sm">Views</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold">{{ asset.download_count }}</div>
                            <div class="text-sm">Downloads</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12 md:col-8">
                <h6 class="text-xl font-bold mb-2">{{ asset.title }}</h6>
                <div class="flex align-items-center mb-4">
                    <Tag
                        :value="asset.asset_type"
                        :icon="getAssetIcon(asset.asset_type)"
                        class="mr-2" />
                    <span class="text-lg font-medium text-600">by {{ asset.author }}</span>
                </div>

                <div class="grid">
                    <div class="col-12">
                        <h6 class="font-bold mb-2">Description</h6>
                        <p class="line-height-3 mb-4">{{ asset.description }}</p>
                    </div>

                    <div class="col-12 md:col-6">
                        <h6 class="font-bold mb-2">Asset Details</h6>
                        <ul class="asset-details-list">
                            <li><span>Asset Type:</span> {{ asset.asset_type }}</li>
                            <li><span>Format:</span> {{ asset.media_type }}</li>
                            <li v-if="asset.duration_minutes">
                                <span>Duration:</span> {{ asset.duration_minutes }} minutes
                            </li>
                            <li><span>Creation Year:</span> {{ asset.publication_year }}</li>
                            <li v-if="asset.manufacturer">
                                <span>Producer:</span> {{ asset.manufacturer }}
                            </li>
                            <li v-if="asset.unique_id"><span>ID:</span> {{ asset.unique_id }}</li>
                            <li>
                                <span>File Size:</span> {{ formatFileSize(asset.file_size_mb) }}
                            </li>
                        </ul>
                    </div>

                    <div class="col-12 md:col-6">
                        <h6 class="font-bold mb-2">Library Information</h6>
                        <ul class="asset-details-list">
                            <li><span>Category:</span> {{ asset.category.name }}</li>
                            <li><span>Publisher:</span> {{ asset.publisher?.name || 'N/A' }}</li>
                            <li><span>Branch:</span> {{ asset.library_branch.name }}</li>
                            <li><span>Section:</span> {{ asset.shelf?.name || 'N/A' }}</li>
                            <li><span>Location:</span> {{ asset.location_details || 'N/A' }}</li>
                            <li><span>Language:</span> {{ asset.language }}</li>
                            <li><span>Added on:</span> {{ formatDate(asset.acquisition_date) }}</li>
                        </ul>
                    </div>

                    <div class="col-12" v-if="asset.usage_instructions">
                        <h6 class="font-bold mb-2 mt-3">Usage Instructions</h6>
                        <div class="p-3 surface-50 border-round">
                            <p class="m-0 line-height-3">{{ asset.usage_instructions }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Enhanced YouTube Video Player -->
        <div v-else-if="showMediaPlayer && isYouTube" class="col-12">
            <div class="surface-card p-3 border-round shadow-2">
                <div class="flex align-items-center justify-content-between mb-3">
                    <div class="flex align-items-center">
                        <i class="pi pi-video text-primary mr-2" style="font-size: 1.5rem"></i>
                        <h5 class="m-0">{{ asset.title }}</h5>
                    </div>
                    <div>
                        <Button
                            icon="pi pi-download"
                            class="p-button-rounded p-button-outlined mr-2"
                            tooltip="Download Video"
                            tooltipOptions="{ position: 'left' }"
                            @click="downloadAsset" />
                        <Button
                            icon="pi pi-times"
                            class="p-button-rounded p-button-danger p-button-text"
                            tooltip="Close Player"
                            tooltipOptions="{ position: 'left' }"
                            @click="toggleMediaPlayer" />
                    </div>
                </div>

                <div class="youtube-player-container shadow-4 border-round overflow-hidden">
                    <iframe
                        :src="youtubeEmbedUrl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        class="youtube-iframe"></iframe>
                </div>

                <div class="mt-4 p-3">
                    <div class="flex flex-column md:flex-row md:align-items-center gap-3 mb-3">
                        <Tag
                            :value="asset.asset_type"
                            :icon="getAssetIcon(asset.asset_type)"
                            severity="info" />
                        <span class="text-600"
                            ><i class="pi pi-user mr-1"></i>{{ asset.author }}</span
                        >
                        <span class="text-600"
                            ><i class="pi pi-clock mr-1"></i
                            >{{ asset.duration_minutes }} minutes</span
                        >
                        <span class="text-600"
                            ><i class="pi pi-calendar mr-1"></i>{{ asset.publication_year }}</span
                        >
                    </div>

                    <Divider />

                    <h6 class="font-bold mb-2">Description</h6>
                    <p class="line-height-3 text-color-secondary">{{ asset.description }}</p>

                    <div class="mt-3 flex justify-content-between">
                        <div>
                            <span class="p-badge p-badge-info">
                                <i class="pi pi-eye mr-1"></i>{{ asset.view_count }} views
                            </span>
                        </div>
                        <div>
                            <Button
                                icon="pi pi-share-alt"
                                class="p-button-text p-button-sm"
                                label="Share" />
                            <Button
                                icon="pi pi-bookmark"
                                class="p-button-text p-button-sm"
                                label="Save" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Enhanced Student-Oriented PDF Reader -->
        <div v-else-if="showPdfViewer && isPdf" class="col-12">
            <div :class="['pdf-container', { 'dark-mode': darkMode }]" ref="pdfElementRef">
                <!-- Minimalist Canva-style top navigation bar -->
                <div
                    class="canva-navbar flex align-items-center justify-content-between"
                    :class="{
                        'fullscreen-header': isFullScreenPdf,
                        'study-mode-active': studyMode
                    }">
                    <div class="flex align-items-center">
                        <Button
                            icon="pi pi-arrow-left"
                            class="p-button-text p-button-rounded nav-button"
                            @click="toggleMediaPlayer"
                            tooltip="Back"
                            tooltipOptions="{ position: 'bottom' }" />
                        <div class="document-info">
                            <span class="document-title">{{ asset.title }}</span>
                        </div>
                    </div>

                    <div class="flex align-items-center nav-controls">
                        <!-- Page Navigation -->
                        <Button
                            icon="pi pi-chevron-left"
                            class="p-button-text nav-button"
                            @click="prevPage"
                            :disabled="pdfCurrentPage <= 1"
                            tooltip="Previous"
                            tooltipOptions="{ position: 'bottom' }" />
                        <div class="page-indicator">
                            <InputNumber
                                v-model="pdfCurrentPage"
                                :min="1"
                                :max="pdfTotalPages"
                                class="nav-input"
                                :step="1" />
                            <span class="text-separator">/</span>
                            <span>{{ pdfTotalPages }}</span>
                        </div>
                        <Button
                            icon="pi pi-chevron-right"
                            class="p-button-text nav-button"
                            @click="nextPage"
                            :disabled="pdfCurrentPage >= pdfTotalPages"
                            tooltip="Next"
                            tooltipOptions="{ position: 'bottom' }" />

                        <!-- Search -->
                        <div class="nav-divider"></div>
                        <span class="p-input-icon-left nav-search">
                            <i class="pi pi-search"></i>
                            <InputText
                                v-model="searchText"
                                placeholder="Search..."
                                class="p-inputtext-sm"
                                @keyup.enter="searchInPdf" />
                        </span>

                        <!-- Zoom -->
                        <div class="nav-divider"></div>
                        <Button
                            icon="pi pi-search-minus"
                            class="p-button-text nav-button"
                            @click="zoomOut"
                            :disabled="pdfViewerScale <= 0.5"
                            tooltip="Zoom Out"
                            tooltipOptions="{ position: 'bottom' }" />
                        <span class="zoom-level">{{ Math.round(pdfViewerScale * 100) }}%</span>
                        <Button
                            icon="pi pi-search-plus"
                            class="p-button-text nav-button"
                            @click="zoomIn"
                            :disabled="pdfViewerScale >= 3"
                            tooltip="Zoom In"
                            tooltipOptions="{ position: 'bottom' }" />

                        <!-- Study Mode Button -->
                        <div class="nav-divider"></div>
                        <Button
                            :class="[
                                'study-mode-button p-button-text',
                                { 'study-mode-active': studyMode }
                            ]"
                            @click="toggleStudyMode"
                            tooltipOptions="{ position: 'bottom' }">
                            <i class="pi pi-book mr-2"></i>
                            <span>Study Mode</span>
                        </Button>

                        <!-- Display Options -->
                        <div class="nav-divider"></div>
                        <Button
                            v-if="!darkMode"
                            icon="pi pi-moon"
                            class="p-button-text nav-button"
                            @click="toggleDarkMode"
                            tooltip="Dark Mode"
                            tooltipOptions="{ position: 'bottom' }" />
                        <Button
                            v-else
                            icon="pi pi-sun"
                            class="p-button-text nav-button"
                            @click="toggleDarkMode"
                            tooltip="Light Mode"
                            tooltipOptions="{ position: 'bottom' }" />
                        <Button
                            v-if="!isFullScreenPdf"
                            icon="pi pi-window-maximize"
                            class="p-button-text nav-button"
                            @click="toggleFullScreenPdf"
                            tooltip="Fullscreen"
                            tooltipOptions="{ position: 'bottom' }" />
                        <Button
                            v-else
                            icon="pi pi-window-minimize"
                            class="p-button-text nav-button"
                            @click="toggleFullScreenPdf"
                            tooltip="Exit Fullscreen"
                            tooltipOptions="{ position: 'bottom' }" />
                    </div>
                </div>

                <!-- Study Tools Toolbar (only visible when study mode is active) -->
                <div v-if="studyMode" class="study-tools-navbar flex align-items-center">
                    <div class="study-timer">
                        <i class="pi pi-clock text-primary mr-1"></i>
                        <span>{{ formatStudyTime() }}</span>
                        <Button
                            v-if="!studyTimerActive"
                            icon="pi pi-play"
                            class="p-button-text p-button-sm timer-button"
                            @click="startStudyTimer"
                            tooltip="Start Timer"
                            tooltipOptions="{ position: 'bottom' }" />
                        <Button
                            v-else
                            icon="pi pi-pause"
                            class="p-button-text p-button-sm timer-button"
                            @click="pauseStudyTimer"
                            tooltip="Pause Timer"
                            tooltipOptions="{ position: 'bottom' }" />
                    </div>

                    <div class="flex align-items-center study-tools">
                        <Button
                            icon="pi pi-bookmark"
                            class="p-button-text study-tool-button"
                            @click="addBookmark"
                            tooltip="Add Bookmark"
                            tooltipOptions="{ position: 'bottom' }" />
                        <Button
                            icon="pi pi-file-edit"
                            class="p-button-text study-tool-button"
                            @click="addQuickNote"
                            tooltip="Quick Note"
                            tooltipOptions="{ position: 'bottom' }" />
                        <Button
                            icon="pi pi-highlight"
                            class="p-button-text study-tool-button"
                            @click="addTextHighlight"
                            tooltip="Highlight"
                            tooltipOptions="{ position: 'bottom' }" />
                        <Button
                            icon="pi pi-id-card"
                            class="p-button-text study-tool-button"
                            @click="openFlashcardDialog"
                            tooltip="Create Flashcard"
                            tooltipOptions="{ position: 'bottom' }" />
                        <Button
                            icon="pi pi-search"
                            class="p-button-text study-tool-button"
                            @click="openDictionary"
                            tooltip="Dictionary"
                            tooltipOptions="{ position: 'bottom' }" />
                        <Button
                            :class="[
                                'p-button-text study-tool-button',
                                { 'study-tool-active': showStudyTools }
                            ]"
                            @click="showStudyTools = !showStudyTools"
                            tooltip="Study Panel"
                            tooltipOptions="{ position: 'bottom' }">
                            <i class="pi pi-th-large"></i>
                        </Button>
                    </div>
                </div>

                <!-- PDF Content Area -->
                <div class="pdf-content-container grid">
                    <!-- PDF Content Area -->
                    <div
                        :class="{
                            'col-12': !showSearchPanel && !showStudyTools,
                            'col-9': showSearchPanel || showStudyTools
                        }">
                        <!-- Vue PDF Viewer -->

                        <div
                            class="vue-pdf-container"
                            :style="{ height: isFullScreenPdf ? 'calc(100vh - 130px)' : '700px' }">
                            <VPdfViewer
                                :src="asset.media_url"
                                :theme="darkMode ? 'dark' : 'light'"
                                class="vue-pdf-viewer" />
                        </div>
                    </div>

                    <!-- Sidebar area -->
                    <div class="col-3" v-if="showSearchPanel || showStudyTools">
                        <TabView>
                            <!-- Search Results Tab -->
                            <TabPanel
                                header="Search Results"
                                :disabled="searchResults.length === 0"
                                v-if="showSearchPanel">
                                <div class="search-results p-3">
                                    <h6 class="mb-3">
                                        Found {{ searchResults.length }} results for "{{
                                            searchText
                                        }}"
                                    </h6>
                                    <div
                                        v-if="searchInProgress"
                                        class="flex justify-content-center">
                                        <ProgressSpinner style="height: 50px" strokeWidth="4" />
                                    </div>
                                    <ul class="list-none p-0 m-0">
                                        <li
                                            v-for="(result, i) in searchResults"
                                            :key="i"
                                            :class="[
                                                'p-2 border-round mb-2 cursor-pointer',
                                                i === currentSearchIndex
                                                    ? 'surface-200'
                                                    : 'surface-hover'
                                            ]"
                                            @click="goToSearchResult(i)">
                                            <div class="flex align-items-center">
                                                <Badge
                                                    :value="result.pageNumber"
                                                    severity="info"
                                                    class="mr-2" />
                                                <span class="font-medium">{{ result.text }}</span>
                                            </div>
                                        </li>
                                    </ul>
                                    <div
                                        v-if="searchResults.length > 0"
                                        class="flex justify-content-between mt-3">
                                        <Button
                                            icon="pi pi-arrow-up"
                                            label="Previous"
                                            class="p-button-sm p-button-outlined"
                                            @click="prevSearchResult" />
                                        <Button
                                            icon="pi pi-arrow-down"
                                            iconPos="right"
                                            label="Next"
                                            class="p-button-sm p-button-outlined"
                                            @click="nextSearchResult" />
                                    </div>
                                </div>
                            </TabPanel>

                            <!-- Study Notes Tab -->
                            <TabPanel header="Study Notes" v-if="studyMode && showStudyTools">
                                <div class="p-3">
                                    <h6 class="mb-3 flex align-items-center">
                                        <i class="pi pi-book mr-2"></i>Study Notes
                                    </h6>

                                    <!-- Add new note input -->
                                    <div class="mb-3">
                                        <Textarea
                                            v-model="currentStudyNote"
                                            rows="3"
                                            class="w-full"
                                            placeholder="Take notes as you study..." />
                                        <div
                                            class="flex justify-content-between align-items-center mt-2">
                                            <small class="text-500"
                                                >Page: {{ pdfCurrentPage }}</small
                                            >
                                            <Button
                                                label="Add Note"
                                                icon="pi pi-plus"
                                                class="p-button-sm"
                                                @click="addStudyNote"
                                                :disabled="!currentStudyNote.trim()" />
                                        </div>
                                    </div>

                                    <!-- Notes list -->
                                    <div
                                        v-if="studyNotes.length === 0"
                                        class="text-center p-5 surface-ground border-round">
                                        <i
                                            class="pi pi-file-edit mb-3"
                                            style="
                                                font-size: 2rem;
                                                color: var(--text-color-secondary);
                                            "></i>
                                        <p class="m-0">Your study notes will appear here</p>
                                    </div>

                                    <ul v-else class="list-none p-0 m-0">
                                        <li
                                            v-for="(note, i) in studyNotes"
                                            :key="note.id"
                                            class="mb-3 p-3 border-round surface-ground">
                                            <div class="flex justify-content-between">
                                                <Badge
                                                    :value="`Page ${note.pageNumber}`"
                                                    severity="info" />
                                                <small class="text-500">{{
                                                    new Date(note.timestamp).toLocaleString()
                                                }}</small>
                                            </div>
                                            <p class="line-height-3 mt-2 mb-0">{{ note.text }}</p>
                                        </li>
                                    </ul>
                                </div>
                            </TabPanel>

                            <!-- Bookmarks Tab -->
                            <TabPanel header="Bookmarks" :disabled="bookmarkedPages.length === 0">
                                <div class="p-3">
                                    <h6 class="mb-3 flex align-items-center">
                                        <i class="pi pi-bookmark mr-2"></i>Bookmarks
                                    </h6>

                                    <ul class="list-none p-0 m-0">
                                        <li
                                            v-for="(bookmark, index) in bookmarkedPages"
                                            :key="index"
                                            class="flex align-items-start p-3 border-round mb-2 surface-hover cursor-pointer"
                                            @click="jumpToBookmark(bookmark)">
                                            <div class="flex-grow-1">
                                                <div class="flex align-items-center">
                                                    <Badge
                                                        severity="info"
                                                        :value="`Page ${bookmark.page}`"
                                                        class="mr-2" />
                                                    <small class="text-500">{{
                                                        new Date(
                                                            bookmark.timestamp
                                                        ).toLocaleString()
                                                    }}</small>
                                                </div>
                                                <p
                                                    v-if="bookmark.note"
                                                    class="mt-2 mb-1 line-height-3 p-2 surface-100 border-round">
                                                    {{ bookmark.note }}
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="flex justify-content-center">
            <div class="text-center">
                <i class="pi pi-exclamation-triangle text-yellow-500" style="font-size: 3rem"></i>
                <h5>Asset not found</h5>
                <p>The digital asset you're looking for doesn't exist or has been removed.</p>
                <Button label="Go Back" @click="goBack" />
            </div>
        </div>
    </div>

    <!-- Enhanced Bookmark Dialog -->
    <Dialog
        v-model:visible="bookmarkDialogVisible"
        header="Add Bookmark"
        :style="{ width: '30rem' }"
        :modal="true"
        class="p-fluid">
        <div class="p-3">
            <div class="mb-3 text-center">
                <i class="pi pi-bookmark text-primary" style="font-size: 2rem"></i>
                <h6 class="mt-2">Bookmark Page {{ pdfCurrentPage }}</h6>
            </div>
            <div class="field">
                <label for="bookmarkNote" class="font-bold block mb-2">Add Note (optional)</label>
                <Textarea
                    id="bookmarkNote"
                    v-model="bookmarkNote"
                    rows="5"
                    class="w-full"
                    placeholder="Add notes about this page to help you remember why it's important..."
                    autoResize />
            </div>
        </div>
        <template #footer>
            <Button
                label="Cancel"
                icon="pi pi-times"
                @click="bookmarkDialogVisible = false"
                class="p-button-text" />
            <Button label="Save Bookmark" icon="pi pi-check" @click="saveBookmark" autofocus />
        </template>
    </Dialog>

    <!-- Quick Note Dialog -->
    <Dialog
        v-model:visible="quickNoteDialogVisible"
        header="Add Quick Note"
        :style="{ width: '30rem' }"
        :modal="true"
        class="p-fluid">
        <div class="p-3">
            <div class="mb-3">
                <div class="flex align-items-center mb-2">
                    <i class="pi pi-file-edit text-primary mr-2"></i>
                    <span class="font-bold">Add a note for page {{ pdfCurrentPage }}</span>
                </div>
                <Textarea
                    v-model="quickNoteText"
                    rows="4"
                    class="w-full"
                    placeholder="Write your study note here..."
                    autoResize />
            </div>
        </div>
        <template #footer>
            <Button
                label="Cancel"
                icon="pi pi-times"
                @click="quickNoteDialogVisible = false"
                class="p-button-text" />
            <Button
                label="Save Note"
                icon="pi pi-check"
                @click="saveQuickNote"
                autofocus
                :disabled="!quickNoteText.trim()" />
        </template>
    </Dialog>
</template>

<style scoped>
.asset-thumbnail {
    max-width: 100%;
    height: auto;
    max-height: 300px;
    object-fit: contain;
    border-radius: 4px;
}

.asset-thumbnail-container {
    width: 100%;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--surface-100);
    border-radius: 4px;
}

.asset-type-icon {
    font-size: 8rem;
    color: var(--primary-color);
}

.asset-details-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.asset-details-list li {
    margin-bottom: 0.5rem;
}

.asset-details-list li span {
    font-weight: 600;
    margin-right: 0.5rem;
}

/* YouTube Player Styles */
.youtube-player-container {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.youtube-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
}

/* Enhanced PDF Reader Styles */
.pdf-container {
    position: relative;
    width: 100%;
    height: auto;
    background-color: var(--surface-ground);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.pdf-container.dark-mode {
    background-color: #1e1e1e;
    color: #f5f5f5;
}

.pdf-viewer-frame {
    width: 100%;
    height: 700px;
    background-color: white;
    transition: all 0.3s ease;
    position: relative;
}

.pdf-viewer-frame.dark-mode {
    background-color: #2d2d2d;
}

.pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
    transition: transform 0.3s ease;
}

.pdf-toolbar {
    background-color: var(--surface-section);
    z-index: 10;
    transition: all 0.3s ease;
}

.pdf-content-container {
    position: relative;
}

/* Fullscreen styles */
:fullscreen .pdf-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
}

:fullscreen .pdf-viewer-frame {
    height: calc(100vh - 130px);
}

.fullscreen-header {
    position: sticky;
    top: 0;
    z-index: 20;
}

.pdf-footer-fullscreen {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
}

/* Study mode styles */
.study-notes-container {
    height: 700px;
    overflow-y: auto;
}

.search-results {
    max-height: 650px;
    overflow-y: auto;
}

/* Annotation styles */
.annotation-highlight {
    background-color: rgba(255, 255, 0, 0.4);
    border-radius: 2px;
    cursor: pointer;
}

.note-container {
    background-color: #fff8dc;
    border: 1px solid #ffeb3b;
    border-radius: 4px;
    padding: 10px;
    width: 200px;
    position: absolute;
    z-index: 100;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Custom TabView styles for reader */
:deep(.p-tabview-nav) {
    background-color: var(--surface-ground);
    border-radius: 8px 8px 0 0;
}

:deep(.p-tabview-selected) {
    font-weight: 700;
}

/* Custom scrollbar for PDF panels */
.search-results::-webkit-scrollbar,
.study-notes-container::-webkit-scrollbar {
    width: 6px;
}

.search-results::-webkit-scrollbar-track,
.study-notes-container::-webkit-scrollbar-track {
    background: var(--surface-ground);
}

.search-results::-webkit-scrollbar-thumb,
.study-notes-container::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 6px;
}

/* Minimalist Canva-style navigation bar */
.canva-navbar {
    height: 52px;
    background-color: white;
    padding: 0 1.25rem;
    border-bottom: 1px solid var(--surface-border);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
}

.document-info {
    margin-left: 0.75rem;
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.document-title {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
}

.nav-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    height: 100%;
}

.nav-button {
    color: #5f6368;
    padding: 0.5rem;
    width: 2.25rem;
    height: 2.25rem;
    margin: 0 0.125rem;
}

.nav-button:hover {
    color: var(--primary-color);
    background-color: rgba(0, 0, 0, 0.04);
}

.nav-button-active {
    color: var(--primary-color);
    background-color: rgba(var(--primary-color-rgb), 0.1);
}

.nav-divider {
    width: 1px;
    height: 28px;
    background-color: #e0e0e0;
    margin: 0 0.5rem;
}

.page-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin: 0 0.25rem;
}

.nav-input {
    width: 3rem !important;
}

:deep(.p-inputnumber-input) {
    width: 3rem !important;
    padding: 0.4rem;
    text-align: center;
    border-color: transparent;
}

:deep(.p-inputtext:enabled:focus) {
    box-shadow: none;
    border-color: var(--primary-color);
}

.text-separator {
    color: #5f6368;
    margin: 0 0.125rem;
}

.zoom-level {
    font-size: 0.875rem;
    min-width: 3rem;
    text-align: center;
    color: #5f6368;
}

.study-timer {
    display: flex;
    align-items: center;
    background-color: rgba(var(--primary-color-rgb), 0.1);
    border-radius: 16px;
    padding: 0.25rem 0.75rem;
    margin-left: 0.5rem;
}

.timer-button {
    padding: 0.25rem;
    font-size: 0.75rem;
}

.nav-search {
    max-width: 180px;
}

:deep(.nav-search .p-inputtext) {
    padding: 0.4rem 0.4rem 0.4rem 2rem;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.04);
    border-color: transparent;
}

:deep(.nav-search .p-inputtext:focus) {
    background-color: white;
    border-color: var(--primary-color);
}

/* Study Mode Button */
.study-mode-button {
    display: flex;
    align-items: center;
    border-radius: 18px;
    padding: 0.3rem 0.8rem;
    transition: all 0.2s ease;
}

.study-mode-button:hover {
    background-color: rgba(var(--primary-color-rgb), 0.08);
}

.study-mode-button.study-mode-active {
    background-color: var(--primary-color);
    color: white;
}

.canva-navbar.study-mode-active {
    border-bottom-color: var(--primary-color);
}

/* Study Tools Toolbar */
.study-tools-navbar {
    height: 40px;
    background-color: #f8f9fa;
    padding: 0 1.25rem;
    border-bottom: 1px solid var(--surface-border);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    display: flex;
    justify-content: space-between;
}

.study-tools {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.study-tool-button {
    color: #5f6368;
    padding: 0.3rem;
    width: 2rem;
    height: 2rem;
    border-radius: 4px;
}

.study-tool-button:hover {
    background-color: rgba(0, 0, 0, 0.04);
    color: var(--primary-color);
}

/* PDF.js canvas styles */
.pdf-canvas-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
    overflow: auto;
}

#pdf-canvas {
    margin: 0 auto;
    display: block;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Search highlight styles */
.search-highlight-element {
    position: absolute;
    background-color: rgba(255, 230, 0, 0.4);
    border: 2px solid rgba(255, 153, 0, 0.8);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(255, 153, 0, 0.5);
    pointer-events: none;
    z-index: 10;
    animation: highlight-pulse 2s infinite;
}

@keyframes highlight-pulse {
    0% {
        opacity: 0.7;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0.7;
    }
}

/* Continuous scroll mode */
.pdf-viewer-frame.continuous-scroll {
    overflow-y: auto;
}

/* PDF loading spinner */
.pdf-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 100;
}

.pdf-loading-overlay.dark-mode {
    background-color: rgba(45, 45, 45, 0.8);
}

.pdf-loading-message {
    margin-top: 1rem;
    font-weight: 500;
}

/* PDF error state */
.pdf-error {
    padding: 2rem;
    text-align: center;
}

.pdf-error-icon {
    font-size: 3rem;
    color: var(--red-500);
    margin-bottom: 1rem;
}

/* Enhanced tooltip styles */
.custom-tooltip {
    background-color: rgba(50, 50, 50, 0.95) !important;
    color: white !important;
    border-radius: 4px !important;
    padding: 0.5rem 0.75rem !important;
    font-size: 0.875rem !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15) !important;
    max-width: 250px !important;
    z-index: 1000 !important;
}

/* Vue PDF Viewer Styles */
.vue-pdf-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    background-color: white;
}

.vue-pdf-viewer {
    width: 100%;
    height: 100%;
    border: none;
}

/* Override some Vue PDF Viewer default styles */
:deep(.vpdf-viewer) {
    width: 100% !important;
    height: 100% !important;
}

:deep(.vpdf-viewer__container) {
    width: 100% !important;
    height: 100% !important;
}

:deep(.vpdf-viewer__document) {
    width: 100% !important;
    height: 100% !important;
}

:deep(.vpdf-viewer__page) {
    margin: 0 auto;
}

/* Fix for dark mode */
.dark-mode .vue-pdf-container {
    background-color: #222;
}

/* Fix for fullscreen mode */
:fullscreen .vue-pdf-container {
    height: 100%;
}

/* Improve loading indicator visibility */
:deep(.vpdf-viewer__loading) {
    background-color: rgba(255, 255, 255, 0.8);
}

.dark-mode :deep(.vpdf-viewer__loading) {
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
