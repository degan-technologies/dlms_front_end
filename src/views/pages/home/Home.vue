<script setup>
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import HeroSection from '@/components/home/HeroSection.vue';
import NewArrivals from '@/components/home/NewArrivals.vue';
import QuickLinks from '@/components/home/QuickLinks.vue';
import ReadingLists from '@/components/home/ReadingLists.vue';
import RecentlyViewed from '@/components/home/RecentlyViewed.vue';
import ResourceFilters from '@/components/home/ResourceFilters.vue';
import ResourceGrid from '@/components/home/ResourceGrid.vue';
// import ResourceRequestForm from '@/components/home/ResourceRequestForm.vue';
import StatsBar from '@/components/home/StatsBar.vue';
// Note: AskLibrarian component would need to be created separately
import AskLibrarian from '@/components/home/AskLibrarian.vue';
import SchoolBranch from '@/components/home/SchoolBranch.vue';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';

import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
// import { useHomeStore } from '@/stores/homeStore';
const authStore = useAuthStore();
const store = useChatStore();
const router = useRouter();
const toast = useToast();
const user = computed(() => authStore.getUser || {});
const userId = computed(() => user.value?.user?.id || null);
const authLoading = ref(true);
const { auth } = storeToRefs(authStore);
// Search functionality
const searchQuery = ref('');
const searchResults = ref([]);
const searchLoading = ref(false);
const searchError = ref(null);
const searchMeta = ref({});
const searchFilters = ref({
    category_id: '',
    language_id: '',
    subject_id: '',
    grade_id: '',
    library_id: ''
});

// Filter options from backend
const filterOptions = ref({
    categories: [],
    languages: [],
    subjects: [],
    grades: [],
    libraries: []
});
const filtersLoading = ref(false);
const openFilterSection = ref('category');

// Physical book reservation modal
const showReservationModal = ref(false);
const selectedPhysicalBook = ref(null);
const currentAnnouncementIndex = ref(0);
const showAnnouncements = ref(true);

// Special announcement state
const showAnnouncement = ref(false);
const specialNotice = ref(null);
const searchCurrentPage = ref(1);
const searchPerPage = ref(15);

const logout = authStore.logout;

import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import Toast from 'primevue/toast';

// Mobile menu state
const showMobileMenu = ref(false);
const showProfileMenu = ref(false);
function toggleProfileMenu() {
    showProfileMenu.value = !showProfileMenu.value;
}
function handleSignOut() {
    logout();
    showProfileMenu.value = false;
    showMobileMenu.value = false;
}
let announcementInterval;
const unreadNotifications = ref(0);

function listenForNewNotifications() {
    if (window.Echo && userId.value) {
        const channelName = `App.Models.User.${userId.value}`;
        console.log(`[Echo] Subscribing to private channel: ${channelName}`);

        const channel = window.Echo.private(channelName);

        channel.notification((notification) => {
            console.log('[Echo] Received notification:', notification);
            if (notification && notification.message) {
                toast.add({
                    severity: 'info',
                    summary: notification.title || 'New Notification',
                    detail: notification.message,
                    life: 5000
                });
            }
            console.log('[Echo] Calling fetchUnreadNotifications after broadcast');
            fetchUnreadNotifications(); // Update unread count after receiving broadcast
        });

        // Optional: confirm subscription
        channel.subscribed(() => {
            console.log(`[Echo] Successfully subscribed to ${channelName}`);
        });

        channel.error((err) => {
            console.error(`[Echo] Subscription error on ${channelName}:`, err);
        });
    } else {
        console.error('window.Echo is not initialized or userId is missing.');
    }
}
let echoInterval = null;

function trySubscribeToNotifications() {
    if (window.Echo && userId.value) {
        listenForNewNotifications();
        if (echoInterval) clearInterval(echoInterval);
    } else {
        // Retry every 1s until Echo and userId are ready
        if (!echoInterval) {
            echoInterval = setInterval(() => {
                if (window.Echo && userId.value) {
                    listenForNewNotifications();
                    clearInterval(echoInterval);
                    echoInterval = null;
                }
            }, 1000);
        }
    }
}
const fetchUnreadNotifications = async () => {
    try {
        const response = await axiosInstance.get('/notifications/unread');
        unreadNotifications.value = response.data?.data?.meta?.unread_count || 0;
        console.log('[Echo] fetchUnreadNotifications result:', unreadNotifications.value, response.data);
    } catch (error) {
        unreadNotifications.value = 0;
        console.error('[Echo] fetchUnreadNotifications error:', error);
    }
};
// ...existing code...

onMounted(() => {
    authStore.authCheck();
    // Debug: show userId and Echo status
    setTimeout(() => {
        console.log('[Echo] onMounted userId:', userId.value, 'window.Echo:', !!window.Echo);
    }, 1000);
    // Start announcement rotation
    announcementInterval = setInterval(() => {
        nextAnnouncement();
    }, 5000);
    trySubscribeToNotifications();
});
watch(userId, () => {
    trySubscribeToNotifications();
});
// Clean up on component unmount
onUnmounted(() => {
    if (announcementInterval) {
        clearInterval(announcementInterval);
    }
});

// Watch for route changes and re-subscribe to notifications
watch(
    () => router.currentRoute.value.fullPath,
    () => {}
);

const announcements = ref([
    { id: 1, message: 'New Science Fiction Collection available in the library from May 15th!' },
    { id: 2, message: 'Library extended hours during exam week - Open until 10 PM' },
    { id: 3, message: 'Join our Book Club meeting every Friday at 4 PM in Room 204' },
    { id: 4, message: 'New educational videos on Mathematics added to our digital collection' }
]);

// Functions to manage announcements
const dismissAnnouncement = () => {
    showAnnouncements.value = false;
};

const nextAnnouncement = () => {
    setTimeout(() => {
        currentAnnouncementIndex.value = (currentAnnouncementIndex.value + 1) % announcements.value.length;
    }, 50);
};

