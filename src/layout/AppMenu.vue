<script setup>
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';
import { computed, ref, watchEffect } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();
const { getUser } = storeToRefs(authStore);

const user = computed(() => getUser.value);
const userRoles = computed(() => user.value?.user?.roles || []);
const userRoleIds = computed(() => userRoles.value.map((role) => role.id));

const ROLE = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    LIBRARIAN: 3,
    STAFF: 4,
    STUDENT: 5
};

const hasRole = (roleId) => userRoleIds.value.includes(roleId);

const modelRef = ref([]);
const isLoading = ref(true);

watchEffect(() => {
    const u = user.value;

    if (!u || !u.user || !u.user.roles) {
        isLoading.value = true;

        // show fallback basic menu while waiting
        modelRef.value = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
            },
            {
                label: 'Library Catalog',
                items: [
                    { label: 'All Books', icon: 'pi pi-fw pi-list', to: '/books' },
                    { label: 'E-Books', icon: 'pi pi-fw pi-file-pdf', to: '/books/ebooks' },
                    { label: 'Digital Assets', icon: 'pi pi-fw pi-video', to: '/books/assets' },
                    { label: 'Categories', icon: 'pi pi-fw pi-tags', to: '/books/categories' },
                    { label: 'Publishers', icon: 'pi pi-fw pi-building', to: '/books/publishers' }
                ]
            },
            {
                label: 'My Account',
                items: [
                    { label: 'Borrowed Items', icon: 'pi pi-fw pi-shopping-bag', to: '/books/borrowed' },
                    { label: 'Borrowing History', icon: 'pi pi-fw pi-clock', to: '/books/history' },
                    { label: 'Profile Settings', icon: 'pi pi-fw pi-cog', to: '/my-profile' }
                ]
            },
            {
                label: 'Help',
                items: [
                    { label: 'FAQ', icon: 'pi pi-fw pi-question-circle', to: '/help/faq' },
                    { label: 'Contact Support', icon: 'pi pi-fw pi-envelope', to: '/help/contact' }
                ]
            }
        ];
        return;
    }

    // roles are ready — full menu
    isLoading.value = false;
    modelRef.value = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
        },
        hasRole(ROLE.ADMIN) || hasRole(ROLE.SUPER_ADMIN)
            ? {
                  label: 'Library Management',
                  items: [{ label: 'Manage Library', icon: 'pi pi-fw pi-book', to: '/library/manage' }]
              }
            : null,
        hasRole(ROLE.SUPER_ADMIN)
            ? {
                  items: [
                      { label: 'Manage Library Branch', icon: 'pi pi-fw pi-building', to: '/library/branches' },
                      { label: 'Manage Staff', icon: 'pi pi-fw pi-id-card', to: '/staff/manage' }
                  ]
              }
            : null,
        hasRole(ROLE.ADMIN)
            ? {
                  label: 'User Management',
                  icon: 'pi pi-fw pi-users',
                  items: [
                      { label: 'Manage Students', icon: 'pi pi-fw pi-users', to: '/students/manage' },
                      { label: 'Manage Staff', icon: 'pi pi-fw pi-id-card', to: '/staff/manage' },
                      { label: 'Roles Management', icon: 'pi pi-fw pi-user-plus', to: '/admin/roles' },
                      { label: 'Settings', icon: 'pi pi-fw pi-cog', to: '/my-profile' }
                  ]
              }
            : null,
        {
            label: 'Library Catalog',
            items: [
                { label: 'All Books', icon: 'pi pi-fw pi-list', to: '/books' },
                { label: 'E-Books', icon: 'pi pi-fw pi-file-pdf', to: '/books/ebooks' },
                { label: 'Digital Assets', icon: 'pi pi-fw pi-video', to: '/books/assets' },
                { label: 'Categories', icon: 'pi pi-fw pi-tags', to: '/constants/categories' },
                { label: 'Publishers', icon: 'pi pi-fw pi-building', to: '/books/publishers' }
            ]
        },
        {
            label: 'My Account',
            items: [
                { label: 'Reservation History', icon: 'pi pi-fw pi-shopping-bag', to: '/books/reserved/history' },
                { label: 'Borrowing History', icon: 'pi pi-fw pi-clock', to: '/books/history' },
                { label: 'Profile Settings', icon: 'pi pi-fw pi-cog', to: '/my-profile' }
            ]
        },
        hasRole(ROLE.LIBRARIAN)
            ? {
                  label: 'Resource Management',
                  items: [
                      { label: 'Languages and Subjects', icon: 'pi pi-fw pi-book', to: '/books/constants/langandsub' },
                      { label: 'LoanHistory', icon: 'pi pi-fw pi-file-pdf', to: '/loans/loan/history' },
                      { label: 'Fine History', icon: 'pi pi-fw pi-plus-circle', to: '/loans/fine/history' }
                  ]
              }
            : null,
        {
            label: 'Help',
            items: [
                { label: 'FAQ', icon: 'pi pi-fw pi-question-circle', to: '/help/faq' },
                { label: 'Librarian Reply', icon: 'pi pi-fw pi-envelope', to: '/librarianReply' }
            ]
        }
    ].filter(Boolean);
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in modelRef" :key="i">
            <app-menu-item v-if="!item.separator" :item="item" :index="i" />
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
