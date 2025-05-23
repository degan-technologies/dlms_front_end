<template>
    <div class="bg-slate-50 font-sans pb-12 text-gray-800">
        <!-- Toast for notifications -->
        <Toast position="top-right" />
        <!-- Top Navigation Bar -->
        <header class="bg-gradient-to-r from-sky-50 to-white shadow-md border-b border-sky-100 py-3 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div class="flex items-center">
                    <div class="flex-shrink-0 relative group">
                        <img src="https://resources.finalsite.net/images/f_auto,q_auto,t_image_size_1/v1697025002/flipperschoolcom/umv1hfkk03vzp206sn4q/Flipper_Logo1.png" alt="Flipper Logo" class="h-12 sm:h-16 md:h-20 relative z-10 object-cover" />
                    </div>
                    <!-- Mobile menu button -->
                    <button @click="showMobileMenu = !showMobileMenu" class="ml-4 md:hidden bg-sky-50 hover:bg-sky-100 p-2 rounded-md transition-colors flex items-center justify-center">
                        <i class="pi pi-bars text-sky-600"></i>
                    </button>
                </div>

                <!-- Desktop Navigation Links -->
                <div class="hidden md:flex items-center gap-4 lg:gap-8 ml-4 lg:ml-8">
                    <a href="#" class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group" data-tooltip="Browse all resources">
                        <i class="pi pi-book"></i>
                        <span>Library</span>
                        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
                    </a>
                    <a href="/bookmarks" class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group" data-tooltip="Your saved items">
                        <i class="pi pi-bookmark"></i>
                        <span>Bookmarks</span>
                        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
                    </a>
                    <a href="/my-notes" class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group" data-tooltip="Your reading notes">
                        <i class="pi pi-pencil"></i>
                        <span>My Notes</span>
                        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
                    </a>
                    <a href="/history" class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group" data-tooltip="Resources you're currently using">
                        <i class="pi pi-clock"></i>
                        <span>History</span>
                        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
                    </a>
                    <a href="/my-collection" class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group" data-tooltip="Your curated collections">
                        <i class="pi pi-th-large"></i>
                        <span>My Collection</span>
                        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
                    </a>
                    <!-- Show My Profile dropdown only if logged in -->
                    <div v-if="isLoggedIn" class="relative">
                        <button 
                            id="profile-dropdown-button"
                            @click="toggleProfileMenu"
                            class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group"
                            data-tooltip="Account options"
                        >
                            <i class="pi pi-user"></i>
                            <span>My Profile</span>
                            <i class="pi pi-chevron-down text-xs ml-1" 
                               :class="{'rotate-180': showProfileMenu}"
                               style="transition: transform 0.2s ease"></i>
                            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
                        </button>
                        <!-- Dropdown Menu -->
                        <div 
                            v-if="showProfileMenu" 
                            id="profile-dropdown-menu"
                            class="absolute mt-11 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                        >
                            <div class="py-1">
                                <a 
                                    href="/my-profile" 
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 flex items-center gap-2"
                                >
                                    <i class="pi pi-user-edit text-sky-600"></i>
                                    My Account
                                </a>
                                <!-- <a 
                                    href="/settings" 
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 flex items-center gap-2"
                                >
                                    <i class="pi pi-cog text-gray-600"></i>
                                    Settings
                                </a> -->
                                <button 
                                    @click="handleSignOut" 
                                    class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <i class="pi pi-sign-out text-red-500"></i>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Show Login button only if not logged in -->
                <div class="flex items-center gap-2 sm:gap-4" v-if="!isLoggedIn">
                    <a
                        href="/auth/login"
                        class="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 text-sky-600 hover:text-sky-800 font-medium flex items-center gap-1.5 rounded-md hover:bg-sky-50 transition-colors border border-sky-100 hover:border-sky-200 text-sm sm:text-base"
                        data-tooltip="Sign in to your account"
                    >
                        <i class="pi pi-sign-in"></i>
                        <span>Login</span>
                        <span class="hidden xs:inline">Log In</span>
                    </a>
                </div>
            </div>
        </header>

        <!-- Mobile Menu Overlay -->
        <div v-if="showMobileMenu" class="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 md:hidden">
            <div class="h-full bg-white w-4/5 max-w-sm shadow-xl overflow-y-auto slide-in-left">
                <div class="flex justify-between items-center p-4 border-b">
                    <h3 class="text-xl font-semibold text-gray-800">Menu</h3>
                    <button @click="showMobileMenu = false" class="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                        <i class="pi pi-times text-gray-600"></i>
                    </button>
                </div>
                <div class="py-4">
                    <a href="#" @click="showMobileMenu = false" class="block px-4 py-3 hover:bg-sky-50 active:bg-sky-100 transition-colors text-gray-700">
                        <div class="flex items-center gap-3">
                            <i class="pi pi-book text-sky-600"></i>
                            <span>Library</span>
                        </div>
                    </a>
                    <a href="/bookmarks" @click="showMobileMenu = false" class="block px-4 py-3 hover:bg-sky-50 active:bg-sky-100 transition-colors text-gray-700">
                        <div class="flex items-center gap-3">
                            <i class="pi pi-bookmark text-sky-600"></i>
                            <span>Bookmarks</span>
                        </div>
                    </a>
                    <a href="/my-notes" @click="showMobileMenu = false" class="block px-4 py-3 hover:bg-sky-50 active:bg-sky-100 transition-colors text-gray-700">
                        <div class="flex items-center gap-3">
                            <i class="pi pi-pencil text-sky-600"></i>
                            <span>My Notes</span>
                        </div>
                    </a>
                    <a href="/history" @click="showMobileMenu = false" class="block px-4 py-3 hover:bg-sky-50 active:bg-sky-100 transition-colors text-gray-700">
                        <div class="flex items-center gap-3">
                            <i class="pi pi-clock text-sky-600"></i>
                            <span>History</span>
                        </div>
                    </a>
                    <a href="/my-collection" @click="showMobileMenu = false" class="block px-4 py-3 hover:bg-sky-50 active:bg-sky-100 transition-colors text-gray-700">
                        <div class="flex items-center gap-3">
                            <i class="pi pi-th-large text-sky-600"></i>
                            <span>My Collection</span>
                        </div>
                    </a>
                    <div v-if="isLoggedIn" class="border-t mt-2 pt-2">
                        <a href="/my-profile" @click="showMobileMenu = false" class="block px-4 py-3 hover:bg-sky-50 text-gray-700">
                            <div class="flex items-center gap-3">
                                <i class="pi pi-user-edit text-sky-600"></i>
                                <span>My Account</span>
                            </div>
                        </a>
                        <button @click="handleSignOut(); showMobileMenu = false" class="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-3">
                            <i class="pi pi-sign-out text-red-500"></i>
                            <span>Sign Out</span>
                        </button>
                    </div>
                    <div v-else class="border-t mt-2 pt-2">
                        <a href="/auth/login" @click="showMobileMenu = false" class="block px-4 py-3 hover:bg-sky-50 text-gray-700">
                            <div class="flex items-center gap-3">
                                <i class="pi pi-sign-in text-sky-600"></i>
                                <span>Login / Register</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Announcement Section -->
        <section v-if="announcements.length > 0 && showAnnouncements" class="bg-gradient-to-r from-amber-500/90 to-orange-400/90 py-3 relative z-20 shadow-md">
            <div class="max-w-6xl mx-auto px-4">
                <div class="relative">
                    <div class="announcement-container relative h-[68px] overflow-hidden rounded-lg bg-amber-500/30 backdrop-blur-sm border border-white/20 px-4">
                        <transition-group name="slide-fade" tag="div" class="relative py-2">
                            <div v-for="announcement in visibleAnnouncement" :key="announcement.key || announcement.id" class="w-full h-[52px] flex items-center">
                                <div class="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full">
                                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                        <i class="pi pi-megaphone text-white text-sm"></i>
                                    </div>
                                    <p class="font-medium flex-1 text-white text-shadow-sm leading-relaxed line-clamp-2">{{ announcement.message }}</p>
                                    <div class="flex items-center gap-3 ml-auto">
                                        <button
                                            @click="learnMoreAboutAnnouncement(announcement)"
                                            class="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap backdrop-blur-sm border border-white/30 hover:shadow-lg"
                                        >
                                            Details
                                        </button>
                                        <button @click="dismissAnnouncement()" class="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-white transition-all duration-300 border border-white/20">
                                            <i class="pi pi-times text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </transition-group>
                    </div>

                    <!-- Announcement navigation -->
                    <div class="flex justify-end items-center gap-4 mt-2 px-2">
                        <div class="flex gap-2">
                            <button
                                v-for="(dot, index) in announcements.length"
                                :key="index"
                                @click="setCurrentAnnouncement(index)"
                                class="w-2 h-2 rounded-full transition-all duration-300 dot-indicator"
                                :class="index === currentAnnouncementIndex ? 'bg-white scale-125 shadow-sm' : 'bg-white/40 hover:bg-white/70'"
                            ></button>
                        </div>
                        <div class="flex gap-1">
                            <button @click="prevAnnouncement" class="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 border border-white/20">
                                <i class="pi pi-chevron-left text-xs"></i>
                            </button>
                            <button @click="nextAnnouncement" class="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 border border-white/20">
                                <i class="pi pi-chevron-right text-xs"></i>
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

        <!-- Featured Resources Section with Sidebar Filters -->
        <section class="max-w-7xl mx-auto px-5 mt-12 featured-resources-section">
            <div class="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <div class="text-indigo-600 font-semibold mb-1">CURATED FOR YOU</div>
                    <h2 class="text-3xl font-bold">Featured Resources</h2>
                </div>
                <div class="mt-4 md:mt-0">
                    <button class="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">View all resources <i class="pi pi-arrow-right"></i></button>
                </div>
            </div>

            <div class="flex flex-col lg:flex-row gap-8">
                <!-- Filters Sidebar -->
                <ResourceFilters />

                <!-- Resources Grid -->
                <ResourceGrid />
            </div>
        </section>

        <!-- New Arrivals -->
        <NewArrivals />

        <!-- Recently Viewed -->
        <RecentlyViewed />

        <!-- Reading Lists -->
        <ReadingLists />

        <!-- Quick Links -->
        <QuickLinks />

        <!-- Resource Request Form -->
        <ResourceRequestForm />

        <!-- Resource Modal -->
        <ResourceModal />

        <!-- Footer -->
        <footer class="bg-slate-800 text-white pt-16 pb-8 mt-16">
            <div class="max-w-7xl mx-auto px-5">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div>
                        <h3 class="font-bold text-lg mb-6">About the Library</h3>
                        <p class="text-slate-300 text-sm mb-6 leading-relaxed">
                            Our digital library provides students and faculty with 24/7 access to thousands of academic resources, journals, books, and multimedia materials to support learning and research.
                        </p>
                        <div class="flex items-center gap-4">
                            <a href="#" class="hover:text-sky-400 transition-colors">
                                <i class="pi pi-facebook text-lg"></i>
                            </a>
                            <a href="#" class="hover:text-sky-400 transition-colors">
                                <i class="pi pi-twitter text-lg"></i>
                            </a>
                            <a href="#" class="hover:text-sky-400 transition-colors">
                                <i class="pi pi-instagram text-lg"></i>
                            </a>
                            <a href="#" class="hover:text-sky-400 transition-colors">
                                <i class="pi pi-youtube text-lg"></i>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 class="font-bold text-lg mb-6">Quick Links</h3>
                        <ul class="space-y-3 text-slate-300">
                            <li><a href="#" class="hover:text-sky-400 transition-colors">About Us</a></li>
                            <li><a href="#" class="hover:text-sky-400 transition-colors">Library Hours</a></li>
                            <li><a href="#" class="hover:text-sky-400 transition-colors">FAQ</a></li>
                            <li><a href="#" class="hover:text-sky-400 transition-colors">Contact Us</a></li>
                            <li><a href="#" class="hover:text-sky-400 transition-colors">Policies</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="font-bold text-lg mb-6">Resources</h3>
                        <ul class="space-y-3 text-slate-300">
                            <li><a href="#" class="hover:text-sky-400 transition-colors">E-Books</a></li>
                            <li><a href="#" class="hover:text-sky-400 transition-colors">Journals</a></li>
                            <li><a href="#" class="hover:text-sky-400 transition-colors">Academic Videos</a></li>
                            <li><a href="#" class="hover:text-sky-400 transition-colors">Research Guides</a></li>
                            <li><a href="#" class="hover:text-sky-400 transition-colors">Citation Tools</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="font-bold text-lg mb-6">Contact Us</h3>
                        <div class="space-y-4 text-slate-300 text-sm">
                            <div class="flex items-start gap-3">
                                <i class="pi pi-map-marker mt-1 text-sky-400"></i>
                                <span>123 Library Lane<br />Education City, FL 12345</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="pi pi-phone text-sky-400"></i>
                                <span>(555) 123-4567</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="pi pi-envelope text-sky-400"></i>
                                <span>library@school.edu</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <i class="pi pi-clock text-sky-400"></i>
                                <span>Mon-Fri: 8am - 8pm</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-16 pt-8 border-t border-slate-700 text-center text-slate-400 text-sm">
                    <p>&copy; {{ new Date().getFullYear() }} Digital Library Management System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { useHomeStore } from '@/stores/homeStore';
