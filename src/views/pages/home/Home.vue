<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
// Import PrimeVue components
import Carousel from 'primevue/carousel';
import Paginator from 'primevue/paginator';
import { useAuthStore } from '@/stores/authStore';
const authStore = useAuthStore();

const { auth } = storeToRefs(authStore); // this makes `auth.isAuthenticated` reactive


const router = useRouter();
const title = ref('FLIPPER INTERNATIONAL SCHOOL');
const searchQuery = ref('');
const currentAnnouncementIndex = ref(0);
const showAnnouncements = ref(true);

const logout = authStore.logout;

// Announcements data
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
    // Using a keyed version to ensure Vue properly handles the transitions
    const announcement = announcements.value[currentAnnouncementIndex.value];
    return [{ ...announcement, key: `announcement-${announcement.id}-${currentAnnouncementIndex.value}` }];
});

// Featured resources data
const allFeaturedResources = ref([
    {
        id: 1,
        title: 'Introduction to Astrophysics',
        description: 'A comprehensive guide to understanding the cosmos',
        type: 'E-Book',
        author: 'Dr. Sarah Johnson',
        image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 4.8
    },
    {
        id: 2,
        title: 'World History: Ancient Civilizations',
        description: "Explore the rise and fall of the world's greatest empires",
        type: 'Book',
        author: 'Prof. Michael Chen',
        image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 4.6
    },
    {
        id: 3,
        title: 'Advanced Calculus Explained',
        description: 'Step-by-step video tutorials for complex mathematical concepts',
        type: 'Video Series',
        author: 'Prof. Emma Rodriguez',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 4.9
    },
    {
        id: 4,
        title: 'The Art of Literature',
        description: 'Analysis of classic and contemporary literary works',
        type: 'E-Book',
        author: 'Dr. James Wilson',
        image: 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 4.5
    },
    {
        id: 5,
        title: 'Environmental Science Today',
        description: 'Understanding our changing planet and sustainable practices',
        type: 'E-Book',
        author: 'Dr. Emily Chang',
        image: 'https://images.unsplash.com/photo-1500829243541-74b677fecc30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 4.7
    },
    {
        id: 6,
        title: 'Introduction to Psychology',
        description: 'Understanding the human mind and behavior patterns',
        type: 'Video Series',
        author: 'Prof. Robert Thompson',
        image: 'https://images.unsplash.com/photo-1555443805-658637491dd4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 4.8
    },
    {
        id: 7,
        title: 'Modern Economics',
        description: 'Key principles of microeconomics and macroeconomics',
        type: 'Book',
        author: 'Dr. Alicia Rodriguez',
        image: 'https://images.unsplash.com/photo-1520695287272-b7f8af46d367?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 4.3
    },
    {
        id: 8,
        title: 'Introduction to Computer Science',
        description: 'Foundations of algorithms and programming concepts',
        type: 'E-Book',
        author: 'Prof. Jason Taylor',
        image: 'https://images.unsplash.com/photo-1517134191118-9d595e4c8c2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 4.9
    },
    {
        id: 9,
        title: 'Art Through The Ages',
        description: 'A journey through artistic movements across different eras',
        type: 'Book',
        author: 'Dr. Sophia Martinez',
        image: 'https://images.unsplash.com/photo-1545989253-02cc26577f88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 4.6
    }
]);

// Pagination state for featured resources
// Categories data
const categories = ref([
    { id: 1, name: 'Science', count: 247, icon: 'pi pi-flask', color: '#FF6B6B' },
    { id: 2, name: 'Mathematics', count: 183, icon: 'pi pi-calculator', color: '#4ECDC4' },
    { id: 3, name: 'Literature', count: 325, icon: 'pi pi-book', color: '#8A2BE2' },
    { id: 4, name: 'History', count: 210, icon: 'pi pi-globe', color: '#FFA62B' },
    { id: 5, name: 'Computer Science', count: 176, icon: 'pi pi-desktop', color: '#45B7D1' },
    { id: 6, name: 'Arts & Music', count: 154, icon: 'pi pi-palette', color: '#FF8C94' }
]);

