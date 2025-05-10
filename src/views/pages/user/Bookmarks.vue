<template>
    <div class="bookmarks-page">
        <Toast />
        <!-- Header -->
        <div class="win8-header">
            <div class="container p-0">
                <div class="header-content">
                    <div class="header-title">
                        <i class="pi pi-th-large mr-2"></i>
                        <h1>Bookmarks</h1>
                    </div>
                    <div class="search-container">
                        <div class="p-inputgroup">
                            <InputText v-model="filters.global.value" placeholder="Search bookmarks..." class="search-input" />
                            <Button icon="pi pi-search" class="search-button" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Main content area -->
        <div class="explorer-content container py-4">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p>Loading bookmarks...</p>
            </div>
            <!-- Empty State -->
            <div v-else-if="filteredBookmarks.length === 0" class="empty-state">
                <i class="pi pi-folder"></i>
                <h3>No bookmarks found</h3>
                <p>You haven't added any bookmarks yet</p>
                <Button label="Explore Library" icon="pi pi-search" @click="navigateToLibrary" class="p-button-primary p-button-lg" />
            </div>

            <!-- Tile Grid View -->
            <div v-else class="tile-grid">
                <div
                    v-for="(bookmark, index) in filteredBookmarks"
                    :key="bookmark.id"
                    class="tile"
                    :class="getTileSize(index)"
                    :style="{ animationDelay: `${index * 0.05}s` }"
                    @click="openResource(bookmark)"
                    @contextmenu.prevent="showContextMenu($event, bookmark)"
                >
                    <div class="tile-content" :style="{ backgroundColor: getColorForType(bookmark.type) }">
                        <div class="tile-icon">
                            <i :class="getIconForResourceType(bookmark.type)"></i>
                        </div>
                        <div class="tile-info">
                            <div class="tile-title">{{ bookmark.title }}</div>
                            <div class="tile-meta">{{ bookmark.author }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Context Menu -->
        <ContextMenu ref="contextMenu" :model="contextMenuItems" />

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup>
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

// PrimeVue Components
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import ContextMenu from 'primevue/contextmenu';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const contextMenu = ref(null);

// State
const bookmarks = ref([]);
const loading = ref(true);
const activeFilter = ref('all');
const selectedBookmark = ref(null);

// Search filter
const filters = reactive({
    global: { value: null, matchMode: 'contains' }
});

// Context menu items
const contextMenuItems = ref([
    {
        label: 'Open',
        icon: 'pi pi-external-link',
        command: () => {
            if (selectedBookmark.value) {
                openResource(selectedBookmark.value);
            }
        }
    },
    {
        label: 'Remove',
        icon: 'pi pi-trash',
        command: () => {
            if (selectedBookmark.value) {
                confirmRemoveBookmark(selectedBookmark.value);
            }
        }
    }
]);

// Display right-click context menu
const showContextMenu = (event, bookmark) => {
    selectedBookmark.value = bookmark;
    contextMenu.value.show(event);
};

// Filter bookmarks based on search
const filteredBookmarks = computed(() => {
    if (!filters.global.value) {
        return bookmarks.value;
    }
    return bookmarks.value.filter((bookmark) => bookmark.title.toLowerCase().includes(filters.global.value.toLowerCase()));
});

// Get icon based on resource type
const getIconForResourceType = (type) => {
    const icons = {
        pdf: 'pi pi-file-pdf',
        ebook: 'pi pi-book',
        video: 'pi pi-video',
        audio: 'pi pi-volume-up',
        youtube: 'pi pi-youtube'
    };
    return icons[type] || 'pi pi-file';
};

// Get color based on resource type
const getColorForType = (type) => {
    const colors = {
        pdf: '#FF7043',
        ebook: '#29B6F6',
        video: '#AB47BC',
        audio: '#26A69A',
        youtube: '#EF5350'
    };
    return colors[type] || '#78909C';
};

// Determine tile size based on index - Windows 8 style with different sized tiles
const getTileSize = (index) => {
    // Create an interesting pattern with different sized tiles
    if (index === 0 || index === 3) {
        return 'tile-large'; // 2x2
    } else if (index === 4 || index === 7) {
        return 'tile-wide'; // 2x1
    } else {
        return 'tile-normal'; // 1x1
    }
};

// Open the resource
const openResource = (bookmark) => {
    // Navigate to resource viewer or open resource
    router.push(`/resource/${bookmark.id}`);
};

// Confirm and remove a bookmark
const confirmRemoveBookmark = (bookmark) => {
    confirm.require({
        message: `Are you sure you want to remove "${bookmark.title}"?`,
        header: 'Confirm Removal',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
            removeBookmark(bookmark);
        }
    });
};

// Remove a bookmark
const removeBookmark = (bookmark) => {
    // Mock removal - replace with actual API call
    bookmarks.value = bookmarks.value.filter((b) => b.id !== bookmark.id);
    toast.add({ severity: 'success', summary: 'Removed', detail: 'Bookmark removed successfully', life: 3000 });
};

// Navigate to library
const navigateToLibrary = () => {
    router.push('/library');
};

