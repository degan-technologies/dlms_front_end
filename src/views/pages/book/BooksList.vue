<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
import { useToast } from 'primevue/usetoast';
const toast = useToast();
const books = ref([]);

import { useHomeStore } from '@/stores/homeStore';
import { storeToRefs } from 'pinia';
const homeStore = useHomeStore();
const { loading, allFeaturedResources, totalRecords, resourcesPerPage, first, currentPage } = storeToRefs(homeStore);
const filters = ref({
    global: { value: null, matchMode: 'contains' },
    title: { value: null, matchMode: 'contains' },
    author: { value: null, matchMode: 'contains' },
    isbn: { value: null, matchMode: 'contains' },
    category_name: { value: null, matchMode: 'contains' }
});

const selectedBooks = ref([]);
const lazyParams = ref({
    first: 0,
    rows: 10,
    sortField: 'created_at',
    sortOrder: 1,
    filters: {}
});

const sortField = ref('title'); // Define sortField as a ref
const sortDirection = ref('asc'); // Define sortDirection as a ref

const selectedBookType = ref('');

// Cover type filter options
const coverTypes = ref([
    { label: 'All Cover Types', value: '' },
    { label: 'Hardcover', value: 'hardcover' },
    { label: 'Paperback', value: 'paperback' },
    { label: 'Spiral Bound', value: 'spiral' },
    { label: 'eBook', value: 'ebook' }
]);
const selectedCoverType = ref('');

// Status filter options
const statusOptions = ref([
    { label: 'All Statuses', value: '' },
    { label: 'Available', value: 'available' },
    { label: 'Checked Out', value: 'checked_out' },
    { label: 'Reserved', value: 'reserved' },
    { label: 'Lost', value: 'lost' },
    { label: 'Damaged', value: 'damaged' }
]);
// Branch filter options
const branchOptions = ref([
    { label: 'All Branches', value: '' },
    { label: 'Main Library', value: 1 },
    { label: 'South Branch', value: 2 },
    { label: 'North Branch', value: 3 }
]);
const selectedBranch = ref('');

// Language filter options
const languageOptions = ref([
    { label: 'All Languages', value: '' },
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Chinese', value: 'zh' }
]);
const selectedLanguage = ref('');

const selectedReference = ref(null);

// Publication year range
const yearRange = ref([1900, new Date().getFullYear()]);
const yearFilters = ref({ range: [1980, new Date().getFullYear()] });

// Enhanced filter variables
const displayFilters = ref(false);
const showMoreFilters = ref(false);
const selectedCategories = ref([]);
const selectedStatuses = ref([]);
const selectedCoverTypes = ref([]);
const isReferenceOnly = ref(false);

// Category options
const categories = ref([
    { label: 'Fiction', value: 'fiction' },
    { label: 'Non-Fiction', value: 'non-fiction' },
    { label: 'Computer Science', value: 'computer_science' },
    { label: 'Psychology', value: 'psychology' },
    { label: 'Mathematics', value: 'mathematics' },
    { label: 'History', value: 'history' },
    { label: 'Science', value: 'science' },
    { label: 'Biography', value: 'biography' }
]);

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
    return (
        selectedCategories.value.length > 0 ||
        selectedStatuses.value.length > 0 ||
        selectedCoverTypes.value.length > 0 ||
        isReferenceOnly.value ||
        selectedBranch.value !== '' ||
        selectedLanguage.value !== '' ||
        (yearFilters.value.range && (yearFilters.value.range[0] !== yearRange.value[0] || yearFilters.value.range[1] !== yearRange.value[1])) ||
        filters.value.global.value
    );
});

