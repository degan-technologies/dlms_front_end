<template>
    <div class="card">
        <Toast />
        <!-- Page Title -->
        <div class="flex justify-content-between align-items-center mb-5">
            <div>
                <h1 class="text-3xl font-bold m-0">My Bookmarks</h1>
                <p class="text-color-secondary mt-2 mb-0">Access your bookmarked resources quickly</p>
            </div>
            <div class="flex align-items-center">
                <span class="p-input-icon-left mr-3">
                    <i class="pi pi-search" />
                    <InputText v-model="filters.global.value" placeholder="Search bookmarks..." class="p-inputtext-sm" />
                </span>
                <Button icon="pi pi-sort-alt" class="p-button-outlined p-button-rounded p-button-sm" @click="showSortOptions = true" aria-label="Sort" aria-haspopup="true" />
                <Menu ref="sortMenu" :model="sortOptions" :popup="true" aria-label="Sort Options" />
            </div>
        </div>

        <!-- Bookmark Filters by Type -->
        <div class="flex gap-2 mb-4">
            <Button :class="{ 'p-button-outlined': activeFilter !== 'all' }" @click="setFilter('all')" label="All" icon="pi pi-star" size="small" />
            <Button :class="{ 'p-button-outlined': activeFilter !== 'pdf' }" @click="setFilter('pdf')" label="PDF" icon="pi pi-file-pdf" size="small" />
            <Button :class="{ 'p-button-outlined': activeFilter !== 'ebook' }" @click="setFilter('ebook')" label="E-Books" icon="pi pi-book" size="small" />
            <Button :class="{ 'p-button-outlined': activeFilter !== 'video' }" @click="setFilter('video')" label="Videos" icon="pi pi-video" size="small" />
            <Button :class="{ 'p-button-outlined': activeFilter !== 'audio' }" @click="setFilter('audio')" label="Audio" icon="pi pi-volume-up" size="small" />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-content-center py-6">
            <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="3" />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredBookmarks.length === 0" class="surface-ground border-round p-6 flex flex-column align-items-center justify-content-center gap-3">
            <i class="pi pi-bookmark-fill text-5xl text-color-secondary"></i>
            <h3 class="m-0">No bookmarks found</h3>
            <p class="text-color-secondary text-center">
                {{ activeFilter === 'all' ? "You haven't bookmarked any resources yet. Start exploring the library!" : `You don't have any bookmarks for ${activeFilter} resources.` }}
            </p>
            <Button label="Explore Library" icon="pi pi-search" @click="navigateToLibrary" />
        </div>

        <!-- Bookmarks DataTable -->
        <DataTable
            v-else
            :value="filteredBookmarks"
            :paginator="true"
            :rows="10"
            pageLinkSize="5"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            tableStyle="min-width: 50rem"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} bookmarks"
            :filters="filters"
            filterDisplay="menu"
            responsiveLayout="scroll"
            v-model:expandedRows="expandedRows"
            dataKey="id"
            stateStorage="local"
            stateKey="bookmarks-table"
            class="p-datatable-sm"
        >
            <template #empty>
                <div class="flex flex-column align-items-center p-5">
                    <span class="pi pi-search text-5xl text-color-secondary mb-3"></span>
                    <span>No matching bookmarks found</span>
                </div>
            </template>

            <!-- Table Header -->
            <Column style="width: 4rem" />
            <Column field="title" header="Title" :sortable="true" style="min-width: 14rem">
                <template #body="{ data }">
                    <div class="flex align-items-center">
                        <i :class="getIconForResourceType(data.type)" class="text-xl mr-2"></i>
                        <div>
                            <span class="font-semibold block">{{ data.title }}</span>
                            <span class="text-sm text-color-secondary">{{ data.type }}</span>
                        </div>
                    </div>
                </template>
            </Column>

            <Column field="dateBookmarked" header="Date Bookmarked" :sortable="true" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ formatDate(data.dateBookmarked) }}
                </template>
            </Column>

            <Column field="author" header="Author" :sortable="true" style="min-width: 10rem" />

            <Column field="lastAccessed" header="Last Accessed" :sortable="true" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.lastAccessed ? formatDate(data.lastAccessed) : 'Never' }}
                </template>
            </Column>

            <Column style="width: 8rem">
                <template #body="{ data }">
                    <div class="flex justify-content-end">
                        <Button icon="pi pi-eye" @click="viewResource(data)" text rounded tooltip="View" />
                        <Button icon="pi pi-trash" @click="confirmRemove(data)" text rounded tooltip="Remove" class="text-red-500" />
                    </div>
                </template>
            </Column>

            <!-- Expanded Row Template -->
            <template #expansion="{ data }">
                <div class="p-3 surface-hover">
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <h4 class="mt-0 mb-3">Resource Details</h4>
                            <div class="flex flex-column gap-3">
                                <div v-if="data.publisher" class="flex align-items-center gap-2">
                                    <i class="pi pi-building text-color-secondary"></i>
                                    <span><strong>Publisher:</strong> {{ data.publisher }}</span>
                                </div>
                                <div v-if="data.publicationYear" class="flex align-items-center gap-2">
                                    <i class="pi pi-calendar text-color-secondary"></i>
                                    <span><strong>Year:</strong> {{ data.publicationYear }}</span>
                                </div>
                                <div v-if="data.language" class="flex align-items-center gap-2">
                                    <i class="pi pi-globe text-color-secondary"></i>
                                    <span><strong>Language:</strong> {{ data.language }}</span>
                                </div>
                                <div v-if="data.category" class="flex align-items-center gap-2">
                                    <i class="pi pi-folder text-color-secondary"></i>
                                    <span><strong>Category:</strong> {{ data.category }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 md:col-6 flex flex-column">
                            <h4 class="mt-0 mb-3">Bookmark Notes</h4>
                            <div v-if="data.notes" class="surface-card p-3 border-round mb-3 flex-grow-1">
                                <p class="m-0">{{ data.notes }}</p>
                            </div>
                            <div v-else class="surface-card border-round p-3 flex-grow-1 flex align-items-center justify-content-center text-color-secondary">
                                <span>No notes for this bookmark</span>
                            </div>
                            <div class="flex justify-content-end mt-3">
                                <Button icon="pi pi-pencil" label="Add/Edit Note" class="p-button-outlined p-button-sm" @click="openNoteDialog(data)" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </DataTable>

        <!-- Remove Bookmark Confirmation -->
        <ConfirmDialog />

        <!-- Note Dialog -->
        <Dialog v-model:visible="noteDialogVisible" header="Bookmark Note" :style="{ width: '450px' }" modal>
            <div class="field">
                <label for="bookmark-note" class="block mb-2">Add a note to this bookmark</label>
                <Textarea id="bookmark-note" v-model="currentNote" rows="5" class="w-full" autoResize />
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="noteDialogVisible = false" class="p-button-text" />
                <Button label="Save" icon="pi pi-check" @click="saveNote" autofocus />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { format } from 'date-fns';
// Use FilterMatchMode directly as a constant instead of importing from primevue/api
// These values match the ones in PrimeVue
const FilterMatchMode = {
    STARTS_WITH: 'startsWith',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'notContains',
    ENDS_WITH: 'endsWith',
    EQUALS: 'equals',
    NOT_EQUALS: 'notEquals',
    IN: 'in',
    LESS_THAN: 'lt',
    LESS_THAN_OR_EQUAL_TO: 'lte',
    GREATER_THAN: 'gt',
    GREATER_THAN_OR_EQUAL_TO: 'gte',
    BETWEEN: 'between',
    DATE_IS: 'dateIs',
    DATE_IS_NOT: 'dateIsNot',
    DATE_BEFORE: 'dateBefore',
    DATE_AFTER: 'dateAfter'
};

import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Component setup
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const sortMenu = ref();

// State
const bookmarks = ref([]);
const loading = ref(true);
const activeFilter = ref('all');
const showSortOptions = ref(false);
const expandedRows = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const noteDialogVisible = ref(false);
const currentBookmark = ref(null);
const currentNote = ref('');

// Sort options for the dropdown menu
const sortOptions = [
    {
        label: 'Date Bookmarked (Newest First)',
        icon: 'pi pi-sort-amount-down',
        command: () => sortBookmarks('dateBookmarked', -1)
    },
    {
        label: 'Date Bookmarked (Oldest First)',
        icon: 'pi pi-sort-amount-up',
        command: () => sortBookmarks('dateBookmarked', 1)
    },
    {
        label: 'Title (A-Z)',
        icon: 'pi pi-sort-alpha-down',
        command: () => sortBookmarks('title', 1)
    },
    {
        label: 'Title (Z-A)',
        icon: 'pi pi-sort-alpha-up',
        command: () => sortBookmarks('title', -1)
    },
    {
        label: 'Recently Accessed',
        icon: 'pi pi-clock',
        command: () => sortBookmarks('lastAccessed', -1)
    }
];

// Computed properties
const filteredBookmarks = computed(() => {
    if (activeFilter.value === 'all') {
        return bookmarks.value;
    }
    return bookmarks.value.filter((b) => b.type.toLowerCase() === activeFilter.value);
});

// Methods
const fetchBookmarks = async () => {
    loading.value = true;
    try {
        // In a real app, you would fetch bookmarks from an API
        // For now, we'll use mock data
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API delay

        bookmarks.value = [
            {
                id: '1',
                title: 'Introduction to Computer Science',
                type: 'PDF',
                author: 'Dr. John Smith',
                dateBookmarked: new Date('2023-08-15'),
                lastAccessed: new Date('2023-09-01'),
                publisher: 'Academic Press',
                publicationYear: '2021',
                language: 'English',
                category: 'Computer Science',
                notes: 'Important reference for CS101 course'
            },
            {
                id: '2',
                title: 'Advanced Data Structures',
                type: 'Ebook',
                author: 'Jane Doe',
                dateBookmarked: new Date('2023-07-22'),
                lastAccessed: new Date('2023-08-30'),
                publisher: 'Tech Publications',
                publicationYear: '2020',
                language: 'English',
                category: 'Computer Science'
            },
            {
                id: '3',
                title: 'Machine Learning Fundamentals',
                type: 'Video',
                author: 'Prof. Alex Johnson',
                dateBookmarked: new Date('2023-09-05'),
                lastAccessed: null,
                publisher: 'TechEd Videos',
                publicationYear: '2022',
                language: 'English',
                category: 'Data Science'
            },
            {
                id: '4',
                title: 'History of Ancient Civilizations',
                type: 'Audio',
                author: 'Dr. Maria Garcia',
                dateBookmarked: new Date('2023-06-10'),
                lastAccessed: new Date('2023-07-15'),
                publisher: 'Historical Archives',
                publicationYear: '2019',
                language: 'English',
                category: 'History',
                notes: 'Great background material for the Egypt project'
            },
            {
                id: '5',
                title: 'Modern Physics Principles',
                type: 'PDF',
                author: 'Dr. Robert Chen',
                dateBookmarked: new Date('2023-08-30'),
                lastAccessed: new Date('2023-09-10'),
                publisher: 'Science Press',
                publicationYear: '2021',
                language: 'English',
                category: 'Physics'
            }
        ];
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load bookmarks. Please try again later.',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const setFilter = (filter) => {
    activeFilter.value = filter;
};

const sortBookmarks = (field, direction) => {
    bookmarks.value.sort((a, b) => {
        if (field === 'lastAccessed') {
            // Handle null lastAccessed dates
            if (!a[field] && !b[field]) return 0;
            if (!a[field]) return 1;
            if (!b[field]) return -1;
        }

        if (a[field] < b[field]) return -1 * direction;
        if (a[field] > b[field]) return 1 * direction;
        return 0;
    });
};

const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM d, yyyy');
};

const getIconForResourceType = (type) => {
    const typeMap = {
        PDF: 'pi pi-file-pdf text-red-500',
        Ebook: 'pi pi-book text-blue-500',
        Video: 'pi pi-video text-purple-500',
        Audio: 'pi pi-volume-up text-orange-500'
    };

    return typeMap[type] || 'pi pi-file text-gray-500';
};

const viewResource = (resource) => {
    // Update lastAccessed date
    resource.lastAccessed = new Date();

    // Navigate to the universal reader with the appropriate type
    router.push({
        name: 'universal-reader',
        params: { id: resource.id },
        query: { type: resource.type.toLowerCase() }
    });
};

const confirmRemove = (bookmark) => {
    confirm.require({
        message: `Are you sure you want to remove "${bookmark.title}" from your bookmarks?`,
        header: 'Remove Bookmark',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => removeBookmark(bookmark)
    });
};

const removeBookmark = (bookmark) => {
    // In a real app, you would call an API to remove the bookmark
    bookmarks.value = bookmarks.value.filter((b) => b.id !== bookmark.id);

    toast.add({
        severity: 'success',
        summary: 'Bookmark Removed',
        detail: 'The bookmark has been removed from your list',
        life: 3000
    });
};

const openNoteDialog = (bookmark) => {
    currentBookmark.value = bookmark;
    currentNote.value = bookmark.notes || '';
    noteDialogVisible.value = true;
};

const saveNote = () => {
    if (currentBookmark.value) {
        currentBookmark.value.notes = currentNote.value;

        // In a real app, you would save this to an API
        toast.add({
            severity: 'success',
            summary: 'Note Saved',
            detail: 'Your bookmark note has been updated',
            life: 3000
        });

        noteDialogVisible.value = false;
    }
};

const navigateToLibrary = () => {
    router.push('/');
};

// Watch for sort options menu click
watch(showSortOptions, (newVal) => {
    if (newVal) {
        sortMenu.value.toggle(event);
        showSortOptions.value = false;
    }
});

// Lifecycle hooks
onMounted(() => {
    fetchBookmarks();
});
</script>

<style scoped>
.resource-title {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
