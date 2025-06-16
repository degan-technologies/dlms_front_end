<script setup>
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppConfigurator from './AppConfigurator.vue';

const router = useRouter();
const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const showProfileMenu = ref(false);
const authStore = useAuthStore();
const { getUser } = storeToRefs(authStore);
const loading = ref(false);

const user = computed(() => {
    return getUser.value;
});

function toggleProfileMenu() {
    showProfileMenu.value = !showProfileMenu.value;
}

const logout = async () => {
    try {
        loading.value = true;
        await authStore.logout();
        // No need to call authCheck after logout since we're redirecting
        loading.value = false;
    } catch (error) {
        console.error('Logout error:', error);
        loading.value = false;
    }
};
</script>

<template>
    <Toast />
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <div class="layout-topbar-logo flex items-center">
                <img src="https://resources.finalsite.net/images/f_auto,q_auto/v1697025002/flipperschoolcom/umv1hfkk03vzp206sn4q/Flipper_Logo1.png" alt="Flipper Logo" style="max-width: 300px; margin-top: 4px" class="hidden sm:inline-block" />
            </div>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{
                            selector: '@next',
                            enterFromClass: 'hidden',
                            enterActiveClass: 'animate-scalein',
                            leaveToClass: 'hidden',
                            leaveActiveClass: 'animate-fadeout',
                            hideOnOutsideClick: true
                        }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{
                    selector: '@next',
                    enterFromClass: 'hidden',
                    enterActiveClass: 'animate-scalein',
                    leaveToClass: 'hidden',
                    leaveActiveClass: 'animate-fadeout',
                    hideOnOutsideClick: true
                }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <Avatar @click="toggleProfileMenu" :label="user?.email?.charAt(0).toUpperCase()" class="mr-2 cursor-pointer" size="large" shape="circle" />
                </div>
            </div>
        </div>

        <Dialog position="topright" v-model:visible="showProfileMenu" header="Profile" :modal="false" :closable="true" :baseZIndex="1000" appendTo="body">
            <div class="p-4 space-y-3">
                <div class="flex items-center justify-center space-x-4">
                    <i class="pi pi-user text-2xl"></i>
                    <h4 class="text-lg font-semibold">{{ user?.username || user?.email }}</h4>
                </div>
                <div class="flex flex-col space-y-2">
                    <Button
                        label="Settings"
                        icon="pi pi-cog"
                        class="p-button-text"
                        @click="
                            () => {
                                showProfileMenu = false;
                                router.push('/userprofile');
                            }
                        "
                    />
                    <Button label="Logout" :loading="loading" icon="pi pi-sign-out" class="p-button-danger" @click="logout" />
                </div>
            </div>
        </Dialog>
    </div>
</template>

<style scoped></style>
