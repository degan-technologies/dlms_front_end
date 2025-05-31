<script setup>
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/util/axios-config';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const authStore = useAuthStore();
const userId = computed(() => authStore.getUser?.user?.id ?? window.userId);

const notifications = ref([]);
const unreadCount = ref(0);
const menu = ref(null);
const loading = ref(false);
const error = ref(null);
const showDetail = ref(false);
const selectedNotification = ref(null);
const toast = useToast();

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
        await axiosInstance.put(`/notifications/${id}/mark-as-read`);
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
    // Only call API if there are unread notifications
    if (unreadCount.value === 0) return;
    try {
        await axiosInstance.put('/notifications/mark-all-read');
        // Update locally
        notifications.value.forEach((n) => (n.status = 'read'));
        unreadCount.value = 0;
    } catch (err) {
        console.error('Error marking all as read:', err);
    }
}

// Clear all notifications
async function clearAllNotifications() {
    // Only call API if there are any notifications
    if (notifications.value.length === 0) return;
    try {
        await axiosInstance.delete('/notifications/clear-all');
        notifications.value = [];
        unreadCount.value = 0;
    } catch (err) {
        console.error('Error clearing notifications:', err);
    }
}

// Delete a single notification
async function deleteNotification(id) {
    try {
        await axiosInstance.delete(`/notifications/${id}`);
        // Remove from local state
        const index = notifications.value.findIndex((n) => n.id === id);
        if (index !== -1) {
            notifications.value.splice(index, 1);
            unreadCount.value = notifications.value.filter((n) => n.status === 'unread').length;
        }
        showDetail.value = false;
        selectedNotification.value = null;
    } catch (err) {
        console.error('Error deleting notification:', err);
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
    if (window.Echo && userId.value) {
        const channelName = `App.Models.User.${userId.value}`;

        const channel = window.Echo.private(channelName);

        channel.notification((notification) => {
            if (notification && notification.message) {
                toast.add({
                    severity: 'info',
                    summary: notification.title || 'New Notification',
                    detail: notification.message,
                    life: 5000
                });
            }
            fetchNotifications();
        });

        // Optional: confirm subscription
        channel.subscribed(() => {
        });

        channel.error((err) => {
            console.error(`[Echo] Subscription error on ${channelName}:`, err);
        });
    } else {
        console.error('window.Echo is not initialized or userId is missing.');
    }
}

function openNotificationDetail(notification) {
    selectedNotification.value = notification;
    showDetail.value = true;
    // Mark as read if unread
    if (notification.status === 'unread') {
        markAsRead(notification.id);
    }
}
function closeNotificationDetail() {
    showDetail.value = false;
    selectedNotification.value = null;
}

onMounted(() => {
    fetchNotifications();
    listenForNewNotifications();
});
</script>

<template>
    <div class="card">
        <div v-if="showDetail && selectedNotification">
            <div class="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-bell text-3xl text-blue-500"></i>
                        <div>
                            <div class="font-bold text-2xl text-blue-900 mb-1">{{ selectedNotification.title }}</div>
                            <div class="text-gray-500 text-xs">{{ new Date(selectedNotification.created_at).toLocaleString() }}</div>
                        </div>
                    </div>
                    <Button icon="pi pi-times" class="p-button-rounded p-button-text text-gray-500 hover:text-red-500" @click="closeNotificationDetail" v-tooltip.left="'Back to Notifications'" />
                </div>
                <div class="text-gray-800 text-lg mb-4">{{ selectedNotification.message }}</div>
                <div v-if="selectedNotification.book" class="mb-4 bg-white rounded p-4 border border-blue-100">
                    <div class="font-semibold text-base text-blue-700 mb-1">Book Info</div>
                    <div class="text-base text-gray-800">
                        Title: <span class="font-medium">{{ selectedNotification.book.title || 'N/A' }}</span>
                    </div>
                    <div class="text-base text-gray-800">
                        Due Date: <span class="font-medium">{{ selectedNotification.book.due_date || 'N/A' }}</span>
                    </div>
                    <div class="text-base text-gray-800">
                        Days Overdue: <span class="font-medium">{{ selectedNotification.book.days_overdue ?? 'N/A' }}</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mt-6">
                    <Button v-if="selectedNotification.actions && selectedNotification.actions.view_loan" icon="pi pi-external-link" label="View Loan" class="p-button-sm p-button-info" @click="$router.push(selectedNotification.actions.view_loan)" />
                    <Button icon="pi pi-trash" label="Delete Notification" class="p-button-danger p-button-sm" @click="deleteNotification(selectedNotification.id)" />
                </div>
            </div>
        </div>
        <div v-else>
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
                            @click="openNotificationDetail(notification)"
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
                                    <span v-if="notification.book && notification.book.days_overdue !== null" class="mx-2">•</span>
                                    <span v-if="notification.book && notification.book.days_overdue !== null">{{ Math.floor(notification.book.days_overdue) }} days overdue</span>
                                </div>
                            </div>
                            <Button v-if="notification.status === 'unread'" icon="pi pi-check" class="p-button-text p-button-sm" @click.stop="markAsRead(notification.id)" v-tooltip.left="'Mark as read'" />
                            <Button
                                v-if="notification.actions && notification.actions.view_loan"
                                icon="pi pi-external-link"
                                class="p-button-text p-button-sm ml-2"
                                @click.stop="$router.push(notification.actions.view_loan)"
                                v-tooltip.left="'View loan'"
                            />
                            <Button icon="pi pi-trash" class="p-button-text p-button-sm ml-2 text-red-500" @click.stop="deleteNotification(notification.id)" v-tooltip="'Delete notification'" />
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
