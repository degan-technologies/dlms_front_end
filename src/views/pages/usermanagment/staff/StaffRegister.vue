<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import Password from 'primevue/password';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';

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

const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const register = async () => {
    submitted.value = true;

    if (!first_name.value || !last_name.value || !department.value || !phone_no.value || !email.value || !username.value || !password.value || !confirmPassword.value || password.value !== confirmPassword.value || !acceptTerms.value) {
        return;
    }

    try {
        loading.value = true;
        errorMessage.value = '';

        const payload = {
            first_name: first_name.value,
            last_name: last_name.value,
            department: department.value,
            phone_no: phone_no.value,
            email: email.value,
            username: username.value,
            password: password.value
        };

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

        // Axios POST request for single staff registration
        const response = await axios.post('http://localhost:8000/api/staff', payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status !== 201 && response.status !== 200) {
            throw new Error(response.data.message || 'Registration failed');
        }

        loading.value = false;
        router.push('/auth/verify-email');
    } catch (error) {
        loading.value = false;
        if (error.response && error.response.status === 401) {
            errorMessage.value = 'Authentication failed. Please log in again.';
        } else {
            errorMessage.value = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
        }
    }
};

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
            ...staff
        }));

        const response = await axios.post(
            'http://localhost:8000/api/staff/bulk',
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
        router.push('/auth/verify-email');
    } catch (error) {
        loading.value = false;
        if (error.response && error.response.status === 401) {
            errorMessage.value = 'Authentication failed. Please log in again.';
        } else {
            errorMessage.value = error.response?.data?.message || error.message || 'Batch registration failed. Please try again.';
        }
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-slate-900 dark:to-slate-800 py-8 px-2">
        <div class="w-full max-w-2xl mx-auto">
            <div class="rounded-3xl shadow-2xl bg-white dark:bg-slate-900 overflow-hidden border border-blue-100 dark:border-slate-800">
                <div class="px-6 py-8 sm:px-10">
                    <div class="text-center mb-8">
                        <i class="pi pi-users text-primary text-4xl mb-2"></i>
                        <div class="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-1">Digital Library Management System</div>
                        <span class="text-muted-color font-medium">Register as Staff</span>
                    </div>

                    <!-- Bulk Import Section -->
                    <div class="mb-8 p-4 border-2 border-dashed border-primary rounded-lg bg-blue-50 dark:bg-slate-800">
                        <div class="text-lg font-semibold mb-1 text-primary">Bulk Import Staff</div>
                        <p class="mb-2 text-muted-color">
                            Upload a CSV or Excel file to register multiple staff at once.<br />
                            <span class="text-xs text-muted-color">Required columns: first_name, last_name, department, phone_no, email, username, password</span>
                        </p>
                        <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" @change="handleFileUpload" class="mb-1" />
                        <Button label="Register Imported Staff" class="mt-1" @click="registerImportedStaff" :disabled="!importedStaff.length" :loading="loading"></Button>
                        <div v-if="importedStaff.length" class="mt-1 text-green-600">Loaded {{ importedStaff.length }} staff from file.</div>
                    </div>

                    <!-- Manual Registration Form -->
                    <div class="space-y-4">
                        <Message severity="error" v-if="errorMessage" class="mb-2">{{ errorMessage }}</Message>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="username" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Username</label>
                                <InputText id="username" type="text" placeholder="Username" class="w-full" v-model="username" :class="{ 'p-invalid': submitted && !username }" />
                                <small v-if="submitted && !username" class="p-error block mb-2">Username is required.</small>
                            </div>
                            <div></div>
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
                        </div>
                        <div class="flex items-center mb-2 mt-2">
                            <Checkbox v-model="acceptTerms" id="acceptTerms" binary :class="{ 'p-invalid': submitted && !acceptTerms }" class="mr-2"></Checkbox>
                            <label for="acceptTerms" :class="{ 'p-error': submitted && !acceptTerms }"> I agree to the <a href="#" class="text-primary underline">terms and conditions</a> </label>
                        </div>
                        <small v-if="submitted && !acceptTerms" class="p-error block mb-2">You must agree to the terms and conditions.</small>
                        <div class="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button label="Register" class="w-full sm:w-auto" @click="register" :loading="loading"></Button>
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
</style>
