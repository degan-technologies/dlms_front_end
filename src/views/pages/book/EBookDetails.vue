<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const ebook = ref(null);
const loading = ref(true);
const downloading = ref(false);
const ebookId = route.params.id;

onMounted(() => {
    fetchEbookDetails();
});

const fetchEbookDetails = async () => {
    try {
        // In a real app, this would be an API call to get e-book details
        setTimeout(() => {
            // Mock data
            ebook.value = {
                id: parseInt(ebookId),
                title: 'Digital Design Principles',
                author: 'Dr. Elizabeth Chen',
                isbn: '9781234567890',
                publication_year: 2023,
                description: 'A comprehensive guide to modern digital design principles and practices. This book covers the fundamentals of digital systems, circuit design, and advanced topics in digital electronics.',
                cover_image_url: '/demo/images/product/product-placeholder.svg',
                category: { id: 6, name: 'Technology' },
                publisher: { id: 5, name: 'Digital Education Group' },
                language: 'en',
                pages: 450,
                file_url: '/demo/data/sample.pdf',
                file_format: 'PDF',
                file_size_mb: 12.5,
                is_downloadable: true,
                requires_authentication: true,
                drm_type: 'none',
                access_expires_at: null,
                max_downloads: 5,
                reader_app: 'Adobe Reader',
                availability_status: 'available',
                library_branch: { id: 1, name: 'Main Branch' },
                download_count: 12,
                view_count: 48
            };
            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('Failed to fetch e-book details:', error);
        loading.value = false;
    }
};

const editEbook = () => {
    router.push(`/books/ebooks/edit/${ebookId}`);
};

const downloadEbook = async () => {
    if (!ebook.value.is_downloadable) {
        return;
    }

    downloading.value = true;
    try {
        // In a real app, this would initiate a download from the server
        // const response = await fetch(`/api/books/ebooks/${ebookId}/download`);
        // const blob = await response.blob();
        // const url = window.URL.createObjectURL(blob);
        // const a = document.createElement('a');
        // a.style.display = 'none';
        // a.href = url;
        // a.download = `${ebook.value.title}.${ebook.value.file_format.toLowerCase()}`;
        // document.body.appendChild(a);
        // a.click();
        // window.URL.revokeObjectURL(url);

        // Simulate download delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Increment download count
        ebook.value.download_count++;
    } catch (error) {
        console.error('Error downloading e-book:', error);
    } finally {
        downloading.value = false;
    }
};

const readEbook = () => {
    // Navigate to the e-book reader
    router.push(`/books/ebooks/read/${ebookId}`);
};

const formatFileSize = (sizeInMB) => {
    if (sizeInMB < 1) {
        return `${Math.round(sizeInMB * 1024)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
};

const goBack = () => {
    router.push('/books/ebooks');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center mb-4">
                    <Button icon="pi pi-arrow-left" class="p-button-text p-button-rounded mr-2" @click="goBack" />
                    <h5 class="m-0" v-if="ebook">{{ ebook.title }}</h5>
                    <h5 class="m-0" v-else>E-Book Details</h5>
                </div>

                <div v-if="loading" class="flex justify-content-center">
                    <ProgressSpinner />
                </div>

                <div v-else-if="ebook" class="grid">
                    <div class="col-12 md:col-4 flex flex-column align-items-center">
                        <div class="book-cover-container mb-4">
                            <img :src="ebook.cover_image_url" :alt="ebook.title" class="book-cover shadow-4" />
                        </div>

                        <div class="w-full">
                            <div class="flex justify-content-center gap-2 mb-4">
                                <Button label="Read Online" icon="pi pi-book" @click="readEbook" />

                                <Button label="Download" icon="pi pi-download" severity="secondary" :disabled="!ebook.is_downloadable" :loading="downloading" @click="downloadEbook" />
                            </div>

                            <div class="flex justify-content-center mb-4">
                                <Button icon="pi pi-pencil" label="Edit" class="p-button-outlined" @click="editEbook" />
                            </div>

                            <div v-if="!ebook.is_downloadable" class="flex justify-content-center mb-4">
                                <Tag severity="info" value="Online Reading Only" />
                            </div>

                            <div v-if="ebook.requires_authentication" class="flex justify-content-center mb-4">
                                <Tag severity="warning" value="Authentication Required" icon="pi pi-lock" />
                            </div>

                            <div class="flex justify-content-center gap-4 mt-4">
                                <div class="text-center">
                                    <div class="text-2xl font-bold">{{ ebook.view_count }}</div>
                                    <div class="text-sm">Views</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold">{{ ebook.download_count }}</div>
                                    <div class="text-sm">Downloads</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 md:col-8">
                        <h6 class="text-xl font-bold mb-2">{{ ebook.title }}</h6>
                        <p class="text-lg font-medium text-600 mb-4">by {{ ebook.author }}</p>

                        <div class="grid">
                            <div class="col-12">
                                <h6 class="font-bold mb-2">Description</h6>
                                <p class="line-height-3 mb-4">{{ ebook.description }}</p>
                            </div>

                            <div class="col-12 md:col-6">
                                <h6 class="font-bold mb-2">Book Details</h6>
                                <ul class="book-details-list">
                                    <li><span>ISBN:</span> {{ ebook.isbn }}</li>
                                    <li><span>Publication Year:</span> {{ ebook.publication_year }}</li>
                                    <li><span>Category:</span> {{ ebook.category.name }}</li>
                                    <li><span>Publisher:</span> {{ ebook.publisher.name }}</li>
                                    <li><span>Language:</span> {{ ebook.language }}</li>
                                    <li><span>Pages:</span> {{ ebook.pages }}</li>
                                </ul>
                            </div>

                            <div class="col-12 md:col-6">
                                <h6 class="font-bold mb-2">File Information</h6>
                                <ul class="book-details-list">
                                    <li><span>Format:</span> {{ ebook.file_format }}</li>
                                    <li><span>Size:</span> {{ formatFileSize(ebook.file_size_mb) }}</li>
                                    <li><span>Recommended Reader:</span> {{ ebook.reader_app }}</li>
                                    <li><span>DRM Protection:</span> {{ ebook.drm_type === 'none' ? 'None' : ebook.drm_type }}</li>
                                    <li v-if="ebook.max_downloads"><span>Download Limit:</span> {{ ebook.max_downloads }} per user</li>
                                    <li v-if="ebook.access_expires_at"><span>Access Expires:</span> {{ new Date(ebook.access_expires_at).toLocaleDateString() }}</li>
                                </ul>

                                <h6 class="font-bold mb-2 mt-4">Access Information</h6>
                                <ul class="book-details-list">
                                    <li><span>Branch:</span> {{ ebook.library_branch.name }}</li>
                                    <li><span>Downloadable:</span> {{ ebook.is_downloadable ? 'Yes' : 'No' }}</li>
                                    <li><span>Authentication Required:</span> {{ ebook.requires_authentication ? 'Yes' : 'No' }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="flex justify-content-center">
                    <div class="text-center">
                        <i class="pi pi-exclamation-triangle text-yellow-500" style="font-size: 3rem"></i>
                        <h5>E-book not found</h5>
                        <p>The e-book you're looking for doesn't exist or has been removed.</p>
                        <Button label="Go Back" @click="goBack" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.book-cover {
    max-width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: contain;
    border-radius: 4px;
}

.book-cover-container {
    width: 100%;
    display: flex;
    justify-content: center;
}

.book-details-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.book-details-list li {
    margin-bottom: 0.5rem;
}

.book-details-list li span {
    font-weight: 600;
    margin-right: 0.5rem;
}
</style>
