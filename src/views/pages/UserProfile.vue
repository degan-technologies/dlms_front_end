<script setup>
import axiosInstance from '@/util/axios-config'; // <-- Use axiosInstance
import { useVuelidate } from '@vuelidate/core';
import { email, minLength, required } from '@vuelidate/validators';
import Cookies from 'js-cookie';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const loading = ref(false);
const showEdit = ref(false);
const showPassword = ref(false);
const showForgot = ref(false);
const forgotEmail = ref('');
const forgotError = ref('');

const user = ref({
    username: '',
    email: '',
    phone_no: ''
});

const editUser = ref({
    username: '',
    email: '',
    phone_no: ''
});

const passwords = ref({
    current: '',
    new: '',
    confirm: ''
});

// Validation rules
const rules = {
    editUser: {
        username: { required },
        email: { required, email },
        phone_no: { required }
    },
    passwords: {
        current: { required },
        new: { required, minLength: minLength(4) },
        confirm: { required }
    }
};

const v$ = useVuelidate(rules, { editUser, passwords });

// Fetch user data on component mount
async function fetchUser() {
    let token = Cookies.get('access_token');
    if (!token) token = localStorage.getItem('access_token');
    if (!token) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No access token found. Please log in again.', life: 3000 });
        return;
    }
    const response = await axiosInstance.get('/user');
    user.value = response.data.user;
    editUser.value = {
        username: response.data.user.username || '',
        email: response.data.user.email || '',
        phone_no: response.data.user.phone_no || ''
    };
}

onMounted(fetchUser);

async function saveProfile() {
    try {
        loading.value = true;
        const isValid = await v$.value.editUser.$validate();
        if (!isValid) return;
        let token = Cookies.get('access_token');
        if (!token) token = localStorage.getItem('access_token');
        if (!token) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No access token found. Please log in again.', life: 3000 });
            return;
        }
        await axiosInstance.put('/user', editUser.value);
        await fetchUser();
        showEdit.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to update profile', life: 3000 });
    } finally {
        loading.value = false;
    }
}

async function changePassword() {
    try {
        loading.value = true;
        const isValid = await v$.value.passwords.$validate();
        if (!isValid) return;
        if (passwords.value.new !== passwords.value.confirm) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', life: 3000 });
            return;
        }
        let token = Cookies.get('access_token');
        if (!token) token = localStorage.getItem('access_token');
        if (!token) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No access token found. Please log in again.', life: 3000 });
            return;
        }
        await axiosInstance.post('/user', {
            current_password: passwords.value.current,
            password: passwords.value.new,
            password_confirmation: passwords.value.confirm
        });
        showPassword.value = false;
        passwords.value = { current: '', new: '', confirm: '' };
        toast.add({ severity: 'success', summary: 'Success', detail: 'Password changed successfully', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to change password', life: 3000 });
    } finally {
        loading.value = false;
    }
}
function openEdit() {
    // Always pre-fill editUser with current user data
    editUser.value = {
        username: user.value.username || '',
        email: user.value.email || '',
        phone_no: user.value.phone_no || ''
    };
    showEdit.value = true;
}
const router = useRouter();
function goBack() {
    router.back();
}

