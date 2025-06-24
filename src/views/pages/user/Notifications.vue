<script setup>
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/util/axios-config';
import Header from '@/views/pages/home/Header.vue';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

const authStore = useAuthStore();
const userId = computed(() => authStore.getUser?.user?.id ?? window.userId);

// Notifications data
const notifications = ref([]);
const unreadCount = ref(0);
const menu = ref(null);
const loading = ref(false);
const error = ref(null);
const showDetail = ref(false);
const selectedNotification = ref(null);

// Announcements data
const announcements = ref([]);
const announcementsLoading = ref(false);
const announcementsError = ref(null);

// Tab control
const activeTab = ref('notifications');
const toast = useToast();

// Menu items
const items = ref([
    { label: 'Mark all as read', icon: 'pi pi-check', command: markAllAsRead },
    { label: 'Clear all', icon: 'pi pi-trash', command: clearAllNotifications }
]);

// Fetch both notifications and announcements
async function fetchAllData() {
    await Promise.all([fetchNotifications(), fetchAnnouncements()]);
}

// Fetch notifications
async function fetchNotifications() {
    try {
        loading.value = true;
        error.value = null;
        const response = await axiosInstance.get('/student/notifications');
        notifications.value = response.data.data.notifications;
        unreadCount.value = response.data.data.meta.unread_count;
    } catch (err) {
        error.value = 'Failed to load notifications';
        console.error('Error fetching notifications:', err);
    } finally {
        loading.value = false;
    }
}

// Fetch announcements
async function fetchAnnouncements() {
    try {
        announcementsLoading.value = true;
        announcementsError.value = null;
        const response = await axiosInstance.get('/student/announcements');
        announcements.value = response.data.data;
    } catch (err) {
        announcementsError.value = 'Failed to load announcements';
        console.error('Error fetching announcements:', err);
    } finally {
        announcementsLoading.value = false;
    }
}

