<script setup>
import { useAuthStore } from '@/stores/authStore';
import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';

// Form fields
const first_name = ref('');
const last_name = ref('');
const department = ref('');
const phone_no = ref('');
const email = ref('');
const acceptTerms = ref(false);
const submitted = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();
const toast = useToast();
// Authentication fields
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const selectedRole = ref('');
const availableRoles = ref([]);

// Library branch fields
const library_branches = ref([]);
const selected_library_branch = ref(null);
const branchesError = ref(null);
const branchesLoading = ref(false);

const authStore = useAuthStore();
const user = computed(() => authStore.getUser || {});
const userRoles = computed(() => user.value.roles?.map((role) => role.name) || []);

// Fetch initial data
onMounted(async () => {
    try {
        const token = Cookies.get('access_token') || localStorage.getItem('access_token');
        if (!token) {
            errorMessage.value = 'Authentication required';
            return;
        }

        // Check authentication if not already fetched
        if (token && !user.value) {
            await authStore.authCheck(); // Ensure user info is loaded
        }

        // Check if user is superadmin
        const roles = user.value?.roles?.map((r) => r.name) || [];

        // Fetch roles (optional if you're already using `userRoles`)
        const rolesResponse = await axiosInstance.get('/roles', {
            headers: { Authorization: `Bearer ${token}` }
        });
        availableRoles.value = rolesResponse.data.data || [];

        // Fetch library branches only if superadmin
        if (roles.includes('superadmin')) {
            await fetchLibraryBranches();
        }
    } catch (error) {
        errorMessage.value = 'Failed to load initial data';
        console.error('Initialization error:', error);
    }
});

// Fetch library branches
const fetchLibraryBranches = async () => {
    try {
        branchesLoading.value = true;
        const token = Cookies.get('access_token') || localStorage.getItem('access_token');
        if (!token) {
            branchesError.value = 'Authentication required';
            return;
        }

        const response = await axiosInstance.get('/branches', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
            library_branches.value = response.data || [];
        }
    } catch (err) {
        branchesError.value = 'Failed to fetch library branches';
        console.error('Branch fetch error:', err);
        library_branches.value = [];
    } finally {
        branchesLoading.value = false;
    }
};

// Computed selected branch
const selectedBranch = computed(() => {
    if (!library_branches.value.length || !selected_library_branch.value) return null;
    return library_branches.value.find((branch) => branch.id === selected_library_branch.value);
});
const resetForm = () => {
    first_name.value = '';
    last_name.value = '';
    department.value = '';
    phone_no.value = '';
    email.value = '';
    username.value = '';
    password.value = '';
    selectedRole.value = null;
    selected_library_branch.value = null;
    submitted.value = false;
    errorMessage.value = '';
};
const register = async () => {
    submitted.value = true;
    errorMessage.value = '';

    // Validation: required fields
    if (!first_name.value || !last_name.value || !department.value || !phone_no.value || !email.value || !username.value || !password.value || !confirmPassword.value || !acceptTerms.value) {
        errorMessage.value = 'Please fill all required fields correctly';
        return;
    }

    // Password match check
    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match';
        return;
    }

    // Role check (only required if not superadmin)
    if (!selectedRole.value && !userRoles.value.includes('superadmin')) {
        errorMessage.value = 'Please select a role';
        return;
    }

    // Library branch check (required if superadmin)
    if (userRoles.value.includes('superadmin') && !selected_library_branch.value) {
        errorMessage.value = 'Please select a library branch';
        return;
    }

    try {
        loading.value = true;

        const payload = {
            first_name: first_name.value,
            last_name: last_name.value,
            department: department.value,
            phone_no: phone_no.value,
            email: email.value,
            username: username.value,
            password: password.value,
            ...(!userRoles.value.includes('superadmin') && { role: selectedRole.value }),
            ...(userRoles.value.includes('superadmin') && { library_branch_id: selected_library_branch.value })
        };

        const token = Cookies.get('access_token') || localStorage.getItem('access_token');
        if (!token) {
            loading.value = false;
            errorMessage.value = 'No access token found. Please log in again.';
            return;
        }

        const response = await axiosInstance.post('/staff', payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        payload.value = {};
        if (![200, 201].includes(response.status)) {
            throw new Error(response.data.message || 'Registration failed');
        }

        loading.value = false;
        toast.add({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Staff member registered successfully.',
            life: 3000
        });
        resetForm();
        await nextTick();
        // router.push({ name: 'staff-management' });
    } catch (error) {
        loading.value = false;
        if (error.response && error.response.status === 401) {
            errorMessage.value = 'Authentication failed. Please log in again.';
        } else {
            errorMessage.value = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
        }
    }
};
// Bulk import functions
const importedStaff = ref([]);

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Assuming the first row is headers
        const headers = jsonData[0];
        importedStaff.value = jsonData.slice(1).map((row) => {
            const staff = {};
            headers.forEach((header, idx) => {
                staff[header] = row[idx];
            });
            // Ensure phone_no is string
            if (staff.phone_no !== undefined && staff.phone_no !== null) {
                staff.phone_no = String(staff.phone_no);
            }
            return staff;
        });
    };
    reader.readAsArrayBuffer(file);
};

