<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
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
            { label: 'Profile Settings', icon: 'pi pi-fw pi-cog', to: '/account/settings' }
        ]
    },
    {
        label: 'Library Management',
        items: [
            { label: 'Add Physical Book', icon: 'pi pi-fw pi-book', to: '/books/physical/create' },
            { label: 'Add E-Book', icon: 'pi pi-fw pi-file-pdf', to: '/books/ebooks/create' },
            { label: 'Add Digital Asset', icon: 'pi pi-fw pi-plus-circle', to: '/books/assets/create' },
            { label: 'Manage Users', icon: 'pi pi-fw pi-users', to: '/admin/users' },
            { label: 'Reports', icon: 'pi pi-fw pi-chart-bar', to: '/admin/reports' }
        ]
    },
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
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
