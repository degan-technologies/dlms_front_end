<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'Library Catalog',
        items: [
            { label: 'Browse Books', icon: 'pi pi-fw pi-book', to: '/catalog/books' },
            { label: 'Categories', icon: 'pi pi-fw pi-tags', to: '/catalog/categories' },
            { label: 'Authors', icon: 'pi pi-fw pi-user-edit', to: '/catalog/authors' },
            { label: 'Publishers', icon: 'pi pi-fw pi-building', to: '/catalog/publishers' }
        ]
    },
    {
        label: 'My Account',
        items: [
            { label: 'Borrowed Items', icon: 'pi pi-fw pi-shopping-bag', to: '/account/borrowed' },
            { label: 'Reservations', icon: 'pi pi-fw pi-calendar', to: '/account/reservations' },
            { label: 'Reading History', icon: 'pi pi-fw pi-clock', to: '/account/history' },
            { label: 'Profile Settings', icon: 'pi pi-fw pi-cog', to: '/account/settings' }
        ]
    },
    {
        label: 'Administration',
        items: [
            { label: 'Manage Books', icon: 'pi pi-fw pi-pencil', to: '/admin/books' },
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
