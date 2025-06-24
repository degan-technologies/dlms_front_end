<script setup>
import axiosInstance from '@/util/axios-config';
import Echo from 'laravel-echo';
import { computed, onMounted, ref } from 'vue';

const notifications = ref([]);
const unreadCount = ref(0);
const menu = ref(null);
const loading = ref(false);
const error = ref(null);
const selectedNotification = ref(null);
const detailVisible = ref(false);
const notificationsContainer = ref(null);

// Menu items
const items = ref([
    { label: 'Mark all as read', icon: 'pi pi-check', command: markAllAsRead },
    { label: 'Clear all', icon: 'pi pi-trash', command: clearAllNotifications }
]);

// Initialize Laravel Echo
const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'local',
    cluster: 'mt1',
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true
});

// Fetch notifications
async function fetchNotifications() {
    try {
        loading.value = true;
        error.value = null;
        const response = await axiosInstance.get('/librarian/notifications');
        notifications.value = response.data.data.notifications;
        unreadCount.value = response.data.data.meta.unread_count;
    } catch (err) {
        error.value = 'Failed to load notifications';
        console.error('Error fetching notifications:', err);
    } finally {
        loading.value = false;
    }
}

// Mark notification as read
async function markAsRead(id) {
    try {
        await axiosInstance.put(`/librarian/notifications/${id}/mark-as-read`);
        // Update locally without refetching
        const notification = notifications.value.find((n) => n.id === id);
        if (notification) {
            notification.status = 'read';
            unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
    } catch (err) {
        console.error('Error marking notification as read:', err);
    }
}

// Mark all as read
async function markAllAsRead() {
    try {
        await axiosInstance.put('/librarian/notifications/{notification}/mark-all-read');
        // Update locally
        notifications.value.forEach((n) => (n.status = 'read'));
        unreadCount.value = 0;
    } catch (err) {
        console.error('Error marking all as read:', err);
    }
}

async function deleteNotification(id) {
    try {
        await axiosInstance.delete(`/librarian/notifications/${id}`);
        notifications.value = notifications.value.filter((n) => n.id !== id);
        unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (err) {
        console.error('Error deleting notification:', err);
    }
}

// Clear all notifications
async function clearAllNotifications() {
    try {
        await axiosInstance.delete('/librarian/notifications/{notification}/clear-all');
        notifications.value = [];
        unreadCount.value = 0;
    } catch (err) {
        console.error('Error clearing notifications:', err);
    }
}

// Group notifications by date
const groupedNotifications = computed(() => {
    const groups = {};

    notifications.value.forEach((notification) => {
        const dateKey = formatDate(notification.created_at);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(notification);
    });

    return groups;
});

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / 86400000); // 1000*60*60*24

    if (diffInDays === 0) return 'TODAY';
    if (diffInDays === 1) return 'YESTERDAY';
    if (diffInDays < 7) return `${diffInDays} DAYS AGO`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} WEEKS AGO`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format date with time
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

// Open notification detail
function openDetail(notification) {
    selectedNotification.value = notification;
    detailVisible.value = true;
    if (notification.status === 'unread') {
        markAsRead(notification.id);
    }
}

// Listen for new notifications
function listenForNewNotifications() {
    echo.private(`App.Models.User.${window.userId}`).notification((notification) => {
        notifications.value.unshift(notification);
        unreadCount.value += 1;
    });
}

onMounted(() => {
    fetchNotifications();
    listenForNewNotifications();
});
</script>

<template>
    <div class="p-4 border border-gray-200 rounded-lg sm:rounded-xl sm:p-6">
        <!-- Scroll Buttons
        <div class="absolute right-4 top-16 sm:top-20 flex flex-col gap-2 z-10">
            <Button icon="pi pi-arrow-up" class="p-button-rounded p-button-text !w-8 !h-8" @click="scrollToTop" v-tooltip="'Scroll to top'" />
            <Button icon="pi pi-arrow-down" class="p-button-rounded p-button-text !w-8 !h-8" @click="scrollToBottom" v-tooltip="'Scroll to bottom'" />
        </div> -->

        <!-- Header -->
        <div class="flex items-center justify-between mb-4 sm:mb-6">
            <div class="font-semibold text-lg sm:text-xl flex items-center">
                Notifications
                <span v-if="unreadCount > 0" class="ml-2 bg-primary text-white text-xs sm:text-sm rounded-full px-2 py-0.5 sm:py-1">
                    {{ unreadCount }}
                </span>
            </div>
            <div v-if="notifications.length > 0">
                <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded !w-8 !h-8 sm:!w-10 sm:!h-10" @click="menu.toggle($event)" :disabled="notifications.length === 0" />
                <Menu ref="menu" popup :model="items" class="!min-w-[160px] sm:!min-w-40"></Menu>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-6 sm:py-8">
            <ProgressSpinner style="width: 40px; height: 40px" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-6 sm:py-8 text-red-500 text-sm sm:text-base">
            {{ error }}
            <Button label="Retry" icon="pi pi-refresh" @click="fetchNotifications" class="mt-2 text-xs sm:text-sm p-button-sm" />
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="text-center py-6 sm:py-8 text-surface-500 text-sm sm:text-base">No notifications available</div>

        <!-- Notifications List -->
        <div v-else ref="notificationsContainer" class="">
            <div v-for="(group, date) in groupedNotifications" :key="date">
                <span class="block text-muted-color font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                    {{ date }}
                </span>
                <ul class="p-0 mx-0 mt-0 mb-4 sm:mb-6 list-none space-y-2 sm:space-y-2">
                    <li
                        v-for="notification in group"
                        :key="notification.id"
                        class="flex items-start sm:items-center p-2 sm:py-2 border-b border-surface hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer rounded-lg"
                        :class="{ 'bg-blue-50 dark:bg-surface-800': notification.status === 'unread' }"
                        @click="openDetail(notification)"
                    >
                        <!-- Notification Icon -->
                        <div class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-3 sm:mr-4 shrink-0">
                            <i class="pi pi-exclamation-triangle text-lg sm:text-xl text-orange-500"></i>
                        </div>

                        <!-- Notification Content -->
                        <div class="flex-1 min-w-0">
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-sm sm:text-base truncate">
                                {{ notification.title }}
                            </div>
                            <div class="text-surface-700 dark:text-surface-300 text-xs sm:text-sm line-clamp-2">
                                {{ notification.message }}
                            </div>
                            <div class="flex items-center mt-1 text-xs text-surface-500 flex-wrap gap-x-2">
                                <span>{{ notification.time_ago }}</span>
                                <span class="hidden sm:inline">•</span>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center ml-2 shrink-0">
                            <Button v-if="notification.status === 'unread'" icon="pi pi-check" class="p-button-text p-button-sm !w-8 !h-8 sm:!w-10 sm:!h-10" @click.stop="markAsRead(notification.id)" v-tooltip="'Mark as read'" />
                            <Button icon="pi pi-trash" class="p-button-text p-button-sm !w-8 !h-8 sm:!w-10 sm:!h-10 ml-2" @click.stop="deleteNotification(notification.id)" v-tooltip="'Delete notification'" />
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Notification Detail Dialog -->
        <Dialog v-model:visible="detailVisible" :header="selectedNotification?.title" :style="{ width: 'min(95vw, 600px)' }" :breakpoints="{ '640px': '95vw', '1024px': '75vw' }" :modal="true" class="notification-detail-dialog">
            <div v-if="selectedNotification" class="space-y-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full shrink-0">
                        <i class="pi pi-exclamation-triangle text-2xl text-orange-500"></i>
                    </div>
                    <div>
                        <div class="text-sm text-surface-500">
                            {{ formatDateTime(selectedNotification.created_at) }}
                        </div>
                        <div class="font-medium">
                            {{ selectedNotification.status === 'unread' ? 'Unread' : 'Read' }}
                        </div>
                    </div>
                </div>

                <div class="bg-surface-100 dark:bg-surface-700 p-4 rounded-lg whitespace-pre-wrap">
                    {{ selectedNotification.message }}
                </div>

                <div v-if="selectedNotification.book" class="bg-surface-50 dark:bg-surface-800 p-4 rounded-lg">
                    <h4 class="font-medium mb-2">Related Book</h4>
                    <div class="flex items-center gap-3">
                        <img :src="selectedNotification.book.cover_url || '/default-book-cover.jpg'" class="w-16 h-20 object-cover rounded" alt="Book cover" />
                        <div>
                            <div class="font-medium">{{ selectedNotification.book.title }}</div>
                            <div class="text-sm text-surface-500">{{ selectedNotification.book.author }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between">
                    <Button label="Mark as Read" icon="pi pi-check" class="p-button-text" v-if="selectedNotification?.status === 'unread'" @click="markAsRead(selectedNotification.id)" />
                    <div class="flex gap-2">
                        <Button label="Close" icon="pi pi-times" class="p-button-text" @click="detailVisible = false" />
                    </div>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.notification-detail-dialog .p-dialog-content {
    padding: 1rem;
}

@media (max-width: 640px) {
    .notification-detail-dialog .p-dialog-content {
        padding: 0.75rem;
    }
}

/* Scroll container styling
.max-h-[calc(100vh-200px)] {
    scrollbar-width: thin;
    scrollbar-color: var(--surface-300) var(--surface-0);
}


.card {
    max-width: 100%;
    width: 100%;
}

/* Better text truncation */
.truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Improved hover states */
@media (hover: hover) {
    li:hover {
        background-color: var(--surface-50);
        transition: background-color 0.2s ease;
    }
}

/* Dark mode adjustments */
.dark {
    li:hover {
        background-color: var(--surface-700);
    }
}

/* Better spacing for mobile */
@media (max-width: 639px) {
    .p-button {
        min-width: 32px;
        min-height: 32px;
    }
}
</style>