// Navigate to ebook details
const goToEbookDetails = (result) => {
    router.push(`/ebook-details/${result.book_item.id}`);
};

// Show physical book reservation modal
const showPhysicalBookReservation = (result) => {
    selectedPhysicalBook.value = result;
    showReservationModal.value = true;
};

const requestBook = async (resource) => {
    // Find an available book from the books array
    const availableBook = resource.books?.find((book) => book.is_borrowable && !book.is_reserved);

    if (availableBook) {
        try {
            await axiosInstance.post('/reservations', {
                book_item_id: resource.id
            });

            toast.add({
                severity: 'info',
                summary: 'Book Reservation',
                detail: `Your request for "${resource.title}" has been submitted.`,
                life: 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Reservation Failed',
                detail: error.response?.data?.message || 'Failed to submit reservation request.',
                life: 3000
            });
            return;
        }
    } else {
        toast.add({
            severity: 'error',
            summary: 'Unavailable',
            detail: 'This book is currently unavailable for reservation.',
            life: 3000
        });
    }
};

// Close reservation modal
const closeReservationModal = () => {
    showReservationModal.value = false;
    selectedPhysicalBook.value = null;
};

// Helper functions for search results
const getAvailableCount = (books) => {
    return books.filter((book) => book.is_borrowable && !book.is_reserved).length;
};

// Handle search pagination
const onSearchPageChange = (event) => {
    searchCurrentPage.value = Math.floor(event.first / searchPerPage.value) + 1;
    searchPerPage.value = event.rows;
    performSearch();
};

const showSearchDialog = ref(false);

const openSearchDialog = () => {
    showSearchDialog.value = true;
    fetchFilterOptions();
};

const closeSearchDialog = () => {
    showSearchDialog.value = false;
    searchQuery.value = '';
    searchResults.value = [];
    searchError.value = null;
    searchLoading.value = false;
    resetSearchFilters();
};

const handleSearchInput = (e) => {
    searchQuery.value = e.target.value;
};

const handleSearchKeydown = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        performSearch();
    }
};

const performSearch = async () => {
    if (!searchQuery.value.trim()) {
        searchResults.value = [];
        searchError.value = null;
        return;
    }

    searchLoading.value = true;
    searchError.value = null;
    console.log('Performing search for:', searchQuery.value.trim());

    try {
        const params = {
            q: searchQuery.value.trim(),
            per_page: searchPerPage.value,
            page: searchCurrentPage.value,
            ...searchFilters.value
        };

        console.log('Search params:', params);

        const response = await axiosInstance.get('/book-items/search', { params });

        console.log('Search response:', response.data);

        if (response.data) {
            searchResults.value = response.data.data || [];
            searchMeta.value = response.data.meta || {};

            if (searchResults.value.length > 0) {
                toast.add({
                    severity: 'success',
                    summary: 'Search Complete',
                    detail: `Found ${searchMeta.value.total || searchResults.value.length} results`,
                    life: 3000
                });
            }
        }
    } catch (error) {
        console.error('Search error:', error);
        searchError.value = 'Failed to search. Please try again.';
        toast.add({
            severity: 'error',
            summary: 'Search Error',
            detail: 'Failed to search resources. Please try again.',
            life: 4000
        });
    } finally {
        searchLoading.value = false;
    }
};

// Fetch filter options from backend
const fetchFilterOptions = async () => {
    if (filtersLoading.value) return; // Prevent duplicate requests

    filtersLoading.value = true;
    try {
        const response = await axiosInstance.get('/constants/all');

        if (response.data) {
            filterOptions.value = {
                categories: response.data.categories?.data || [],
                languages: response.data.languages?.data || [],
                subjects: response.data.subjects?.data || [],
                grades: response.data.grades?.data || [],
                libraries: response.data.libraries?.data || []
            };
            console.log('Filter options loaded:', filterOptions.value);
        }
    } catch (error) {
        console.error('Failed to fetch filter options:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load filter options.',
            life: 3000
        });
    } finally {
        filtersLoading.value = false;
    }
};

// Reset search filters
const resetSearchFilters = () => {
    searchFilters.value = {
        category_id: '',
        language_id: '',
        subject_id: '',
        grade_id: '',
        library_id: ''
    };
};

// Clear all filters
const clearAllFilters = () => {
    resetSearchFilters();
    if (searchQuery.value.trim()) {
        performSearch();
    }
};

// Get active filter count
const getActiveFilterCount = () => {
    return Object.values(searchFilters.value).filter((value) => value && value !== '').length;
};

// Toggle filter section
const toggleFilterSection = (section) => {
    openFilterSection.value = openFilterSection.value === section ? '' : section;
};

onMounted(async () => {
    const token = Cookies.get('access_token');
    if (token && !user.value) {
        await authStore.authCheck();
    }
    authLoading.value = false;
    store.closeTawk();
    fetchUnreadNotifications();
});
</script>

