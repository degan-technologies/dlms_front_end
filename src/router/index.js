import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/dashboard',
            component: AppLayout,
            children: [
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { requiresAuth: true }
                },

                // Book Management Routes

                {
                    path: '/library/manage',
                    name: 'libray-manage',
                    component: () => import('@/views/pages/library/ManageLibrary.vue'),
                    meta: { requiresAuth: true, isAdminOrSuperAdmin: true }
                },

                // E-Book Management Routes

                // Reader routes for different content types

                // Routes for bookmarks, notes, and collections

                // {
                //     path: '/history',
                //     name: 'user-history',
                //     component: () => import('@/views/pages/user/History.vue'),
                //     meta: { requiresAuth: true }
                // },

                // Other Assets Management Routes
                {
                    path: '/books/assets',
                    name: 'assets-list',
                    component: () => import('@/views/pages/book/AssetsList.vue'),
                    meta: { requiresAuth: true }
                }

                // Category and Publisher Routes

                // User borrowing and history routes
            ]
        },

        // Public Routes
        // {
        //     path: '/bookmarks',
        //     name: 'bookmarks',
        //     component: () => import('@/views/pages/user/Bookmarks.vue'),
        //     meta: { requiresAuth: true }
        // },
        // {
        //     path: '/my-notes',
        //     name: 'my-notes',
        //     component: () => import('@/views/pages/user/MyNotes.vue'),
        //     meta: { requiresAuth: true }
        // },
        // {
        //     path: '/my-collection',
        //     name: 'my-collection',
        //     component: () => import('@/views/pages/user/MyCollection.vue'),
        //     meta: { requiresAuth: true }
        // },
        // {
        //     path: '/my-collection/:id',
        //     name: 'reading-list-detail',
        //     component: () => import('@/views/pages/user/ReadingListDetail.vue'),
        //     meta: { requiresAuth: true }
        // },
        {
            path: '/reader/:id',
            name: 'universal-reader',
            component: () => import('@/components/reader/Reader.vue'),
            meta: { requiresAuth: true }
        },

        {
            path: '/reading-list/:id',
            name: 'reading-list-details',
            component: () => import('@/views/pages/user/ReadingListDetail.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/my-reading-list',
            name: 'my-reading-lists',
            component: () => import('@/views/pages/user/MyReadingLists.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/my-reading-list-detail/:id',
            name: 'my-reading-list-detail',
            component: () => import('@/views/pages/user/MyReadingListDetail.vue'),
            meta: { requiresAuth: true }
        },

        {
            path: '/bookmarks',
            name: 'bookmarks',
            component: () => import('@/views/pages/user/Bookmarks.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/my-notes',
            name: 'my notes',
            component: () => import('@/views/pages/user/MyNotes.vue'),
            meta: { requiresAuth: true }
        },
        // Authentication Routes
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/pages/home/Home.vue'),
            meta: { public: true }
        },

        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/auth/forgot-password',
            name: 'forgot-password',
            component: () => import('@/views/pages/auth/ForgotPassword.vue')
        },
        {
            path: '/auth/reset-password',
            name: 'reset-password',
            component: () => import('@/views/pages/auth/ResetPassword.vue')
        },
        {
            path: '/auth/verify-email',
            name: 'verify-email',
            component: () => import('@/views/pages/auth/VerifyEmail.vue')
        },
        {
            path: '/auth/access-denied',
            name: 'access-denied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/pdf',
            name: 'pdf',
            component: () => import('@/components/reader/PDFReader.vue')
        },
        {
            path: '/ebook-details/:id',
            name: 'EbookDetails',
            component: () => import('@/views/pages/user/EbookDetails.vue'),
            meta: {
                title: 'Digital Resource Details',
                requiresAuth: true
            }
        }
    ]
});

// Set axios Authorization header from cookie on app initialization
const initializeAuth = () => {
    const token = Cookies.get('access_token');
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};

// Initialize axios headers when this file is imported
initializeAuth();

// Define role constants outside the router guard for better maintainability
const ROLE = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    LIBRARIAN: 3,
    TEACHER: 4,
    STUDENT: 5
};

