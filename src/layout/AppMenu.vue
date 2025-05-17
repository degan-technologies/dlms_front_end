<script setup>
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();
const { getUser } = storeToRefs(authStore);

const user = computed(() => {
    return getUser.value;
});

// Compute user roles with proper null checking
const userRoles = computed(() => {
    return user.value?.user?.roles || [];
});

// Extract role IDs
const userRoleIds = computed(() => {
    return userRoles.value.map((role) => role.id);
});

// Helper function to check if user has a specific role
const hasRole = (roleId) => {
    return userRoleIds.value.includes(roleId);
};

// Define role constants for better readability
const ROLE = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    LIBRARIAN: 3,
    STAFF: 4,
    STUDENT: 5
};

// Create a computed menu model to properly react to user role changes
const model = computed(() => [
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard' }]
    },
    // Admin menu - only show for admin or librarian roles

    // Admin and Super Admin menu - shared access
    hasRole(ROLE.ADMIN) || hasRole(ROLE.SUPER_ADMIN)
        ? {
              label: 'Library Management',
              items: [
                  { label: 'Manage Library', icon: 'pi pi-fw pi-book', to: '/library/manage' },
                  { label: 'Manage Library Sections', icon: 'pi pi-fw pi-sitemap', to: '/library/sections' }
              ]
          }
        : null,
    // Super Admin menu - exclusive access
    hasRole(ROLE.SUPER_ADMIN)
        ? {
              items: [
                  { label: 'Manage Library Branch', icon: 'pi pi-fw pi-building', to: '/library/branches' },
                  { label: 'Manage Admins', icon: 'pi pi-fw pi-id-card', to: '/admin/manage' },
              ]
          }
        : null,
    // Admin menu - exclusive access
    hasRole(ROLE.ADMIN)
        ? {
              label: 'User Management',
              icon: 'pi pi-fw pi-users',
              items: [
                  { label: 'Manage Students', icon: 'pi pi-fw pi-users', to: '/students/manage' },
                  { label: 'Manage Staff', icon: 'pi pi-fw pi-id-card', to: '/staff/manage' },
                  { label: 'Roles Management', icon: 'pi pi-fw pi-user-plus', to: '/admin/roles' },
                //   { label: 'Manage Admins', icon: 'pi pi-fw pi-id-card', to: '/admin/manage' },

                  { label: 'Settings', icon: 'pi pi-fw pi-cog', to: '/userprofile' }
              ]
          }
        : null,
    hasRole(ROLE.ADMIN) || hasRole(ROLE.LIBRARIAN)
        ? {
              label: 'Library Catalog',
              items: [
                  { label: 'All Books', icon: 'pi pi-fw pi-list', to: '/books' },
                  { label: 'E-Books', icon: 'pi pi-fw pi-file-pdf', to: '/books/ebooks' },
                  { label: 'Digital Assets', icon: 'pi pi-fw pi-video', to: '/books/assets' },
                  { label: 'Categories', icon: 'pi pi-fw pi-tags', to: '/books/categories' },
                  { label: 'Publishers', icon: 'pi pi-fw pi-building', to: '/books/publishers' }
              ]
          }
        : null,
    {
        label: 'My Account',
        items: [
            { label: 'Borrowed Items', icon: 'pi pi-fw pi-shopping-bag', to: '/books/borrowed' },
            { label: 'Borrowing History', icon: 'pi pi-fw pi-clock', to: '/books/history' },
            { label: 'Profile Settings', icon: 'pi pi-fw pi-cog', to: '/profile' }
        ]
    },
    // Library Management - only for librarians (assuming role ID 2 is librarian)
    hasRole(ROLE.LIBRARIAN)
        ? {
              label: 'Resource Management',
              items: [
                  { label: 'Add Physical Book', icon: 'pi pi-fw pi-book', to: '/books/physical/create' },
                  { label: 'Add E-Book', icon: 'pi pi-fw pi-file-pdf', to: '/books/ebooks/create' },
                  { label: 'Add Digital Asset', icon: 'pi pi-fw pi-plus-circle', to: '/books/assets/create' }
              ]
          }
        : null,
    {
        label: 'Help',
        items: [
            { label: 'FAQ', icon: 'pi pi-fw pi-question-circle', to: '/help/faq' },
            { label: 'Contact Support', icon: 'pi pi-fw pi-envelope', to: '/help/contact' }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model.filter((item) => item !== null)" :key="i">
            <app-menu-item v-if="item && !item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item && item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