<template>
    <div class="bg-gray-50 min-h-screen font-inter text-gray-800">
        <!-- Toast for notifications -->
        <Toast position="top-right" />
        <!-- Modern Header with Udemy-style Navigation -->
        <header class="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto">
                <div class="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
                    <!-- Logo and Brand -->
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <img src="https://resources.finalsite.net/images/f_auto,q_auto,t_image_size_1/v1697025002/flipperschoolcom/umv1hfkk03vzp206sn4q/Flipper_Logo1.png" alt="Flipper Logo" class="h-16 w-auto" />
                        </div>
                    </div>
                    <!-- Desktop Navigation -->
                    <nav class="hidden lg:flex items-center space-x-8">
                        <!-- Lollipop Search Button -->
                        <button @click="openSearchDialog" class="group relative flex items-center gap-3 p-2 text-gray-600 hover:text-gray-800 transition-all duration-300 transform hover:scale-105">
                            <!-- Lollipop-style Search Icon -->
                            <div class="relative">
                                <!-- Main lollipop circle (magnifying glass) -->
                                <div class="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-lg">
                                    <!-- Inner lens with glass effect -->
                                    <div class="w-7 h-7 bg-gradient-to-br from-white/40 to-white/10 rounded-full border-2 border-white/30 flex items-center justify-center">
                                        <!-- Lens highlight -->
                                        <div class="w-2 h-2 bg-white/80 rounded-full"></div>
                                    </div>
                                </div>
                                <!-- Lollipop stick (search handle) -->
                                <div class="absolute -bottom-1 -right-1 w-4 h-1.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transform rotate-45 transition-all duration-300 group-hover:scale-125 shadow-md"></div>

                                <!-- Subtle floating elements -->
                                <div class="absolute -top-1 -right-1 w-1 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-pulse"></div>
                                <div class="absolute -bottom-1 left-2 w-0.5 h-0.5 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-bounce"></div>
                            </div>

                            <!-- Professional text label -->
                            <span class="hidden xl:inline font-medium text-base group-hover:font-semibold transition-all duration-300"> Search </span>
                        </button>

                        <RouterLink to="/my-notes" class="text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm flex items-center gap-1">
                            <i class="pi pi-pencil text-xs"></i>
                            Notes
                        </RouterLink>
                        <RouterLink to="/bookmarks" class="text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm flex items-center gap-1">
                            <i class="pi pi-bookmark text-xs"></i>
                            Bookmarks
                        </RouterLink>
                        <RouterLink to="/my-reading-list" class="text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm flex items-center gap-1">
                            <i class="pi pi-heart text-xs"></i>
                            My Collection
                        </RouterLink>
                        <RouterLink to="/notifications" class="text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm flex items-center gap-1 relative">
                            <i class="pi pi-bell text-lg"></i>
                            Notifications
                            <span v-if="unreadNotifications > 0" class="ml-auto min-w-[1.5rem] h-[1.5rem] bg-red-500 text-white text-sm rounded-full flex items-center justify-center font-bold animate-pulse px-1">
                                {{ unreadNotifications }}
                            </span>
                        </RouterLink>
                        <div v-if="auth.isAuthenticated" class="relative">
                            <button @click="toggleProfileMenu" class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group">
                                <i class="pi pi-user"></i>
                                <span>My Account</span>
                                <i class="pi pi-chevron-down text-xs ml-1" :class="{ 'rotate-180': showProfileMenu }" style="transition: transform 0.2s ease"></i>
                            </button>
                            <div v-if="showProfileMenu" class="absolute mt-6 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                <div class="py-1">
                                    <RouterLink to="/my-profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 flex items-center gap-2"> <i class="pi pi-user-edit text-sky-600"></i> My Profile </RouterLink>
                                    <button @click="handleSignOut" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><i class="pi pi-sign-out text-red-500"></i> Sign Out</button>
                                </div>
                            </div>
                        </div>
                        <div v-else class="flex items-center gap-3">
                            <RouterLink to="/auth/login" class="px-4 py-2 text-purple-600 border border-purple-600 rounded hover:bg-purple-50 transition-colors font-medium text-sm"> Log in </RouterLink>
                        </div>
                    </nav>
                    <!-- Mobile Search & Menu -->
                    <div class="flex items-center gap-2 md:hidden">
                        <button @click="openSearchDialog" class="group relative p-3 text-gray-700 hover:text-purple-600 transition-all duration-300 transform hover:scale-110">
                            <div class="relative">
                                <!-- Mobile search icon with modern design -->
                                <div class="w-7 h-7 border-2 border-gray-400 group-hover:border-purple-500 rounded-full transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                                    <div class="w-3 h-3 border-2 border-gray-500 group-hover:border-purple-600 rounded-full mt-0.5 ml-0.5 transition-all duration-300"></div>
                                    <div class="absolute -bottom-0.5 -right-0.5 w-2 h-0.5 bg-gray-500 group-hover:bg-purple-600 rounded-full transform rotate-45 transition-all duration-300"></div>
                                </div>
                                <!-- Floating dots around the icon -->
                                <div class="absolute -top-1 -right-1 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-pulse"></div>
                                <div class="absolute -bottom-1 left-1 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-bounce"></div>
                            </div>
                        </button>
                        <button @click="showMobileMenu = !showMobileMenu" class="p-2 text-gray-600 hover:text-purple-600 transition-colors" aria-label="Toggle menu">
                            <i class="pi" :class="showMobileMenu ? 'pi-times' : 'pi-bars'"></i>
                        </button>
                    </div>
                </div>
            </div>
        </header>
        <!-- Mobile Menu -->
        <div v-show="showMobileMenu" class="fixed inset-0 z-50 md:hidden" @click.self="showMobileMenu = false">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"></div>
            <div class="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl transform transition-all duration-300 ease-out flex flex-col">
                <!-- Mobile Header -->
                <div class="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-900">Menu</h2>
                    <button @click="showMobileMenu = false" class="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <i class="pi pi-times text-gray-600"></i>
                    </button>
                </div>

                <!-- Mobile Navigation Links -->
                <nav class="flex-1 p-4 space-y-2">
                    <RouterLink to="/my-notes" @click="showMobileMenu = false" class="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors">
                        <i class="pi pi-pencil text-lg"></i>
                        <span class="font-medium">Notes</span>
                    </RouterLink>
                    <RouterLink to="/bookmarks" @click="showMobileMenu = false" class="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors">
                        <i class="pi pi-bookmark text-lg"></i>
                        <span class="font-medium">Bookmarks</span>
                    </RouterLink>
                    <RouterLink to="/my-reading-list" @click="showMobileMenu = false" class="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors">
                        <i class="pi pi-heart text-lg"></i>
                        <span class="font-medium">My Collection</span>
                    </RouterLink>
                    <RouterLink to="/notifications" @click="showMobileMenu = false" class="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors">
                        <i class="pi pi-bell text-lg"></i>
                        <span class="font-medium">Notifications</span>
                        <span v-if="unreadNotifications > 0" class="ml-auto min-w-[1.5rem] h-[1.5rem] bg-red-500 text-white text-sm rounded-full flex items-center justify-center font-bold animate-pulse px-1">
                            {{ unreadNotifications }}
                        </span>
                    </RouterLink>
                    <div class="border-t border-gray-200 my-4"></div>
                    <!-- My Account Dropdown (add here, before Settings) -->
                    <template v-if="auth.isAuthenticated">
                        <div>
                            <button @click="toggleProfileMenu" class="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                                <i class="pi pi-user text-lg"></i>
                                <span class="font-medium">My Account</span>
                                <i class="pi pi-chevron-down ml-auto" :class="{ 'rotate-180': showProfileMenu }" style="transition: transform 0.2s ease"></i>
                            </button>
                            <div v-if="showProfileMenu" class="pl-8 pb-2">
                                <RouterLink
                                    to="/my-profile"
                                    @click="
                                        showMobileMenu = false;
                                        showProfileMenu = false;
                                    "
                                    class="block px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-600 flex items-center gap-2"
                                >
                                    <i class="pi pi-user-edit text-sky-600"></i> My Profile
                                </RouterLink>
                                <button @click="handleSignOut" class="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"><i class="pi pi-sign-out text-red-500"></i> Sign Out</button>
                            </div>
                        </div>
                    </template>
                </nav>

                <!-- Mobile Auth Buttons -->
            </div>
        </div>
        <!-- Udemy-style Announcement Banner -->
        <section v-if="showAnnouncement && specialNotice" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4 flex-1">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <i class="pi pi-megaphone text-white text-lg"></i>
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-3 mb-1">
                                    <span class="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"> New </span>
                                    <h3 class="text-white font-bold text-base sm:text-lg">
                                        {{ specialNotice.title }}
                                    </h3>
                                </div>
                                <p class="text-white text-opacity-90 text-sm leading-relaxed">
                                    {{ specialNotice.message }}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <button class="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm font-medium rounded-lg transition-all duration-200 border border-white border-opacity-30">Learn more</button>
                            <button @click="dismissAnnouncement" class="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                                <i class="pi pi-times text-white text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- Enhanced Search Results Section -->
        <!-- Search Results Modal (Udemy-style) -->
        <!-- This modal is now replaced by the unified search dialog above -->

        <!-- Hero Section -->
        <HeroSection />

        <!-- Stats Bar -->
        <StatsBar />
        <!-- Featured Resources Section with Enhanced Udemy-style Header -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div class="text-center mb-12">
                <div class="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    <i class="pi pi-star-fill"></i>
                    <span>FEATURED COURSES</span>
                </div>
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Start learning with our top picks</h2>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">Handpicked resources from our collection to accelerate your learning journey</p>
            </div>
            <div class="flex flex-col lg:flex-row gap-8">
                <!-- Enhanced Filters Sidebar -->
                <ResourceFilters />
                <!-- Enhanced Resources Grid -->
                <ResourceGrid />
            </div>
        </section>

        <!-- Component Sections -->
        <NewArrivals />
        <RecentlyViewed />
        <ReadingLists />
        <QuickLinks />
        <SchoolBranch />

        <!-- Enhanced Footer -->
        <footer class="bg-gray-900 text-white pt-16 pb-8 mt-16">
            <div class="max-w-7xl mx-auto px-5">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div>
                        <h3 class="font-bold text-lg mb-6">About the Library</h3>
                        <p class="text-gray-300 text-sm mb-6 leading-relaxed">
                            Our digital library provides students and faculty with 24/7 access to thousands of academic resources, journals, books, and multimedia materials to support learning and research.
                        </p>
                        <div class="flex items-center gap-4">
                            <a href="#" class="hover:text-indigo-400 transition-colors">
                                <i class="pi pi-facebook text-lg"></i>
                            </a>
                            <a href="#" class="hover:text-indigo-400 transition-colors">
                                <i class="pi pi-twitter text-lg"></i>
                            </a>
                            <a href="#" class="hover:text-indigo-400 transition-colors">
                                <i class="pi pi-instagram text-lg"></i>
                            </a>
                            <a href="#" class="hover:text-indigo-400 transition-colors">
                                <i class="pi pi-youtube text-lg"></i>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 class="font-bold text-lg mb-6">Quick Links</h3>
                        <ul class="space-y-3 text-gray-300">
                            <li><a href="#" class="hover:text-indigo-400 transition-colors">About Us</a></li>
                            <li><a href="#" class="hover:text-indigo-400 transition-colors">Library Hours</a></li>
                            <li><a href="#" class="hover:text-indigo-400 transition-colors">FAQ</a></li>
                            <li><a href="#" class="hover:text-indigo-400 transition-colors">Contact Us</a></li>
                            <li><a href="#" class="hover:text-indigo-400 transition-colors">Policies</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="font-bold text-lg mb-6">Resources</h3>
                        <ul class="space-y-3 text-gray-300">
                            <li><a href="#" class="hover:text-indigo-400 transition-colors">E-Books</a></li>
                            <li><a href="#" class="hover:text-indigo-400 transition-colors">Journals</a></li>
                            <li><a href="#" class="hover:text-indigo-400 transition-colors">Academic Videos</a></li>
                            <li><a href="#" class="hover:text-indigo-400 transition-colors">Research Guides</a></li>
                            <li><a href="#" class="hover:text-indigo-400 transition-colors">Citation Tools</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="font-bold text-lg mb-6">Contact Us</h3>
                        <div class="space-y-4 text-gray-300 text-sm">
                            <div class="flex items-start gap-3">
                                <i class="pi pi-map-marker mt-1 text-indigo-400"></i>
                                <span>123 Library Lane<br />Education City, FL 12345</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="pi pi-phone text-indigo-400"></i>
                                <span>(555) 123-4567</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="pi pi-envelope text-indigo-400"></i>
                                <span>library@school.edu</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="pi pi-clock text-indigo-400"></i>
                                <span>Mon-Fri: 8am - 8pm</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-16 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
                    <p>&copy; {{ new Date().getFullYear() }} Digital Library Management System. All rights reserved.</p>
                </div>
            </div>
        </footer>
        <!-- Chatbot Floating Button -->
        <div class="fixed bottom-6 right-10 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-transparent">
            <button @click="store.openTawk" class="bg-green-500 hover:bg-green-400 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105" title="Live Support">
                <i class="pi pi-comments text-2xl"></i>
            </button>
        </div>

        <!-- Custom Chat Component (Handles both custom chat and Tawk initialization) -->
        <AskLibrarian />

        <!-- Physical Book Reservation Modal -->
        <Dialog v-model:visible="showReservationModal" modal :style="{ width: '500px' }" header="Reserve Physical Book" :closable="true" @hide="closeReservationModal">
            <div v-if="selectedPhysicalBook" class="space-y-6">
                <!-- Book Information -->
                <div class="flex gap-4">
                    <div class="flex-shrink-0">
                        <img
                            :src="selectedPhysicalBook.book_item.cover_image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'"
                            :alt="selectedPhysicalBook.book_item.title"
                            class="w-20 h-24 object-cover rounded-lg"
                        />
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-1">{{ selectedPhysicalBook.book_item.title }}</h3>
                        <p v-if="selectedPhysicalBook.book_item.author" class="text-sm text-gray-600 mb-2">by {{ selectedPhysicalBook.book_item.author }}</p>
                        <div class="flex flex-wrap gap-2">
                            <span v-if="selectedPhysicalBook.book_item.category" class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {{ selectedPhysicalBook.book_item.category.name }}
                            </span>
                            <span v-if="selectedPhysicalBook.book_item.subject" class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                {{ selectedPhysicalBook.book_item.subject.name }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Availability Information -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-900 mb-3">Availability</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-gray-900">{{ selectedPhysicalBook.books.length }}</div>
                            <div class="text-sm text-gray-600">Total Copies</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold" :class="getAvailableCount(selectedPhysicalBook.books) > 0 ? 'text-green-600' : 'text-red-600'">
                                {{ getAvailableCount(selectedPhysicalBook.books) }}
                            </div>
                            <div class="text-sm text-gray-600">Available</div>
                        </div>
                    </div>
                </div>

                <!-- Library Information -->
                <div v-if="selectedPhysicalBook.book_item.library" class="bg-blue-50 rounded-lg p-4">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-building text-blue-600"></i>
                        <div>
                            <div class="font-semibold text-gray-900">{{ selectedPhysicalBook.book_item.library.name }}</div>
                            <div class="text-sm text-gray-600">Library Location</div>
                        </div>
                    </div>
                </div>

                <!-- Reservation Notice -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div class="flex items-start gap-3">
                        <i class="pi pi-info-circle text-yellow-600 mt-0.5"></i>
                        <div class="text-sm text-yellow-800">
                            <p class="font-semibold mb-1">Reservation Policy</p>
                            <ul class="space-y-1 text-xs">
                                <li>• Books are reserved for 24 hours</li>
                                <li>• You'll receive an email notification when ready</li>
                                <li>• Please collect within the reservation period</li>
                                <li>• Maximum borrowing period: 14 days</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Error/Warning Messages -->
                <div v-if="getAvailableCount(selectedPhysicalBook.books) === 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-exclamation-triangle text-red-600"></i>
                        <div class="text-sm text-red-800">
                            <p class="font-semibold">Currently Unavailable</p>
                            <p>All copies are currently borrowed. You can join the waiting list to be notified when a copy becomes available.</p>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <button @click="closeReservationModal" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                    <button
                        @click="requestBook(selectedPhysicalBook.book_item)"
                        :disabled="!selectedPhysicalBook || getAvailableCount(selectedPhysicalBook.books) === 0"
                        class="px-4 py-2 rounded-lg transition-colors font-medium"
                        :class="selectedPhysicalBook && getAvailableCount(selectedPhysicalBook.books) > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
                    >
                        <i class="pi pi-bookmark mr-2"></i>
                        {{ selectedPhysicalBook && getAvailableCount(selectedPhysicalBook.books) > 0 ? 'Reserve Book' : 'Join Waiting List' }}
                    </button>
                </div>
            </template>
        </Dialog>
        <!-- Search Dialog -->
        <Dialog v-model:visible="showSearchDialog" modal :style="{ width: '95vw', maxWidth: '1400px', height: '90vh' }" header="Search Resources" :closable="true" @hide="closeSearchDialog">
            <template #header>
                <div class="flex items-center justify-between w-full pr-8 mb-3">
                    <div>
                        <h2 class="text-xl font-bold text-gray-900">Search Resources</h2>
                        <p v-if="searchResults.length > 0" class="text-sm text-gray-600">Found {{ searchMeta.total || 0 }} results for "{{ searchQuery }}"</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button v-if="getActiveFilterCount() > 0" @click="clearAllFilters" class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-2 text-sm">
                            <i class="pi pi-filter-slash text-xs"></i>
                            <span class="hidden sm:inline">Clear Filters ({{ getActiveFilterCount() }})</span>
                            <span class="sm:hidden">{{ getActiveFilterCount() }}</span>
                        </button>
                    </div>
                </div>
            </template>

            <div class="h-full flex flex-col lg:flex-row gap-6 mt-3">
                <!-- Filters Sidebar - Mobile: Top, Desktop: Left -->
                <div class="w-full lg:w-80 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex flex-col order-1 lg:order-none max-h-60 lg:max-h-none">
                    <!-- Filter Header -->
                    <div class="px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900">Filters</h3>
                            <div class="flex items-center gap-2">
                                <span v-if="getActiveFilterCount() > 0" class="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                    {{ getActiveFilterCount() }}
                                </span>
                                <button @click="clearAllFilters" class="text-purple-600 hover:text-purple-700 text-sm font-semibold transition-colors">Clear all</button>
                            </div>
                        </div>
                    </div>

                    <!-- Filter Sections - Scrollable -->
                    <div class="flex-1 overflow-y-auto">
                        <div class="space-y-0">
                            <!-- Category Filter -->
                            <div class="border-b border-gray-200">
                                <button @click="toggleFilterSection('category')" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white transition-colors">
                                    <span class="font-semibold text-gray-900">Category</span>
                                    <i :class="openFilterSection === 'category' ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-gray-500 text-sm"></i>
                                </button>
                                <div v-if="openFilterSection === 'category'" class="px-4 pb-3 bg-white">
                                    <div v-if="filtersLoading" class="text-center py-4">
                                        <i class="pi pi-spin pi-spinner text-gray-400"></i>
                                        <p class="text-gray-500 text-sm mt-2">Loading categories...</p>
                                    </div>
                                    <div v-else class="max-h-32 lg:max-h-40 overflow-y-auto space-y-2">
                                        <label v-for="category in filterOptions.categories" :key="category.id" class="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                                            <input type="radio" :value="category.id" v-model="searchFilters.category_id" class="mr-3 text-purple-600 focus:ring-purple-500" />
                                            <span class="text-sm text-gray-700">{{ category.name }}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Subject Filter -->
                            <div class="border-b border-gray-200">
                                <button @click="toggleFilterSection('subject')" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white transition-colors">
                                    <span class="font-semibold text-gray-900">Subject</span>
                                    <i :class="openFilterSection === 'subject' ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-gray-500 text-sm"></i>
                                </button>
                                <div v-if="openFilterSection === 'subject'" class="px-4 pb-3 bg-white">
                                    <div v-if="filtersLoading" class="text-center py-4">
                                        <i class="pi pi-spin pi-spinner text-gray-400"></i>
                                        <p class="text-gray-500 text-sm mt-2">Loading subjects...</p>
                                    </div>
                                    <div v-else class="max-h-32 lg:max-h-40 overflow-y-auto space-y-2">
                                        <label v-for="subject in filterOptions.subjects" :key="subject.id" class="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                                            <input type="radio" :value="subject.id" v-model="searchFilters.subject_id" class="mr-3 text-purple-600 focus:ring-purple-500" />
                                            <span class="text-sm text-gray-700">{{ subject.name }}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Grade Level Filter -->
                            <div class="border-b border-gray-200">
                                <button @click="toggleFilterSection('grade')" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white transition-colors">
                                    <span class="font-semibold text-gray-900">Grade Level</span>
                                    <i :class="openFilterSection === 'grade' ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-gray-500 text-sm"></i>
                                </button>
                                <div v-if="openFilterSection === 'grade'" class="px-4 pb-3 bg-white">
                                    <div v-if="filtersLoading" class="text-center py-4">
                                        <i class="pi pi-spin pi-spinner text-gray-400"></i>
                                        <p class="text-gray-500 text-sm mt-2">Loading grades...</p>
                                    </div>
                                    <div v-else class="max-h-32 lg:max-h-40 overflow-y-auto space-y-2">
                                        <label v-for="grade in filterOptions.grades" :key="grade.id" class="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                                            <input type="radio" :value="grade.id" v-model="searchFilters.grade_id" class="mr-3 text-purple-600 focus:ring-purple-500" />
                                            <span class="text-sm text-gray-700">Grade {{ grade.name }}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- Language Filter -->
                            <div class="border-b border-gray-200">
                                <button @click="toggleFilterSection('language')" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white transition-colors">
                                    <span class="font-semibold text-gray-900">Language</span>
                                    <i :class="openFilterSection === 'language' ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-gray-500 text-sm"></i>
                                </button>
                                <div v-if="openFilterSection === 'language'" class="px-4 pb-3 bg-white">
                                    <div v-if="filtersLoading" class="text-center py-4">
                                        <i class="pi pi-spin pi-spinner text-gray-400"></i>
                                        <p class="text-gray-500 text-sm mt-2">Loading languages...</p>
                                    </div>
                                    <div v-else>
                                        <select v-model="searchFilters.language_id" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                            <option value="">All Languages</option>
                                            <option v-for="language in filterOptions.languages" :key="language.id" :value="language.id">
                                                {{ language.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- Library Filter -->
                            <div>
                                <button @click="toggleFilterSection('library')" class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white transition-colors">
                                    <span class="font-semibold text-gray-900">Library</span>
                                    <i :class="openFilterSection === 'library' ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-gray-500 text-sm"></i>
                                </button>
                                <div v-if="openFilterSection === 'library'" class="px-4 pb-3 bg-white">
                                    <div v-if="filtersLoading" class="text-center py-4">
                                        <i class="pi pi-spin pi-spinner text-gray-400"></i>
                                        <p class="text-gray-500 text-sm mt-2">Loading libraries...</p>
                                    </div>
                                    <div v-else>
                                        <select v-model="searchFilters.library_id" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                                            <option value="">All Libraries</option>
                                            <option v-for="library in filterOptions.libraries" :key="library.id" :value="library.id">
                                                {{ library.name }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Apply Filters Button -->
                    <div class="p-4 bg-white border-t border-gray-200 flex-shrink-0 lg:block hidden">
                        <button @click="performSearch" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm" :disabled="searchLoading">
                            <span v-if="searchLoading" class="inline-flex items-center gap-2">
                                <i class="pi pi-spin pi-spinner"></i>
                                Searching...
                            </span>
                            <span v-else class="inline-flex items-center gap-2">
                                <i class="pi pi-search"></i>
                                Apply Filters & Search
                            </span>
                        </button>
                    </div>
                </div>

                <!-- Search Input and Results -->
                <div class="flex-1 flex flex-col min-w-0 order-2 lg:order-none">
                    <!-- Search Input -->
                    <div class="relative mb-6 flex-shrink-0">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="pi pi-search text-gray-400"></i>
                        </div>
                        <input
                            v-model="searchQuery"
                            @input="handleSearchInput"
                            @keydown="handleSearchKeydown"
                            type="text"
                            placeholder="Search for books, ebooks, and educational resources..."
                            class="w-full pl-10 pr-16 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            autofocus
                        />
                        <button
                            @click="performSearch"
                            :disabled="!searchQuery.trim() || searchLoading"
                            class="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            <i v-if="searchLoading" class="pi pi-spin pi-spinner"></i>
                            <i v-else class="pi pi-search"></i>
                        </button>
                    </div>

                    <!-- Mobile Apply Filters Button -->
                    <div class="mb-4 lg:hidden">
                        <button @click="performSearch" class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed" :disabled="searchLoading">
                            <span v-if="searchLoading" class="inline-flex items-center gap-2">
                                <i class="pi pi-spin pi-spinner"></i>
                                Searching...
                            </span>
                            <span v-else class="inline-flex items-center gap-2">
                                <i class="pi pi-search"></i>
                                Apply Filters & Search
                            </span>
                        </button>
                    </div>

                    <!-- Content Area -->
                    <div class="flex-1 min-h-0">
                        <!-- Initial State -->
                        <div v-if="!searchLoading && !searchError && searchResults.length === 0 && !searchQuery.trim()" class="flex flex-col items-center justify-center h-full">
                            <div class="text-center">
                                <i class="pi pi-search text-6xl text-gray-300 mb-4"></i>
                                <h3 class="text-xl font-semibold text-gray-900 mb-2">Start Your Search</h3>
                                <p class="text-gray-600 mb-6 max-w-md">Find books, ebooks, and educational resources from our extensive collection</p>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-md">
                                    <button
                                        @click="
                                            searchQuery = 'Mathematics';
                                            performSearch();
                                        "
                                        class="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm"
                                    >
                                        📊 Mathematics
                                    </button>
                                    <button
                                        @click="
                                            searchQuery = 'Science';
                                            performSearch();
                                        "
                                        class="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm"
                                    >
                                        🔬 Science
                                    </button>
                                    <button
                                        @click="
                                            searchQuery = 'History';
                                            performSearch();
                                        "
                                        class="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm"
                                    >
                                        📚 History
                                    </button>
                                    <button
                                        @click="
                                            searchQuery = 'Literature';
                                            performSearch();
                                        "
                                        class="p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors text-sm"
                                    >
                                        ✍️ Literature
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Loading State -->
                        <div v-else-if="searchLoading" class="flex flex-col items-center justify-center h-full">
                            <div class="relative">
                                <div class="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
                            </div>
                            <p class="text-gray-600 mt-4">Searching through our collection...</p>
                            <p v-if="getActiveFilterCount() > 0" class="text-sm text-gray-500 mt-2">Using {{ getActiveFilterCount() }} filter{{ getActiveFilterCount() > 1 ? 's' : '' }}</p>
                        </div>

                        <!-- Error State -->
                        <div v-else-if="searchError" class="flex flex-col items-center justify-center h-full">
                            <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">Search Error</h3>
                            <p class="text-gray-600 mb-4">{{ searchError }}</p>
                            <button @click="performSearch" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Try Again</button>
                        </div>

                        <!-- No Results State -->
                        <div v-else-if="searchResults.length === 0 && searchQuery.trim()" class="flex flex-col items-center justify-center h-full">
                            <i class="pi pi-search text-4xl text-gray-400 mb-4"></i>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                            <p class="text-gray-600 mb-4">No resources found matching your search criteria.</p>
                            <div class="text-center">
                                <p class="text-sm text-gray-500 mb-4">Try:</p>
                                <div class="flex flex-wrap gap-2 justify-center mb-4">
                                    <button @click="clearAllFilters" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs">Clearing filters</button>
                                    <button
                                        @click="
                                            searchQuery = 'Grade 10';
                                            performSearch();
                                        "
                                        class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs"
                                    >
                                        Grade levels
                                    </button>
                                    <button
                                        @click="
                                            searchQuery = 'Physics';
                                            performSearch();
                                        "
                                        class="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs"
                                    >
                                        Subject names
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Search Results -->
                        <div v-else class="h-full flex flex-col">
                            <!-- Results Count -->
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3 flex-shrink-0">
                                <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                                    <p class="text-base font-medium text-gray-900">
                                        <span class="font-bold text-purple-600">{{ searchMeta.total || searchResults.length }}</span> results found
                                    </p>
                                    <div v-if="getActiveFilterCount() > 0" class="flex items-center gap-2">
                                        <span class="hidden sm:inline text-sm text-gray-500">•</span>
                                        <span class="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full font-medium"> {{ getActiveFilterCount() }} filter{{ getActiveFilterCount() > 1 ? 's' : '' }} applied </span>
                                    </div>
                                </div>
                                <div v-if="searchQuery" class="text-sm text-gray-600">
                                    for "<span class="font-semibold text-gray-900">{{ searchQuery }}</span
                                    >"
                                </div>
                            </div>

                            <div class="flex-1 overflow-y-auto space-y-4 pr-2">
                                <div
                                    v-for="result in searchResults"
                                    :key="`${result.format}-${result.book_item.id}`"
                                    class="flex flex-col sm:flex-row gap-4 p-5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-purple-200"
                                    @click="result.format === 'digital' ? goToEbookDetails(result) : showPhysicalBookReservation(result)"
                                >
                                    <!-- Thumbnail -->
                                    <div class="flex-shrink-0 mx-auto sm:mx-0">
                                        <img
                                            :src="result.book_item.cover_image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80'"
                                            :alt="result.book_item.title"
                                            class="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-lg shadow-md"
                                            @error="
                                                (e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80';
                                                }
                                            "
                                        />
                                    </div>

                                    <!-- Content -->
                                    <div class="flex-1 min-w-0">
                                        <!-- Header with title and format badge -->
                                        <div class="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
                                            <h3 class="font-bold text-gray-900 text-lg sm:text-xl line-clamp-2 leading-tight hover:text-purple-600 transition-colors">
                                                {{ result.book_item.title }}
                                            </h3>
                                            <span class="self-start px-3 py-1.5 text-sm font-bold rounded-full whitespace-nowrap" :class="result.format === 'physical' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'">
                                                {{ result.format === 'physical' ? '📚 Physical Book' : '🎓 Digital Course' }}
                                            </span>
                                        </div>

                                        <!-- Author -->
                                        <p v-if="result.book_item.author" class="text-base text-gray-700 mb-3 font-medium">
                                            <i class="pi pi-user text-gray-400 mr-2"></i>
                                            by {{ result.book_item.author }}
                                        </p>

                                        <!-- Description -->
                                        <p class="text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                            {{ result.book_item.description || 'Comprehensive educational resource designed to enhance your learning experience and provide in-depth knowledge on the subject matter.' }}
                                        </p>

                                        <!-- Enhanced Metadata Grid -->
                                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                                            <div v-if="result.book_item.category" class="flex items-center gap-2 text-sm">
                                                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                <span class="text-gray-600 font-medium">{{ result.book_item.category.name }}</span>
                                            </div>
                                            <div v-if="result.book_item.subject" class="flex items-center gap-2 text-sm">
                                                <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                                                <span class="text-gray-600 font-medium">{{ result.book_item.subject.name }}</span>
                                            </div>
                                            <div v-if="result.book_item.grade" class="flex items-center gap-2 text-sm">
                                                <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                <span class="text-gray-600 font-medium">Grade {{ result.book_item.grade.name }}</span>
                                            </div>
                                            <div v-if="result.book_item.language" class="flex items-center gap-2 text-sm">
                                                <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                                <span class="text-gray-600 font-medium">{{ result.book_item.language.name || 'English' }}</span>
                                            </div>
                                        </div>

                                        <!-- Additional Info Row -->
                                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <!-- Availability and Location Info -->
                                            <div class="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                                                <div v-if="result.format === 'physical'" class="flex items-center gap-2">
                                                    <div class="w-3 h-3 rounded-full" :class="getAvailableCount(result.books) > 0 ? 'bg-green-500' : 'bg-red-500'"></div>
                                                    <span class="text-gray-700 font-medium"> {{ getAvailableCount(result.books) }} of {{ result.books.length }} available </span>
                                                </div>
                                                <div v-else class="flex items-center gap-2">
                                                    <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                                                    <span class="text-gray-700 font-medium"> {{ result.ebooks?.length || 0 }} digital resources </span>
                                                </div>
                                                <div v-if="result.book_item.library" class="flex items-center gap-2">
                                                    <i class="pi pi-map-marker text-gray-400"></i>
                                                    <span class="text-gray-600">{{ result.book_item.library.name }}</span>
                                                </div>
                                                <div v-if="result.book_item.isbn" class="flex items-center gap-2">
                                                    <i class="pi pi-id-card text-gray-400"></i>
                                                    <span class="text-gray-600 text-xs">ISBN: {{ result.book_item.isbn }}</span>
                                                </div>
                                            </div>

                                            <!-- Action Button -->
                                            <button
                                                class="px-6 py-3 text-base font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 min-w-fit"
                                                :class="
                                                    result.format === 'physical'
                                                        ? getAvailableCount(result.books) > 0
                                                            ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                                                "
                                                :disabled="result.format === 'physical' && getAvailableCount(result.books) === 0"
                                                @click.stop="result.format === 'digital' ? goToEbookDetails(result) : showPhysicalBookReservation(result)"
                                            >
                                                <i class="pi" :class="result.format === 'physical' ? 'pi-bookmark' : 'pi-play'"></i>
                                                <span>{{ result.format === 'physical' ? (getAvailableCount(result.books) > 0 ? 'Reserve Book' : 'Unavailable') : 'Start Learning' }}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Pagination Footer -->
                            <div v-if="searchMeta.last_page > 1" class="border-t border-gray-200 pt-6 mt-6 flex-shrink-0">
                                <Paginator
                                    :rows="searchMeta.per_page"
                                    :totalRecords="searchMeta.total"
                                    :first="(searchMeta.current_page - 1) * searchMeta.per_page"
                                    @page="onSearchPageChange($event)"
                                    class="border-none bg-transparent"
                                    :template="{
                                        '640px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
                                        '960px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
                                        '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport'
                                    }"
                                    currentPageReportTemplate="{first} to {last} of {totalRecords}"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
/* Line clamp utilities for text truncation */
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur()) {
    .backdrop-blur-sm {
        background-color: rgba(255, 255, 255, 0.9);
    }
    .backdrop-blur-md {
        background-color: rgba(255, 255, 255, 0.85);
    }
}

/* PrimeVue Dialog customization */
:deep(.p-dialog) {
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

:deep(.p-dialog-mask) {
    backdrop-filter: blur(4px);
    background-color: rgba(0, 0, 0, 0.5);
}

/* Carousel transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition:
        opacity 0.5s ease,
        transform 0.5s ease;
}
.slide-fade-enter-from {
    opacity: 0;
    transform: translateY(20px);
}
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

/* Add text shadow utility for better visibility on image backgrounds */
.text-shadow-sm {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Custom dot indicator animation */
.dot-indicator {
    transition:
        transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
        background-color 0.3s ease,
        box-shadow 0.3s ease;
}

/* Animation classes */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.5s ease;
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
}

.slide-fade-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.slide-fade-leave-to {
    opacity: 0;
    transform: translateX(-30px);
}

/* Ensures the announcement container maintains consistent height */
.announcement-container {
    position: relative;
    min-height: 52px; /* Set minimum height based on content requirements */
    overflow: hidden;
}

/* Announcement dot indicators hover effect */
.dot-indicator {
    cursor: pointer;
    transition: all 0.3s ease;
}
.dot-indicator:hover {
    transform: scale(1.3);
}

/* Mobile menu animations */
.slide-in-left {
    animation: slideInLeft 0.3s ease-out forwards;
}

@keyframes slideInLeft {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(0);
    }
}

/* Responsive typography */
@media (max-width: 640px) {
    .banner-text h1 {
        font-size: 1.75rem !important;
        line-height: 2.25rem !important;
    }

    .banner-text p {
        font-size: 0.875rem !important;
    }
}
</style>
