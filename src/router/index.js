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
                    meta: { requiresAuth: true, isAdminOrSuperAdminOrLibrarian: true }
                },
                {
                    path: '/userprofile',
                    name: 'userprofile',
                    component: () => import('@/views/pages/UserProfile.vue'),
                    meta: { requiresAuth: true, isAdminOrSuperAdmin: true }
                },

                // User Management Routes

                {
                    path: '/students/manage',
                    name: 'students-manage',
                    component: () => import('@/views/pages/usermanagment/student/StudentManage.vue'),
                    meta: { requiresAuth: true, isAdminOrSuperAdmin: true }
                },
                {
                    path: '/staff/manage',
                    name: 'staff-manage',
                    component: () => import('@/views/pages/usermanagment/staff/StaffManage.vue'),
                    meta: { requiresAuth: true, isAdminOrSuperAdmin: true }
                },
                {
                    path: '/admin/manage',
                    name: 'admin-manage',
                    component: () => import('@/views/pages/usermanagment/admin/AdminManage.vue'),
                    meta: { requiresAuth: true, isSuperAdmin: true }
                },
                {
                    path: '/auth/register',
                    name: 'register',
                    component: () => import('@/views/pages/usermanagment/student/Register.vue'),
                    meta: { requiresAuth: true, isAdminOrSuperAdmin: true }
                },
                {
                    path: '/auth/staffregister',
                    name: 'staffregister',
                    component: () => import('@/views/pages/usermanagment/staff/StaffRegister.vue'),
                    meta: { requiresAuth: true, isAdminOrSuperAdmin: true }
                },
                // Book Management Routes
                {
                    path: '/loans/fine/history',
                    name: 'FineHistory',
                    component: () => import('@/views/pages/loan/fine.vue'),
                    meta: { requiresAuth: true, isAdminOrLibrarian: true }
                },
                {
                    path: '/books/constants/langandsub',
                    name: 'language-and-subject',
                    component: () => import('@/views/pages/constants/languages.vue'),
                    meta: { requiresAuth: true, isAdminOrLibrarian: true }
                },

                {
                    path: '/constants/categories',
                    name: 'categories-create',
                    component: () => import('@/views/pages/constants/categories.vue'),
                    meta: { requiresAuth: true, isAdminOrLibrarian: true }
                },

                {
                    path: '/library/manage',
                    name: 'libray-manage',
                    component: () => import('@/views/pages/library/ManageLibrary.vue'),
                    meta: { requiresAuth: true, isAdmin: true }
                },
                {
                    path: '/library/branches',
                    name: 'manage-branches',
                    component: () => import('@/views/pages/library/LibraryBranch.vue'),
                    meta: { requiresAuth: true, isSuperAdmin: true }
                },

                {
                    path: '/books/assets',
                    name: 'assets-list',
                    component: () => import('@/views/pages/book/AssetsList.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
                },

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
                    meta: { requiresAuth: true, isAdminOrLibrarian: true }
                },
                {
                    path: '/librarianReply',
                    name: 'LibrarianReply',
                    component: () => import('@/views/pages/library/LibrarianReply.vue'),
                    meta: { requiresAuth: true, isLibrarian: true }
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
                    path: '/teacher/ebooks/:id',
                    name: 'teacher-resource-details',
                    component: () => import('@/views/pages/teacher/TeacherEbookDetails.vue'),
                    meta: {
                        requiresAuth: true,
                        isTeacher: true
                    }
                }
            ]
        },

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
            meta: { requiresAuth: true }
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
            component: () => import('@/components/home/AskLibrarian.vue'),
            meta: {
                requiresAuth: true,
                isStudent: true
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
    SUPERADMIN: 1,
    ADMIN: 2,
    LIBRARIAN: 3,
    TEACHER: 4,
    STUDENT: 5
};

