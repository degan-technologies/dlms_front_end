import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import { defineStore } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

// Helper function to check if token exists
const hasToken = () => !!Cookies.get('access_token');

// Restore token and axios header on store init
const token = Cookies.get('access_token');
if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const useAuthStore = defineStore(
    'auth',
    () => {
        const toast = useToast();
        const router = useRouter();
        const auth = ref({
            isSigning: false,
            isAuthenticated: hasToken(), // Initialize based on token presence
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

                // Store token in cookies
                Cookies.set('access_token', token, {
                    expires: rememberMe ? 30 : 1,
                    secure: window.location.protocol === 'https:',
                    sameSite: 'lax',
                    path: '/'
                });

                // Set the auth state
                auth.value.isAuthenticated = true;
                auth.value.user = user;

                console.log('Login successful for user:', user);
                console.log('User roles:', user.roles);

                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Login successful',
                    life: 3000
                });

                // Route based on user role using helper function
                const redirectPath = determineRedirectPath(user.roles);
                console.log('Redirecting to:', redirectPath);
                router.push(redirectPath);
            } catch (error) {
                console.error('Login error:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message || 'Login failed. Please check your credentials.',
                    life: 3000
                });
            } finally {
                auth.value.isSigning = false;
            }
        } // Auth check function
        async function authCheck() {
            try {
                const token = Cookies.get('access_token');
                if (!token) {
                    auth.value.isAuthenticated = false;
                    auth.value.user = null;
                    return false;
                }

                // Make sure axios has the token in headers
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Fetch current user data
                const response = await axiosInstance.get('user');
                if (response.status === 200) {
                    auth.value.isAuthenticated = true;
                    auth.value.user = response.data;
                    return true;
                } else {
                    // If we get any other status, clear auth
                    throw new Error('Invalid authentication response');
                }
            } catch (error) {
                console.error('Auth check error:', error);
                // Only clear auth if it's an authentication error (401/403)
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    auth.value.isAuthenticated = false;
                    auth.value.user = null;
                    Cookies.remove('access_token', { path: '/' });
                    delete axiosInstance.defaults.headers.common['Authorization'];
                }
                return false;
            }
        } // Logout function
        async function logout() {
            try {
                // First try to call the logout API endpoint
                try {
                    await axiosInstance.post('logout');
                } catch (apiError) {
                    console.warn('Logout API call failed:', apiError);
                    // Continue with local logout even if API call fails
                }

                // Always clear cookies and local state
                Cookies.remove('access_token', { path: '/' });
                delete axiosInstance.defaults.headers.common['Authorization'];
                auth.value.isAuthenticated = false;
                auth.value.user = null;

                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Logout successful',
                    life: 3000
                });

                router.push('/auth/login');
            } catch (error) {
                console.error('Error during logout:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong during logout',
                    life: 3000
                }); // Force logout anyway on error
                Cookies.remove('access_token', { path: '/' });
                delete axiosInstance.defaults.headers.common['Authorization'];
                auth.value.isAuthenticated = false;
                auth.value.user = null;
                router.push('/auth/login');
            }
        } // Helper function to determine redirect path based on user roles
        function determineRedirectPath(userRoles) {
            if (!userRoles || userRoles.length === 0) {
                return '/dashboard'; // Default fallback
            }

            const roleNames = userRoles.map((role) => role.name.toLowerCase());
            const roleIds = userRoles.map((role) => role.id);

            console.log('Determining redirect path for roles:', roleNames, roleIds);

            // Check by role name first (more reliable)
            if (roleNames.includes('student')) {
                return '/';
            } else if (roleNames.includes('teacher')) {
                return '/teacher/dashboard';
            } else if (roleNames.includes('superadmin') || roleNames.includes('admin') || roleNames.includes('librarian')) {
                return '/dashboard';
            }

            // Fallback check by role ID
            if (roleIds.includes(5)) {
                // STUDENT
                return '/';
            } else if (roleIds.includes(4)) {
                // TEACHER
                return '/teacher/dashboard';
            } else if (roleIds.includes(1) || roleIds.includes(2) || roleIds.includes(3)) {
                // SUPERADMIN, ADMIN, LIBRARIAN
                return '/dashboard';
            }

            // Default fallback
            return '/dashboard';
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
        persist: {
            paths: ['auth.isAuthenticated', 'auth.user'],
            storage: localStorage
        }
    }
);
