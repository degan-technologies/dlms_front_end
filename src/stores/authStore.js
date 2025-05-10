import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const auth = ref({
        isSigning: false,
        isAuthenticated: false,
        user: {}
    });

    const router = useRouter();

    const getAuth = computed(() => auth.value);

    async function authCheck() {
        try {
            auth.value.isSigning = true;
            const response = await axiosInstance.get('user');
            if (response.status === 200) {
                auth.value.isSigning = false;
                auth.value.isAuthenticated = true;
                auth.value.user = response.data;
            }
        } catch (error) {
            console.error('Error during auth check:', error);
            auth.value.isSigning = false;
            auth.value.isAuthenticated = false;
            auth.value.user = {};
        }
    }

    async function logout() {
        try {
            await axiosInstance.post('logout');
            Cookies.remove('access_token');
            auth.value.isAuthenticated = false;
            auth.value.user = {};
            router.push('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    return {
        auth,
        authCheck,
        logout,
        getAuth
    };
});
