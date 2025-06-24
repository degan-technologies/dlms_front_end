<script setup>
import axiosInstance from '@/util/axios-config';
import Cookies from 'js-cookie';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';

const toast = useToast();
const router = useRouter();

// Student data
const first_name = ref('');
const last_name = ref('');
const address = ref('');
const grade = ref('');
const section = ref('');
const gender = ref('');
const phone_no = ref('');
const email = ref('');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const acceptTerms = ref(false);
const sections = ref([]);

const submitted = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const importedStudents = ref([]);

// Options
const grades = ref(Array.from({ length: 12 }, (_, i) => ({ label: `Grade ${i + 1}`, value: `${i + 1}` })));
const genders = ref([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
]);

// Fetch available roles (if needed for future flexibility)
onMounted(async () => {
    fetchSection();
});

const resetForm = () => {
    first_name.value = '';
    last_name.value = '';
    address.value = '';
    grade.value = null;
    section.value = null;
    gender.value = null;
    phone_no.value = '';
    email.value = '';
    username.value = '';
    password.value = '';
    confirmPassword.value = '';
    acceptTerms.value = false;
    submitted.value = false;
};
const register = async () => {
    submitted.value = true;

    if (!validateForm()) {
        return;
    }

    try {
        loading.value = true;
        errorMessage.value = '';

        const payload = {
            first_name: first_name.value,
            last_name: last_name.value,
            address: address.value,
            grade_id: grade.value,
            section_id: section.value,
            gender: gender.value,
            phone_no: phone_no.value,
            email: email.value,
            username: username.value,
            password: password.value
        };

        const token = getAuthToken();
        if (!token) return;

        const response = await axiosInstance.post('/students', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        handleSuccessResponse(response);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Student registered successfully!', life: 3000 });
        await nextTick();
        resetForm();
    } catch (error) {
        handleError(error);
    }
};

const validateForm = () => {
    return first_name.value && last_name.value && gender.value && grade.value && phone_no.value && email.value && username.value && password.value && confirmPassword.value && password.value === confirmPassword.value && acceptTerms.value;
};

const getAuthToken = () => {
    const token = Cookies.get('access_token') || localStorage.getItem('access_token');
    if (!token) {
        loading.value = false;
        errorMessage.value = 'No access token found. Please log in again.';
        return null;
    }
    return token;
};

const handleSuccessResponse = (response) => {
    if (response.status !== 201 && response.status !== 200) {
        throw new Error(response.data.message || 'Registration failed');
    }
    loading.value = false;
};

const handleError = (error) => {
    loading.value = false;
    if (error.response && error.response.status === 401) {
        errorMessage.value = 'Authentication failed. Please log in again.';
    } else {
        errorMessage.value = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
    }
};

// Bulk import functions
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

        const headers = jsonData[0];
        importedStudents.value = jsonData.slice(1).map((row) => {
            const student = {};
            headers.forEach((header, idx) => {
                student[header] = row[idx] !== undefined ? row[idx] : '';
            });
            // Ensure phone_no and grade are strings
            if (student.phone_no !== undefined) student.phone_no = String(student.phone_no);
            if (student.grade !== undefined) student.grade = String(student.grade);
            return student;
        });
    };
    reader.readAsArrayBuffer(file);
};

const registerImportedStudents = async () => {
    if (!importedStudents.value.length) return;
    loading.value = true;
    errorMessage.value = '';

    try {
        const token = getAuthToken();
        if (!token) return;

        const transformedStudents = importedStudents.value.map((student) => ({
            ...student
        }));

        const response = await axiosInstance.post('/students/bulk', { students: transformedStudents }, { headers: { Authorization: `Bearer ${token}` } });

        handleSuccessResponse(response);
    } catch (error) {
        handleError(error);
    }
};

