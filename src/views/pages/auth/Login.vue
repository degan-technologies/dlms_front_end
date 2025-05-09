<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const toast = useToast();

const login = ref(''); // Changed from email to login to match backend
const password = ref('');
const rememberMe = ref(false);
const submitted = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
    submitted.value = true;
    errorMessage.value = '';

    if (!login.value || !password.value) {
        return;
    }

    try {
        loading.value = true;
        // Call the login method from authStore
        await authStore.login(login.value, password.value, rememberMe.value);
        // No need to set loading to false as we will redirect after login
    } catch (error) {
        loading.value = false;
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage.value = error.response.data.message;
        } else {
            errorMessage.value = 'Failed to login. Please check your credentials and try again.';
        }
    } finally {
        loading.value = false;
    }
};

// Social login methods
const loginWithGoogle = () => {
    loading.value = true;
    // Implement Google OAuth login here
    // In production, you would redirect to Google auth endpoint or use a library
    setTimeout(() => {
        loading.value = false;
        window.location.href = '/dashboard';
    }, 1000);
};

const loginWithLinkedIn = () => {
    loading.value = true;
    // Implement LinkedIn OAuth login here
    // In production, you would redirect to LinkedIn auth endpoint or use a library
    setTimeout(() => {
        loading.value = false;
        window.location.href = '/dashboard';
    }, 1000);
};
</script>

<template>
    <Toast />
    <div class="login-page flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <!-- Left side with branding -->
        <div class="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary-800 justify-center items-center relative overflow-hidden">
            <!-- Background pattern -->
            <div class="absolute inset-0 pattern-dots opacity-10"></div>

            <!-- Content -->
            <div class="max-w-lg px-8 relative z-10 text-center md:text-left">
                <div class="mb-8 flex justify-center md:justify-start">
                    <i class="pi pi-book text-white text-5xl"></i>
                </div>
                <h1 class="text-white text-5xl font-bold mb-4 leading-tight">Digital Library</h1>
                <p class="text-white/90 text-xl leading-relaxed">Access thousands of books, journals, and resources with your library account.</p>

                <!-- Feature points -->
                <div class="mt-8">
                    <div class="flex items-center mb-3">
                        <i class="pi pi-check-circle text-white mr-2"></i>
                        <span class="text-white/90">Access to thousands of resources</span>
                    </div>
                    <div class="flex items-center mb-3">
                        <i class="pi pi-check-circle text-white mr-2"></i>
                        <span class="text-white/90">Personalized reading recommendations</span>
                    </div>
                    <div class="flex items-center">
                        <i class="pi pi-check-circle text-white mr-2"></i>
                        <span class="text-white/90">Seamless reading experience</span>
                    </div>
                </div>
            </div>

            <!-- Decorative elements -->
            <div class="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32"></div>
            <div class="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full"></div>
        </div>

        <!-- Right side with login form -->
        <div class="w-full md:w-1/2 flex items-center justify-center p-6">
            <div class="w-full max-w-md">
                <!-- Logo for mobile view -->
                <div class="md:hidden text-center mb-8">
                    <h1 class="text-2xl font-bold mt-3">Digital Library</h1>
                </div>

                <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 class="text-2xl font-bold mb-2 text-gray-800">Welcome back</h2>
                    <p class="text-gray-600 mb-6">Please sign in to your account</p>

                    <div v-if="errorMessage" class="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 mb-6 rounded-r">
                        <div class="flex">
                            <i class="pi pi-exclamation-circle mr-2"></i>
                            <span>{{ errorMessage }}</span>
                        </div>
                    </div>

                    <form @submit.prevent="handleLogin" class="space-y-5">
                        <div>
                            <FloatLabel variant="on" class="w-full">
                                <InputText id="login" v-model="login" type="text" class="w-full" :class="{ 'p-invalid': submitted && !login }" autocomplete="username" />
                                <label for="login">Username or Email</label>
                            </FloatLabel>
                            <small v-if="submitted && !login" class="p-error">Username or email is required</small>
                        </div>

                        <div>
                            <div class="flex justify-end mb-1">
                                <router-link to="/auth/forgot-password" class="text-sm text-primary hover:underline">Forgot password?</router-link>
                            </div>
                            <FloatLabel variant="on" class="w-full">
                                <Password id="password" v-model="password" class="w-full" :class="{ 'p-invalid': submitted && !password }" :feedback="false" :toggleMask="true" inputClass="w-full" autocomplete="current-password" />
                                <label for="password">Password</label>
                            </FloatLabel>
                            <small v-if="submitted && !password" class="p-error">Password is required</small>
                        </div>

                        <div class="flex items-center">
                            <Checkbox v-model="rememberMe" inputId="rememberMe" binary class="mr-2" />
                            <label for="rememberMe" class="text-sm text-gray-600">Remember me</label>
                        </div>

                        <Button type="submit" label="Sign in" class="w-full p-button-primary" icon="pi pi-sign-in" :loading="loading" />
                    </form>

                    <!-- Divider -->
                    <div class="relative flex items-center my-6">
                        <div class="flex-grow border-t border-gray-200"></div>
                        <span class="flex-shrink mx-3 text-gray-400 text-sm">or continue with</span>
                        <div class="flex-grow border-t border-gray-200"></div>
                    </div>

                    <!-- Social Login Buttons -->
                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <Button type="button" @click="loginWithGoogle" class="p-button-outlined p-button-secondary" outlined>
                            <i class="pi pi-google mr-2"></i>
                            <span>Google</span>
                        </Button>

                        <Button type="button" @click="loginWithLinkedIn" class="p-button-outlined p-button-secondary" outlined>
                            <i class="pi pi-linkedin mr-2"></i>
                            <span>LinkedIn</span>
                        </Button>
                    </div>

                    <div class="text-center text-sm text-gray-600">
                        <span>New to Digital Library?</span>
                        <router-link to="/auth/register" class="text-primary font-medium hover:underline ml-1"> Create an account </router-link>
                    </div>
                </div>

                <!-- Footer -->
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.p-password input) {
    width: 100%;
}

:deep(.p-inputtext) {
    padding: 0.75rem;
}

:deep(.p-password-panel) {
    margin-top: 0.25rem;
}

:deep(.p-button) {
    padding: 0.75rem 1rem;
}

:deep(.p-float-label) {
    width: 100%;
}

:deep(.p-float-label label) {
    margin-top: 0;
}

.pattern-dots {
    background-image: radial-gradient(rgba(255, 255, 255, 0.4) 2px, transparent 2px);
    background-size: 30px 30px;
}
</style>
