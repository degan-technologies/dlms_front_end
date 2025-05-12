<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Cookies from 'js-cookie'; // <-- Add this line

const firstName = ref('');
const lastName = ref('');
const address = ref('');
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

const grades = ref(
    Array.from({ length: 12 }, (_, i) => ({ label: `Grade ${i + 1}`, value: `${i + 1}` }))
);

const genders = ref([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
]);

const register = async () => {
    submitted.value = true;

    if (
        !firstName.value ||
        !lastName.value ||
        !gender.value ||
        !grade.value ||
        !phone_no.value ||
        !email.value ||
        !acceptTerms.value
    ) {
        return;
    }

    try {
        loading.value = true;
        errorMessage.value = '';

        const payload = {
            FirstName: firstName.value,
            LastName: lastName.value,
            Address: address.value,
            grade: grade.value,
            section: section.value,
            gender: gender.value,
            phone_no: phone_no.value,
            email: email.value
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
        importedUsers.value = jsonData.slice(1).map(row => {
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

        const response = await axios.post('http://localhost:8000/api/students/batch', {
            students: importedUsers.value
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
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
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 32px; padding: 0.2rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-8 px-4 sm:px-10" style="border-radius: 28px">
                    <div class="text-center mb-4">
                        <i class="pi pi-book text-primary text-4xl mb-2"></i>
                        <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-2">Digital Library Management System</div>
                        <span class="text-muted-color font-medium">Register as a Student</span>
                    </div>

                    <!-- File Upload Section (moved up and styled) -->
                    <div class="mb-6 p-4 border-2 border-dashed border-primary rounded-lg bg-surface-100 dark:bg-surface-800">
                        <div class="text-lg font-semibold mb-1 text-primary">Bulk Import Students</div>
                        <p class="mb-2 text-muted-color">Upload a CSV or Excel file to register multiple students at once.</p>
                        <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" @change="handleFileUpload" class="mb-1" />
                        <Button label="Register Imported Students" class="mt-1" @click="registerImportedUsers" :disabled="!importedUsers.length" :loading="loading"></Button>
                        <div v-if="importedUsers.length" class="mt-1 text-green-600">Loaded {{ importedUsers.length }} students from file.</div>
                    </div>

                    <!-- Manual Registration Form -->
                    <div>
                        <Message severity="error" v-if="errorMessage" class="mb-2">{{ errorMessage }}</Message>

                        <div class="flex gap-2 mb-1">
                            <div class="flex-1">
                                <label for="firstName" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-1">First Name</label>
                                <InputText id="firstName" type="text" placeholder="First name" class="w-full" v-model="firstName" :class="{ 'p-invalid': submitted && !firstName }" />
                                <small v-if="submitted && !firstName" class="p-error block mb-2">First name is required.</small>
                                <small v-else class="block mb-2 invisible">_</small>
                            </div>
                            <div class="flex-1">
                                <label for="lastName" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-1">Last Name</label>
                                <InputText id="lastName" type="text" placeholder="Last name" class="w-full" v-model="lastName" :class="{ 'p-invalid': submitted && !lastName }" />
                                <small v-if="submitted && !lastName" class="p-error block mb-2">Last name is required.</small>
                                <small v-else class="block mb-2 invisible">_</small>
                            </div>
                        </div>

                        <div class="flex gap-2 mb-1">
                            <div class="flex-1">
                                <label for="grade" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-1">Grade</label>
                                <Dropdown id="grade" v-model="grade" :options="grades" optionLabel="label" optionValue="value" placeholder="Select Grade" class="w-full" :class="{ 'p-invalid': submitted && !grade }" />
                                <small v-if="submitted && !grade" class="p-error block mb-2">Grade is required.</small>
                                <small v-else class="block mb-2 invisible">_</small>
                            </div>
                            <div class="flex-1">
                                <label for="section" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-1">Section</label>
                                <InputText id="section" type="text" placeholder="Section (optional)" class="w-full" v-model="section" />
                                <small class="block mb-2 invisible">_</small>
                            </div>
                        </div>

                        <div class="flex gap-2 mb-1">
                            <div class="flex-1">
                                <label for="phone_no" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-1">Phone Number</label>
                                <InputText id="phone_no" type="text" placeholder="Phone number" class="w-full" v-model="phone_no" :class="{ 'p-invalid': submitted && !phone_no }" />
                                <small v-if="submitted && !phone_no" class="p-error block mb-2">Phone number is required.</small>
                                <small v-else class="block mb-2 invisible">_</small>
                            </div>
                            <div class="flex-1">
                                <label for="email" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-1">Email</label>
                                <InputText id="email" type="email" placeholder="Email address" class="w-full" v-model="email" :class="{ 'p-invalid': submitted && !email }" />
                                <small v-if="submitted && !email" class="p-error block mb-2">Email is required.</small>
                                <small v-else class="block mb-2 invisible">_</small>
                            </div>
                        </div>

                        <div class="flex gap-2 mb-1">
                            <div class="flex-1">
                                <label for="gender" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-1">Gender</label>
                                <Dropdown id="gender" v-model="gender" :options="genders" optionLabel="label" optionValue="value" placeholder="Select Gender" class="w-full" :class="{ 'p-invalid': submitted && !gender }" />
                                <small v-if="submitted && !gender" class="p-error block mb-2">Gender is required.</small>
                                <small v-else class="block mb-2 invisible">_</small>
                            </div>
                            <div class="flex-1">
                                <label for="address" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-1">Address</label>
                                <InputText id="address" type="text" placeholder="Address (optional)" class="w-full" v-model="address" />
                                <small class="block mb-2 invisible">_</small>
                            </div>
                        </div>
                        <div class="mb-4 mt-2">
                            <Checkbox v-model="acceptTerms" id="acceptTerms" binary :class="{ 'p-invalid': submitted && !acceptTerms }" class="mr-2"></Checkbox>
                            <label for="acceptTerms" :class="{ 'p-error': submitted && !acceptTerms }"> I agree to the <a href="#" class="text-primary">terms and conditions</a> </label>
                            <small v-if="submitted && !acceptTerms" class="p-error block mt-1">You must agree to the terms and conditions.</small>
                        </div>

                        <div class="flex gap-2">
                            <Button label="Register" class="w-full" @click="register" :loading="loading"></Button>
                            <Button label="Back" class="w-full p-button-secondary" @click="router.back()" :disabled="loading"></Button>
                        </div>

                        <div class="text-center mt-4">
                            <span class="text-muted-color mr-2">Already have an account?</span>
                            <router-link to="/auth/login" class="font-medium no-underline text-primary">Sign In</router-link>
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