const fetchSection = async () => {
    try {
        const token = getAuthToken();
        if (!token) return;

        const response = await axiosInstance.get('/sections', { headers: { Authorization: `Bearer ${token}` } });
        sections.value = response.data.data || [];
        console.log('Sections fetched successfully:', sections.value);
    } catch (error) {
        console.error('Failed to fetch sections:', error);
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center py-8 px-2">
        <div class="w-full max-w-5xl mx-auto">
            <div class="rounded-3xl bg-white dark:bg-slate-900 overflow-hidden border border-blue-100 dark:border-slate-800">
                <div class="px-6 py-8 sm:px-10">
                    <div class="text-center mb-8">
                        <i class="pi pi-book text-primary text-4xl mb-2"></i>
                        <div class="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-1">Student Registration</div>
                        <span class="text-muted-color font-medium">Register new students</span>
                    </div>

                    <!-- Bulk Import Section -->
                    <div class="mb-8 p-4 border-2 border-dashed border-primary rounded-lg bg-blue-50 dark:bg-slate-800">
                        <div class="text-lg font-semibold mb-1 text-primary">Bulk Import Students</div>
                        <p class="mb-2 text-muted-color">
                            Upload a CSV or Excel file to register multiple students at once.<br />
                            <span class="text-xs text-muted-color">Required columns: first_name, last_name, grade, gender, phone_no, email, username, password</span>
                        </p>
                        <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" @change="handleFileUpload" class="mb-1 w-full" />
                        <Button label="Register Imported Students" class="mt-1 w-full" @click="registerImportedStudents" :disabled="!importedStudents.length" :loading="loading" />
                        <div v-if="importedStudents.length" class="mt-1 text-green-600">Loaded {{ importedStudents.length }} students from file.</div>
                    </div>

                    <!-- Manual Registration Form -->
                    <div class="space-y-4">
                        <Message severity="error" v-if="errorMessage" class="mb-2">{{ errorMessage }}</Message>

                        <!-- Credentials Section -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="username" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Username *</label>
                                <InputText id="username" type="text" placeholder="Username" class="w-full" v-model="username" :class="{ 'p-invalid': submitted && !username }" />
                                <small v-if="submitted && !username" class="p-error block">Username is required.</small>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="password" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Password *</label>
                                <Password id="password" v-model="password" placeholder="Password" class="w-full" :class="{ 'p-invalid': submitted && !password }" toggleMask />
                                <small v-if="submitted && !password" class="p-error block">Password is required.</small>
                            </div>
                            <div>
                                <label for="confirmPassword" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Confirm Password *</label>
                                <Password id="confirmPassword" v-model="confirmPassword" placeholder="Confirm Password" class="w-full" :class="{ 'p-invalid': submitted && password !== confirmPassword }" toggleMask />
                                <small v-if="submitted && password !== confirmPassword" class="p-error block">Passwords must match.</small>
                            </div>
                        </div>

                        <!-- Personal Information -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="first_name" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">First Name *</label>
                                <InputText id="first_name" type="text" placeholder="First name" class="w-full" v-model="first_name" :class="{ 'p-invalid': submitted && !first_name }" />
                                <small v-if="submitted && !first_name" class="p-error block">First name is required.</small>
                            </div>
                            <div>
                                <label for="last_name" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Last Name *</label>
                                <InputText id="last_name" type="text" placeholder="Last name" class="w-full" v-model="last_name" :class="{ 'p-invalid': submitted && !last_name }" />
                                <small v-if="submitted && !last_name" class="p-error block">Last name is required.</small>
                            </div>
                        </div>

                        <!-- Academic Information -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="grade" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Grade *</label>
                                <Dropdown id="grade_id" v-model="grade" :options="grades" optionLabel="label" optionValue="value" placeholder="Select Grade" class="w-full" :class="{ 'p-invalid': submitted && !grade }" />
                                <small v-if="submitted && !grade" class="p-error block">Grade is required.</small>
                            </div>
                            <div>
                                <label for="section_id" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Section</label>
                                <Dropdown id="section_id" v-model="section" :options="sections" optionLabel="sectionName" optionValue="id" placeholder="Select a Section" class="w-full" />
                            </div>
                        </div>

                        <!-- Contact Information -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="phone_no" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Phone Number *</label>
                                <InputText id="phone_no" type="text" placeholder="Phone number" class="w-full" v-model="phone_no" :class="{ 'p-invalid': submitted && !phone_no }" />
                                <small v-if="submitted && !phone_no" class="p-error block">Phone number is required.</small>
                            </div>
                            <div>
                                <label for="email" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Email *</label>
                                <InputText id="email" type="email" placeholder="Email address" class="w-full" v-model="email" :class="{ 'p-invalid': submitted && !email }" />
                                <small v-if="submitted && !email" class="p-error block">Email is required.</small>
                            </div>
                        </div>

                        <!-- Additional Information -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="gender" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Gender *</label>
                                <Dropdown id="gender" v-model="gender" :options="genders" optionLabel="label" optionValue="value" placeholder="Select Gender" class="w-full" :class="{ 'p-invalid': submitted && !gender }" />
                                <small v-if="submitted && !gender" class="p-error block">Gender is required.</small>
                            </div>
                            <div>
                                <label for="address" class="block text-slate-900 dark:text-slate-100 text-base font-medium mb-1">Address</label>
                                <InputText id="address" type="text" placeholder="Address (optional)" class="w-full" v-model="address" />
                            </div>
                        </div>

                        <!-- Terms and Actions -->
                        <div class="flex items-center mb-2 mt-2">
                            <Checkbox v-model="acceptTerms" id="acceptTerms" binary :class="{ 'p-invalid': submitted && !acceptTerms }" class="mr-2" />
                            <label for="acceptTerms" :class="{ 'p-error': submitted && !acceptTerms }"> I agree to the <a href="#" class="text-primary underline">terms and conditions</a> </label>
                        </div>
                        <small v-if="submitted && !acceptTerms" class="p-error block mb-2">You must agree to the terms and conditions.</small>

                        <div class="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button label="Register" class="w-full sm:w-auto" @click="register" :loading="loading" />
                            <Button label="Back" class="w-full sm:w-auto p-button-secondary" @click="router.back()" :disabled="loading" />
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

/* Style adjustments for file input */
input[type='file'] {
    border: 1px solid #ced4da;
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    background-color: white;
}

/* Dark mode adjustments */
.dark input[type='file'] {
    background-color: #2d3748;
    border-color: #4a5568;
    color: #e2e8f0;
}
</style>