// Load bookmarks
const loadBookmarks = () => {
    loading.value = true;
    // Mock data loading - replace with actual API call
    setTimeout(() => {
        bookmarks.value = [
            { id: 1, title: 'JavaScript Basics', type: 'pdf', author: 'John Doe', bookmarkedAt: new Date() },
            { id: 2, title: 'Vue.js Guide', type: 'ebook', author: 'Jane Smith', bookmarkedAt: new Date() },
            { id: 3, title: 'HTML Tutorial', type: 'video', author: 'Web School', bookmarkedAt: new Date() },
            { id: 4, title: 'CSS Masterclass', type: 'pdf', author: 'Style Master', bookmarkedAt: new Date() },
            { id: 5, title: 'Python for Beginners', type: 'ebook', author: 'Code Academy', bookmarkedAt: new Date() },
            { id: 6, title: 'Web Development', type: 'youtube', author: 'Dev Channel', bookmarkedAt: new Date() },
            { id: 7, title: 'Database Design', type: 'pdf', author: 'SQL Expert', bookmarkedAt: new Date() },
            { id: 8, title: 'React Hooks', type: 'video', author: 'React Team', bookmarkedAt: new Date() }
        ];
        loading.value = false;
    }, 500);
};

// Initialize
onMounted(() => {
    loadBookmarks();
});
</script>

<style scoped>
.bookmarks-page {
    min-height: 100vh;
    background-color: #0c0c0c; /* Darker background for Windows 8 style */
    color: white;
}

/* Windows 8 style header */
.win8-header {
    padding: 24px 0;
    background-color: #1a1a1a;
    border-bottom: 2px solid #333;
    margin-bottom: 20px;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 0 16px;
}

.header-title {
    display: flex;
    align-items: center;
}

.header-title i {
    font-size: 1.8rem;
    color: #0078d7; /* Windows 8 blue */
}

.header-title h1 {
    font-size: 1.8rem;
    font-weight: 300;
    margin: 0;
    letter-spacing: 1px;
    color: white;
}

.search-container {
    flex: 1;
    max-width: 400px;
}

.search-input {
    background-color: #333 !important;
    border: none !important;
    color: white !important;
    height: 44px;
    font-size: 1rem !important;
    padding-left: 16px !important;
    border-radius: 0 !important;
    transition: all 0.2s ease;
}

.search-input:focus {
    background-color: #444 !important;
    box-shadow: none !important;
}

.search-input::placeholder {
    color: #888;
}

.search-button {
    background-color: #0078d7 !important; /* Windows 8 blue */
    border: none !important;
    height: 44px !important;
    width: 50px !important;
    border-radius: 0 !important;
}

.search-button:hover {
    background-color: #00a2ed !important;
}

/* Windows 8 style tile grid */
.tile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    grid-auto-rows: 140px;
    grid-gap: 10px;
    padding: 20px 10px;
    max-width: 1600px;
    margin: 0 auto;
}

/* Tile sizes */
.tile {
    position: relative;
    cursor: pointer;
    border-radius: 2px;
    overflow: hidden;
    animation: tileAppear 0.3s ease-out forwards;
    opacity: 0;
    transform: scale(0.9);
}

.tile-normal {
    grid-column: span 1;
    grid-row: span 1;
}

.tile-wide {
    grid-column: span 2;
    grid-row: span 1;
}

.tile-large {
    grid-column: span 2;
    grid-row: span 2;
}

/* Tile content styling */
.tile-content {
    height: 100%;
    width: 100%;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px;
    box-sizing: border-box;
    transition: all 0.2s ease;
}

.tile:hover .tile-content {
    transform: scale(1.05);
}

.tile-icon {
    font-size: 2rem;
    margin-bottom: auto;
}

.tile-info {
    margin-top: auto;
}

.tile-title {
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tile-meta {
    font-size: 0.8rem;
    opacity: 0.9;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Windows 8 style animations */
@keyframes tileAppear {
    0% {
        opacity: 0;
        transform: scale(0.9);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
    .tile-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        grid-auto-rows: 100px;
        grid-gap: 8px;
    }

    .tile-icon {
        font-size: 1.5rem;
    }

    .tile-title {
        font-size: 0.8rem;
    }

    .tile-meta {
        font-size: 0.7rem;
    }
}

@media screen and (min-width: 1200px) {
    .tile-grid {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        grid-auto-rows: 160px;
    }
}

/* Loading animation styling */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    margin: 40px auto;
}

.loading-state p {
    color: #888;
    margin-top: 20px;
    font-size: 1rem;
}

.loading-dots {
    display: flex;
    gap: 8px;
}

.loading-dots span {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #0078d7;
    animation: dotPulse 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

.loading-dots span:nth-child(4) {
    animation-delay: 0.6s;
}

.loading-dots span:nth-child(5) {
    animation-delay: 0.8s;
}

@keyframes dotPulse {
    0%,
    100% {
        transform: scale(0.3);
        opacity: 0.2;
    }
    50% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Empty state styling */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 60px 20px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    max-width: 500px;
    margin: 40px auto;
    text-align: center;
}

.empty-state i {
    font-size: 4rem;
    color: #0078d7;
    margin-bottom: 10px;
}

.empty-state h3 {
    font-size: 1.5rem;
    font-weight: 300;
    margin: 0;
    color: white;
}

.empty-state p {
    color: #888;
    margin: 0;
}
</style>
