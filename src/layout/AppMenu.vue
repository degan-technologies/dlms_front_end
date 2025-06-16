<script setup>
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';
import { computed, ref, watchEffect } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();
const { getUser } = storeToRefs(authStore);

const user = computed(() => getUser.value);
const userRoles = computed(() => user.value?.roles || []);
const userRoleIds = computed(() => userRoles.value.map((role) => role.id));

const ROLE = {
    SUPERADMIN: 1,
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

    if (!u || !u.roles) {
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
                    { label: 'Digital Assets', icon: 'pi pi-fw pi-video', to: '/books/assets' },
                    { label: 'Categories', icon: 'pi pi-fw pi-tags', to: '/books/categories' }
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
        hasRole(ROLE.ADMIN) || hasRole(ROLE.SUPERADMIN)
            ? {
                  label: 'Library Management',
                  icon: 'pi pi-fw pi-book',
                  items: [{ label: 'Manage Library', icon: 'pi pi-fw pi-book', to: '/library/manage' }]
              }
            : null,
        hasRole(ROLE.SUPERADMIN)
            ? {
                  label: 'Superadmin Tools',
                  icon: 'pi pi-fw pi-cog',
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
                      { label: 'Manage Students', icon: 'pi pi-fw pi-user', to: '/students/manage' },
                      { label: 'Manage Staff', icon: 'pi pi-fw pi-id-card', to: '/staff/manage' },
                      { label: 'Roles Management', icon: 'pi pi-fw pi-user-plus', to: '/admin/roles' }
                  ]
              }
            : null,
        {
            label: 'Library Catalog',
            items: [
                { label: 'Digital Assets', icon: 'pi pi-fw pi-database', to: '/books/assets' },
                { label: 'Categories', icon: 'pi pi-fw pi-th-large', to: '/constants/categories' }
            ]
        },
        {
            label: 'My Account',
            items: [{ label: 'Reservation History', icon: 'pi pi-fw pi-calendar-plus', to: '/books/reserved/history' }]
        },
        hasRole(ROLE.LIBRARIAN)
            ? {
                  label: 'Resource Management',
                  items: [
                      { label: 'Languages and Subjects', icon: 'pi pi-fw pi-globe', to: '/books/constants/langandsub' },
                      { label: 'LoanHistory', icon: 'pi pi-fw pi-briefcase', to: '/loans/loan/history' },
                      { label: 'Fine History', icon: 'pi pi-fw pi-money-bill', to: '/loans/fine/history' }
                  ]
              }
            : null,
        {
            label: 'Help',
            items: [{ label: 'Librarian Reply', icon: 'pi pi-fw pi-reply', to: '/librarianReply' }]
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