// Pagination state for featured resources
const resourcesPerPage = 6;
const currentPage = ref(1);
const first = ref(0);
const totalPages = computed(() => Math.ceil(allFeaturedResources.value.length / resourcesPerPage));

// Compute the current page of featured resources
const featuredResources = computed(() => {
    const start = first.value;
    const end = start + resourcesPerPage;
    return allFeaturedResources.value.slice(start, end);
});

// Function to handle page change from PrimeVue Paginator
const onPageChange = (event) => {
    first.value = event.first;
    currentPage.value = event.page + 1;
};

// Carousel responsive options
const carouselResponsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
]);

// New arrivals data
const newArrivals = ref([
    {
        id: 1,
        title: 'Quantum Computing Fundamentals',
        author: 'Dr. Alan Turing',
        cover: 'https://plus.unsplash.com/premium_photo-1664006988924-16f386bcd40e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Ym9va3xlbnwwfHwwfHx8MA%3D%3D'
    },
    {
        id: 2,
        title: 'The Modern Periodic Table',
        author: 'Marie Curie',
        cover: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 3,
        title: 'Behavioral Psychology',
        author: 'Dr. Jordan Peterson',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 4,
        title: 'The Digital Revolution',
        author: 'Steve Jobs',
        cover: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 5,
        title: 'Machine Learning Essentials',
        author: 'Andrew Ng',
        cover: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
]);

// Quick links
const quickLinks = ref([
    { id: 1, name: 'My Borrowed Books', icon: 'pi pi-bookmark', route: '/student/borrowed' },
    { id: 2, name: 'Reading Lists', icon: 'pi pi-list', route: '/student/reading-lists' },
    { id: 3, name: 'Study Resources', icon: 'pi pi-file-pdf', route: '/resources/study' },
    { id: 4, name: 'Educational Videos', icon: 'pi pi-video', route: '/resources/videos' }
]);

// Rotate announcements every 5 seconds
let announcementInterval;
onMounted(() => {
    announcementInterval = setInterval(() => {
        nextAnnouncement();
    }, 5000);
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

// Direct navigation to a specific announcement
const goToAnnouncement = (index) => {
    if (index === currentAnnouncementIndex.value) return; // Skip if already on this announcement
    setTimeout(() => {
        currentAnnouncementIndex.value = index;
    }, 50);
};

// Function to search resources
const searchResources = () => {
    if (searchQuery.value.trim()) {
        // Implement search functionality here
        console.log('Searching for:', searchQuery.value);
        // router.push({ name: 'search', query: { q: searchQuery.value } });
    }
};

// Function to view a specific resource
const viewResource = (resource) => {
    console.log('Viewing resource:', resource);
    // router.push({ name: 'resource-details', params: { id: resource.id } });
};

// Function to browse a category
const browseCategory = (category) => {
    console.log('Browsing category:', category);
    // router.push({ name: 'category', params: { id: category.id } });
};

// Function to view all new arrivals
const seeAllNewArrivals = () => {
    console.log('Viewing all new arrivals');
    // router.push({ name: 'new-arrivals' });
};

// Function to view a specific book
const viewBook = (book) => {
    console.log('Viewing book:', book);
    // router.push({ name: 'book-details', params: { id: book.id } });
};

// Function to navigate to a specific route
const navigateTo = (route) => {
    console.log('Navigating to:', route);
    router.push(route);
};

// Function to reset filters
const resetFilters = () => {
    console.log('Resetting all filters');
    // Reset filter implementation would go here
};

// Function for quick search from hero section
const quickSearch = (term) => {
    console.log('Quick searching for:', term);
    searchQuery.value = term;
    searchResources();
};

onMounted(() => {
    authStore.authCheck(); // Only runs on the login page
});
</script>

<template>
    <div class="bg-slate-50 font-sans pb-12 text-gray-800">
        <!-- Top Navigation Bar -->
        <header class="bg-gradient-to-r from-sky-50 to-white shadow-md border-b border-sky-100 py-3 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div class="flex items-center">
                    <div class="flex-shrink-0 relative group">
                        <img src="https://resources.finalsite.net/images/f_auto,q_auto,t_image_size_1/v1697025002/flipperschoolcom/umv1hfkk03vzp206sn4q/Flipper_Logo1.png" alt="Flipper Logo" class="h-20 relative z-10 object-cover" />
                    </div>
                </div>
                <div class="hidden md:flex items-center gap-8 ml-8">
                    <a href="#" class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group" data-tooltip="Browse all resources">
                        <i class="pi pi-book"></i>
                        <span>Library</span>
                        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
                    </a>
                    <a href="#" class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group" data-tooltip="Your saved items">
                        <i class="pi pi-bookmark"></i>
                        <span>Bookmarks</span>
                        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
                    </a>
                    <a href="#" class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group" data-tooltip="Your reading notes">
                        <i class="pi pi-pencil"></i>
                        <span>My Notes</span>
                        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
                    </a>
                    <a href="#" class="text-gray-700 hover:text-sky-600 font-medium flex items-center gap-1.5 relative group" data-tooltip="Resources you're currently using">
                        <i class="pi pi-clock"></i>
                        <span>History</span>
                        <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
                    </a>
                </div>
                <div class="flex items-center gap-4">
                    <template v-if="auth.isAuthenticated">
                        <button
                            @click="logout"
                            class="px-5 py-2 text-red-600 hover:text-red-800 font-medium flex items-center gap-1.5 rounded-md hover:bg-red-50 transition-colors border border-red-100 hover:border-red-200"
                            data-tooltip="Sign out of your account"
                        >
                            <i class="pi pi-sign-out"></i>
                            <span>Log Out</span>
                        </button>
                    </template>
                    <template v-else>
                        <a
                            href="/auth/login"
                            class="px-5 py-2 text-sky-600 hover:text-sky-800 font-medium flex items-center gap-1.5 rounded-md hover:bg-sky-50 transition-colors border border-sky-100 hover:border-sky-200"
                            data-tooltip="Sign in to your account"
                        >
                            <i class="pi pi-sign-in"></i>
                            <span>Log In</span>
                        </a>
                    </template>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <!-- Standalone Announcement Section -->
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

        <!-- Hero Section - Now separate from announcement -->
        <section class="py-16 px-5 text-white relative overflow-hidden">
            <!-- Background elements -->
            <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-no-repeat bg-center bg-cover"></div>

            <!-- Floating book elements -->
            <div class="hidden md:block absolute -top-10 -left-20 w-40 h-48 rotate-12 opacity-20">
                <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e" alt="Book" class="w-full h-full object-cover rounded shadow-lg" />
            </div>
            <div class="hidden md:block absolute bottom-10 -right-10 w-32 h-44 -rotate-6 opacity-20">
                <img src="https://images.unsplash.com/photo-1541963463532-d68292c34b19" alt="Book" class="w-full h-full object-cover rounded shadow-lg" />
            </div>

            <!-- Hero content -->
            <div class="relative z-10 max-w-6xl mx-auto">
                <div class="text-center mb-10">
                    <p class="text-lg md:text-xl mb-10 font-light max-w-2xl mx-auto text-white/90 leading-relaxed">Where every page turns into an adventure and every resource unlocks new possibilities</p>
                </div>

                <!-- Search panel -->
                <div class="max-w-3xl mx-auto">
                    <div class="flex flex-col md:flex-row bg-white/95 rounded-lg shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
                        <div class="relative flex-1">
                            <input type="text" placeholder="What knowledge are you seeking today?" v-model="searchQuery" class="w-full py-5 px-6 focus:outline-none focus:ring-2 focus:ring-sky-300 text-gray-700 text-base" />
                            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-light">Press Enter ↵</span>
                        </div>
                        <button @click="searchResources" class="bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-8 py-5 hover:from-sky-600 hover:to-indigo-700 transition-all flex items-center gap-2 font-medium">
                            <i class="pi pi-search"></i>
                            <span>Explore</span>
                        </button>
                    </div>

                    <!-- Popular topics chips -->
                    <div class="mt-6 flex flex-wrap justify-center gap-3">
                        <span class="bg-white/20 px-4 py-2 rounded-md backdrop-blur-sm text-sm font-medium">Popular Topics:</span>
                        <button
                            v-for="(topic, index) in ['Physics', 'Mathematics', 'Literature', 'Computer Science', 'Biology']"
                            :key="index"
                            @click="quickSearch(topic)"
                            class="bg-white/10 hover:bg-white/30 px-4 py-2 rounded-md transition-colors backdrop-blur-sm text-sm hover:shadow-lg"
                        >
                            {{ topic }}
                        </button>
                    </div>
                </div>
            </div>
        </section>
        <!-- No duplicate announcement section needed, we'll keep the one in the hero section -->

        <!-- Stats Bar -->
        <section class="bg-white border-b border-slate-200 shadow-sm py-6">
            <div class="max-w-7xl mx-auto px-5 flex flex-wrap justify-between items-center gap-8">
                <div class="flex items-center gap-3">
                    <i class="pi pi-book text-sky-600 text-xl"></i>
                    <div>
                        <div class="font-bold text-xl">10,000+</div>
                        <div class="text-sm text-gray-500">Books & E-Books</div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <i class="pi pi-video text-sky-600 text-xl"></i>
                    <div>
                        <div class="font-bold text-xl">5,000+</div>
                        <div class="text-sm text-gray-500">Educational Videos</div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <i class="pi pi-users text-sky-600 text-xl"></i>
                    <div>
                        <div class="font-bold text-xl">30,000+</div>
                        <div class="text-sm text-gray-500">Global Students</div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <i class="pi pi-globe text-sky-600 text-xl"></i>
                    <div>
                        <div class="font-bold text-xl">50+</div>
                        <div class="text-sm text-gray-500">Languages</div>
                    </div>
                </div>
            </div>
        </section>
        <!-- Featured Resources Section with Sidebar Filters -->
        <section class="max-w-7xl mx-auto px-5 mt-12">
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
                <div class="lg:w-1/4 bg-white rounded-xl p-5 shadow-sm h-fit border border-gray-200">
                    <div class="mb-6">
                        <h3 class="font-semibold text-lg mb-3 flex items-center justify-between">
                            <span>Filters</span>
                            <button @click="resetFilters" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Reset</button>
                        </h3>
                        <div class="relative">
                            <input type="text" placeholder="Filter by keyword..." class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <i class="pi pi-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        </div>
                    </div>

                    <!-- Filter by Type -->
                    <div class="border-t border-gray-200 py-4">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-medium">Resource Type</h4>
                            <button class="text-xs text-blue-600 hover:underline">Select All</button>
                        </div>
                        <div class="space-y-2">
                            <div class="flex items-center">
                                <input id="filter-books" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
                                <label for="filter-books" class="ml-2 text-gray-700 flex items-center justify-between w-full">
                                    <span>Physical Books</span>
                                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">1,254</span>
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-ebooks" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
                                <label for="filter-ebooks" class="ml-2 text-gray-700 flex items-center justify-between w-full">
                                    <span>E-Books</span>
                                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">982</span>
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-videos" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
                                <label for="filter-videos" class="ml-2 text-gray-700 flex items-center justify-between w-full">
                                    <span>Videos</span>
                                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">645</span>
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-worksheets" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
                                <label for="filter-worksheets" class="ml-2 text-gray-700 flex items-center justify-between w-full">
                                    <span>Worksheets</span>
                                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">328</span>
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-assignments" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
                                <label for="filter-assignments" class="ml-2 text-gray-700 flex items-center justify-between w-full">
                                    <span>Assignments</span>
                                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">147</span>
                                </label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-audiobooks" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded" />
                                <label for="filter-audiobooks" class="ml-2 text-gray-700 flex items-center justify-between w-full">
                                    <span>Audiobooks</span>
                                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">203</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Filter by Grade -->
                    <div class="border-t border-gray-200 py-4">
                        <h4 class="font-medium mb-3">Grade Level</h4>
                        <div class="space-y-2">
                            <div class="flex items-center">
                                <input id="filter-grade-9" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                <label for="filter-grade-9" class="ml-2 text-gray-700">Grade 9</label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-grade-10" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                <label for="filter-grade-10" class="ml-2 text-gray-700">Grade 10</label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-grade-11" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                <label for="filter-grade-11" class="ml-2 text-gray-700">Grade 11</label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-grade-12" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                <label for="filter-grade-12" class="ml-2 text-gray-700">Grade 12</label>
                            </div>
                        </div>
                    </div>

                    <!-- Filter by Section -->
                    <div class="border-t border-gray-200 py-4">
                        <h4 class="font-medium mb-3">Section</h4>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="flex items-center">
                                <input id="filter-section-a" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                <label for="filter-section-a" class="ml-2 text-gray-700">11A</label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-section-b" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                <label for="filter-section-b" class="ml-2 text-gray-700">11B</label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-section-c" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                <label for="filter-section-c" class="ml-2 text-gray-700">11C</label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-section-d" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                <label for="filter-section-d" class="ml-2 text-gray-700">11D</label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-section-e" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                <label for="filter-section-e" class="ml-2 text-gray-700">11E</label>
                            </div>
                            <div class="flex items-center">
                                <input id="filter-section-f" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded" />
                                <label for="filter-section-f" class="ml-2 text-gray-700">11F</label>
                            </div>
                        </div>
                    </div>

                    <!-- Filter by Rating -->

                    <!-- Filter by Language -->
                    <div class="border-t border-gray-200 py-4">
                        <h4 class="font-medium mb-3">Language</h4>
                        <select class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">All Languages</option>
                            <option value="en">English</option>
                            <option value="am">Spanish</option>
                        </select>
                    </div>

                    <div class="border-t border-gray-200 pt-4 mt-2">
                        <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors">Apply Filters</button>
                    </div>
                </div>

                <!-- Resources Grid -->
                <div class="lg:w-3/4">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                        <div
                            v-for="resource in featuredResources"
                            :key="resource.id"
                            @click="viewResource(resource)"
                            class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100"
                            data-tooltip="Click to view resource details"
                        >
                            <div class="relative h-48">
                                <img :src="resource.image" :alt="resource.title" class="w-full h-full object-cover" />
                                <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-indigo-700 px-3 py-1 rounded-md text-xs font-semibold shadow-sm">
                                    {{ resource.type }}
                                </div>
                                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-16"></div>
                            </div>
                            <div class="p-5">
                                <h3 class="font-semibold text-lg mb-2 line-clamp-1">{{ resource.title }}</h3>
                                <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ resource.description }}</p>
                                <div class="flex justify-between items-center text-sm">
                                    <span v-if="resource.author" class="flex items-center gap-1.5 text-gray-500"> <i class="pi pi-user"></i> {{ resource.author }} </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-8 flex justify-center">
                        <Paginator :rows="resourcesPerPage" :totalRecords="allFeaturedResources.length" v-model:first="first" :rowsPerPageOptions="[6, 9, 12]" @page="onPageChange($event)" class="border-none" />
                    </div>
                </div>
            </div>
        </section>
        <!-- Categories Section -->
        <section class="max-w-7xl mx-auto px-5 mt-16">
            <div class="text-center mb-10">
                <div class="text-indigo-600 font-semibold mb-1">EXPLORE TOPICS</div>
                <h2 class="text-3xl font-bold mb-3">Browse by Category</h2>
                <p class="text-gray-600 max-w-xl mx-auto">Find exactly what you're looking for from our extensive collection across multiple disciplines</p>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 p-2">
                <div
                    v-for="category in categories"
                    :key="category.id"
                    @click="browseCategory(category)"
                    class="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                    <div class="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center transform transition-transform group-hover:scale-110" :style="{ backgroundColor: category.color }">
                        <i :class="category.icon + ' text-2xl text-white'"></i>
                    </div>
                    <h3 class="font-semibold text-lg mb-2">{{ category.name }}</h3>
                    <p class="text-gray-500 text-sm">
                        <span class="font-medium text-indigo-600">{{ category.count }}</span> resources
                    </p>
                </div>
            </div>

            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 mt-10 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between">
                <div class="mb-6 md:mb-0 md:mr-6">
                    <h3 class="text-xl font-bold mb-2">Can't find what you're looking for?</h3>
                    <p class="text-gray-600">Our librarians are here to help you find any resource you need</p>
                </div>
                <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-sm font-medium transition-colors flex-shrink-0">Request Assistance</button>
            </div>
        </section>
        <!-- New Arrivals -->
        <section class="max-w-7xl mx-auto px-5 mt-16">
            <div class="flex justify-between items-center mb-6">
                <div>
                    <div class="text-indigo-600 font-semibold mb-1">JUST ADDED</div>
                    <h2 class="text-3xl font-bold">New Arrivals</h2>
                </div>
                <button @click="seeAllNewArrivals" class="border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors px-5 py-2.5 rounded-lg font-medium">See All</button>
            </div>

            <div class="p-2 bg-white shadow-sm rounded-lg">
                <Carousel
                    :value="newArrivals"
                    :numVisible="3"
                    :numScroll="1"
                    :responsiveOptions="carouselResponsiveOptions"
                    circular
                    :autoplayInterval="5000"
                    class="new-arrivals-carousel"
                    showIndicators
                    showNavigators
                    :pt="{
                        root: { class: 'pb-4' },
                        content: { class: 'pb-6' }
                    }"
                >
                    <template #header>
                        <div class="flex justify-between items-center px-4 pt-3 pb-2">
                            <span class="text-lg font-medium text-gray-700">Latest Books</span>
                        </div>
                    </template>
                    <template #item="slotProps">
                        <div class="p-3" @click="viewBook(slotProps.data)">
                            <div class="cursor-pointer group">
                                <div class="h-64 rounded-lg overflow-hidden shadow-md relative">
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4 z-10">
                                        <button class="bg-white text-indigo-600 rounded-md px-4 py-2 font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform">View Details</button>
                                    </div>
                                    <img :src="slotProps.data.cover" :alt="slotProps.data.title" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    <div class="absolute top-3 left-3 z-10">
                                        <span class="bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-md uppercase font-bold tracking-wider">New</span>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <h3 class="text-base font-medium mb-1 truncate">{{ slotProps.data.title }}</h3>
                                    <p class="text-gray-500 text-sm">{{ slotProps.data.author }}</p>
                                    <div class="mt-2 flex items-center">
                                        <div class="flex">
                                            <i class="pi pi-star-fill text-yellow-400"></i>
                                            <i class="pi pi-star-fill text-yellow-400"></i>
                                            <i class="pi pi-star-fill text-yellow-400"></i>
                                            <i class="pi pi-star-fill text-yellow-400"></i>
                                            <i class="pi pi-star text-yellow-400"></i>
                                        </div>
                                        <span class="text-xs text-gray-500 ml-2">(24)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Carousel>
            </div>
        </section>

        <!-- Quick Links -->
        <section class="max-w-7xl mx-auto px-5 mt-10 text-center">
            <h2 class="text-3xl font-semibold mb-8">Quick Access</h2>
            <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5 p-2">
                <div
                    v-for="link in quickLinks"
                    :key="link.id"
                    @click="navigateTo(link.route)"
                    class="bg-white rounded-xl p-5 shadow-md transition-colors duration-300 hover:bg-sky-400 hover:text-white cursor-pointer flex flex-col items-center justify-center gap-4"
                >
                    <div class="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-white">
                        <i :class="link.icon + ' text-xl text-sky-600'"></i>
                    </div>
                    <span class="font-medium">{{ link.name }}</span>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
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

/* Custom scrollbar for book shelf */
.scrollbar-thin::-webkit-scrollbar {
    height: 6px;
}

.scrollbar-thumb-sky-200::-webkit-scrollbar-thumb {
    background-color: #bae6fd;
    border-radius: 9999px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
    background-color: transparent;
}

/* PrimeVue component customizations */
:deep(.p-paginator) {
    background: transparent;
    border: none;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    background-color: #4f46e5;
    color: white;
}

:deep(.new-arrivals-carousel .p-carousel-indicators .p-carousel-indicator.p-highlight button) {
    background-color: #4f46e5;
}

:deep(.new-arrivals-carousel .p-carousel-next),
:deep(.new-arrivals-carousel .p-carousel-prev) {
    color: #4f46e5;
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
}

:deep(.new-arrivals-carousel .p-carousel-container) {
    padding: 0 1.5rem;
}
</style>
