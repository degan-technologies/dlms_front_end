<script setup>
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

import HeroSection from '@/components/home/HeroSection.vue';
import NewArrivals from '@/components/home/NewArrivals.vue';
import QuickLinks from '@/components/home/QuickLinks.vue';
import ReadingLists from '@/components/home/ReadingLists.vue';
import RecentlyViewed from '@/components/home/RecentlyViewed.vue';
import ResourceFilters from '@/components/home/ResourceFilters.vue';
import ResourceGrid from '@/components/home/ResourceGrid.vue';
import ResourceRequestForm from '@/components/home/ResourceRequestForm.vue';
import StatsBar from '@/components/home/StatsBar.vue';
import { useAuthStore } from '@/stores/authStore';
// import { useHomeStore } from '@/stores/homeStore';
const authStore = useAuthStore();

const { auth } = storeToRefs(authStore); // this makes `auth.isAuthenticated` reactive

// eslint-disable-next-line no-unused-vars
const searchQuery = ref('');
const currentAnnouncementIndex = ref(0);
const showAnnouncements = ref(true);

const logout = authStore.logout;

import Toast from 'primevue/toast';

// Mobile menu state
const showMobileMenu = ref(false);
let announcementInterval;
onMounted(() => {
    authStore.authCheck();

    // Start announcement rotation
    announcementInterval = setInterval(() => {
        nextAnnouncement();
    }, 5000);
});

// Clean up on component unmount
onUnmounted(() => {
    if (announcementInterval) {
        clearInterval(announcementInterval);
    }
});

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

const learnMoreAboutAnnouncement = (announcement) => {
    console.log('Learn more about announcement:', announcement);
    // Here you would navigate to detailed announcement page or show a modal
    // For example: router.push({ name: 'announcement-details', params: { id: announcement.id } });
};

// Function to navigate to a specific announcement
const setCurrentAnnouncement = (index) => {
    currentAnnouncementIndex.value = index;
};

// Compute the current visible announcement with improved transition handling
const visibleAnnouncement = computed(() => {
    const announcement = announcements.value[currentAnnouncementIndex.value];
    return announcement ? [{ ...announcement, key: `announcement-${announcement.id}-${currentAnnouncementIndex.value}` }] : [];
});
// Functions for announcement navigation with smoother transitions
const nextAnnouncement = () => {
    // Small timeout to ensure Vue has completed any ongoing transitions
    setTimeout(() => {
        currentAnnouncementIndex.value = (currentAnnouncementIndex.value + 1) % announcements.value.length;
    }, 50);
};

const prevAnnouncement = () => {
    setTimeout(() => {
        currentAnnouncementIndex.value = (currentAnnouncementIndex.value - 1 + announcements.value.length) % announcements.value.length;
    }, 50);
};
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

                    <!-- Center Search Bar (Udemy-style) -->
                    <div class="hidden md:flex flex-1 max-w-lg mx-8">
                        <div class="relative w-full">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="pi pi-search text-gray-400"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="What do you want to learn?"
                                class="w-full pl-10 pr-12 py-3 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all"
                            />
                            <button class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <div class="p-1.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors">
                                    <i class="pi pi-search text-xs"></i>
                                </div>
                            </button>
                        </div>
                    </div>
                    <!-- Desktop Navigation -->
                    <nav class="hidden lg:flex items-center space-x-8">
                        <RouterLink to="/my-notes" class="text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm flex items-center gap-1">
                            <i class="pi pi-pencil text-xs"></i>
                            Notes
                        </RouterLink>
                        <RouterLink to="/bookmarks" class="text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm flex items-center gap-1">
                            <i class="pi pi-bookmark text-xs"></i>
                            Bookmarks
                        </RouterLink>
                        <RouterLink to="/my-collection" class="text-gray-700 hover:text-purple-600 transition-colors font-medium text-sm flex items-center gap-1">
                            <i class="pi pi-heart text-xs"></i>
                            My Collection
                        </RouterLink>

                        <!-- Notifications -->
                        <button class="relative p-2 text-gray-600 hover:text-purple-600 transition-colors">
                            <i class="pi pi-bell text-lg"></i>
                            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <!-- User Menu -->
                        <div class="flex items-center gap-3">
                            <RouterLink to="/auth/login" class="px-4 py-2 text-purple-600 border border-purple-600 rounded hover:bg-purple-50 transition-colors font-medium text-sm"> Log in </RouterLink>
                            <RouterLink to="/auth/register" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium text-sm"> Sign up </RouterLink>
                        </div>
                    </nav>

                    <!-- Mobile Search & Menu -->
                    <div class="flex items-center gap-2 md:hidden">
                        <button class="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                            <i class="pi pi-search text-lg"></i>
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

                <!-- Mobile Search -->
                <div class="p-4 border-b border-gray-200">
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="pi pi-search text-gray-400"></i>
                        </div>
                        <input type="text" placeholder="What do you want to learn?" class="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
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
                    <RouterLink to="/my-collection" @click="showMobileMenu = false" class="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors">
                        <i class="pi pi-heart text-lg"></i>
                        <span class="font-medium">My Collection</span>
                    </RouterLink>

                    <div class="border-t border-gray-200 my-4"></div>

                    <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                        <i class="pi pi-bell text-lg"></i>
                        <span class="font-medium">Notifications</span>
                        <span class="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                    </a>
                    <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                        <i class="pi pi-cog text-lg"></i>
                        <span class="font-medium">Settings</span>
                    </a>
                </nav>

                <!-- Mobile Auth Buttons -->
                <div class="p-4 border-t border-gray-200 space-y-3">
                    <RouterLink to="/auth/login" @click="showMobileMenu = false" class="block w-full py-3 px-4 text-center text-purple-600 border border-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"> Log in </RouterLink>
                    <RouterLink to="/auth/register" @click="showMobileMenu = false" class="block w-full py-3 px-4 text-center bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"> Sign up </RouterLink>
                </div>
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
                <ResourceFilters @filtersChanged="handleFiltersChanged" />
                <!-- Enhanced Resources Grid -->
                <ResourceGrid :filters="currentFilters" />
            </div>
        </section>

        <!-- Component Sections -->
        <NewArrivals />
        <RecentlyViewed />
        <ReadingLists />
        <QuickLinks />
        <ResourceRequestForm />

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
        <div class="fixed bottom-6 right-6 z-50">
            <button @click="toggleChatbot" class="bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-105" title="Ask a Librarian">
                <i class="pi pi-comments text-xl"></i>
            </button>
        </div>
        <!-- Chatbot Modal -->
        <div v-if="showChatbot" class="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center">
            <AskLibrarian @some-event="toggleChatbot" />
        </div>
        <!-- Resource Modal -->
        <!-- <ResourceModal /> -->
    </div>
