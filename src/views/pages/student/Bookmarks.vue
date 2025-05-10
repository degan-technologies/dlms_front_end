<template>
    <div class="surface-ground px-4 py-8 md:px-6 lg:px-8">
        <div class="bg-white border-round shadow-2 p-4 md:p-6">
            <div class="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                <div>
                    <div class="text-900 font-bold text-3xl mb-1">My Bookmarks</div>
                    <div class="text-500 mb-3 md:mb-0">Keep track of your favorite resources</div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <span class="p-input-icon-left w-full md:w-auto">
                        <i class="pi pi-search"></i>
                        <InputText v-model="searchQuery" placeholder="Search bookmarks" class="w-full" />
                    </span>
                    <Dropdown v-model="filterType" :options="filterOptions" optionLabel="label" placeholder="Filter by type" class="w-full md:w-auto" />
                </div>
            </div>

            <DataView :value="filteredBookmarks" :paginator="true" :rows="9" :layout="layout" paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" :rows-per-page-options="[9, 18, 36]">
                <template #header>
                    <div class="flex justify-content-end">
                        <DataViewLayoutOptions v-model="layout" />
                    </div>
                </template>

                <template #list="slotProps">
                    <div class="col-12">
                        <div
                            class="flex flex-column md:flex-row align-items-center p-3 w-full border-round mb-3 surface-border"
                            :class="{ 'surface-hover': hoveredId === slotProps.data.id }"
                            @mouseenter="hoveredId = slotProps.data.id"
                            @mouseleave="hoveredId = null"
                        >
                            <div class="relative flex-shrink-0 mr-4 mb-3 md:mb-0" style="width: 125px; height: 85px">
                                <img :src="slotProps.data.thumbnailUrl || resourceTypeImage(slotProps.data.type)" :alt="slotProps.data.title" class="shadow-2 w-full h-full object-cover border-round" />
                                <div class="absolute top-0 right-0 bg-primary text-white px-2 py-1 text-xs border-round-md m-1 font-semibold">
                                    {{ slotProps.data.type }}
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="flex flex-column md:flex-row md:justify-content-between">
                                    <div>
                                        <h5 class="mb-2 text-lg font-semibold">{{ slotProps.data.title }}</h5>
                                        <p class="text-600 line-clamp-1 mb-3">{{ slotProps.data.description }}</p>
                                        <div class="flex align-items-center">
                                            <div class="flex align-items-center text-sm mr-3">
                                                <i class="pi pi-user mr-1 text-600"></i>
                                                <span class="text-700">{{ slotProps.data.author }}</span>
                                            </div>
                                            <div class="flex align-items-center text-sm mr-3">
                                                <i class="pi pi-calendar mr-1 text-600"></i>
                                                <span class="text-700">{{ formatDate(slotProps.data.dateAdded) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-column md:flex-row gap-2 md:align-items-end mt-3 md:mt-0">
                                        <Button icon="pi pi-eye" label="View" @click="viewResource(slotProps.data)" />
                                        <Button icon="pi pi-trash" severity="danger" text @click="removeBookmark(slotProps.data)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <template #grid="slotProps">
                    <div class="col-12 sm:col-6 lg:col-4 p-2">
                        <div class="p-3 border-round shadow-2 h-full flex flex-column" :class="{ 'surface-hover': hoveredId === slotProps.data.id }" @mouseenter="hoveredId = slotProps.data.id" @mouseleave="hoveredId = null">
                            <div class="relative mb-3">
                                <img :src="slotProps.data.thumbnailUrl || resourceTypeImage(slotProps.data.type)" :alt="slotProps.data.title" class="w-full h-48 object-cover border-round" />
                                <div class="absolute top-0 right-0 bg-primary text-white px-2 py-1 text-xs border-round-md m-1 font-semibold">
                                    {{ slotProps.data.type }}
                                </div>
                            </div>
                            <div class="text-lg font-semibold mb-2 line-clamp-1">{{ slotProps.data.title }}</div>
                            <p class="text-600 mb-3 line-clamp-2 flex-grow-1">{{ slotProps.data.description }}</p>
                            <div class="flex align-items-center justify-content-between mb-3">
                                <div class="text-sm text-600">{{ slotProps.data.author }}</div>
                                <div class="text-sm text-600">{{ formatDate(slotProps.data.dateAdded) }}</div>
                            </div>
                            <div class="flex gap-2">
                                <Button icon="pi pi-eye" label="View" @click="viewResource(slotProps.data)" class="flex-1" />
                                <Button icon="pi pi-trash" severity="danger" text @click="removeBookmark(slotProps.data)" />
                            </div>
                        </div>
                    </div>
                </template>

                <template #empty>
                    <div class="flex flex-column align-items-center p-6">
                        <i class="pi pi-bookmark-fill text-6xl text-primary mb-4"></i>
                        <h3 class="text-2xl text-900 mb-2">No Bookmarks Found</h3>
                        <p class="text-600 mb-5">You haven't added any bookmarks yet.</p>
                        <Button label="Browse Library" icon="pi pi-search" @click="goToLibrary" />
                    </div>
                </template>
            </DataView>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const bookmarks = ref([]);
const searchQuery = ref('');
const filterType = ref(null);
const layout = ref('grid');
const hoveredId = ref(null);
const loading = ref(true);

const filterOptions = [
    { label: 'All Types', value: null },
    { label: 'E-Books', value: 'ebook' },
    { label: 'PDF Documents', value: 'pdf' },
    { label: 'Videos', value: 'video' },
    { label: 'Audio', value: 'audio' }
];

// Mock data - In real app you'd fetch this from an API
onMounted(() => {
    loading.value = true;
    setTimeout(() => {
        bookmarks.value = [
            {
                id: 1,
                title: 'Advanced Machine Learning Techniques',
                description: 'A comprehensive guide to modern machine learning algorithms and their applications in data science.',
                author: 'Dr. Sarah Johnson',
                type: 'ebook',
                thumbnailUrl: 'https://images.unsplash.com/photo-1620207418302-439b387441b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                dateAdded: '2025-04-15'
            },
            {
                id: 2,
                title: 'Introduction to Quantum Computing',
                description: 'Learn the basics of quantum computing and understand how quantum algorithms work.',
                author: 'Prof. Richard Meyer',
                type: 'pdf',
                thumbnailUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                dateAdded: '2025-04-10'
            },
            {
                id: 3,
                title: 'World Literature Classics',
                description: 'A collection of the most influential literary works from around the world.',
                author: 'Emily Bronson',
                type: 'ebook',
                thumbnailUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                dateAdded: '2025-04-05'
            },
            {
                id: 4,
                title: 'The Human Body: An Illustrated Guide',
                description: 'Detailed anatomical illustrations and explanations of human body systems.',
                author: 'Dr. Michael Torres',
                type: 'pdf',
                thumbnailUrl: 'https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                dateAdded: '2025-03-30'
            },
            {
                id: 5,
                title: 'Introduction to Differential Equations',
                description: 'A video lecture series covering the fundamentals of solving differential equations.',
                author: 'Prof. Amanda Chen',
                type: 'video',
                thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                dateAdded: '2025-03-25'
            }
        ];
        loading.value = false;
    }, 500);
});

// Computed property for filtered bookmarks
const filteredBookmarks = computed(() => {
    return bookmarks.value.filter((bookmark) => {
        const matchesSearch =
            bookmark.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || bookmark.description.toLowerCase().includes(searchQuery.value.toLowerCase()) || bookmark.author.toLowerCase().includes(searchQuery.value.toLowerCase());

        const matchesType = !filterType.value || bookmark.type === filterType.value;

        return matchesSearch && matchesType;
    });
});

// Format date to readable format
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Get default image based on resource type
const resourceTypeImage = (type) => {
    switch (type.toLowerCase()) {
        case 'ebook':
            return 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
        case 'pdf':
            return 'https://images.unsplash.com/photo-1537640685229-4a8c0c4354dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
        case 'video':
            return 'https://images.unsplash.com/photo-1611162618479-ee3d24aaef2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
        case 'audio':
            return 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
        default:
            return 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    }
};

// View resource
const viewResource = (resource) => {
    console.log('Viewing resource:', resource);
    router.push(`/resource/${resource.id}`);
};

// Remove bookmark
const removeBookmark = (bookmark) => {
    bookmarks.value = bookmarks.value.filter((item) => item.id !== bookmark.id);
};

// Navigate to library
const goToLibrary = () => {
    router.push('/');
};
</script>

<style scoped>
.line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
}

.line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}
</style>