import Toast from 'primevue/toast';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

// Import all modularized components
import HeroSection from '@/components/home/HeroSection.vue';
import NewArrivals from '@/components/home/NewArrivals.vue';
import QuickLinks from '@/components/home/QuickLinks.vue';
import ReadingLists from '@/components/home/ReadingLists.vue';
import RecentlyViewed from '@/components/home/RecentlyViewed.vue';
import ResourceFilters from '@/components/home/ResourceFilters.vue';
import ResourceGrid from '@/components/home/ResourceGrid.vue';
import ResourceModal from '@/components/home/ResourceModal.vue';
import ResourceRequestForm from '@/components/home/ResourceRequestForm.vue';
import StatsBar from '@/components/home/StatsBar.vue';

// Router setup
const router = useRouter();

// Initialize Pinia store
const homeStore = useHomeStore();

// Mobile menu state
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
    if (
        menu &&
        !menu.contains(event.target) &&
        button &&
        !button.contains(event.target)
    ) {
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

// Announcements data
const announcements = ref([
    { id: 1, message: 'New Science Fiction Collection available in the library from May 15th!' },
    { id: 2, message: 'Library extended hours during exam week - Open until 10 PM' },
    { id: 3, message: 'Join our Book Club meeting every Friday at 4 PM in Room 204' },
    { id: 4, message: 'New educational videos on Mathematics added to our digital collection' }
]);
const showAnnouncements = ref(true);
const currentAnnouncementIndex = ref(0);

// Fetch data on component mount
onMounted(() => {
    homeStore.fetchBookItem();

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

// Functions to manage announcements
const dismissAnnouncement = () => {
    showAnnouncements.value = false;
};

const learnMoreAboutAnnouncement = (announcement) => {
    console.log('Learn more about announcement:', announcement);
    // In a real app, this would navigate to a detailed announcement page or show a modal
};

// Function to navigate to a specific announcement
const setCurrentAnnouncement = (index) => {
    currentAnnouncementIndex.value = index;
};

// Next announcement
const nextAnnouncement = () => {
    if (currentAnnouncementIndex.value < announcements.value.length - 1) {
        currentAnnouncementIndex.value++;
    } else {
        currentAnnouncementIndex.value = 0;
    }
};

// Previous announcement
const prevAnnouncement = () => {
    if (currentAnnouncementIndex.value > 0) {
        currentAnnouncementIndex.value--;
    } else {
        currentAnnouncementIndex.value = announcements.value.length - 1;
    }
};

// Compute the current visible announcement with improved transition handling
const visibleAnnouncement = computed(() => {
    // Using a keyed version to ensure Vue properly handles the transitions
    const announcement = announcements.value[currentAnnouncementIndex.value];
    return [{ ...announcement, key: `announcement-${announcement.id}-${currentAnnouncementIndex.value}` }];
});

// Rotate announcements every 5 seconds
let announcementInterval;
</script>

<style scoped>
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
