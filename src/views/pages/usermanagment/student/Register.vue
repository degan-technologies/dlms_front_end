<script setup>
import axios from 'axios';
import Cookies from 'js-cookie'; // <-- Add this line
import Password from 'primevue/password';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';

const first_name = ref('');
const last_name = ref('');
const adress = ref('');
const grade = ref('');
const section = ref('');
const gender = ref('');
const phone_no = ref('');
const email = ref('');
const acceptTerms = ref(false);
const submitted = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();

const grades = ref(Array.from({ length: 12 }, (_, i) => ({ label: `Grade ${i + 1}`, value: `${i + 1}` })));

const genders = ref([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
]);

const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const register = async () => {
    submitted.value = true;

    if (!first_name.value || !last_name.value || !gender.value || !grade.value || !phone_no.value || !email.value || !username.value || !password.value || !confirmPassword.value || password.value !== confirmPassword.value || !acceptTerms.value) {
        return;
    }

    try {
        loading.value = true;
        errorMessage.value = '';

        const payload = {
            first_name: first_name.value,
            last_name: last_name.value,
            adress: adress.value,
            grade_name: grade.value, // Changed from grade to grade_name
            section_name: section.value, // Changed from section to section_name
            gender: gender.value,
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

        // Axios POST request
        const response = await axios.post('http://localhost:8000/api/students', payload, {
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

const importedUsers = ref([]);

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
        importedUsers.value = jsonData.slice(1).map((row) => {
            const user = {};
            headers.forEach((header, idx) => {
                user[header] = row[idx];
            });
            // Ensure grade and phone_no are strings
            if (user.grade !== undefined && user.grade !== null) {
                user.grade = String(user.grade);
            }
            if (user.phone_no !== undefined && user.phone_no !== null) {
                user.phone_no = String(user.phone_no);
            }
            return user;
        });
    };
    reader.readAsArrayBuffer(file);
};

const registerImportedUsers = async () => {
    if (!importedUsers.value.length) return;
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

        // Transform imported users to match new API format
        const transformedUsers = importedUsers.value.map((user) => ({
            ...user,
            grade_name: user.grade, // Changed from grade to grade_name
            section_name: user.section // Changed from section to section_name
        }));

        const response = await axios.post(
            'http://localhost:8000/api/students/batch',
            {
                students: transformedUsers
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
                        <i class="pi pi-book text-primary text-4xl mb-2"></i>
                        <div class="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-1">Digital Library Management System</div>
                        <span class="text-muted-color font-medium">Register as a Student</span>
                    </div>

                    <!-- Bulk Import Section -->
                    <div class="mb-8 p-4 border-2 border-dashed border-primary rounded-lg bg-blue-50 dark:bg-slate-800">
                        <div class="text-lg font-semibold mb-1 text-primary">Bulk Import Students</div>
                        <p class="mb-2 text-muted-color">Upload a CSV or Excel file to register multiple students at once.</p>
                        <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" @change="handleFileUpload" class="mb-1" />
                        <Button label="Register Imported Students" class="mt-1" @click="registerImportedUsers" :disabled="!importedUsers.length" :loading="loading"></Button>
                        <div v-if="importedUsers.length" class="mt-1 text-green-600">Loaded {{ importedUsers.length }} students from file.</div>
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
                                <label for="grade" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Grade</label>
                                <Dropdown id="grade" v-model="grade" :options="grades" optionLabel="label" optionValue="value" placeholder="Select Grade" class="w-full" :class="{ 'p-invalid': submitted && !grade }" />
                                <small v-if="submitted && !grade" class="p-error block mb-2">Grade is required.</small>
                            </div>
                            <div>
                                <label for="section" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Section</label>
                                <InputText id="section" type="text" placeholder="Section (optional)" class="w-full" v-model="section" />
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="phone_no" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Phone Number</label>
                                <InputText id="phone_no" type="text" placeholder="Phone number" class="w-full" v-model="phone_no" :class="{ 'p-invalid': submitted && !phone_no }" />
                                <small v-if="submitted && !phone_no" class="p-error block mb-2">Phone number is required.</small>
                            </div>
                            <div>
                                <label for="email" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Email</label>
                                <InputText id="email" type="email" placeholder="Email address" class="w-full" v-model="email" :class="{ 'p-invalid': submitted && !email }" />
                                <small v-if="submitted && !email" class="p-error block mb-2">Email is required.</small>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="gender" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Gender</label>
                                <Dropdown id="gender" v-model="gender" :options="genders" optionLabel="label" optionValue="value" placeholder="Select Gender" class="w-full" :class="{ 'p-invalid': submitted && !gender }" />
                                <small v-if="submitted && !gender" class="p-error block mb-2">Gender is required.</small>
                            </div>
                            <div>
                                <label for="adress" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Address</label>
                                <InputText id="adress" type="text" placeholder="Address (optional)" class="w-full" v-model="adress" />
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