const registerImportedStaff = async () => {
    if (!importedStaff.value.length) return;
    loading.value = true;
    errorMessage.value = '';
    try {
        // Get token from cookies or localStorage
        let token = Cookies.get('access_token');
        if (!token) {
            token = localStorage.getItem('access_token');
        }
        if (!token) {
            loading.value = false;
            errorMessage.value = 'No access token found. Please log in again.';
            return;
        }

        // Transform imported staff to match API format
        const transformedStaff = importedStaff.value.map((staff) => ({
            ...staff,
            role: staff.role || 'staff' // Default role if not specified
        }));

        const response = await axiosInstance.post(
            '/staff/bulk',
            {
                staff: transformedStaff
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        if (response.status !== 201 && response.status !== 200) {
            throw new Error(response.data.message || 'Batch registration failed');
        }
        loading.value = false;
    } catch (error) {
        loading.value = false;
        if (error.response && error.response.status === 401) {
            errorMessage.value = 'Authentication failed. Please log in again.';
        } else {
            errorMessage.value = error.response?.data?.message || error.message || 'Batch registration failed. Please try again.';
        }
    }
};

watch(
    () => user.value,
    (newUser) => {
        if (!newUser) {
            authStore.authCheck();
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="min-h-screen flex items-center justify-center py-8 px-2">
        <div class="w-full max-w-5xl mx-auto">
            <div class="rounded-3xl bg-white dark:bg-slate-900 overflow-hidden border border-blue-100 dark:border-slate-800">
                <div class="px-6 py-8 sm:px-10">
                    <div class="text-center mb-8">
                        <i class="pi pi-users text-primary text-4xl mb-2"></i>
                        <div class="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-1">Digital Library Management System</div>
                        <span class="text-muted-color font-medium">Register as Staff</span>
                    </div>

                    <!-- Error Message -->
                    <Message severity="error" v-if="errorMessage" class="mb-4">{{ errorMessage }}</Message>

                    <!-- Bulk Import Section -->
                    <div class="mb-8 p-4 border-2 border-dashed border-primary rounded-lg bg-blue-50 dark:bg-slate-800">
                        <div class="text-lg font-semibold mb-1 text-primary">Bulk Import Staff</div>
                        <p class="mb-2 text-muted-color">
                            Upload a CSV or Excel file to register multiple staff at once.<br />
                            <span class="text-xs text-muted-color">Required columns: first_name, last_name, department, phone_no, email, username, password, role</span>
                        </p>
                        <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" @change="handleFileUpload" class="mb-1" />
                        <Button label="Register Imported Staff" class="mt-1" @click="registerImportedStaff" :disabled="!importedStaff.length" :loading="loading"></Button>
                        <div v-if="importedStaff.length" class="mt-1 text-green-600">Loaded {{ importedStaff.length }} staff from file.</div>
                    </div>

                    <!-- Manual Registration Form -->
                    <div class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="username" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Username</label>
                                <InputText id="username" type="text" placeholder="Username" class="w-full" v-model="username" :class="{ 'p-invalid': submitted && !username }" />
                                <small v-if="submitted && !username" class="p-error block mb-2">Username is required.</small>
                            </div>
                            <div v-if="!userRoles.includes('superadmin')">
                                <label for="role" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Role</label>
                                <Dropdown id="role" v-model="selectedRole" :options="availableRoles" optionLabel="name" optionValue="name" placeholder="Select a role" class="w-full" :class="{ 'p-invalid': submitted && !selectedRole }" />
                                <small v-if="submitted && !selectedRole" class="p-error block mb-2">Role is required.</small>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="password" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Password</label>
                                <Password id="password" v-model="password" placeholder="Password" class="w-full" :class="{ 'p-invalid': submitted && !password }" toggleMask />
                                <small v-if="submitted && !password" class="p-error block mb-2">Password is required.</small>
                            </div>
                            <div>
                                <label for="confirmPassword" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Confirm Password</label>
                                <Password id="confirmPassword" v-model="confirmPassword" placeholder="Confirm Password" class="w-full" :class="{ 'p-invalid': submitted && password !== confirmPassword }" toggleMask />
                                <small v-if="submitted && password !== confirmPassword" class="p-error block mb-2">Passwords must match.</small>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="first_name" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">First Name</label>
                                <InputText id="first_name" type="text" placeholder="First name" class="w-full" v-model="first_name" :class="{ 'p-invalid': submitted && !first_name }" />
                                <small v-if="submitted && !first_name" class="p-error block mb-2">First name is required.</small>
                            </div>
                            <div>
                                <label for="last_name" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Last Name</label>
                                <InputText id="last_name" type="text" placeholder="Last name" class="w-full" v-model="last_name" :class="{ 'p-invalid': submitted && !last_name }" />
                                <small v-if="submitted && !last_name" class="p-error block mb-2">Last name is required.</small>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="department" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Department</label>
                                <InputText id="department" type="text" placeholder="Department" class="w-full" v-model="department" :class="{ 'p-invalid': submitted && !department }" />
                                <small v-if="submitted && !department" class="p-error block mb-2">Department is required.</small>
                            </div>
                            <div>
                                <label for="phone_no" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Phone Number</label>
                                <InputText id="phone_no" type="text" placeholder="Phone number" class="w-full" v-model="phone_no" :class="{ 'p-invalid': submitted && !phone_no }" />
                                <small v-if="submitted && !phone_no" class="p-error block mb-2">Phone number is required.</small>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="email" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Email</label>
                                <InputText id="email" type="email" placeholder="Email address" class="w-full" v-model="email" :class="{ 'p-invalid': submitted && !email }" />
                                <small v-if="submitted && !email" class="p-error block mb-2">Email is required.</small>
                            </div>
                            <div v-if="userRoles.includes('superadmin')">
                                <label for="library_branch" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Library Branch</label>
                                <Dropdown
                                    id="library_branch"
                                    v-model="selected_library_branch"
                                    :options="library_branches"
                                    optionLabel="branch_name"
                                    optionValue="id"
                                    placeholder="Select a library branch"
                                    class="w-full"
                                    :class="{ 'p-invalid': submitted && !selected_library_branch }"
                                    :loading="branchesLoading"
                                />
                                <small v-if="submitted && !selected_library_branch" class="p-error block mb-2">Library branch is required.</small>
                                <small v-if="branchesError" class="p-error block mb-2">{{ branchesError }}</small>
                            </div>
                        </div>

                        <!-- Branch Details Display -->
                        <div v-if="selectedBranch" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
                                <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{{ selectedBranch.branch_name }}</h2>
                                <div class="space-y-3">
                                    <div>
                                        <span class="font-medium text-slate-700 dark:text-slate-300">Address:</span>
                                        <p class="text-slate-900 dark:text-slate-100">{{ selectedBranch.address }}</p>
                                    </div>
                                    <div>
                                        <span class="font-medium text-slate-700 dark:text-slate-300">Contact:</span>
                                        <p class="text-slate-900 dark:text-slate-100">{{ selectedBranch.contact_number }}</p>
                                    </div>
                                    <div>
                                        <span class="font-medium text-slate-700 dark:text-slate-300">Email:</span>
                                        <p class="text-slate-900 dark:text-slate-100">{{ selectedBranch.email }}</p>
                                    </div>
                                    <div>
                                        <span class="font-medium text-slate-700 dark:text-slate-300">Opening Hours:</span>
                                        <div class="text-slate-900 dark:text-slate-100">
                                            <div v-for="(day, name) in JSON.parse(selectedBranch.library_time)" :key="name" class="flex justify-between">
                                                <span class="capitalize">{{ name }}:</span>
                                                <span v-if="day.open !== '00:00'">{{ day.open }} - {{ day.close }}</span>
                                                <span v-else>Closed</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-slate-700">
                                <div class="responsive-iframe-container">
                                    <div v-html="selectedBranch.location"></div>
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center mb-2 mt-2">
                            <Checkbox v-model="acceptTerms" id="acceptTerms" binary :class="{ 'p-invalid': submitted && !acceptTerms }" class="mr-2"></Checkbox>
                            <label for="acceptTerms" :class="{ 'p-error': submitted && !acceptTerms }"> I agree to the <a href="#" class="text-primary underline">terms and conditions</a> </label>
                        </div>
                        <small v-if="submitted && !acceptTerms" class="p-error block mb-2">You must agree to the terms and conditions.</small>
                        <div class="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button label="Register" class="w-full sm:w-auto" @click="register()" :loading="loading"></Button>
                            <Button label="Back" class="w-full sm:w-auto p-button-secondary" @click="router.back()" :disabled="loading"></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.p-password {
    width: 100%;
}

.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.responsive-iframe-container {
    position: relative;
    overflow: hidden;
    padding-top: 56.25%; /* 16:9 Aspect Ratio */
}

.responsive-iframe-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
}

.dark .shadow-md {
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.3),
        0 2px 4px -1px rgba(0, 0, 0, 0.2);
}
</style>
