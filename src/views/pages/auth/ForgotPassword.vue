<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref } from 'vue';

const email = ref('');
const submitted = ref(false);
const loading = ref(false);
const mailSent = ref(false);
const errorMessage = ref('');

const requestPasswordReset = async () => {
    submitted.value = true;

    if (!email.value) {
        return;
    }

    try {
        loading.value = true;
        // In a real application, you would send a password reset request to your backend
        // API call would go here
        setTimeout(() => {
            loading.value = false;
            mailSent.value = true;
        }, 1000);
    } catch (error) {
        loading.value = false;
        errorMessage.value = error?.message || 'Failed to send password reset email. Please try again.';
    }
};
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div v-if="!mailSent">
                        <div class="text-center mb-8">
                            <i class="pi pi-lock text-primary text-6xl mb-3"></i>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Forgot Your Password?</div>
                            <span class="text-muted-color font-medium">Enter your email to reset your password</span>
                        </div>

                        <div>
                            <Message severity="error" v-if="errorMessage" class="mb-4">{{ errorMessage }}</Message>

                            <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <InputText id="email" type="text" placeholder="Enter your email" class="w-full md:w-[30rem] mb-2" v-model="email" :class="{ 'p-invalid': submitted && !email }" />
                            <small v-if="submitted && !email" class="p-error block mb-4">Email is required.</small>
                            <small v-else class="block mb-4 invisible">_</small>

                            <Button label="Send Reset Link" class="w-full mb-6" @click="requestPasswordReset" :loading="loading"></Button>

                            <div class="text-center">
                                <router-link to="/auth/login" class="font-medium no-underline text-primary">
                                    <i class="pi pi-arrow-left mr-1"></i>
                                    Back to login
                                </router-link>
                            </div>
                        </div>
                    </div>

                    <div v-else class="text-center">
                        <i class="pi pi-envelope text-primary text-6xl mb-3"></i>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Check Your Email</div>
                        <p class="text-muted-color text-xl mb-6">
                            We've sent a password reset link to<br />
                            <strong class="text-surface-900 dark:text-surface-0">{{ email }}</strong>
                        </p>
                        <p class="text-muted-color mb-8">Please check your inbox and click on the link to reset your password. If you don't see the email, check your spam folder.</p>
                        <Button label="Return to Login" class="mb-4" to="/auth/login"></Button>
                        <div>
                            <Button label="Resend Email" severity="secondary" outlined @click="requestPasswordReset" :loading="loading"></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
