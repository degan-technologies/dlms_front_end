import AppLayout from '@/layout/AppLayout.vue';

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

// router.beforeEach(async (to, from, next) => {
//     const authStore = useAuthStore();
//     const { authCheck, auth } = authStore;

//     if (isInitialLoad && to.path !== '/auth/login' && !to.query.token) {
//         try {
//             await authCheck();
//         } catch (error) {
//             console.error('Auth validation failed on initial load:', error);
//         } finally {
//             isInitialLoad = false;
//         }
//     }

//     const { isAuthenticated, user } = auth;

//     if (to.meta.requiresAuth && !isAuthenticated) {
//         Cookies.remove('access_token');
//         return next('/auth/login');
//     }

//     // Role-based access control
//     const userRoleId = user?.roles?.[0]?.id;

//     // Define roles by ID
//     const ADMIN_ROLE = 1;
//     const LIBRARIAN_ROLE = 2;
//     const STAFF_ROLE = 3;
//     const STUDENT_ROLE = 4;

//     const conditions = [
//         { metaKey: 'requiresAuth', condition: !isAuthenticated, redirect: '/auth/login' },
//         { metaKey: 'isAdmin', condition: userRoleId !== ADMIN_ROLE, redirect: '/auth/access-denied' },
//         { metaKey: 'isLibrarian', condition: userRoleId !== LIBRARIAN_ROLE, redirect: '/auth/access-denied' },
//         { metaKey: 'isStaff', condition: userRoleId !== STAFF_ROLE, redirect: '/auth/access-denied' },
//         { metaKey: 'isStudent', condition: userRoleId !== STUDENT_ROLE, redirect: '/auth/access-denied' },
//         {
//             metaKey: 'isAdminOrLibrarian',
//             condition: !(userRoleId === ADMIN_ROLE || userRoleId === LIBRARIAN_ROLE),
//             redirect: '/auth/access-denied'
//         }
//     ];

//     for (const { metaKey, condition, redirect } of conditions) {
//         if (to.meta[metaKey] && condition) {
//             return next(redirect);
//         }
//     }

//     if ((to.path === '/auth/login' || to.path === '/auth/register') && isAuthenticated) {
//         return next('/dashboard');
//     }

//     next();
// });

export default router;
