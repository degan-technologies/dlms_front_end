import { defineStore } from 'pinia';

export const useBookStore = defineStore('book', () => {
    const requestBook = async (resource) => {
        if (authLoading.value) {
            toast.add({
                severity: 'info',
                summary: 'Please wait',
                detail: 'Checking authentication status...',
                life: 2000
            });
            return;
        }
        if (!userId.value) {
            toast.add({
                severity: 'error',
                summary: 'Not Authenticated',
                detail: 'You must be logged in to reserve a book.',
                life: 3000
            });
            return;
        }

        if (resource && resource.available_books_count > 0) {
            // Generate a random reservation code (8 uppercase letters/numbers)
            const reservationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

            // --- NEW: Select a random book_id from available_books array ---
            // Assume resource.available_books is an array of book IDs (add this to your resource processing if not present)
            let randomBookId = null;
            if (Array.isArray(resource.available_books) && resource.available_books.length > 0) {
                const idx = Math.floor(Math.random() * resource.available_books.length);
                randomBookId = resource.available_books[idx];
            }

            try {
                await axiosInstance.post('/reservations', {
                    reservation_code: reservationCode,
                    user_id: userId.value,
                    book_item_id: resource.originalId || resource.id.split('-')[0], // always send book_item_id
                    book_id: randomBookId, // send the randomly selected book_id
                    library_id: resource.library_id || null,
                    reservation_date: new Date().toISOString().slice(0, 19).replace('T', ' '), // current date/time
                    status: 'pending'
                });

                // --- NEW: Update UI availability after reservation ---
                if (typeof resource.available_books_count === 'number') {
                    resource.available_books_count = Math.max(0, resource.available_books_count - 1);
                    resource.availability_status = resource.available_books_count > 0 ? 'available' : 'borrowed';
                }
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
});
