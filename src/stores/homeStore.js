import axiosInstance from '@/util/axios-config';
import { defineStore } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';

export const useHomeStore = defineStore('home', () => {
    // Toast for notifications
    const toast = useToast();

    // State
    const loading = ref(false);
    const allFeaturedResources = ref([]);
    const totalRecords = ref(0);
    const sortField = ref('created_at');
    const sortDirection = ref('desc');
    const currentPage = ref(1);
    const resourcesPerPage = ref(5);
    const first = ref(0);
    const lastPage = ref(1);
    const searchQuery = ref('');
    const filterKeyword = ref('');
    const selectedResource = ref(null);
    const resourceModalVisible = ref(false);
    const pdfViewerVisible = ref(false);
    const isYoutubeVideo = ref(false);
    const youtubeEmbedUrl = ref('');
    const activeFilters = ref({
        itemType: [],
        categoryId: [],
        language: '',
        gradeLevel: []
    });

    // Computed properties
    const featuredResources = computed(() => {
        return allFeaturedResources.value;
    });

    const totalPages = computed(() => Math.ceil(totalRecords.value / resourcesPerPage.value));

    // inside defineStore(…)
    const fetchBookItem = async (filterParams = {}) => {
        loading.value = true;
        try {
            // Ensure pagination parameters are included
            const params = {
                page: currentPage.value,
                per_page: resourcesPerPage.value,
                ...filterParams
            };

            console.log('📡 fetchBookItem() → Axios params:', params);

            const response = await axiosInstance.get('/book/item', { params });
            console.log('Fetched book items:', response.data);

            // Map into your featured array...
            allFeaturedResources.value = response.data.data.map((item) => ({
                id: item.id,
                title: item.title,
                cover_image_url: item.cover_image_url?.item.cover_image_url ?? 'https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg',
                description: item.description,
                type: capitalizeFirstLetter(item.item_type),
                author: item.author,
                image: item.cover_image_url,
                rating: 4.5,
                category: item.category?.category_name ?? 'Uncategorized',
                publisher: item.publisher?.publisher_name ?? 'Unknown',
                publication_year: item.publication_year,
                language: item.language,
                availability_status: item.availability_status,
                isbn: item.isbn,
                library_branch_id: item.library_branch_id,
                shelfCode: item.shelf?.ShelfCode ?? null
            }));

            // Meta
            totalRecords.value = parseInt(response.data.meta.total) || 0;
            currentPage.value = parseInt(response.data.meta.current_page) || 1;
            lastPage.value = parseInt(response.data.meta.total_pages) || 1;
            first.value = (currentPage.value - 1) * resourcesPerPage.value;
        } catch (error) {
            console.error('Error fetching book items:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load library resources',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    };

    const onPageChange = (event) => {
        first.value = event.first;
        currentPage.value = event.page + 1;

        if (event.rows !== resourcesPerPage.value) {
            console.log('Rows per page changed:', event.rows);
            resourcesPerPage.value = event.rows;
        }

        console.log('Page change event:', {
            first: first.value,
            page: currentPage.value,
            rows: resourcesPerPage.value,
            event: event
        });

        // Pass the correct pagination parameters to fetchBookItem
        fetchBookItem({
            page: currentPage.value,
            per_page: resourcesPerPage.value
        });
    };

    const resetFilters = () => {
        filterKeyword.value = '';
        activeFilters.value = {
            itemType: [],
            categoryId: [],
            language: '',
            gradeLevel: []
        };
        currentPage.value = 1;
        first.value = 0;
    };

    const searchResources = () => {
        if (searchQuery.value.trim()) {
            resetFilters();
            filterKeyword.value = searchQuery.value.trim();
            fetchBookItem();

            toast.add({
                severity: 'info',
                summary: 'Searching',
                detail: `Searching for: "${searchQuery.value.trim()}"`,
                life: 3000
            });
        }
    };

    const quickSearch = (topic) => {
        searchQuery.value = topic;
        searchResources();
    };

    const applyFilter = (filterType, value) => {
        if (filterType === 'itemType' || filterType === 'categoryId') {
            if (!activeFilters.value[filterType].includes(value)) {
                activeFilters.value[filterType].push(value);
            }
        } else {
            activeFilters.value[filterType] = value;
        }

        currentPage.value = 1;
        first.value = 0;
        fetchBookItem();
    };

    // eslint-disable-next-line no-unused-vars
    const removeFilter = (filterType, value = null, index = -1) => {
        if (filterType === 'itemType' || filterType === 'categoryId') {
            activeFilters.value[filterType].splice(index, 1);
        } else {
            activeFilters.value[filterType] = '';
        }

        currentPage.value = 1;
        first.value = 0;
        fetchBookItem();
    };

    const viewResource = (resource) => {
        console.log('Viewing resource:', resource);

        if (resource && resource.id) {
            selectedResource.value = resource;
            resourceModalVisible.value = true;

            // Check if the resource has a file_url and add a demo one if needed
            if (
                !resource.file_url &&
                ((resource.type && (resource.type.toLowerCase() === 'ebook' || resource.type.toLowerCase() === 'pdf' || resource.type.toLowerCase() === 'e-book')) ||
                    (resource.file_format && resource.file_format.toLowerCase() === 'pdf') ||
                    (resource.type && resource.type.toLowerCase().includes('book') && !resource.type.toLowerCase().includes('physical')))
            ) {
                // Add a demo PDF URL for eBooks and PDFs
                selectedResource.value.file_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
            }

            // Handle YouTube videos
            if ((resource.type && (resource.type.toLowerCase() === 'video' || resource.type.toLowerCase() === 'video series')) || (resource.media_type && resource.media_type.toLowerCase() === 'youtube')) {
                isYoutubeVideo.value = true;

                // If we have a media URL and it contains youtube, extract the video ID and create embed URL
                if (resource.media_url && resource.media_url.includes('youtube')) {
                    const videoId = extractYoutubeId(resource.media_url);
                    youtubeEmbedUrl.value = `https://www.youtube.com/embed/${videoId}`;
                } else {
                    // Fallback to demo YouTube video based on category if available
                    const demoVideos = {
                        science: 'Ci6lMQNLmZU',
                        math: 'X54SAB9E-0k',
                        literature: 'E5OgpUNbSEg',
                        history: '54jB5woNbgw',
                        'computer science': 'rBasaTye2kM',
                        physics: 'SZorAJ4I-sA',
                        chemistry: 'bka20Q9TN6M',
                        biology: 'QnQe0xW_JY4',
                        engineering: 'ZSt9tm3RoUU',
                        medicine: '8Ey2egWPu0k',
                        arts: 'ZwKhufmMxko',
                        languages: 'iBpgqJAJWzs',
                        geography: '6Ra3oY_XzC8',
                        economics: '3ez10ADR_gM',
                        education: 'ymJEIZjespw',
                        default: 'dQw4w9WgXcQ' // Famous Rick Roll as default
                    };

                    // Find appropriate video based on resource category or title
                    let demoKey = 'default';
                    if (resource.category) {
                        const category = resource.category.toString().toLowerCase();
                        demoKey = Object.keys(demoVideos).find((key) => category.includes(key)) || demoKey;
                    } else if (resource.title) {
                        const title = resource.title.toLowerCase();
                        demoKey = Object.keys(demoVideos).find((key) => title.includes(key)) || demoKey;
                    }

                    youtubeEmbedUrl.value = `https://www.youtube.com/embed/${demoVideos[demoKey]}`;

                    // Add media_url to the resource for Open in YouTube button
                    selectedResource.value.media_url = `https://www.youtube.com/watch?v=${demoVideos[demoKey]}`;
                }
            } else {
                isYoutubeVideo.value = false;
                youtubeEmbedUrl.value = '';
            }
        }
    };

    const viewBook = (book) => {
        console.log('Viewing book:', book);
        if (book && book.id) {
            selectedResource.value = book;
            resourceModalVisible.value = true;

            // Determine book type and handle accordingly
            const bookType = book.type ? book.type.toLowerCase() : '';

            // Check and set file_url for eBooks and PDFs if not present
            if ((bookType === 'ebook' || bookType === 'pdf' || (book.file_format && book.file_format.toLowerCase() === 'pdf')) && !book.file_url) {
                selectedResource.value.file_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
            }
        }
    };

    const openExternalLink = (url) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    // Utility functions
    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const extractYoutubeId = (url) => {
        if (!url) return null;

        // Match YouTube URL patterns
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        return match && match[2].length === 11 ? match[2] : null;
    };

    return {
        // State
        loading,
        allFeaturedResources,
        totalRecords,
        sortField,
        sortDirection,
        currentPage,
        resourcesPerPage,
        first,
        lastPage,
        searchQuery,
        filterKeyword,
        selectedResource,
        resourceModalVisible,
        pdfViewerVisible,
        isYoutubeVideo,
        youtubeEmbedUrl,
        activeFilters,

        // Computed properties
        featuredResources,
        totalPages,

        // Actions
        fetchBookItem,
        onPageChange,
        resetFilters,
        searchResources,
        quickSearch,
        applyFilter,
        removeFilter,
        viewResource,
        viewBook,
        openExternalLink,

        // Utility functions
        capitalizeFirstLetter,
        extractYoutubeId
    };
});
