import TeacherDashboard from '@/views/pages/teacher/TeacherDashboard.vue';
import TeacherEbookDetails from '@/views/pages/teacher/TeacherEbookDetails.vue';

const teacherRoutes = [
    {
        path: '/teacher',
        name: 'teacher',
        children: [
            {
                path: 'dashboard',
                name: 'teacher-dashboard',
                component: TeacherDashboard,
                meta: {
                    requiresAuth: true,
                    roles: ['teacher', 'admin']
                }
            },
            {
                path: 'resources/:id',
                name: 'teacher-resource-details',
                component: TeacherEbookDetails,
                meta: {
                    requiresAuth: true,
                    roles: ['teacher', 'admin']
                }
            }
        ]
    }
];

export default teacherRoutes;
