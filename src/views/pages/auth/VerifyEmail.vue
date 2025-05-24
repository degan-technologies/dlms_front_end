<script setup>
import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const loading = ref(false);
const router = useRouter();
const code = ref(['', '', '', '']);
const errorMessage = ref('');
const submitted = ref(false);

// Handle OTP input focus management
const inputs = ref([]);

const handleInput = (e, index) => {
    const value = e.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(value) && value !== '') {
        code.value[index] = '';
        return;
    }

    // Auto move to next input
    if (value && index < code.value.length - 1) {
        inputs.value[index + 1].focus();
    }
};

const handleKeyDown = (e, index) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !code.value[index] && index > 0) {
        inputs.value[index - 1].focus();
    }
};

const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');

    // If pasted data has the correct format (4 digits)
    if (/^\d{4}$/.test(pasteData)) {
        for (let i = 0; i < 4; i++) {
            code.value[i] = pasteData[i];
        }
    }
};

const verifyCode = async () => {
    submitted.value = true;

    // Check if any of the code fields are empty
    if (code.value.some((digit) => !digit)) {
        return;
    }

    try {
        loading.value = true;
        // In a real application, you would verify the code with your backend
        // const verificationCode = code.value.join('');
        // API call would go here

        setTimeout(() => {
            loading.value = false;
            router.push('/auth/login');
        }, 1000);
    } catch (error) {
        loading.value = false;
        errorMessage.value = error?.message || 'Invalid verification code. Please try again.';
    }
};

const resendCode = async () => {
    try {
        loading.value = true;
        // In a real application, you would resend the verification code
        // API call would go here

        setTimeout(() => {
            loading.value = false;
        }, 1000);
    } catch (error) {
        loading.value = false;
        errorMessage.value = error?.message || 'Failed to resend code. Please try again.';
    }
};
</script>

<template>
    <FloatingConfigurator />
    <div
        class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div
                style="
                    border-radius: 56px;
                    padding: 0.3rem;
                    background: linear-gradient(
                        180deg,
                        var(--primary-color) 10%,
                        rgba(33, 150, 243, 0) 30%
                    );
                ">
                <div
                    class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20"
                    style="border-radius: 53px">
                    <div class="text-center mb-8">
                        <i class="pi pi-envelope text-primary text-6xl mb-3"></i>
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">
                            Verify Your Email
                        </div>
                        <p class="text-muted-color font-medium">
                            We've sent a verification code to your email.<br />
                            Please enter the code below to verify your account.
                        </p>
                    </div>

                    <div>
                        <Message severity="error" v-if="errorMessage" class="mb-4">{{
                            errorMessage
                        }}</Message>

                        <div class="text-center mb-6">
                            <div class="flex justify-center gap-2">
                                <InputText
                                    v-for="(digit, i) in code"
                                    :key="i"
                                    v-model="code[i]"
                                    class="w-16 h-16 text-center text-2xl"
                                    :class="{ 'p-invalid': submitted && !code[i] }"
                                    maxlength="1"
                                    @input="handleInput($event, i)"
                                    @keydown="handleKeyDown($event, i)"
                                    @paste="handlePaste"
                                    ref="inputs" />
                            </div>
                            <small
                                v-if="submitted && code.some((digit) => !digit)"
                                class="p-error block mt-2">
                                Please enter the complete verification code.
                            </small>
                        </div>

                        <Button
                            label="Verify Email"
                            class="w-full mb-6"
                            @click="verifyCode"
                            :loading="loading"></Button>

                        <div class="text-center">
                            <p class="mb-3 text-muted-color">Didn't receive the code?</p>
                            <Button
                                label="Resend Code"
                                severity="secondary"
                                outlined
                                @click="resendCode"
                                :loading="loading"></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.p-inputtext {
    transition: all 0.2s;
}

.p-inputtext:not(.p-invalid):focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 1px var(--primary-color);
}
</style>