// Function to determine redirect path based on user role
const getRedirectPathForRole = (userRoles) => {
    const roleIds = userRoles.map((role) => role.id);
    const roleNames = userRoles.map((role) => role.name.toLowerCase());
    console.log('User Role IDs:', roleIds);
    console.log('User Role Names:', roleNames);

    // Check by role name first (more reliable for this case)
    if (roleNames.includes('student')) {
        return '/';
    } else if (roleNames.includes('teacher')) {
        return '/teacher/dashboard';
    } else if (roleNames.includes('superadmin') || roleNames.includes('admin') || roleNames.includes('librarian')) {
        return '/dashboard';
    }

    // Fallback check by role ID
    if (roleIds.includes(ROLE.SUPERADMIN) || roleIds.includes(ROLE.ADMIN) || roleIds.includes(ROLE.LIBRARIAN)) {
        return '/dashboard';
    } else if (roleIds.includes(ROLE.TEACHER)) {
        return '/teacher/dashboard';
    } else if (roleIds.includes(ROLE.STUDENT)) {
        return '/';
    }

    // Default fallback
    return '/dashboard';
};

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const accessToken = Cookies.get('access_token');

    console.log(`[Router] Navigating to: ${to.path}`);
    console.log(`[Router] Has token: ${!!accessToken}`);

    // Skip authentication checks for public routes
    if (to.path === '/' || to.path.startsWith('/auth/') || to.path === '/pdf') {
        // If user is authenticated and tries to access login page, redirect based on role
        if (to.path === '/auth/login' && accessToken && authStore.getAuth.isAuthenticated) {
            const userRoles = authStore.getAuth?.user?.roles || [];
            const redirectPath = getRedirectPathForRole(userRoles);
            console.log(`[Router] Authenticated user accessing login, redirecting to: ${redirectPath}`);
            return next(redirectPath);
        }
        return next();
    }

    // Check if user needs authentication
    if (to.meta.requiresAuth) {
        // If no token, redirect to login
        if (!accessToken) {
            console.log('[Router] No token found, redirecting to login');
            return next({ path: '/auth/login', query: { redirect: to.fullPath } });
        }

        // If token exists but no user data or not authenticated in store, validate token
        if (!authStore.getAuth.user || !authStore.getAuth.isAuthenticated) {
            console.log('[Router] Token exists but no user data, validating...');
            try {
                const isValid = await authStore.authCheck();
                if (!isValid) {
                    console.log('[Router] Token validation failed, redirecting to login');
                    return next({ path: '/auth/login', query: { redirect: to.fullPath } });
                }
            } catch (error) {
                console.error('[Router] Auth validation error:', error);
                return next({ path: '/auth/login', query: { redirect: to.fullPath } });
            }
        }

        // Now check role-based access
        const { user } = authStore.getAuth;
        if (user && user.roles) {
            const userRoles = user.roles;
            const userRoleIds = userRoles.map((role) => role.id);
            const userRoleNames = userRoles.map((role) => role.name.toLowerCase());
            console.log(`[Router] User roles for ${to.path}:`, userRoleNames, userRoleIds);

            // Super admin has access to everything
            if (userRoleIds.includes(ROLE.SUPERADMIN)) {
                return next();
            }

            // Check specific role requirements
            if (to.meta.isTeacher && !userRoleIds.includes(ROLE.TEACHER) && !userRoleNames.includes('teacher')) {
                console.log('[Router] Teacher access required but user is not teacher');
                return next('/auth/access-denied');
            }

            if (to.meta.isStudent && !userRoleIds.includes(ROLE.STUDENT) && !userRoleNames.includes('student')) {
                console.log('[Router] Student access required but user is not student');
                return next('/auth/access-denied');
            }

            if (to.meta.isAdmin && !userRoleIds.includes(ROLE.ADMIN) && !userRoleNames.includes('admin')) {
                console.log('[Router] Admin access required but user is not admin');
                return next('/auth/access-denied');
            }

            if (to.meta.isLibrarian && !userRoleIds.includes(ROLE.LIBRARIAN) && !userRoleNames.includes('librarian')) {
                console.log('[Router] Librarian access required but user is not librarian');
                return next('/auth/access-denied');
            }

            if (to.meta.isSuperAdmin && !userRoleIds.includes(ROLE.SUPERADMIN) && !userRoleNames.includes('superadmin')) {
                console.log('[Router] Super admin access required but user is not super admin');
                return next('/auth/access-denied');
            }

            // Check combined role requirements
            if (to.meta.isAdminOrLibrarian) {
                const hasAccess = userRoleIds.some((id) => [ROLE.ADMIN, ROLE.LIBRARIAN].includes(id)) || userRoleNames.some((name) => ['admin', 'librarian'].includes(name));
                if (!hasAccess) {
                    console.log('[Router] Admin or Librarian access required but user has neither role');
                    return next('/auth/access-denied');
                }
            }

            if (to.meta.isAdminOrSuperAdmin) {
                const hasAccess = userRoleIds.some((id) => [ROLE.ADMIN, ROLE.SUPERADMIN].includes(id)) || userRoleNames.some((name) => ['admin', 'superadmin'].includes(name));
                if (!hasAccess) {
                    console.log('[Router] Admin or Super Admin access required but user has neither role');
                    return next('/auth/access-denied');
                }
            }
            if (to.meta.isAdminOrSuperAdminOrLibrarian) {
                const hasAccess = userRoleIds.some((id) => [ROLE.ADMIN, ROLE.SUPERADMIN, ROLE.LIBRARIAN].includes(id)) || userRoleNames.some((name) => ['admin', 'superadmin', 'librarian'].includes(name));
                if (!hasAccess) {
                    console.log('[Router] Admin, Super Admin or Librarian access required but user has none of these roles');
                    return next('/auth/access-denied');
                }
            }
        }
    }

    // Redirect authenticated users away from auth pages (except access-denied and verify-email)
    if (to.path.startsWith('/auth/') && authStore.getAuth.isAuthenticated && to.path !== '/auth/access-denied' && to.path !== '/auth/verify-email') {
        const userRoles = authStore.getAuth.user?.roles || [];
        const redirectPath = getRedirectPathForRole(userRoles);
        console.log(`[Router] Authenticated user accessing auth page, redirecting to: ${redirectPath}`);
        return next(redirectPath);
    }

    next();
});

export default router;