// Get list of active filters for display as pills
const activeFiltersList = computed(() => {
    const activeFilters = [];

    // Global search
    if (filters.value.global.value) {
        activeFilters.push({
            type: 'search',
            label: `Search: ${filters.value.global.value}`,
            severity: 'info',
            value: filters.value.global.value
        });
    }

    // Categories
    selectedCategories.value.forEach((catValue) => {
        const category = categories.value.find((c) => c.value === catValue);
        if (category) {
            activeFilters.push({
                type: 'category',
                label: category.label,
                severity: 'success',
                value: catValue
            });
        }
    });

    // Statuses
    selectedStatuses.value.forEach((statusValue) => {
        const status = statusOptions.value.find((s) => s.value === statusValue);
        if (status) {
            activeFilters.push({
                type: 'status',
                label: status.label,
                severity: getStatusSeverity(statusValue) || 'info',
                value: statusValue
            });
        }
    });

    // Cover types
    selectedCoverTypes.value.forEach((coverValue) => {
        const cover = coverTypes.value.find((c) => c.value === coverValue);
        if (cover) {
            activeFilters.push({
                type: 'cover',
                label: cover.label,
                severity: 'info',
                value: coverValue
            });
        }
    });

    // Reference only
    if (isReferenceOnly.value) {
        activeFilters.push({
            type: 'reference',
            label: 'Reference Only',
            severity: 'info',
            value: true
        });
    }

    // Branch
    if (selectedBranch.value) {
        const branch = branchOptions.value.find((b) => b.value === selectedBranch.value);
        if (branch) {
            activeFilters.push({
                type: 'branch',
                label: `Branch: ${branch.label}`,
                severity: 'info',
                value: selectedBranch.value
            });
        }
    }

    // Language
    if (selectedLanguage.value) {
        const language = languageOptions.value.find((l) => l.value === selectedLanguage.value);
        if (language) {
            activeFilters.push({
                type: 'language',
                label: `Language: ${language.label}`,
                severity: 'info',
                value: selectedLanguage.value
            });
        }
    }

    // Year range
    if (yearFilters.value.range && (yearFilters.value.range[0] !== yearRange.value[0] || yearFilters.value.range[1] !== yearRange.value[1])) {
        activeFilters.push({
            type: 'year',
            label: `Year: ${yearFilters.value.range[0]} - ${yearFilters.value.range[1]}`,
            severity: 'info',
            value: yearFilters.value.range
        });
    }

    return activeFilters;
});

// Function to remove a specific filter
const removeFilter = (filter) => {
    switch (filter.type) {
        case 'search':
            filters.value.global.value = null;
            break;
        case 'category':
            selectedCategories.value = selectedCategories.value.filter((c) => c !== filter.value);
            break;
        case 'status':
            selectedStatuses.value = selectedStatuses.value.filter((s) => s !== filter.value);
            break;
        case 'cover':
            selectedCoverTypes.value = selectedCoverTypes.value.filter((c) => c !== filter.value);
            break;
        case 'reference':
            isReferenceOnly.value = false;
            break;
        case 'branch':
            selectedBranch.value = '';
            break;
        case 'language':
            selectedLanguage.value = '';
            break;
        case 'year':
            yearFilters.value.range = [yearRange.value[0], yearRange.value[1]];
            break;
    }

    applyFilters();
};

// Enhanced reset function for all filters
const resetFilters = () => {
    selectedCategories.value = [];
    selectedStatuses.value = [];
    selectedCoverTypes.value = [];
    isReferenceOnly.value = false;
    selectedBranch.value = '';
    selectedLanguage.value = '';
    selectedBookType.value = '';
    yearFilters.value.range = [yearRange.value[0], yearRange.value[1]];

    filters.value = {
        global: { value: null, matchMode: 'contains' },
        title: { value: null, matchMode: 'contains' },
        author: { value: null, matchMode: 'contains' },
        isbn: { value: null, matchMode: 'contains' },
        category: { value: null, matchMode: 'contains' }
    };

    applyFilters();
};

// Enhanced apply filters function that collects all filter values
function applyFilters() {
    console.log('🔥 applyFilters() triggered');

    // Build raw params
    let params = {
        // pagination from lazyParams
        page: Math.floor(lazyParams.value.first / lazyParams.value.rows) + 1,
        per_page: lazyParams.value.rows,
        sort_by: lazyParams.value.sortField,
        sort_direction: lazyParams.value.sortOrder === 1 ? 'asc' : 'desc',

        global: filters.value.global.value,
        item_type: selectedBookType.value,
        cover_type: selectedCoverType.value,
        availability_status: selectedStatuses.value.length ? selectedStatuses.value.join(',') : null,
        library_branch_id: selectedBranch.value,
        language: selectedLanguage.value,
        reference_only: selectedReference.value,

        category: selectedCategories.value.length ? selectedCategories.value.join(',') : null,

        year_from: yearFilters.value.range[0],
        year_to: yearFilters.value.range[1]
    };

    // Strip out any null or empty-string fields
    Object.keys(params).forEach((key) => {
        if (params[key] == null || params[key] === '') {
            delete params[key];
        }
    });

    console.log('→ applyFilters cleaned params:', params);

    // reset pagination UI
    first.value = 0;
    lazyParams.value.first = 0;

    // send to store
    homeStore.fetchBookItem(params);
}

