import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import { defineStore } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore(
    'auth',
    () => {
        const toast = useToast();
        const router = useRouter();
        const auth = ref({
            isSigning: false,
            isAuthenticated: false,
            user: null
        });

        const getAuth = computed(() => auth.value); // Login function
        async function login(login, password, rememberMe = false) {
            try {
                auth.value.isSigning = true;
                const response = await axiosInstance.post('login', {
                    login,
                    password,
                    remember_me: rememberMe
                });

                const { token, user } = response.data;
                Cookies.set('access_token', token, {
                    expires: rememberMe ? 7 : 1,
                    secure: true,
                    sameSite: 'strict'
                });

                auth.value.isAuthenticated = true;
                auth.value.user = user;
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Login successful',
                    life: 3000
                });

                // Use window.location.href for more reliable page navigation after login
                router.push('/dashboard');
            } catch (error) {
                console.error('Login error:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong',
                    life: 3000
                });
            } finally {
                auth.value.isSigning = false;
            }
        }

        // Auth check function
        async function authCheck() {
            try {
                const token = Cookies.get('access_token');
                if (!token) {
                    auth.value.isAuthenticated = false;
                    auth.value.user = null;
                    return false;
                }

                const response = await axiosInstance.get('user');
                if (response.status === 200) {
                    auth.value.isAuthenticated = true;
                    auth.value.user = response.data;
                    return true;
                }
            } catch (error) {
                console.error('Auth check error:', error);
                auth.value.isAuthenticated = false;
                auth.value.user = null;
                Cookies.remove('access_token');
                return false;
            }
        } // Logout function
        async function logout() {
            try {
                await axiosInstance.post('logout');
                Cookies.remove('access_token');
                auth.value.isAuthenticated = false;
                auth.value.user = null;
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Logout successful',
                    life: 3000
                });
                // Use window.location.href for more reliable page navigation after logout
                router.push('/auth/login');
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong',
                    life: 3000
                });
                console.error('Error during logout:', error);
            }
        }

        const getUser = computed(() => {
            return auth.value.user ? auth.value.user : null;
        });

        return {
            auth,
            getAuth,
            login,
            authCheck,
            logout,
            getUser
        };
    },
    {
        persist: true
    }
);