// Variable to track if we've done the initial auth check
let hasCheckedAuth = false;

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const accessToken = Cookies.get('access_token');

    // Skip authentication checks for public routes
    if (to.path === '/' || to.path.startsWith('/auth/') || to.path === '/pdf') {
        if (to.path !== '/auth/access-denied' && accessToken && authStore.getAuth.isAuthenticated) {
            // If user is already authenticated and tries to access login page, redirect to dashboard
            if (to.path === '/auth/login') {
                return next('/dashboard');
            }
        }
        return next();
    }

    // On initial app load or when refreshing a page, validate the token
    if (!hasCheckedAuth || !authStore.getAuth.user) {
        try {
            // Set the authorization header using the token
            if (accessToken) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                // Check if the token is valid by fetching user data
                const isAuthenticated = await authStore.authCheck();

                if (!isAuthenticated) {
                    Cookies.remove('access_token');
                    delete axiosInstance.defaults.headers.common['Authorization'];
                    return next({ path: '/auth/login', query: { redirect: to.fullPath } });
                }
            } else if (to.meta.requiresAuth) {
                // No token and route requires auth
                return next({ path: '/auth/login', query: { redirect: to.fullPath } });
            }
        } catch (error) {
            console.error('Auth validation failed:', error);
            Cookies.remove('access_token');
            delete axiosInstance.defaults.headers.common['Authorization'];
            return next({ path: '/auth/login', query: { redirect: to.fullPath } });
        } finally {
            hasCheckedAuth = true;
        }
    }

    const { isAuthenticated, user } = authStore.getAuth;

    // Check for public routes that don't require authentication
    const isAuthRoute = to.path.startsWith('/auth/');

    // If route requires authentication but user is not authenticated
    if (to.meta.requiresAuth && !isAuthenticated) {
        Cookies.remove('access_token');
        return next({
            path: '/auth/login',
            query: { redirect: to.fullPath } // Store the attempted URL for later redirection
        });
    }

    // Role-based access control
    if (isAuthenticated && user) {
        const userRoles = user?.user?.roles || [];
        console.log('User Roles:', userRoles);
        const userRoleIds = userRoles.map((role) => role.id);

        // Ensure super-admin has unrestricted access
        if (userRoleIds.includes(ROLE.SUPER_ADMIN)) {
            return next();
        }

        // Define conditions for access
        const conditions = [
            { metaKey: 'isAdmin', condition: to.meta.isAdmin && !userRoleIds.includes(ROLE.ADMIN), redirect: '/auth/access-denied' },
            { metaKey: 'isSuperAdmin', condition: to.meta.isSuperAdmin && !userRoleIds.includes(ROLE.SUPER_ADMIN), redirect: '/auth/access-denied' },
            { metaKey: 'isLibrarian', condition: to.meta.isLibrarian && !userRoleIds.includes(ROLE.LIBRARIAN), redirect: '/auth/access-denied' },
            { metaKey: 'isTeacher', condition: to.meta.isTeacher && !userRoleIds.includes(ROLE.TEACHER), redirect: '/auth/access-denied' },
            { metaKey: 'isStudent', condition: to.meta.isStudent && !userRoleIds.includes(ROLE.STUDENT), redirect: '/auth/access-denied' },
            {
                metaKey: 'isAdminOrLibrarian',
                condition: to.meta.isAdminOrLibrarian && !userRoleIds.some((roleId) => [ROLE.ADMIN, ROLE.LIBRARIAN].includes(roleId)),
                condition: to.meta.isAdminOrSuperAdmin && !userRoleIds.some((roleId) => [ROLE.ADMIN, ROLE.SUPER_ADMIN].includes(roleId)),
                redirect: '/auth/access-denied'
            }
        ];

        // Check each condition
        for (const { condition, redirect } of conditions) {
            if (condition) {
                return next(redirect);
            }
        }
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && isAuthenticated && to.path !== '/auth/access-denied' && to.path !== '/auth/verify-email') {
        return next('/dashboard');
    }

    next();
});

export default router;
