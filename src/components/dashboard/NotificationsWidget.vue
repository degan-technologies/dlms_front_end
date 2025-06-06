<script setup>
import { ref, onMounted, computed } from 'vue';
import Echo from 'laravel-echo';
import axiosInstance from '@/util/axios-config';

const notifications = ref([]);
const unreadCount = ref(0);
const menu = ref(null);
const loading = ref(false);
const error = ref(null);

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
        const response = await axiosInstance.get('/notifications');
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
        await axiosInstance.post(`/notifications/${id}/read`);
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
        await axiosInstance.post('/notifications/mark-all-read');
        // Update locally
        notifications.value.forEach((n) => (n.status = 'read'));
        unreadCount.value = 0;
    } catch (err) {
        console.error('Error marking all as read:', err);
    }
}

// Clear all notifications
async function clearAllNotifications() {
    try {
        await axiosInstance.delete('/notifications/clear');
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
    <div class="card">
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
                                <span>{{ Math.floor(notification.book.days_overdue) }} days overdue</span>
                            </div>
                        </div>
                        <Button v-if="notification.status === 'unread'" icon="pi pi-check" class="p-button-text p-button-sm" @click.stop="markAsRead(notification.id)" v-tooltip="'Mark as read'" />
                        <Button icon="pi pi-external-link" class="p-button-text p-button-sm ml-2" @click.stop="$router.push(notification.actions.view_loan)" v-tooltip="'View loan'" />
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
