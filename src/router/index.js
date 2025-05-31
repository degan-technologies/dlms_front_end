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
                {
                    path: '/userprofile',
                    name: 'userprofile',
                    component: () => import('@/views/pages/UserProfile.vue'),
                    meta: { requiresAuth: true }
                },

                // User Management Routes

                {
                    path: '/students/manage',
                    name: 'students-manage',
                    component: () => import('@/views/pages/usermanagment/student/StudentManage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/staff/manage',
                    name: 'staff-manage',
                    component: () => import('@/views/pages/usermanagment/staff/StaffManage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/admin/manage',
                    name: 'admin-manage',
                    component: () => import('@/views/pages/usermanagment/admin/AdminManage.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/auth/register',
                    name: 'register',
                    component: () => import('@/views/pages/usermanagment/student/Register.vue')
                },
                {
                    path: '/auth/staffregister',
                    name: 'staffregister',
                    component: () => import('@/views/pages/usermanagment/staff/StaffRegister.vue')
                },
                // Book Management Routes
                {
                    path: '/loans/fine/history',
                    name: 'FineHistory',
                    component: () => import('@/views/pages/loan/fine.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/books/constants/langandsub',
                    name: 'language-and-subject',
                    component: () => import('@/views/pages/constants/languages.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },

                {
                    path: '/constants/categories',
                    name: 'categories-create',
                    component: () => import('@/views/pages/constants/categories.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },

                // {
                //     path: '/books/physical/create',
                //     name: 'physical-book-create',
                //     component: () => import('@/views/pages/loan/languages.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },
                {
                    path: '/library/manage',
                    name: 'libray-manage',
                    component: () => import('@/views/pages/library/ManageLibrary.vue'),
                    meta: { requiresAuth: true, isAdminOrSuperAdmin: true }
                },
                {
                    path: '/library/branches',
                    name: 'manage-branches',
                    component: () => import('@/views/pages/library/LibraryBranch.vue'),
                    meta: { requiresAuth: true, isSuperAdmin: true }
                },

                // E-Book Management Routes
                // {
                //     path: '/books/ebooks',
                //     name: 'ebooks-list',
                //     component: () => import('@/views/pages/book/EBooksList.vue'),
                //     meta: { requiresAuth: true }
                // },
                // {
                //     path: '/books/ebooks/create',
                //     name: 'ebook-create',
                //     component: () => import('@/views/pages/book/EBookCreate.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },
                // {
                //     path: '/books/ebooks/edit/:id',
                //     name: 'ebook-edit',
                //     component: () => import('@/views/pages/book/EBookEdit.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },

                // {
                //     path: '/books/ebooks/:id',
                //     name: 'ebook-details',
                //     component: () => import('@/views/pages/book/EBookDetails.vue'),
                //     meta: { requiresAuth: true }
                // },
                // {
                //     path: '/books/ebooks/read/:id',
                //     name: 'ebook-reader',
                //     component: () => import('@/views/pages/book/EBookReader.vue'),
                //     meta: { requiresAuth: true }
                // },
                // Reader routes for different content types

                // Routes for bookmarks, notes, and collections

                // Other Assets Management Routes
                {
                    path: '/books/assets',
                    name: 'assets-list',
                    component: () => import('@/views/pages/book/AssetsList.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },
                // {
                //     path: '/books/assets/create',
                //     name: 'asset-create',
                //     component: () => import('@/views/pages/book/AssetCreate.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },
                // {
                //     path: '/books/assets/edit/:id',
                //     name: 'asset-edit',
                //     component: () => import('@/views/pages/book/AssetEdit.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },
                // {
                //     path: '/books/assets/:id',
                //     name: 'asset-details',
                //     component: () => import('@/views/pages/book/AssetDetails.vue'),
                //     meta: { requiresAuth: true }
                // },

                // Category and Publisher Routes
                // {
                //     path: '/books/categories',
                //     name: 'categories-list',
                //     component: () => import('@/views/pages/book/CategoriesList.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },
                // {
                //     path: '/books/publishers',
                //     name: 'publishers-list',
                //     component: () => import('@/views/pages/book/PublishersList.vue'),
                //     meta: { requiresAuth: true, isLibrarian: true }
                // },

                // User borrowing and history routes
                {
                    path: '/books/reserved/history',
                    name: 'borrowed-books',
                    component: () => import('@/views/pages/loan/reservations.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/loans/loan/history',
                    name: 'loan-history',
                    component: () => import('@/views/pages/loan/loanHistory.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/librarianReply',
                    name: 'LibrarianReply',
                    component: () => import('@/views/pages/library/LibrarianReply.vue'),
                    meta: { requiresAuth: true }
                }
            ]
        },
        {
            path: '/teacher',
            name: 'teacher',

            children: [
                {
                    path: '/teacher/dashboard',
                    name: 'teacher-dashboard',
                    component: () => import('@/views/pages/teacher/TeacherDashboard.vue'),
                    meta: {
                        requiresAuth: true,
                        isTeacher: true
                    }
                },
                {
                    path: '/ebooks/:id',
                    name: 'teacher-resource-details',
                    component: () => import('@/views/pages/teacher/TeacherEbookDetails.vue'),
                    meta: {
                        requiresAuth: true,
                        isTeacher: true
                    }
                }
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
            path: '/reading-list-details/:id',
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
            path: '/notifications',
            name: 'notifications',
            component: () => import('@/views/pages/user/Notifications.vue'),
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
        {
            path: '/my-collection',
            name: 'my-collection',
            component: () => import('@/views/pages/user/MyCollection.vue'),
            meta: { requiresAuth: true }
        },
        // {
        //     path: '/reader/:id',
        //     name: 'universal-reader',
        //     component: () => import('@/views/pages/reader/Reader.vue'),
        //     meta: { requiresAuth: true }
        // },
        {
            path: '/my-profile',
            name: 'my-profile',
            component: () => import('@/views/pages/usermanagment/StudentProfile.vue'),
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
            path: '/auth/forgot-password',
            name: 'forgot-password',
            component: () => import('@/views/pages/auth/ForgotPassword.vue')
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: () => import('@/views/pages/ResetPassword.vue'),
            props: (route) => ({ email: route.query.email })
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
        },
        {
            path: '/student/ask-librarian',
            name: 'AskLibrarian',
            component: () => import('@/components/home/AskLibrarian.vue')
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

// Function to determine redirect path based on user role
const getRedirectPathForRole = (userRoles) => {
    const roleIds = userRoles.map((role) => role.id);

    // Priority order: Super Admin -> Admin -> Librarian -> Teacher -> Student
    if (roleIds.includes(ROLE.SUPER_ADMIN) || roleIds.includes(ROLE.ADMIN) || roleIds.includes(ROLE.LIBRARIAN)) {
        return '/dashboard';
    } else if (roleIds.includes(ROLE.TEACHER)) {
        return '/teacher/dashboard';
    } else if (roleIds.includes(ROLE.STUDENT)) {
        return '/dashboard'; // or '/student/dashboard' if you have a specific student dashboard
    }

    // Default fallback
    return '/dashboard';
};

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const accessToken = Cookies.get('access_token'); // Skip authentication checks for public routes
    if (to.path === '/' || to.path.startsWith('/auth/') || to.path === '/pdf') {
        if (to.path !== '/auth/access-denied' && accessToken && authStore.getAuth.isAuthenticated) {
            // If user is already authenticated and tries to access login page, redirect based on role
            if (to.path === '/auth/login') {
                const userRoles = authStore.getAuth.user?.user?.roles || [];
                const redirectPath = getRedirectPathForRole(userRoles);
                return next(redirectPath);
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

    // If route requires authentication but user is not authenticated
    if (to.meta.requiresAuth && !isAuthenticated) {
        Cookies.remove('access_token');
        return next({
            path: '/auth/login',
            query: { redirect: to.fullPath }
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
                redirect: '/auth/access-denied'
            },
            {
                metaKey: 'isAdminOrSuperAdmin',
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
    } // Redirect authenticated users away from auth pages
    if (to.path.startsWith('/auth/') && isAuthenticated && to.path !== '/auth/access-denied' && to.path !== '/auth/verify-email') {
        const userRoles = user?.user?.roles || [];
        const redirectPath = getRedirectPathForRole(userRoles);
        return next(redirectPath);
    }

    next();
});

export default router;
