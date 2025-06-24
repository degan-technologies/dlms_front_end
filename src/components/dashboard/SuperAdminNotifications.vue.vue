<script setup>
import axiosInstance from '@/util/axios-config';
import { computed, onMounted, ref } from 'vue';

const notifications = ref([]);
const unreadCount = ref(0);
const menu = ref(null);
const loading = ref(false);
const error = ref(null);
const detailVisible = ref(false);
const selectedNotification = ref(null);

// Menu items
const items = ref([
    { label: 'Mark all as read', icon: 'pi pi-check', command: markAllAsRead },
    { label: 'Clear all', icon: 'pi pi-trash', command: clearAllNotifications }
]);

// Fetch notifications
async function fetchNotifications() {
    try {
        loading.value = true;
        error.value = null;
        const response = await axiosInstance.get('/superadmin/notifications');
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
        await axiosInstance.post(`superadmin/notifications/${id}/read`);
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
        await axiosInstance.post('/superadmin/notifications/{id}mark-all-read');
        // Update locally
        notifications.value.forEach((n) => (n.status = 'read'));
        unreadCount.value = 0;
    } catch (err) {
        console.error('Error marking all as read:', err);
    }
}

async function deleteANotification(id) {
    try {
        await axiosInstance.delete(`/superadmin/notifications/${id}`);
        notifications.value = notifications.value.filter((n) => n.id !== id);
        unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (err) {
        console.error('Error deleting notification:', err);
    }
}

// Clear all notifications
async function clearAllNotifications() {
    try {
        await axiosInstance.delete('/superadmin/notifications/{id}clear-all');
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

// Listen for new notifications

onMounted(() => {
    fetchNotifications();
});
</script>

<template>
    <div class="card border border-gray-200 rounded-xl p-6">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">
                Notifications
                <span v-if="unreadCount > 0" class="ml-2 bg-primary text-white text-sm rounded-full px-2 py-1">
                    {{ unreadCount }}
                </span>
            </div>
            <div>
                <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="menu.toggle($event)" :disabled="notifications.length === 0"></Button>
                <Menu ref="menu" popup :model="items" class="!min-w-40"></Menu>
            </div>
        </div>

        <div v-if="loading" class="text-center py-8">
            <ProgressSpinner style="width: 50px; height: 50px" />
        </div>

        <div v-else-if="error" class="text-center py-8 text-red-500">
            {{ error }}
            <Button label="Retry" icon="pi pi-refresh" @click="fetchNotifications" class="mt-2" />
        </div>

        <div v-else-if="notifications.length === 0" class="text-center py-8 text-surface-500">No notifications available</div>

        <div v-else>
            <div v-for="(group, date) in groupedNotifications" :key="date">
                <span class="block text-muted-color font-medium mb-4">{{ date }}</span>
                <ul class="p-0 mx-0 mt-0 mb-6 list-none">
                    <li
                        v-for="notification in group"
                        :key="notification.id"
                        class="flex items-center py-2 border-b border-surface hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                        :class="{ 'bg-blue-50 dark:bg-surface-800': notification.status === 'unread' }"
                        @click="markAsRead(notification.id)"
                    >
                        <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
                            <i class="pi pi-exclamation-triangle text-xl text-orange-500"></i>
                        </div>
                        <div class="flex-1">
                            <div class="text-surface-900 dark:text-surface-0 font-medium">
                                {{ notification.title }}
                            </div>
                            <div class="text-surface-700 dark:text-surface-300">
                                {{ notification.message }}
                            </div>
                            <div class="flex items-center mt-1 text-xs text-surface-500">
                                <span>{{ notification.time_ago }}</span>
                                <span class="mx-2">•</span>
                            </div>
                        </div>
                        <Button v-if="notification.status === 'unread'" icon="pi pi-check" class="p-button-text p-button-sm" @click.stop="markAsRead(notification.id)" v-tooltip="'Mark as read'" />
                        <Button icon="pi pi-trash" class="p-button-text p-button-sm ml-2" @click.stop="deleteANotification(notification.id)" v-tooltip="'Delete notification'" />
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