</template>

<!-- <script setup>
import HeroSection from '@/components/home/HeroSection.vue';
import NewArrivals from '@/components/home/NewArrivals.vue';
import QuickLinks from '@/components/home/QuickLinks.vue';
import ReadingLists from '@/components/home/ReadingLists.vue';
import RecentlyViewed from '@/components/home/RecentlyViewed.vue';
import ResourceFilters from '@/components/home/ResourceFilters.vue';
import ResourceGrid from '@/components/home/ResourceGrid.vue';
import ResourceRequestForm from '@/components/home/ResourceRequestForm.vue';
// import ResourceModal from '@/components/home/ResourceModal.vue';
import StatsBar from '@/components/home/StatsBar.vue';

import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const toast = useToast();
const showMobileMenu = ref(false);

// Profile dropdown state
const showProfileMenu = ref(false);

// Dropdown toggle
function toggleProfileMenu() {
    showProfileMenu.value = !showProfileMenu.value;
}

// Click outside handler to close dropdown
function handleClickOutside(event) {
    const menu = document.getElementById('profile-dropdown-menu');
    const button = document.getElementById('profile-dropdown-button');
    if (menu && !menu.contains(event.target) && button && !button.contains(event.target)) {
        showProfileMenu.value = false;
    }
}
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// Sign out handler
// function handleSignOut() {
//     // Remove tokens from localStorage and cookies
//     localStorage.removeItem('access_token');
//     localStorage.removeItem('refresh_token');
//     document.cookie = 'access_token=; Max-Age=0; path=/;';
//     document.cookie = 'refresh_token=; Max-Age=0; path=/;';
//     // Redirect to login page
//     router.push('/auth/login');
// }

// Helper to check login status
function checkIsLoggedIn() {
    return !!localStorage.getItem('access_token') || document.cookie.includes('access_token');
}

const isLoggedIn = ref(checkIsLoggedIn());

// Update isLoggedIn when storage changes (e.g., login/logout in another tab)
function handleStorageChange() {
    isLoggedIn.value = checkIsLoggedIn();
}
onMounted(() => {
    window.addEventListener('storage', handleStorageChange);
    // Also check on mount in case of direct navigation
    isLoggedIn.value = checkIsLoggedIn();
});
onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange);
});

// When logging in or out, update isLoggedIn
function handleSignOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    document.cookie = 'access_token=; Max-Age=0; path=/;';
    document.cookie = 'refresh_token=; Max-Age=0; path=/;';
    isLoggedIn.value = false;
    router.push('/auth/login');
}
const loading = ref(false);
const error = ref(null);
const specialNotice = ref(null);
const showAnnouncement = ref(true); // Controls the visibility of the announcement
const currentFilters = ref({}); // For filter communication between components

// Add the missing libraryInfo definition
const libraryInfo = ref({
    name: 'Digital Learning Management System',
    description: 'Your gateway to comprehensive educational resources',
    totalResources: 10000,
    activeUsers: 5000,
    categories: 50,
    special_notices: [
        {
            id: 1,
            title: 'New Digital Collection Available',
            message: 'Explore our latest collection of interactive science textbooks and multimedia resources.',
            type: 'info',
            active: true
        }
    ]
});

// Handle filter changes from ResourceFilters component
const handleFiltersChanged = (filters) => {
    console.log('Filters changed in Home:', filters);
    currentFilters.value = filters;
};

onMounted(() => {
    loading.value = true;
    console.log('Home component mounted - initializing data');

    // Initialize with static data
    if (libraryInfo.value?.special_notices?.length > 0) {
        specialNotice.value = libraryInfo.value.special_notices[0];
    }

    // Check if the user previously dismissed the announcement
    if (localStorage.getItem('announcementDismissed') === 'true') {
        showAnnouncement.value = false;
    }

    loading.value = false;
});

// Simplified function to simulate tracking resource views (no API calls)
const trackResourceView = (resourceId) => {
    console.log('Resource view tracked (simulation):', resourceId);
};

// Function to dismiss the announcement
const dismissAnnouncement = () => {
    showAnnouncement.value = false;

    // Optional: Store in localStorage to keep it dismissed between page reloads
    localStorage.setItem('announcementDismissed', 'true');

    toast.add({
        severity: 'info',
        summary: 'Notification Dismissed',
        detail: 'You can reactivate notifications in settings',
        life: 3000
    });
};
</script> -->

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
