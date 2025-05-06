<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const password = ref('');
const confirmPassword = ref('');
const submitted = ref(false);
const loading = ref(false);
const resetSuccessful = ref(false);
const errorMessage = ref('');
const route = useRoute();
const router = useRouter();
// In actual implementation, you would get the token from the route params
const token = route.query.token || 'DEMO_TOKEN';

const resetPassword = async () => {
    submitted.value = true;

    if (!password.value || !confirmPassword.value) {
        return;
    }

    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match';
        return;
    }

    try {
        loading.value = true;
        // In a real application, you would reset the password through your backend
        // API call would go here with token and new password
        setTimeout(() => {
            loading.value = false;
            resetSuccessful.value = true;
        }, 1000);
    } catch (error) {
        loading.value = false;
        errorMessage.value = error?.message || 'Failed to reset password. Please try again.';
    }
};
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div v-if="!resetSuccessful">
                        <div class="text-center mb-8">
                            <i class="pi pi-lock-open text-primary text-6xl mb-3"></i>
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Reset Your Password</div>
                            <span class="text-muted-color font-medium">Create a new password for your account</span>
                        </div>

                        <div>
                            <Message severity="error" v-if="errorMessage" class="mb-4">{{ errorMessage }}</Message>

                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">New Password</label>
                            <Password id="password" v-model="password" placeholder="Enter new password" :toggleMask="true" class="w-full mb-2" :class="{ 'p-invalid': submitted && !password }"></Password>
                            <small v-if="submitted && !password" class="p-error block mb-4">Password is required.</small>
                            <small v-else class="block mb-4 invisible">_</small>

                            <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Confirm Password</label>
                            <Password
                                id="confirmPassword"
                                v-model="confirmPassword"
                                placeholder="Confirm new password"
                                :toggleMask="true"
                                class="w-full mb-2"
                                :feedback="false"
                                :class="{ 'p-invalid': submitted && (!confirmPassword || confirmPassword !== password) }"
                            ></Password>
                            <small v-if="submitted && !confirmPassword" class="p-error block mb-2">Confirm password is required.</small>
                            <small v-else-if="submitted && confirmPassword !== password" class="p-error block mb-2">Passwords do not match.</small>
                            <small v-else class="block mb-2 invisible">_</small>

                            <Button label="Reset Password" class="w-full mt-4" @click="resetPassword" :loading="loading"></Button>
                        </div>
                    </div>

                    <div v-else class="text-center">
                        <i class="pi pi-check-circle text-primary text-6xl mb-3"></i>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Password Reset Successful</div>
                        <p class="text-muted-color text-xl mb-6">Your password has been successfully reset.</p>
                        <p class="text-muted-color mb-8">You can now login with your new password.</p>
                        <Button label="Login" class="mb-4" @click="router.push('/auth/login')"></Button>
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
