<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const book = ref(null);
const loading = ref(true);
const borrowing = ref(false);
const reserving = ref(false);
const bookId = route.params.id;

onMounted(() => {
    fetchBookDetails();
});

const fetchBookDetails = async () => {
    try {
        // In a real app, this would be an API call to get book details
        setTimeout(() => {
            // Mock data
            book.value = {
                id: parseInt(bookId),
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                isbn: '9780743273565',
                publication_year: 1925,
                description: `Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.`,
                cover_image_url: 'https://covers.openlibrary.org/b/id/8267752-M.jpg',
                category: { id: 1, name: 'Fiction' },
                publisher: { id: 2, name: 'Scribner' },
                language: 'en',
                edition: 'First Edition',
                pages: 180,
                cover_type: 'hardcover',
                dimensions: '8 x 5 x 0.7 inches',
                weight_grams: 300,
                barcode: 'GB1925001',
                shelf_location_detail: 'Fiction Section, Row 3, Shelf 2',
                reference_only: false,
                availability_status: 'available',
                library_branch: { id: 1, name: 'Main Branch' },
                shelf: { id: 2, name: 'Fiction - G-M' }
            };
            loading.value = false;
        }, 1000);
    } catch (error) {
        console.error('Failed to fetch book details:', error);
        loading.value = false;
    }
};

const editBook = () => {
    router.push(`/books/physical/edit/${bookId}`);
};

const borrowBook = async () => {
    if (book.value.availability_status !== 'available') {
        return;
    }

    borrowing.value = true;
    try {
        // In a real app, this would be an API call to borrow the book
        // const response = await fetch(`/api/books/${bookId}/borrow`, { method: 'POST' });
        // const data = await response.json();

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        book.value.availability_status = 'checked_out';
    } catch (error) {
        console.error('Error borrowing book:', error);
    } finally {
        borrowing.value = false;
    }
};

const reserveBook = async () => {
    if (book.value.availability_status !== 'checked_out') {
        return;
    }

    reserving.value = true;
    try {
        // In a real app, this would be an API call to reserve the book
        // const response = await fetch(`/api/books/${bookId}/reserve`, { method: 'POST' });
        // const data = await response.json();

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        book.value.availability_status = 'reserved';
    } catch (error) {
        console.error('Error reserving book:', error);
    } finally {
        reserving.value = false;
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case 'available':
            return 'bg-green-100 text-green-700';
        case 'checked_out':
            return 'bg-yellow-100 text-yellow-700';
        case 'reserved':
            return 'bg-blue-100 text-blue-700';
        case 'lost':
        case 'damaged':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const goBack = () => {
    router.push('/books');
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex align-items-center mb-4">
                    <Button icon="pi pi-arrow-left" class="p-button-text p-button-rounded mr-2" @click="goBack" />
                    <h5 class="m-0" v-if="book">{{ book.title }}</h5>
                    <h5 class="m-0" v-else>Book Details</h5>
                </div>

                <div v-if="loading" class="flex justify-content-center">
                    <ProgressSpinner />
                </div>

                <div v-else-if="book" class="grid">
                    <div class="col-12 md:col-4 flex flex-column align-items-center">
                        <div class="book-cover-container mb-4">
                            <img :src="book.cover_image_url" :alt="book.title" class="book-cover shadow-4" />
                        </div>

                        <div class="w-full">
                            <div class="status-badge flex justify-content-center mb-4">
                                <span :class="['py-2 px-3 border-round text-uppercase font-bold', getStatusClass(book.availability_status)]">
                                    {{ book.availability_status.replace('_', ' ') }}
                                </span>
                            </div>

                            <div class="flex justify-content-center gap-2 mb-4">
                                <Button label="Borrow" icon="pi pi-shopping-bag" :disabled="book.availability_status !== 'available' || book.reference_only" :loading="borrowing" @click="borrowBook" />

                                <Button label="Reserve" icon="pi pi-calendar" severity="secondary" :disabled="book.availability_status !== 'checked_out'" :loading="reserving" @click="reserveBook" />
                            </div>

                            <div class="flex justify-content-center mb-4">
                                <Button icon="pi pi-pencil" label="Edit" class="p-button-outlined" @click="editBook" />
                            </div>

                            <div v-if="book.reference_only" class="flex justify-content-center mb-4">
                                <Tag severity="info" value="Reference Only - Not for borrowing" />
                            </div>
                        </div>
                    </div>

                    <div class="col-12 md:col-8">
                        <h6 class="text-xl font-bold mb-2">{{ book.title }}</h6>
                        <p class="text-lg font-medium text-600 mb-4">by {{ book.author }}</p>

                        <div class="grid">
                            <div class="col-12">
                                <h6 class="font-bold mb-2">Description</h6>
                                <p class="line-height-3 mb-4">{{ book.description }}</p>
                            </div>

                            <div class="col-12 md:col-6">
                                <h6 class="font-bold mb-2">Book Details</h6>
                                <ul class="book-details-list">
                                    <li><span>ISBN:</span> {{ book.isbn }}</li>
                                    <li><span>Publication Year:</span> {{ book.publication_year }}</li>
                                    <li><span>Category:</span> {{ book.category.name }}</li>
                                    <li><span>Publisher:</span> {{ book.publisher.name }}</li>
                                    <li><span>Language:</span> {{ book.language }}</li>
                                    <li><span>Edition:</span> {{ book.edition }}</li>
                                    <li><span>Pages:</span> {{ book.pages }}</li>
                                    <li><span>Cover Type:</span> {{ book.cover_type }}</li>
                                </ul>
                            </div>

                            <div class="col-12 md:col-6">
                                <h6 class="font-bold mb-2">Physical Characteristics</h6>
                                <ul class="book-details-list">
                                    <li><span>Dimensions:</span> {{ book.dimensions }}</li>
                                    <li><span>Weight:</span> {{ book.weight_grams }}g</li>
                                    <li><span>Barcode:</span> {{ book.barcode }}</li>
                                </ul>

                                <h6 class="font-bold mb-2 mt-4">Location</h6>
                                <ul class="book-details-list">
                                    <li><span>Branch:</span> {{ book.library_branch.name }}</li>
                                    <li><span>Shelf:</span> {{ book.shelf.name }}</li>
                                    <li><span>Detailed Location:</span> {{ book.shelf_location_detail }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="flex justify-content-center">
                    <div class="text-center">
                        <i class="pi pi-exclamation-triangle text-yellow-500" style="font-size: 3rem"></i>
                        <h5>Book not found</h5>
                        <p>The book you're looking for doesn't exist or has been removed.</p>
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
