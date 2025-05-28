import axiosInstance from '@/util/axios-config';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFilterStore = defineStore('filter', () => {
    // State
    const filters = ref({
        itemType: [],
        categoryId: [],
        language: '',
        gradeLevel: [],
        subject: [],
        keyword: '',
        format: 'all'
    });

    const filterOptions = ref({
        ebook_types: [],
        categories: [],
        languages: [],
        grades: [],
        subjects: []
    });

    const resources = ref([]);
    const loading = ref(false);
    const filtersLoading = ref(true);
    const totalRecords = ref(0);
    const currentPage = ref(1);
    const resourcesPerPage = ref(5);

    // Actions
    const fetchFilterOptions = async () => {
        filtersLoading.value = true;
        try {
            const response = await axiosInstance.get('/constants/all');
            if (response.data) {
                filterOptions.value = {
                    ebook_types: response.data.ebook_types?.data || [],
                    categories: response.data.categories?.data || [],
                    languages: response.data.languages?.data || [],
                    grades: response.data.grades?.data || [],
                    subjects: response.data.subjects?.data || []
                };
            }
        } catch (error) {
            console.error('Failed to fetch filter options:', error);
            throw error;
        } finally {
            filtersLoading.value = false;
        }
    };

    const applyFilters = async (newFilters = null) => {
        if (newFilters) {
            filters.value = { ...newFilters };
        }

        loading.value = true;
        currentPage.value = 1; // Reset to first page when applying filters

        try {
            const params = {
                page: currentPage.value,
                per_page: resourcesPerPage.value,
                format: filters.value.format || 'all'
            };

            // Add filter parameters to API request
            if (filters.value.keyword && filters.value.keyword.trim()) {
                params.title = filters.value.keyword.trim();
            }
            if (filters.value.categoryId && filters.value.categoryId.length > 0) {
                params.category_id = filters.value.categoryId[0];
            }
            if (filters.value.language && filters.value.language !== '') {
                params.language_id = filters.value.language;
            }
            if (filters.value.gradeLevel && filters.value.gradeLevel.length > 0) {
                params.grade_id = filters.value.gradeLevel[0];
            }
            if (filters.value.subject && filters.value.subject.length > 0) {
                params.subject_id = filters.value.subject[0];
            }

            console.log('API request params:', params);
            const response = await axiosInstance.get('/book-items', { params });

            if (response.data && response.data.data) {
                processResourcesData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch filtered resources:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const fetchResources = async (page = 1) => {
        loading.value = true;
        currentPage.value = page;

        try {
            const response = await axiosInstance.get('/book-items', {
                params: {
                    page: currentPage.value,
                    per_page: resourcesPerPage.value,
                    format: 'all'
                }
            });

            if (response.data && response.data.data) {
                processResourcesData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            throw error;
        } finally {
            loading.value = false;
        }
    };

    const processResourcesData = (apiResponse) => {
        const expandedResources = [];

        apiResponse.data.forEach((item) => {
            const hasPhysicalBook = item.books_count && item.books_count.total > 0;
            const hasEbook = item.ebooks_count && item.ebooks_count.total > 0;

            if (hasPhysicalBook) {
                const physicalBookCard = {
                    id: `${item.id}-physical`,
                    originalId: item.id,
                    title: item.title,
                    author: item.author,
                    description: item.description,
                    type: 'Physical Book',
                    image: item.cover_image,
                    category: item.category ? item.category.name : null,
                    language: item.language ? item.language.name : null,
                    grade: item.grade ? `Grade ${item.grade.name}` : '',
                    subject: item.subject ? item.subject.name : null,
                    library: item.library ? item.library.name : null,
                    available_books_count: item.books_count.available,
                    total_books_count: item.books_count.total,
                    availability_status: item.books_count.available > 0 ? 'available' : 'borrowed',
                    resource_type: 'physical',
                    is_physical: true
                };
                expandedResources.push(physicalBookCard);
            }

            if (hasEbook) {
                const ebookTypes = item.ebooks_count.by_type || {};
                const availableTypes = [];
                if (ebookTypes.pdf > 0) availableTypes.push(`PDF (${ebookTypes.pdf})`);
                if (ebookTypes.video > 0) availableTypes.push(`Video (${ebookTypes.video})`);
                if (ebookTypes.audio > 0) availableTypes.push(`Audio (${ebookTypes.audio})`);

                const ebookCard = {
                    id: `${item.id}-ebook`,
                    originalId: item.id,
                    title: item.title,
                    author: item.author,
                    description: item.description,
                    type: 'Digital Collection',
                    image: item.cover_image,
                    category: item.category ? item.category.name : null,
                    language: item.language ? item.language.name : null,
                    grade: item.grade ? `Grade ${item.grade.name}` : '',
                    subject: item.subject ? item.subject.name : null,
                    library: item.library ? item.library.name : null,
                    total_ebooks_count: item.ebooks_count.total,
                    downloadable_count: item.ebooks_count.downloadable,
                    ebook_types: availableTypes.join(', '),
                    ebooks_count: item.ebooks_count,
                    availability_status: 'available',
                    resource_type: 'ebook',
                    ebook_types_breakdown: ebookTypes,
                    is_ebook: true
                };
                expandedResources.push(ebookCard);
            }
        });

        resources.value = expandedResources;
        totalRecords.value = apiResponse.total || 0;
    };

    const resetFilters = () => {
        filters.value = {
            itemType: [],
            categoryId: [],
            language: '',
            gradeLevel: [],
            subject: [],
            keyword: '',
            format: 'all'
        };
        applyFilters();
    };

    const updatePage = (page) => {
        currentPage.value = page;
        if (hasActiveFilters()) {
            applyFilters();
        } else {
            fetchResources(page);
        }
    };

    const hasActiveFilters = () => {
        return (
            filters.value.itemType.length > 0 ||
            filters.value.categoryId.length > 0 ||
            filters.value.language !== '' ||
            filters.value.gradeLevel.length > 0 ||
            filters.value.subject.length > 0 ||
            filters.value.keyword !== '' ||
            filters.value.format !== 'all'
        );
    };

    const getActiveFilterCount = () => {
        let count = 0;
        count += filters.value.itemType.length;
        count += filters.value.categoryId.length;
        count += filters.value.language ? 1 : 0;
        count += filters.value.gradeLevel.length;
        count += filters.value.subject.length;
        if (filters.value.keyword) count += 1;
        if (filters.value.format !== 'all') count += 1;
        return count;
    };

    return {
        // State
        filters,
        filterOptions,
        resources,
        loading,
        filtersLoading,
        totalRecords,
        currentPage,
        resourcesPerPage,

        // Actions
        fetchFilterOptions,
        applyFilters,
        fetchResources,
        resetFilters,
        updatePage,
        hasActiveFilters,
        getActiveFilterCount
    };
});