const featuredResources = computed(() => allFeaturedResources.value);

onMounted(async () => {
    applyFilters();
    try {
        await homeStore.fetchBookItem();
        // 1) Console-log
        console.log('DEBUG: fetched resources →', allFeaturedResources.value);

        // 2) Show count in a toast
        toast.add({
            severity: 'success',
            summary: 'Fetched',
            detail: `${allFeaturedResources.value.length} resources loaded`,
            life: 3000
        });
    } catch (e) {
        console.error('DEBUG: fetchBookItem error →', e);
        toast.add({
            severity: 'error',
            summary: 'Fetch Error',
            detail: 'Failed to load resources. See console for details.',
            life: 5000
        });
    }
    // Log to verify data
});

// Make featured books a computed property

// Use featuredBooks in the template or logic to avoid unused variable error

// 1) On page change
function onPage(event) {
    lazyParams.value.first = event.first;
    lazyParams.value.rows = event.rows;
    currentPage.value = event.page + 1;
    resourcesPerPage.value = event.rows;
    applyFilters();
}

function onSort(event) {
    // only allow these real columns:
    const valid = ['author', 'isbn', 'publication_year', 'created_at'];
    sortField.value = valid.includes(event.sortField) ? event.sortField : 'created_at';

    sortDirection.value = event.sortOrder === 1 ? 'asc' : 'desc';
    applyFilters();
}

function onFilter() {
    // PrimeVue column filters or global filter
    lazyParams.value.first = 0;
    applyFilters();
}

const viewDetails = (book) => {
    router.push(`/books/physical/${book.id}`);
};

const editBook = (book) => {
    router.push(`/books/physical/edit/${book.id}`);
};

const createBook = () => {
    router.push('/books/physical/create');
};

const borrowBook = (book) => {
    // In a real app, this would initiate a borrowing process
    alert(`Processing borrowing request for "${book.title}"`);
};

const confirmDeleteBook = (book) => {
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
        deleteBook(book.id);
    }
};

const deleteBook = async (id) => {
    try {
        // Simulated API call
        books.value = books.value.filter((book) => book.id !== id);
        totalRecords.value--;
    } catch (error) {
        console.error(`Failed to delete book with ID ${id}:`, error);
    }
};

const getBookIcon = (book) => {
    if (book.reference_only) return 'pi pi-book';

    switch (book.book_type) {
        case 'fiction':
            return 'pi pi-bookmark';
        case 'non-fiction':
            return 'pi pi-info-circle';
        case 'reference':
            return 'pi pi-book';
        case 'textbook':
            return 'pi pi-briefcase';
        case 'biography':
            return 'pi pi-user';
        default:
            return 'pi pi-book';
    }
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'available':
            return 'success';
        case 'checked_out':
            return 'info';
        case 'reserved':
            return 'warning';
        case 'lost':
            return 'danger';
        case 'damaged':
            return 'danger';
        default:
            return null;
    }
};

const exportCSV = () => {
    // Will use PrimeVue's DataTable export feature
};