// Mark notification as read
async function markAsRead(id) {
    try {
        await axiosInstance.put(`/student/notifications/${id}/mark-as-read`);
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
    if (unreadCount.value === 0) return;
    try {
        await axiosInstance.put('/student/notifications/mark-all-read');
        notifications.value.forEach((n) => (n.status = 'read'));
        unreadCount.value = 0;
    } catch (err) {
        console.error('Error marking all as read:', err);
    }
}

// Clear all notifications
async function clearAllNotifications() {
    if (notifications.value.length === 0) return;
    try {
        await axiosInstance.delete('/student/notifications/clear-all');
        notifications.value = [];
        unreadCount.value = 0;
    } catch (err) {
        console.error('Error clearing notifications:', err);
    }
}

// Delete a single notification
async function deleteNotification(id) {
    try {
        await axiosInstance.delete(`/student/notifications/${id}`);
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
    const diffInDays = Math.floor((now - date) / 86400000);

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

        window.Echo.channel('announcements').listen('AnnouncementCreated', () => {
            fetchAnnouncements();
            toast.add({
                severity: 'info',
                summary: 'New Announcement',
                detail: 'A new announcement has been posted',
                life: 5000
            });
        });
    }
}

function openNotificationDetail(notification) {
    selectedNotification.value = notification;
    showDetail.value = true;
    if (notification.status === 'unread') {
        markAsRead(notification.id);
    }
}

function closeNotificationDetail() {
    showDetail.value = false;
    selectedNotification.value = null;
}

onMounted(() => {
    fetchAllData();
    listenForNewNotifications();
});
</script>

<template>
    <div class="layout-content">
        <Header class="mb-6" />
        <div class="mt-6 max-w-7xl mx-auto bg-white dark:bg-surface-900 p-4 sm:p-6 lg:p-8 rounded-lg">
            <template v-if="showDetail && selectedNotification">
                <div class="rounded-xl p-6 mt-10 border border-blue-200 shadow-sm">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-5 mt-10">
                        <div class="flex items-center gap-4">
                            <i class="pi pi-bell text-3xl text-blue-600"></i>
                            <div>
                                <h2 class="text-2xl font-bold text-blue-900">{{ selectedNotification.title }}</h2>
                                <p class="text-xs text-gray-500">{{ new Date(selectedNotification.created_at).toLocaleString() }}</p>
                            </div>
                        </div>
                        <Button icon="pi pi-times" class="p-button-rounded p-button-text text-gray-500 hover:text-red-500" @click="closeNotificationDetail" v-tooltip.left="'Back to Notifications'" />
                    </div>

                    <!-- Main Message -->
                    <p class="text-gray-800 text-lg leading-relaxed mb-4">
                        {{ selectedNotification.message }}
                    </p>

                    <!-- Book Info Section -->
                    <div v-if="selectedNotification.book" class="rounded-lg p-4 border border-blue-100 mb-4">
                        <h3 class="font-semibold text-blue-700 text-base mb-2 flex items-center gap-2"><i class="pi pi-book text-blue-600"></i> Book Info</h3>

                        <p class="text-gray-800 text-base mb-1">
                            <span class="font-medium">Title:</span>
                            {{ selectedNotification.book.title || 'N/A' }}
                        </p>

                        <p v-if="selectedNotification.book.due_date" class="text-gray-800 text-base mb-1 flex items-center gap-1">
                            <i class="pi pi-calendar text-blue-600"></i>
                            <span class="font-medium">Due Date:</span> {{ selectedNotification.book.due_date }}
                        </p>

                        <p v-if="selectedNotification.book.days_overdue !== null && selectedNotification.book.days_overdue !== undefined" class="text-gray-800 text-base flex items-center gap-1">
                            <i class="pi pi-clock text-blue-600"></i>
                            <span v-if="selectedNotification.book.days_overdue < 0">
                                Remaining Days:
                                <span class="font-medium">{{ Math.abs(selectedNotification.book.days_overdue) }}</span>
                            </span>
                            <span v-else>
                                Days Overdue:
                                <span class="font-medium text-red-600">{{ selectedNotification.book.days_overdue }}</span>
                            </span>
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap gap-2 mt-6">
                        <Button
                            v-if="selectedNotification.actions && selectedNotification.actions.view_loan"
                            icon="pi pi-external-link"
                            label="View Loan"
                            class="p-button-text p-button-sm p-button-info"
                            @click="$router.push(selectedNotification.actions.view_loan)"
                        />
                        <Button icon="pi pi-trash" label="Delete Notification" class="p-button-text p-button-danger p-button-sm" @click="deleteNotification(selectedNotification.id)" />
                    </div>
                </div>
            </template>

            <template v-else>
                <!-- Header -->
                <div class="text-base sm:text-lg md:text-xl font-semibold mb-4 flex flex-wrap items-center gap-2 px-2">
                    <span>Notifications & Announcements</span>
                    <span v-if="unreadCount > 0" class="bg-primary text-white text-xs sm:text-sm rounded-full px-2 py-0.5 sm:py-1"> {{ unreadCount }} unread </span>
                </div>

                <!-- Tab Navigation -->
                <div class="flex flex-wrap border-b border-gray-200 mb-6 px-2 gap-2">
                    <button
                        @click="activeTab = 'notifications'"
                        :class="{
                            'border-b-2 border-primary text-primary': activeTab === 'notifications',
                            'text-gray-500 hover:text-gray-700': activeTab !== 'notifications'
                        }"
                        class="px-3 py-2 font-medium text-sm flex items-center gap-2 transition-colors"
                    >
                        <i class="pi pi-bell"></i>
                        <span class="hidden sm:inline">Notifications</span>
                        <span v-if="unreadCount > 0" class="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                            {{ unreadCount }}
                        </span>
                    </button>

                    <button
                        @click="activeTab = 'announcements'"
                        :class="{
                            'border-b-2 border-blue-500 text-blue-500': activeTab === 'announcements',
                            'text-gray-500 hover:text-gray-700': activeTab !== 'announcements'
                        }"
                        class="px-3 py-2 font-medium text-sm flex items-center gap-2 transition-colors"
                    >
                        <i class="pi pi-megaphone"></i>
                        <span class="hidden sm:inline">Announcements</span>
                    </button>
                </div>

                <!-- Notifications -->
                <div v-if="activeTab === 'notifications'" class="px-2">
                    <div class="flex flex-wrap items-center justify-between mb-4 gap-2">
                        <h2 class="text-base sm:text-lg font-semibold">Your Notifications</h2>
                        <div>
                            <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="menu.toggle($event)" :disabled="notifications.length === 0" />
                            <Menu ref="menu" popup :model="items" class="!min-w-40"></Menu>
                        </div>
                    </div>

                    <div v-if="loading" class="text-center py-8">
                        <ProgressSpinner style="width: 50px; height: 50px" />
                    </div>

                    <div v-else-if="error" class="text-center py-8 text-red-500 px-4 sm:px-6">
                        {{ error }}
                        <Button label="Retry" icon="pi pi-refresh" @click="fetchNotifications" class="mt-2" />
                    </div>

                    <div v-else-if="notifications.length === 0" class="text-center py-8 text-surface-500 px-4 sm:px-6">No notifications available</div>

                    <div v-else>
                        <div v-for="(group, date) in groupedNotifications" :key="date" class="px-1 sm:px-0">
                            <span class="block text-muted-color font-medium mb-4">
                                {{ date }}
                            </span>

                            <ul class="p-0 m-0 mb-6 list-none space-y-2">
                                <li
                                    v-for="notification in group"
                                    :key="notification.id"
                                    class="flex flex-col sm:flex-row sm:items-center py-3 px-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors cursor-pointer gap-3"
                                    :class="{ 'font-bold': notification.status === 'unread' }"
                                    @click="openNotificationDetail(notification)"
                                >
                                    <div class="flex-shrink-0">
                                        <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full">
                                            <i class="pi pi-exclamation-triangle text-xl text-orange-500"></i>
                                        </div>
                                    </div>

                                    <div class="flex-1">
                                        <div class="text-surface-900 dark:text-surface-0 font-medium">
                                            {{ notification.title }}
                                        </div>
                                        <div class="text-surface-700 dark:text-surface-300 text-sm">
                                            {{ notification.message }}
                                        </div>
                                        <div class="flex flex-wrap items-center mt-1 text-xs text-surface-500 gap-x-2">
                                            <span>{{ notification.time_ago }}</span>
                                            <template v-if="notification.book && notification.book.days_overdue !== null">
                                                <span>•</span>
                                                <template v-if="notification.book.days_overdue < 0">
                                                    {{ Math.abs(Math.floor(notification.book.days_overdue)) }} Remaining Day<span v-if="Math.abs(Math.floor(notification.book.days_overdue)) !== 1">s</span>
                                                </template>
                                                <template v-else-if="notification.book.days_overdue === 0">Due Today</template>
                                                <template v-else> {{ Math.floor(notification.book.days_overdue) }} Day<span v-if="Math.floor(notification.book.days_overdue) !== 1">s</span> overdue </template>
                                            </template>
                                        </div>
                                    </div>

                                    <div class="flex gap-2 mt-2 sm:mt-0 sm:ml-auto">
                                        <Button v-if="notification.status === 'unread'" icon="pi pi-check" class="p-button-text p-button-sm" @click.stop="markAsRead(notification.id)" v-tooltip.left="'Mark as read'" />
                                        <Button
                                            v-if="notification.actions && notification.actions.view_loan"
                                            icon="pi pi-external-link"
                                            class="p-button-text p-button-sm"
                                            @click.stop="$router.push(notification.actions.view_loan)"
                                            v-tooltip.left="'View loan'"
                                        />
                                        <Button icon="pi pi-trash" class="p-button-text p-button-sm text-red-500" @click.stop="deleteNotification(notification.id)" v-tooltip="'Delete notification'" />
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Announcements -->
                <div v-if="activeTab === 'announcements'" class="px-2">
                    <h2 class="text-base sm:text-lg font-semibold mb-4">Recent Announcements</h2>

                    <div v-if="announcementsLoading" class="text-center py-8">
                        <ProgressSpinner style="width: 50px; height: 50px" />
                    </div>

                    <div v-else-if="announcementsError" class="text-center py-8 text-red-500">
                        {{ announcementsError }}
                        <Button label="Retry" icon="pi pi-refresh" @click="fetchAnnouncements" class="mt-2" />
                    </div>

                    <div v-else-if="announcements.length === 0" class="text-center py-8 text-surface-500">No announcements available</div>

                    <div v-else class="space-y-4">
                        <Card v-for="announcement in announcements" :key="announcement.id" class="border border-gray-200 shadow-none hover:shadow-sm transition-shadow">
                            <template #title>
                                <div class="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <span class="font-medium">{{ announcement.title }}</span>
                                    <Tag :value="announcement.is_published ? 'Published' : 'Draft'" :severity="announcement.is_published ? 'success' : 'warning'" class="text-xs" />
                                </div>
                            </template>

                            <template #subtitle>
                                <span class="text-xs text-gray-500">
                                    {{ formatDate(announcement.created_at) }}
                                </span>
                            </template>

                            <template #content>
                                <p class="whitespace-pre-wrap text-sm sm:text-base">
                                    {{ announcement.content }}
                                </p>
                            </template>
                        </Card>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.card {
    max-width: full;
    margin: 0 auto;
    padding: 1rem;
}

@media (min-width: 768px) {
    .card {
        padding: 1.5rem;
    }
}

/* Tab styling */
.tab-button {
    position: relative;
    padding-bottom: 0.5rem;
    margin-right: 1rem;
    outline: none;
}

.tab-button.active {
    color: #3b82f6;
    border-bottom: 2px solid #3b82f6;
}

/* Card hover effect */
.card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Transition effects */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Notification item styling */
.notification-item {
    transition: background-color 0.2s ease;
}

.notification-item:hover {
    background-color: #f8fafc;
}

/* Dark mode support */
.dark .notification-item:hover {
    background-color: #1e293b;
}
</style>