async function sendResetLink() {
    forgotError.value = '';
    if (!forgotEmail.value) {
        forgotError.value = 'Email is required';
        return;
    }

    loading.value = true;
    try {
        const response = await axiosInstance.post('/forgot-password', {
            email: forgotEmail.value
        });
        toast.add({ severity: 'success', summary: 'Success', detail: 'OTP sent to your email', life: 3000 });
        showForgot.value = false;
        router.push({
            path: '/reset-password',
            query: {
                email: forgotEmail.value,
                otp: response.data.otp // Assuming backend returns OTP in response
            }
        });
    } catch (error) {
        forgotError.value = error.response?.data?.message || 'Failed to send reset link';
    } finally {
        loading.value = false;
    }
}
</script>
<template>
    <div class="min-h-screen w-full py-8 px-2 flex flex-col">
        <div class="card flex flex-col md:flex-row md:items-start md:gap-12 w-full max-w-5xl mx-auto">
            <!-- Left: Avatar and User Info -->
            <div class="flex flex-col items-center md:items-start md:w-1/3 w-full mb-8 md:mb-0">
                <div class="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">
                    <span v-if="user.username">{{ user.username.charAt(0).toUpperCase() }}</span>
                </div>
                <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 text-center md:text-left">{{ user.username }}</h2>
                <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 text-blue-600 dark:text-blue-300 text-base font-medium mb-2">
                    <span v-if="user.roles && user.roles.length"><i class="pi pi-star-fill"></i> {{ user.roles[0].name }}</span>
                    <span v-if="user.library_branch"><i class="pi pi-building"></i> {{ user.library_branch.branch_name }}</span>
                </div>
                <div class="flex flex-col gap-2 mt-4 w-full">
                    <Button label="Edit Profile" icon="pi pi-pencil" @click="openEdit" class="w-full" />
                    <Button label="Change Password" icon="pi pi-key" severity="info" @click="showPassword = true" class="w-full" />
                </div>
            </div>
            <!-- Right: Details -->
            <div class="flex-1 rounded-3xl p-8 flex flex-col justify-center">
                <div class="mb-6">
                    <div class="flex items-center gap-2 text-slate-700 dark:text-slate-200 mb-4 text-lg">
                        <i class="pi pi-envelope"></i>
                        <span class="font-semibold">Email:</span>
                        <span>{{ user.email }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-lg">
                        <i class="pi pi-phone"></i>
                        <span class="font-semibold">Phone:</span>
                        <span>{{ user.phone_no || 'N/A' }}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- Back button at top left for mobile -->
        <button class="fixed top-4 left-4 z-50 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 text-blue-600 dark:text-blue-300 shadow md:hidden" @click="goBack" title="Back">
            <i class="pi pi-arrow-left"></i>
        </button>
        <!-- Back button for desktop (top right of details) -->
        <button class="absolute top-8 right-8 z-50 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 text-blue-600 dark:text-blue-300 shadow hidden md:block" @click="goBack" title="Back">
            <i class="pi pi-arrow-left"></i>
        </button>
        <!-- Modals -->
        <Dialog v-model:visible="showEdit" header="Edit Profile" :modal="true" :style="{ width: '400px' }">
            <div class="space-y-4">
                <div>
                    <label class="block font-medium mb-1">Username</label>
                    <InputText v-model="editUser.username" :class="{ 'p-invalid': v$.editUser.username.$error }" class="w-full" />
                    <small class="p-error" v-if="v$.editUser.username.$error">{{ v$.editUser.username.$errors[0].$message }}</small>
                </div>
                <div>
                    <label class="block font-medium mb-1">Email</label>
                    <InputText v-model="editUser.email" :class="{ 'p-invalid': v$.editUser.email.$error }" class="w-full" />
                    <small class="p-error" v-if="v$.editUser.email.$error">{{ v$.editUser.email.$errors[0].$message }}</small>
                </div>
                <div>
                    <label class="block font-medium mb-1">Phone Number</label>
                    <InputText v-model="editUser.phone_no" :class="{ 'p-invalid': v$.editUser.phone_no.$error }" class="w-full" />
                    <small class="p-error" v-if="v$.editUser.phone_no.$error">{{ v$.editUser.phone_no.$errors[0].$message }}</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="showEdit = false" class="p-button-text" />
                <Button label="Save" icon="pi pi-check" @click="saveProfile" :loading="loading" />
            </template>
        </Dialog>
        <Dialog v-model:visible="showPassword" header="Change Password" :modal="true" :style="{ width: '400px' }">
            <div class="space-y-4">
                <div>
                    <label class="block font-medium mb-1">Current Password</label>
                    <Password v-model="passwords.current" :class="{ 'p-invalid': v$.passwords.current.$error }" toggleMask class="w-full" />
                    <small class="p-error" v-if="v$.passwords.current.$error">{{ v$.passwords.current.$errors[0].$message }}</small>
                </div>
                <div>
                    <label class="block font-medium mb-1">New Password</label>
                    <Password v-model="passwords.new" :class="{ 'p-invalid': v$.passwords.new.$error }" toggleMask class="w-full" />
                    <small class="p-error" v-if="v$.passwords.new.$error">{{ v$.passwords.new.$errors[0].$message }}</small>
                </div>
                <div>
                    <label class="block font-medium mb-1">Confirm Password</label>
                    <Password v-model="passwords.confirm" :class="{ 'p-invalid': v$.passwords.confirm.$error }" toggleMask class="w-full" />
                    <small class="p-error" v-if="v$.passwords.confirm.$error">{{ v$.passwords.confirm.$errors[0].$message }}</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="showPassword = false" class="p-button-text" />
                <Button label="Change" icon="pi pi-check" @click="changePassword" :loading="loading" />
            </template>
        </Dialog>
        <Dialog v-model:visible="showForgot" header="Forgot Password" :modal="true" :style="{ width: '400px' }">
            <div class="space-y-4">
                <div>
                    <label class="block font-medium mb-1">Email</label>
                    <InputText v-model="forgotEmail" :class="{ 'p-invalid': forgotError }" class="w-full" />
                    <small class="p-error" v-if="forgotError">{{ forgotError }}</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="showForgot = false" class="p-button-text" />
                <Button label="Send Reset Link" icon="pi pi-send" @click="sendResetLink()" :loading="loading" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped></style>
