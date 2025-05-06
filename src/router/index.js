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
                }

                // User Profile Management Routes
                // {
                //     path: '/profile',
                //     name: 'user-profile',
                //     component: () => import('@/views/pages/profile/UserProfile.vue'),
                //     meta: { requiresAuth: true }
                // },
                // {
                //     path: '/profile/change-password',
                //     name: 'change-password',
                //     component: () => import('@/views/pages/profile/ChangePassword.vue'),
                //     meta: { requiresAuth: true }
                // },
                // {
                //     path: '/profile/preferences',
                //     name: 'user-preferences',
                //     component: () => import('@/views/pages/profile/UserPreferences.vue'),
                //     meta: { requiresAuth: true }
                // },

                // // Catalog Management Routes (Admin & Librarian)
                // {
                //     path: '/catalog/books',
                //     name: 'manage-books',
                //     component: () => import('@/views/pages/admin/catalog/ManageBooks.vue'),
                //     meta: { requiresAuth: true, isAdminOrLibrarian: true }
                // },
                // {
                //     path: '/catalog/books/add',
                //     name: 'add-book',
                //     component: () => import('@/views/pages/admin/catalog/AddBook.vue'),
                //     meta: { requiresAuth: true, isAdminOrLibrarian: true }
                // },
                // {
                //     path: '/catalog/books/edit/:id',
                //     name: 'edit-book',
                //     component: () => import('@/views/pages/admin/catalog/EditBook.vue'),
                //     meta: { requiresAuth: true, isAdminOrLibrarian: true }
                // },
                // {
                //     path: '/catalog/categories',
                //     name: 'manage-categories',
                //     component: () => import('@/views/pages/admin/catalog/ManageCategories.vue'),
                //     meta: { requiresAuth: true, isAdminOrLibrarian: true }
                // },
                // {
                //     path: '/catalog/authors',
                //     name: 'manage-authors',
                //     component: () => import('@/views/pages/admin/catalog/ManageAuthors.vue'),
                //     meta: { requiresAuth: true, isAdminOrLibrarian: true }
                // },
                // {
                //     path: '/catalog/publishers',
                //     name: 'manage-publishers',
                //     component: () => import('@/views/pages/admin/catalog/ManagePublishers.vue'),
                //     meta: { requiresAuth: true, isAdminOrLibrarian: true }
                // },

                // // Circulation Management Routes
                // {
                //     path: '/circulation/checkouts',
                //     name: 'manage-checkouts',
                //     component: () => import('@/views/pages/librarian/circulation/ManageCheckouts.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },
                // {
                //     path: '/circulation/returns',
                //     name: 'manage-returns',
                //     component: () => import('@/views/pages/librarian/circulation/ManageReturns.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },
                // {
                //     path: '/circulation/reservations',
                //     name: 'manage-reservations',
                //     component: () => import('@/views/pages/librarian/circulation/ManageReservations.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },
                // {
                //     path: '/circulation/fines',
                //     name: 'manage-fines',
                //     component: () => import('@/views/pages/librarian/circulation/ManageFines.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },

                // // User Management Routes (Admin only)
                // {
                //     path: '/admin/users',
                //     name: 'manage-users',
                //     component: () => import('@/views/pages/admin/users/ManageUsers.vue'),
                //     meta: { requiresAuth: true, isAdmin: true }
                // },
                // {
                //     path: '/admin/users/add',
                //     name: 'add-user',
                //     component: () => import('@/views/pages/admin/users/AddUser.vue'),
                //     meta: { requiresAuth: true, isAdmin: true }
                // },
                // {
                //     path: '/admin/users/edit/:id',
                //     name: 'edit-user',
                //     component: () => import('@/views/pages/admin/users/EditUser.vue'),
                //     meta: { requiresAuth: true, isAdmin: true }
                // },
                // {
                //     path: '/admin/roles',
                //     name: 'manage-roles',
                //     component: () => import('@/views/pages/admin/users/ManageRoles.vue'),
                //     meta: { requiresAuth: true, isAdmin: true }
                // },

                // Reports Routes
                // {
                //     path: '/admin/reports/circulation',
                //     name: 'circulation-reports',
                //     component: () => import('@/views/pages/admin/reports/CirculationReports.vue'),
                //     meta: { requiresAuth: true, isAdminOrLibrarian: true }
                // },
                // {
                //     path: '/admin/reports/acquisitions',
                //     name: 'acquisition-reports',
                //     component: () => import('@/views/pages/admin/reports/AcquisitionReports.vue'),
                //     meta: { requiresAuth: true, isAdminOrLibrarian: true }
                // },
                // {
                //     path: '/admin/reports/user-activity',
                //     name: 'user-activity-reports',
                //     component: () => import('@/views/pages/admin/reports/UserActivityReports.vue'),
                //     meta: { requiresAuth: true, isAdminOrLibrarian: true }
                // },

                // // System Configuration Routes (Admin only)
                // {
                //     path: '/admin/settings/general',
                //     name: 'general-settings',
                //     component: () => import('@/views/pages/admin/settings/GeneralSettings.vue'),
                //     meta: { requiresAuth: true, isAdmin: true }
                // },
                // {
                //     path: '/admin/settings/circulation',
                //     name: 'circulation-settings',
                //     component: () => import('@/views/pages/admin/settings/CirculationSettings.vue'),
                //     meta: { requiresAuth: true, isAdmin: true }
                // },
                // {
                //     path: '/admin/settings/notifications',
                //     name: 'notification-settings',
                //     component: () => import('@/views/pages/admin/settings/NotificationSettings.vue'),
                //     meta: { requiresAuth: true, isAdmin: true }
                // },

                // // Member/Student Routes
                // {
                //     path: '/catalog/browse',
                //     name: 'browse-catalog',
                //     component: () => import('@/views/pages/student/BrowseCatalog.vue'),
                //     meta: { requiresAuth: true }
                // },
                // {
                //     path: '/catalog/book/:id',
                //     name: 'book-details',
                //     component: () => import('@/views/pages/student/BookDetails.vue'),
                //     meta: { requiresAuth: true }
                // },
                // {
                //     path: '/student/borrowed',
                //     name: 'my-borrowed-items',
                //     component: () => import('@/views/pages/student/MyBorrowedItems.vue'),
                //     meta: { requiresAuth: true, isStudent: true }
                // },
                // {
                //     path: '/student/history',
                //     name: 'borrowing-history',
                //     component: () => import('@/views/pages/student/BorrowingHistory.vue'),
                //     meta: { requiresAuth: true, isStudent: true }
                // },
                // {
                //     path: '/student/reservations',
                //     name: 'my-reservations',
                //     component: () => import('@/views/pages/student/MyReservations.vue'),
                //     meta: { requiresAuth: true, isStudent: true }
                // },
                // {
                //     path: '/student/fines',
                //     name: 'my-fines',
                //     component: () => import('@/views/pages/student/MyFines.vue'),
                //     meta: { requiresAuth: true, isStudent: true }
                // },

                // Faculty/Staff Routes
                // {
                //     path: '/staff/resources',
                //     name: 'staff-resources',
                //     component: () => import('@/views/pages/staff/StaffResources.vue'),
                //     meta: { requiresAuth: true, isStaff: true }
                // },
                // {
                //     path: '/staff/reserved-materials',
                //     name: 'reserved-materials',
                //     component: () => import('@/views/pages/staff/ReservedMaterials.vue'),
                //     meta: { requiresAuth: true, isStaff: true }
                // },
                // {
                //     path: '/staff/course-reserves/add',
                //     name: 'add-course-reserves',
                //     component: () => import('@/views/pages/staff/AddCourseReserves.vue'),
                //     meta: { requiresAuth: true, isStaff: true }
                // },

                // // Digital Resources Routes
                // {
                //     path: '/resources/e-books',
                //     name: 'e-books',
                //     component: () => import('@/views/pages/resources/EBooks.vue'),
                //     meta: { requiresAuth: true }
                // },
                // {
                //     path: '/resources/journals',
                //     name: 'journals',
                //     component: () => import('@/views/pages/resources/Journals.vue'),
                //     meta: { requiresAuth: true }
                // },
                // {
                //     path: '/resources/databases',
                //     name: 'databases',
                //     component: () => import('@/views/pages/resources/Databases.vue'),
                //     meta: { requiresAuth: true }
                // },
                // {
                //     path: '/resources/multimedia',
                //     name: 'multimedia',
                //     component: () => import('@/views/pages/resources/Multimedia.vue'),
                //     meta: { requiresAuth: true }
                // },

                // // Help & Support Routes
                // {
                //     path: '/help/faq',
                //     name: 'faq',
                //     component: () => import('@/views/pages/help/FAQ.vue')
                // },
                // {
                //     path: '/help/contact',
                //     name: 'contact-support',
                //     component: () => import('@/views/pages/help/ContactSupport.vue')
                // },
                // {
                //     path: '/help/tutorials',
                //     name: 'tutorials',
                //     component: () => import('@/views/pages/help/Tutorials.vue')
                // }
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
        }
        // {
        //     path: '/auth/access-denied',
        //     name: 'access-denied',
        //     component: () => import('@/views/pages/auth/Access.vue')
        // },
        // {
        //     path: '/:pathMatch(.*)*',
        //     name: 'not-found',
        //     component: () => import('@/views/pages/NotFound.vue')
        // }
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
