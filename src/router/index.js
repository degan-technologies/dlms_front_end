import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/authStore';
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
                    path: '/books',
                    name: 'books-list',
                    component: () => import('@/views/pages/book/BooksList.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/books/physical/create',
                    name: 'physical-book-create',
                    component: () => import('@/views/pages/book/PhysicalBookCreate.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },
                {
                    path: '/library/manage',
                    name: 'libray-manage',
                    component: () => import('@/views/pages/library/ManageLibrary.vue'),
                    meta: { requiresAuth: true, isAdminOrSuperAdmin: true }
                },
                {
                    path: '/books/physical/edit/:id',
                    name: 'physical-book-edit',
                    component: () => import('@/views/pages/book/PhysicalBookEdit.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },
                {
                    path: '/books/physical/:id',
                    name: 'physical-book-details',
                    component: () => import('@/views/pages/book/PhysicalBookDetails.vue'),
                    meta: { requiresAuth: true }
                },

                // E-Book Management Routes
                {
                    path: '/books/ebooks',
                    name: 'ebooks-list',
                    component: () => import('@/views/pages/book/EBooksList.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/books/ebooks/create',
                    name: 'ebook-create',
                    component: () => import('@/views/pages/book/EBookCreate.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },
                {
                    path: '/books/ebooks/edit/:id',
                    name: 'ebook-edit',
                    component: () => import('@/views/pages/book/EBookEdit.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },
                {
                    path: '/books/ebooks/:id',
                    name: 'ebook-details',
                    component: () => import('@/views/pages/book/EBookDetails.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/books/ebooks/read/:id',
                    name: 'ebook-reader',
                    component: () => import('@/views/pages/book/EBookReader.vue'),
                    meta: { requiresAuth: true }
                },

                // Other Assets Management Routes
                {
                    path: '/books/assets',
                    name: 'assets-list',
                    component: () => import('@/views/pages/book/AssetsList.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/books/assets/create',
                    name: 'asset-create',
                    component: () => import('@/views/pages/book/AssetCreate.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },
                {
                    path: '/books/assets/edit/:id',
                    name: 'asset-edit',
                    component: () => import('@/views/pages/book/AssetEdit.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },
                {
                    path: '/books/assets/:id',
                    name: 'asset-details',
                    component: () => import('@/views/pages/book/AssetDetails.vue'),
                    meta: { requiresAuth: true }
                },

                // Category and Publisher Routes
                {
                    path: '/books/categories',
                    name: 'categories-list',
                    component: () => import('@/views/pages/book/CategoriesList.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },
                {
                    path: '/books/publishers',
                    name: 'publishers-list',
                    component: () => import('@/views/pages/book/PublishersList.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },

                // User borrowing and history routes
                {
                    path: '/books/borrowed',
                    name: 'borrowed-books',
                    component: () => import('@/views/pages/book/BorrowedBooks.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/books/history',
                    name: 'borrowing-history',
                    component: () => import('@/views/pages/book/BorrowingHistory.vue'),
                    meta: { requiresAuth: true }
                }
            ]
        },

        // Public Routes

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
        }
    ]
});

let isInitialLoad = true;

// Define role constants outside the router guard for better maintainability
const ROLE = {
    SUPER_ADMIN: 1,
    ADMIN: 2,
    LIBRARIAN: 3,
    STAFF: 4,
    STUDENT: 5
};

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const accessToken = Cookies.get('access_token');

    // Skip authentication checks for home page and auth routes
    if (to.path === '/' || to.path.startsWith('/auth/')) {
        return next();
    }

    // First time the app loads, check authentication status
    if (isInitialLoad && !to.query.token) {
        try {
            // If we have a token but no user info, try to validate it
            if (accessToken && (!authStore.getAuth.isAuthenticated || !authStore.getAuth.user)) {
                const isAuthenticated = await authStore.authCheck();
                if (!isAuthenticated) {
                    Cookies.remove('access_token');
                    isInitialLoad = false;
                    return next('/auth/login');
                }
            } else if (!accessToken) {
                isInitialLoad = false;
                return next('/auth/login');
            }
        } catch (error) {
            console.error('Auth validation failed on initial load:', error);
            Cookies.remove('access_token');
        } finally {
            isInitialLoad = false;
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
            { metaKey: 'isStaff', condition: to.meta.isStaff && !userRoleIds.includes(ROLE.STAFF), redirect: '/auth/access-denied' },
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
