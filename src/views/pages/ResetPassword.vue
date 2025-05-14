<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const email = ref(route.query.email || '');
const otp = ref(route.query.otp || '');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const submitted = ref(false);
const loading = ref(false);
const resetSuccessful = ref(false);

async function resetPassword() {
  submitted.value = true;
  errorMessage.value = '';

  if (!email.value || !otp.value) {
    errorMessage.value = 'Email and OTP are required for password reset';
    return;
  }

  if (!password.value || !confirmPassword.value) {
    errorMessage.value = 'Password fields are required';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  try {
    loading.value = true;

    const response = await axios.post('http://localhost:8000/api/reset-password', {
      email: email.value,
      otp: otp.value,
      password: password.value,
      password_confirmation: confirmPassword.value,
    });

    resetSuccessful.value = true;
    console.log('Password reset successful:', response.data);

    setTimeout(() => {
      router.push({ name: 'login' });
    }, 2000);

  } catch (error) {
    if (error.response) {
      errorMessage.value = error.response.data.message || 'Password reset failed';
      console.error('Response error:', error.response.data);
    } else {
      errorMessage.value = 'An error occurred. Please try again.';
      console.error('General error:', error);
    }
  } finally {
    loading.value = false;
  }
}
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

              <!-- Show email input if not provided -->
              <div v-if="!email">
                <label for="email" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Email</label>
                <InputText id="email" v-model="email" placeholder="Enter your email" class="w-full mb-4" />
              </div>

              <!-- Show OTP input if not provided -->
              <div v-if="!otp">
                <label for="otp" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">OTP Code</label>
                <InputText id="otp" v-model="otp" placeholder="Enter OTP code" class="w-full mb-4" />
              </div>

              <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">New Password</label>
              <Password
                id="password"
                v-model="password"
                placeholder="Enter new password"
                :toggleMask="true"
                class="w-full mb-2"
                :class="{ 'p-invalid': submitted && !password }"
              />
              <small v-if="submitted && !password" class="p-error block mb-4">Password is required.</small>
              <small v-else class="block mb-4 invisible">_</small>

              <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Confirm Password</label>
              <Password
                id="confirmPassword"
                v-model="confirmPassword"
                placeholder="Confirm new password"
                :toggleMask="true"
                :feedback="false"
                class="w-full mb-2"
                :class="{ 'p-invalid': submitted && (!confirmPassword || confirmPassword !== password) }"
              />
              <small v-if="submitted && !confirmPassword" class="p-error block mb-2">Confirm password is required.</small>
              <small v-else-if="submitted && confirmPassword !== password" class="p-error block mb-2">Passwords do not match.</small>
              <small v-else class="block mb-2 invisible">_</small>

              <Button label="Reset Password" class="w-full mt-4" @click="resetPassword" :loading="loading" />
            </div>
          </div>

          <div v-else class="text-center">
            <i class="pi pi-check-circle text-primary text-6xl mb-3"></i>
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Password Reset Successful</div>
            <p class="text-muted-color text-xl mb-6">Your password has been successfully reset.</p>
            <p class="text-muted-color mb-8">You can now login with your new password.</p>
            <Button label="Login" class="mb-4" @click="router.push('/auth/login')" />
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
