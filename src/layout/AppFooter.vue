<script setup></script>

<template>
    <div class="layout-footer">
        &copy; {{ currentYear }} Digital Library by
        <a href="https://degantechnologies.com" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline"> Degan Technologies </a>
    </div>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>
