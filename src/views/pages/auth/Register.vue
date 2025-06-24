<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const acceptTerms = ref(false);
const submitted = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();

const register = async () => {
    submitted.value = true;

    if (!name.value || !email.value || !password.value || !confirmPassword.value || !acceptTerms.value) {
        return;
    }

    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match';
        return;
    }

    try {
        loading.value = true;
        // In a real application, you would register with your backend
        // API call would go here
        setTimeout(() => {
            loading.value = false;
            router.push('/auth/verify-email');
        }, 1000);
    } catch (error) {
        loading.value = false;
        errorMessage.value = error?.message || 'Registration failed. Please try again.';
    }
};
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <i class="pi pi-book text-primary text-6xl mb-3"></i>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Digital Library Management System</div>
                        <span class="text-muted-color font-medium">Create a new account</span>
                    </div>

                    <div>
                        <Message severity="error" v-if="errorMessage" class="mb-4">{{ errorMessage }}</Message>

                        <label for="name" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Full Name</label>
                        <InputText id="name" type="text" placeholder="Your name" class="w-full md:w-[30rem] mb-2" v-model="name" :class="{ 'p-invalid': submitted && !name }" />
                        <small v-if="submitted && !name" class="p-error block mb-4">Name is required.</small>
                        <small v-else class="block mb-4 invisible">_</small>

                        <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <InputText id="email" type="text" placeholder="Email address" class="w-full md:w-[30rem] mb-2" v-model="email" :class="{ 'p-invalid': submitted && !email }" />
                        <small v-if="submitted && !email" class="p-error block mb-4">Email is required.</small>
                        <small v-else class="block mb-4 invisible">_</small>

                        <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                        <Password id="password" v-model="password" placeholder="Create password" :toggleMask="true" class="w-full mb-2" :class="{ 'p-invalid': submitted && !password }"></Password>
                        <small v-if="submitted && !password" class="p-error block mb-4">Password is required.</small>
                        <small v-else class="block mb-4 invisible">_</small>

                        <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Confirm Password</label>
                        <Password
                            id="confirmPassword"
                            v-model="confirmPassword"
                            placeholder="Confirm password"
                            :toggleMask="true"
                            class="w-full mb-2"
                            :feedback="false"
                            :class="{
                                'p-invalid': submitted && (!confirmPassword || confirmPassword !== password)
                            }"
                        ></Password>
                        <small v-if="submitted && !confirmPassword" class="p-error block mb-2">Confirm password is required.</small>
                        <small v-else-if="submitted && confirmPassword !== password" class="p-error block mb-2">Passwords do not match.</small>
                        <small v-else class="block mb-2 invisible">_</small>

                        <div class="mb-8 mt-4">
                            <Checkbox v-model="acceptTerms" id="acceptTerms" binary :class="{ 'p-invalid': submitted && !acceptTerms }" class="mr-2"></Checkbox>
                            <label for="acceptTerms" :class="{ 'p-error': submitted && !acceptTerms }">
                                I agree to the
                                <a href="#" class="text-primary">terms and conditions</a>
                            </label>
                            <small v-if="submitted && !acceptTerms" class="p-error block mt-2">You must agree to the terms and conditions.</small>
                        </div>

                        <Button label="Register" class="w-full" @click="register" :loading="loading"></Button>

                        <div class="text-center mt-6">
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