const formatStatus = (status) => {
    return status
        .replace('_', ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};
</script>

<template>
    <div class="card">
        <h5 class="m-0">Physical Books Collection</h5>
        <p class="mt-2 mb-4 text-gray-600">Browse, search, and manage the physical books available in the library.</p>

        <!-- Enhanced Filter Section with E-commerce style -->
        <div class="filter-container mb-4">
            <!-- Search Bar with Advanced Filter Toggle -->
            <div class="flex flex-column md:flex-row align-items-center justify-content-between gap-3 mb-3">
                <span class="p-input-icon-left w-full md:w-full">
                    <i class="pi pi-search" />
                    <InputText v-model="filters.global.value" placeholder="Search books by title, author, ISBN, shelf ID..." class="w-full" />
                </span>
                <div class="flex align-items-center gap-2">
                    <Button
                        type="button"
                        icon="pi pi-filter"
                        label="Filters"
                        @click="displayFilters = !displayFilters"
                        :class="{
                            'p-button-outlined': !displayFilters,
                            'p-button-info': displayFilters
                        }"
                    />
                    <Button type="button" icon="pi pi-filter-slash" class="p-button-text" @click="resetFilters" :disabled="!hasActiveFilters" title="Clear all filters" />
                </div>
            </div>

            <!-- Advanced Filters Panel - E-commerce Style -->
            <div v-if="displayFilters" class="filter-panel p-3 mb-4 surface-ground border-round">
                <div class="grid">
                    <!-- Key Filters Section - First Row -->
                    <div class="col-12 md:col-4 lg:col-3 xl:col-2 filter-group">
                        <div class="filter-header">
                            <i class="pi pi-tag mr-2"></i>
                            <h6>Category</h6>
                        </div>
                        <div class="filter-options">
                            <div v-for="category in categories" :key="category.value" class="filter-option">
                                <Checkbox :inputId="`category-${category.value}`" name="category" :value="category.value" v-model="selectedCategories" />
                                <label :for="`category-${category.value}`" class="ml-2">{{ category.label }}</label>
                            </div>
                        </div>
                    </div>

                    <!-- Availability Status -->
                    <div class="col-12 md:col-4 lg:col-3 xl:col-2 filter-group">
                        <div class="filter-header">
                            <i class="pi pi-check-circle mr-2"></i>
                            <h6>Availability</h6>
                        </div>
                        <div class="filter-options">
                            <div v-for="status in statusOptions" :key="status.value" class="filter-option" v-show="status.value !== ''">
                                <Checkbox :inputId="`status-${status.value}`" name="status" :value="status.value" v-model="selectedStatuses" />
                                <label :for="`status-${status.value}`" class="ml-2">
                                    <Tag :value="status.label" :severity="getStatusSeverity(status.value)" class="mr-2" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Format/Cover Type -->
                    <div class="col-12 md:col-4 lg:col-3 xl:col-2 filter-group">
                        <div class="filter-header">
                            <i class="pi pi-book mr-2"></i>
                            <h6>Format</h6>
                        </div>
                        <div class="filter-options">
                            <div v-for="cover in coverTypes" :key="cover.value" class="filter-option" v-show="cover.value !== ''">
                                <Checkbox :inputId="`cover-${cover.value}`" name="cover" :value="cover.value" v-model="selectedCoverTypes" />
                                <label :for="`cover-${cover.value}`" class="ml-2">{{ cover.label }}</label>
                            </div>
                            <!-- Reference Only is a format property too -->
                            <div class="filter-option mt-2">
                                <Checkbox inputId="reference-only" name="reference" :binary="true" v-model="isReferenceOnly" />
                                <label for="reference-only" class="ml-2">Reference Only</label>
                            </div>
                        </div>
                    </div>

                    <!-- Second row - toggleable secondary filters -->
                    <div class="col-12 filter-group-toggle">
                        <Button
                            :label="showMoreFilters ? 'Show Less Filters' : 'Show More Filters'"
                            icon="pi pi-angle-down"
                            :icon-pos="showMoreFilters ? 'right' : 'right'"
                            class="p-button-text p-button-sm"
                            @click="showMoreFilters = !showMoreFilters"
                        />
                    </div>

                    <!-- Additional Filters (only shown when "Show More Filters" is clicked) -->
                    <div v-if="showMoreFilters" class="col-12">
                        <div class="grid">
                            <!-- Branch Location -->
                            <div class="col-12 md:col-4 lg:col-3 xl:col-2 filter-group">
                                <div class="filter-header">
                                    <i class="pi pi-map-marker mr-2"></i>
                                    <h6>Library Branch</h6>
                                </div>
                                <div class="filter-options">
                                    <Dropdown v-model="selectedBranch" :options="branchOptions" optionLabel="label" optionValue="value" placeholder="All Branches" class="w-full mb-2" />
                                </div>
                            </div>

                            <!-- Language -->
                            <div class="col-12 md:col-4 lg:col-3 xl:col-2 filter-group">
                                <div class="filter-header">
                                    <i class="pi pi-globe mr-2"></i>
                                    <h6>Language</h6>
                                </div>
                                <div class="filter-options">
                                    <Dropdown v-model="selectedLanguage" :options="languageOptions" optionLabel="label" optionValue="value" placeholder="All Languages" class="w-full mb-2" />
                                </div>
                            </div>

                            <!-- Publication Year Range -->
                            <div class="col-12 md:col-4 lg:col-3 xl:col-2 filter-group">
                                <div class="filter-header">
                                    <i class="pi pi-calendar mr-2"></i>
                                    <h6>Publication Year</h6>
                                </div>
                                <div class="filter-options">
                                    <div class="flex flex-column gap-2">
                                        <Slider v-model="yearFilters.range" :min="yearRange[0]" :max="yearRange[1]" :step="1" range class="w-full" />
                                        <div class="flex justify-content-between">
                                            <span>{{ yearFilters.range[0] }}</span>
                                            <span>{{ yearFilters.range[1] }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Active Filter Pills -->
                    <div v-if="hasActiveFilters" class="col-12 mt-3">
                        <div class="flex align-items-center mb-2">
                            <i class="pi pi-filter mr-2" style="font-size: 1rem"></i>
                            <h6 class="m-0">Active Filters:</h6>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <Tag v-for="(filter, index) in activeFiltersList" :key="index" :value="filter.label" :severity="filter.severity" class="active-filter" removable @remove="removeFilter(filter)" />
                        </div>
                    </div>

                    <!-- Filter Actions -->
                    <div class="col-12 flex justify-content-end gap-2 mt-3">
                        <Button label="Apply Filters" icon="pi pi-filter" @click="applyFilters" />
                    </div>
                </div>
            </div>
        </div>

        <Toolbar class="mb-4">
            <template v-slot:start>
                <Button label="New Book" icon="pi pi-plus" severity="success" class="mr-2" @click="createBook" />
                <Button label="Delete Selected" icon="pi pi-trash" severity="danger" :disabled="!selectedBooks.length" />
            </template>
            <template v-slot:end>
                <Button icon="pi pi-file-excel" severity="success" @click="exportCSV" />
            </template>
        </Toolbar>

        <!-- Enhanced Data Table -->
        <DataTable
            v-model:selection="selectedBooks"
            :value="featuredResources"
            :paginator="true"
            :rows="resourcesPerPage"
            :loading="loading"
            :lazy="true"
            :total-records="totalRecords"
            v-model:first="first"
            :rowsPerPageOptions="[5, 10, 15, 20]"
            :row-hover="true"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            current-page-report-template="Showing {first} to {last} of {totalRecords} books"
            responsive-layout="stack"
            :global-filter-fields="['title', 'author', 'isbn', 'category.name', 'publisher.name', 'description']"
            v-model:filters="filters"
            @page="onPage"
            @sort="onSort"
            @filter="onFilter"
            style-class="p-datatable-gridlines p-datatable-sm"
            breakpoint="960px"
        >
            <template #empty>
                <div class="p-4 text-center">
                    <i class="pi pi-folder-open text-primary" style="font-size: 3rem"></i>
                    <p>No books found.</p>
                </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column header="Cover" headerStyle="min-width:5rem; max-width:8rem">
                <template #body="{ data }">
                    <img :src="data.image || 'https://via.placeholder.com/50x70?text=No+Cover'" :alt="data.title || data.isbn" class="shadow-2 border-round" style="width: 50px; height: 70px; object-fit: cover" />
                </template>
            </Column>

            <Column header="Title" sortable :showFilterMenu="false">
                <template #body="{ data }">
                    <div class="flex align-items-center gap-2">
                        <i :class="getBookIcon(data)" style="font-size: 1.2rem" />
                        <div>
                            <span class="font-bold block">
                                {{ data.title || data.isbn }}
                            </span>
                            <small v-if="data.title"> <Badge value="ISBN" severity="info" /> {{ data.isbn }} </small>
                        </div>
                    </div>
                </template>
            </Column>
            <!-- Author -->
            <Column header="Author" sortable>
                <template #body="{ data }">
                    {{ data.author || 'Unknown' }}
                </template>
            </Column>

            <!-- Publisher -->
            <Column header="Publisher" sortable>
                <template #body="{ data }">
                    {{ data.publisher?.publisher_name || 'Unknown' }}
                </template>
            </Column>

            <!-- Year -->
            <Column header="Year" sortable headerStyle="width:6rem">
                <template #body="{ data }">
                    {{ data.publication_year || '–' }}
                </template>
            </Column>

            <!-- Category -->
            <Column header="Category" sortable>
                <template #body="{ data }">
                    {{ data.category || 'Uncategorized' }}
                </template>
            </Column>

            <!-- Status -->
            <Column header="Status" sortable headerStyle="width:8rem">
                <template #body="{ data }">
                    <Tag :value="formatStatus(data.availability_status)" :severity="getStatusSeverity(data.availability_status)" />
                </template>
            </Column>

            <!-- Location -->
            <Column header="Location" sortable headerStyle="min-width:10rem">
                <template #body="{ data }">
                    <div>
                        <div>Branch ID: {{ data.library_branch_id }}</div>
                        <div class="flex align-items-center gap-2 mt-1">
                            <Badge value="SHELF" severity="success" />
                            <span class="text-sm font-bold">
                                {{ data.shelfCode || 'N/A' }}
                            </span>
                        </div>
                    </div>
                </template>
            </Column>

            <!-- Pages with fallback -->
            <Column header="Pages" sortable headerStyle="width:6rem">
                <template #body="{ data }">
                    {{ data.pages != null ? data.pages : '–' }}
                </template>
            </Column>

            <!-- Cover Type with fallback -->
            <Column header="Cover" sortable headerStyle="width:8rem">
                <template #body="{ data }">
                    {{ data.cover_type || 'Unknown' }}
                </template>
            </Column>

            <!-- Actions remain the same -->
            <Column headerStyle="min-width:10rem; text-align:center" bodyStyle="text-align:center">
                <template #header>Actions</template>
                <template #body="{ data }">
                    <div class="flex flex-wrap justify-content-center gap-2">
                        <Button icon="pi pi-eye" tooltip="View Details" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-info p-button-sm" @click="viewDetails(data)" />
                        <Button
                            icon="pi pi-shopping-cart"
                            tooltip="Borrow"
                            tooltipOptions="{ position: 'top' }"
                            class="p-button-rounded p-button-warning p-button-sm"
                            @click="borrowBook(data)"
                            :disabled="data.availability_status !== 'available' || data.reference_only"
                        />
                        <Button icon="pi pi-pencil" tooltip="Edit" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-success p-button-sm" @click="editBook(data)" />
                        <Button icon="pi pi-trash" tooltip="Delete" tooltipOptions="{ position: 'top' }" class="p-button-rounded p-button-danger p-button-sm" @click="confirmDeleteBook(data)" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
/* Responsive styling for table */
@media screen and (max-width: 960px) {
    ::v-deep(.p-datatable-tbody > tr > td .p-column-title) {
        font-weight: 600;
    }
}

/* Enhanced styling for filters */
.filter-container {
    font-family: var(--font-family);
}

.filter-panel {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
}

.filter-group {
    margin-bottom: 1rem;
}

.filter-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
}

.filter-header h6 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color);
}

.filter-options {
    padding-left: 0.5rem;
}

.filter-option {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    cursor: pointer;
}

.filter-option label {
    cursor: pointer;
    font-size: 0.875rem;
}

.active-filter {
    display: flex;
    align-items: center;
}

.filter-group-toggle {
    margin: 0.5rem 0;
}

/* Make filter elements more responsive */
@media screen and (max-width: 768px) {
    .filter-panel {
        padding: 0.75rem !important;
    }

    .filter-group {
        margin-bottom: 1.5rem;
    }

    .filter-header h6 {
        font-size: 1rem;
    }
}

/* Additional styling for DataTable */
.p-datatable ::v-deep(.p-datatable-tbody > tr > td) {
    padding: 0.75rem;
}
</style>
