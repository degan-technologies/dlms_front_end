<script setup>
import { useAuthStore } from '@/stores/authStore';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { nextTick, onMounted, ref } from 'vue';

const toast = useToast();

const login = ref(''); // Changed from email to login to match backend
const password = ref('');
const rememberMe = ref(false);
const submitted = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const authStore = useAuthStore();
const loginInput = ref(null);

// Focus login input only after component is fully mounted
// This helps avoid the "autofocus processing was blocked" warning
onMounted(() => {
    // Use nextTick to ensure DOM is fully updated
    nextTick(() => {
        // A small delay helps prevent focus issues
        setTimeout(() => {
            // Only focus if nothing else is focused
            if (!document.activeElement || document.activeElement === document.body) {
                if (loginInput.value && loginInput.value.$el) {
                    loginInput.value.$el.querySelector('input').focus();
                }
            }
        }, 100);
    });
});

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
    <!-- Ocean-themed Login Page for Flipper's International School -->
    <div class="login-page min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 relative overflow-hidden">
        <!-- Underwater Background Animation -->
        <div class="absolute inset-0 opacity-70">
            <svg class="absolute w-full h-full" viewBox="0 0 1400 800" preserveAspectRatio="none">
                <defs>
                    <!-- Enhanced realistic ocean gradients -->
                    <linearGradient id="deepOcean" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color: #0ea5e9; stop-opacity: 0.6" />
                        <stop offset="30%" style="stop-color: #0284c7; stop-opacity: 0.7" />
                        <stop offset="70%" style="stop-color: #0369a1; stop-opacity: 0.8" />
                        <stop offset="100%" style="stop-color: #1e40af; stop-opacity: 0.9" />
                    </linearGradient>
                    <linearGradient id="midOcean" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color: #06b6d4; stop-opacity: 0.5" />
                        <stop offset="50%" style="stop-color: #0891b2; stop-opacity: 0.6" />
                        <stop offset="100%" style="stop-color: #0e7490; stop-opacity: 0.7" />
                    </linearGradient>
                    <linearGradient id="surfaceWave" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color: #67e8f9; stop-opacity: 0.4" />
                        <stop offset="100%" style="stop-color: #22d3ee; stop-opacity: 0.5" />
                    </linearGradient>
                </defs>

                <!-- Deep ocean layer with enhanced wave pattern -->
                <path d="M0,150 C120,130 180,170 300,155 C420,140 480,180 600,165 C720,150 780,190 900,175 C1020,160 1080,200 1200,185 C1300,175 1400,195 1400,195 L1400,800 L0,800 Z" fill="url(#deepOcean)" class="animate-ocean-deep" />

                <!-- Mid ocean layer with bigger waves -->
                <path d="M0,200 C80,180 160,220 280,205 C400,190 480,230 620,215 C760,200 840,240 980,225 C1120,210 1200,250 1320,235 C1350,230 1400,245 1400,245 L1400,800 L0,800 Z" fill="url(#midOcean)" class="animate-ocean-mid" />

                <!-- Surface waves with enhanced foam effect -->
                <path
                    d="M0,270 C60,250 140,290 220,275 C300,260 380,300 480,285 C580,270 660,310 760,295 C860,280 940,320 1040,305 C1140,290 1220,330 1320,315 C1360,310 1400,325 1400,325 L1400,800 L0,800 Z"
                    fill="url(#surfaceWave)"
                    class="animate-ocean-surface"
                />

                <!-- Additional dramatic wave crests -->
                <path d="M0,300 C100,285 200,315 320,300 C440,285 560,325 680,310 C800,295 920,335 1040,320 C1160,305 1280,345 1400,330 L1400,800 L0,800 Z" fill="url(#surfaceWave)" opacity="0.8" class="animate-wave-crest" />
            </svg>
        </div>
        <!-- Floating Swimming Elements -->
        <div class="absolute top-[29%] left-[13%] text-blue-400 opacity-60 animate-swim-login-1">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="currentColor" class="drop-shadow-lg">
                <g transform="rotate(15 60 60)">
                    <!-- Enhanced diver with more visibility -->
                    <ellipse cx="60" cy="50" rx="8" ry="20" fill="currentColor" opacity="0.9" />
                    <circle cx="60" cy="30" r="6" fill="currentColor" opacity="1" />
                    <ellipse cx="48" cy="45" rx="15" ry="4" fill="currentColor" opacity="0.8" />
                    <ellipse cx="72" cy="55" rx="15" ry="4" fill="currentColor" opacity="0.8" />
                    <!-- Enhanced flippers -->
                    <ellipse cx="55" cy="72" rx="12" ry="4" fill="currentColor" opacity="0.7" />
                    <ellipse cx="65" cy="72" rx="12" ry="4" fill="currentColor" opacity="0.7" />
                </g>
            </svg>
        </div>

        <div class="absolute top-[71%] right-[23%] text-cyan-400 opacity-70 animate-swim-login-2">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" class="drop-shadow-lg">
                <g transform="rotate(-25 50 50)">
                    <!-- Enhanced second diver -->
                    <ellipse cx="50" cy="40" rx="6" ry="18" fill="currentColor" opacity="0.9" />
                    <circle cx="50" cy="25" r="5" fill="currentColor" opacity="1" />
                    <ellipse cx="40" cy="37" rx="12" ry="3" fill="currentColor" opacity="0.8" />
                    <ellipse cx="60" cy="43" rx="12" ry="3" fill="currentColor" opacity="0.8" />
                    <!-- Enhanced flippers -->
                    <ellipse cx="46" cy="60" rx="10" ry="3" fill="currentColor" opacity="0.7" />
                    <ellipse cx="54" cy="60" rx="10" ry="3" fill="currentColor" opacity="0.7" />
                </g>
            </svg>
        </div>

        <!-- Ships on Water Surface (moved to top surface) -->
        <div class="absolute top-[19%] right-[19%] text-gray-700 opacity-70 animate-ship-1">
            <svg width="100" height="60" viewBox="0 0 100 60" fill="currentColor" class="drop-shadow-xl">
                <!-- Ship hull -->
                <ellipse cx="50" cy="45" rx="35" ry="8" fill="#8b5cf6" opacity="0.9" />
                <!-- Ship deck -->
                <rect x="30" y="35" width="40" height="10" rx="2" fill="#a855f7" opacity="0.95" />
                <!-- Masts -->
                <line x1="40" y1="35" x2="40" y2="15" stroke="#6b7280" stroke-width="2" />
                <line x1="60" y1="35" x2="60" y2="10" stroke="#6b7280" stroke-width="2" />
                <!-- Sails -->
                <rect x="35" y="15" width="10" height="15" fill="#f3f4f6" opacity="0.95" />
                <rect x="55" y="10" width="10" height="20" fill="#f3f4f6" opacity="0.95" />
                <!-- Ship wake -->
                <path d="M15 50 Q25 53 35 50 Q45 47 55 50" stroke="rgba(255,255,255,0.3)" stroke-width="1" fill="none" />
            </svg>
        </div>

        <div class="absolute top-[22%] left-[5%] text-gray-600 opacity-65 animate-ship-2">
            <svg width="80" height="50" viewBox="0 0 80 50" fill="currentColor" class="drop-shadow-lg">
                <!-- Ship hull -->
                <ellipse cx="40" cy="38" rx="28" ry="6" fill="#ef4444" opacity="0.9" />
                <!-- Ship deck -->
                <rect x="25" y="30" width="30" height="8" rx="2" fill="#f87171" opacity="0.95" />
                <!-- Mast -->
                <line x1="40" y1="30" x2="40" y2="12" stroke="#6b7280" stroke-width="2" />
                <!-- Sail -->
                <rect x="35" y="12" width="10" height="15" fill="#f3f4f6" opacity="0.9" />
                <!-- Ship wake -->
                <path d="M12 43 Q22 46 32 43 Q42 40 52 43" stroke="rgba(255,255,255,0.3)" stroke-width="1" fill="none" />
            </svg>
        </div>

        <!-- Additional ships for more activity -->
        <div class="absolute top-[18%] right-[72%] text-blue-700 opacity-60 animate-ship-3">
            <svg width="90" height="55" viewBox="0 0 90 55" fill="currentColor" class="drop-shadow-lg">
                <!-- Yacht hull -->
                <ellipse cx="45" cy="42" rx="32" ry="7" fill="#1e40af" opacity="0.9" />
                <!-- Yacht deck -->
                <rect x="28" y="32" width="34" height="10" rx="2" fill="#3b82f6" opacity="0.95" />
                <!-- Mast -->
                <line x1="45" y1="32" x2="45" y2="8" stroke="#6b7280" stroke-width="2" />
                <!-- Sail -->
                <rect x="38" y="8" width="14" height="20" fill="#f1f5f9" opacity="0.95" />
                <!-- Ship wake -->
                <path d="M13 47 Q23 50 33 47 Q43 44 53 47" stroke="rgba(255,255,255,0.3)" stroke-width="1" fill="none" />
            </svg>
        </div>

        <div class="absolute top-[25%] left-[37%] text-green-700 opacity-55 animate-ship-4">
            <svg width="70" height="45" viewBox="0 0 70 45" fill="currentColor" class="drop-shadow-md">
                <!-- Fishing boat hull -->
                <ellipse cx="35" cy="35" rx="25" ry="6" fill="#16a34a" opacity="0.9" />
                <!-- Fishing boat deck -->
                <rect x="20" y="27" width="30" height="8" rx="2" fill="#22c55e" opacity="0.95" />
                <!-- Small mast -->
                <line x1="35" y1="27" x2="35" y2="12" stroke="#6b7280" stroke-width="2" />
                <!-- Small sail -->
                <rect x="30" y="12" width="10" height="12" fill="#f8fafc" opacity="0.9" />
                <!-- Ship wake -->
                <path d="M10 40 Q20 43 30 40 Q40 37 50 40" stroke="rgba(255,255,255,0.3)" stroke-width="1" fill="none" />
            </svg>
        </div>

        <div class="absolute top-[21%] right-[45%] text-purple-600 opacity-50 animate-ship-5">
            <svg width="75" height="48" viewBox="0 0 75 48" fill="currentColor" class="drop-shadow-md">
                <!-- Cargo ship hull -->
                <ellipse cx="37" cy="37" rx="30" ry="7" fill="#7c3aed" opacity="0.9" />
                <!-- Ship deck -->
                <rect x="22" y="28" width="30" height="9" rx="2" fill="#8b5cf6" opacity="0.95" />
                <!-- Containers -->
                <rect x="25" y="23" width="6" height="5" fill="#ef4444" opacity="0.8" />
                <rect x="32" y="23" width="6" height="5" fill="#22c55e" opacity="0.8" />
                <rect x="39" y="23" width="6" height="5" fill="#eab308" opacity="0.8" />
                <!-- Ship wake -->
                <path d="M7 42 Q17 45 27 42 Q37 39 47 42" stroke="rgba(255,255,255,0.3)" stroke-width="1" fill="none" />
            </svg>
        </div>
        <!-- Sea Turtles Swimming -->
        <div class="absolute top-[62%] left-[28%] text-green-600 opacity-75 animate-turtle-1">
            <svg width="140" height="90" viewBox="0 0 140 90" fill="currentColor" class="drop-shadow-xl">
                <g transform="rotate(5 70 45)">
                    <!-- Turtle shell -->
                    <ellipse cx="70" cy="45" rx="40" ry="25" fill="currentColor" opacity="0.9" />
                    <!-- Shell pattern -->
                    <ellipse cx="70" cy="45" rx="35" ry="20" fill="#065f46" opacity="0.7" />
                    <path d="M40 35 Q55 30 70 35 Q85 30 100 35" stroke="#064e3b" stroke-width="2" fill="none" opacity="0.8" />
                    <path d="M45 50 Q60 45 75 50 Q90 45 95 50" stroke="#064e3b" stroke-width="2" fill="none" opacity="0.8" />
                    <!-- Head -->
                    <ellipse cx="35" cy="42" rx="15" ry="12" fill="currentColor" opacity="0.95" />
                    <!-- Flippers -->
                    <ellipse cx="50" cy="25" rx="18" ry="8" fill="currentColor" opacity="0.8" transform="rotate(-20 50 25)" />
                    <ellipse cx="90" cy="25" rx="18" ry="8" fill="currentColor" opacity="0.8" transform="rotate(20 90 25)" />
                    <ellipse cx="50" cy="65" rx="18" ry="8" fill="currentColor" opacity="0.8" transform="rotate(20 50 65)" />
                    <ellipse cx="90" cy="65" rx="18" ry="8" fill="currentColor" opacity="0.8" transform="rotate(-20 90 65)" />
                    <!-- Eye -->
                    <circle cx="25" cy="38" r="3" fill="#ffffff" opacity="0.9" />
                    <circle cx="24" cy="37" r="1.5" fill="#000000" opacity="1" />
                </g>
            </svg>
        </div>

        <div class="absolute top-[78%] right-[15%] text-emerald-600 opacity-70 animate-turtle-2">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="currentColor" class="drop-shadow-lg">
                <g transform="rotate(-15 60 40)">
                    <!-- Turtle shell -->
                    <ellipse cx="60" cy="40" rx="35" ry="22" fill="currentColor" opacity="0.9" />
                    <!-- Shell pattern -->
                    <ellipse cx="60" cy="40" rx="30" ry="17" fill="#047857" opacity="0.7" />
                    <circle cx="50" cy="32" r="5" fill="#065f46" opacity="0.6" />
                    <circle cx="70" cy="32" r="5" fill="#065f46" opacity="0.6" />
                    <circle cx="60" cy="48" r="6" fill="#065f46" opacity="0.6" />
                    <!-- Head -->
                    <ellipse cx="30" cy="37" rx="12" ry="10" fill="currentColor" opacity="0.95" />
                    <!-- Flippers -->
                    <ellipse cx="45" cy="22" rx="15" ry="7" fill="currentColor" opacity="0.8" transform="rotate(-25 45 22)" />
                    <ellipse cx="75" cy="22" rx="15" ry="7" fill="currentColor" opacity="0.8" transform="rotate(25 75 22)" />
                    <ellipse cx="45" cy="58" rx="15" ry="7" fill="currentColor" opacity="0.8" transform="rotate(25 45 58)" />
                    <ellipse cx="75" cy="58" rx="15" ry="7" fill="currentColor" opacity="0.8" transform="rotate(-25 75 58)" />
                    <!-- Eye -->
                    <circle cx="22" cy="34" r="2.5" fill="#ffffff" opacity="0.9" />
                    <circle cx="21" cy="33" r="1.2" fill="#000000" opacity="1" />
                </g>
            </svg>
        </div>

        <div class="absolute top-[45%] left-[85%] text-teal-600 opacity-65 animate-turtle-3">
            <svg width="100" height="70" viewBox="0 0 100 70" fill="currentColor" class="drop-shadow-md">
                <g transform="rotate(25 50 35)">
                    <!-- Smaller turtle shell -->
                    <ellipse cx="50" cy="35" rx="30" ry="18" fill="currentColor" opacity="0.9" />
                    <!-- Shell pattern -->
                    <ellipse cx="50" cy="35" rx="25" ry="14" fill="#0f766e" opacity="0.7" />
                    <path d="M30 28 Q40 25 50 28 Q60 25 70 28" stroke="#134e4a" stroke-width="1.5" fill="none" opacity="0.8" />
                    <path d="M35 42 Q45 39 55 42 Q65 39 65 42" stroke="#134e4a" stroke-width="1.5" fill="none" opacity="0.8" />
                    <!-- Head -->
                    <ellipse cx="25" cy="32" rx="10" ry="8" fill="currentColor" opacity="0.95" />
                    <!-- Flippers -->
                    <ellipse cx="38" cy="20" rx="12" ry="6" fill="currentColor" opacity="0.8" transform="rotate(-30 38 20)" />
                    <ellipse cx="62" cy="20" rx="12" ry="6" fill="currentColor" opacity="0.8" transform="rotate(30 62 20)" />
                    <ellipse cx="38" cy="50" rx="12" ry="6" fill="currentColor" opacity="0.8" transform="rotate(30 38 50)" />
                    <ellipse cx="62" cy="50" rx="12" ry="6" fill="currentColor" opacity="0.8" transform="rotate(-30 62 50)" />
                    <!-- Eye -->
                    <circle cx="18" cy="29" r="2" fill="#ffffff" opacity="0.9" />
                    <circle cx="17" cy="28" r="1" fill="#000000" opacity="1" />
                </g>
            </svg>
        </div>

        <!-- Dolphins Swimming -->
        <div class="absolute top-[55%] left-[81%] text-cyan-500 opacity-70 animate-dolphin-1">
            <svg width="150" height="100" viewBox="0 0 150 100" fill="currentColor" class="drop-shadow-xl">
                <g transform="rotate(-10 75 50)">
                    <!-- Dolphin body -->
                    <ellipse cx="75" cy="50" rx="45" ry="12" fill="currentColor" opacity="0.9" />
                    <!-- Dolphin head -->
                    <ellipse cx="45" cy="48" rx="18" ry="10" fill="currentColor" opacity="0.95" />
                    <!-- Dolphin snout -->
                    <ellipse cx="28" cy="46" rx="8" ry="4" fill="currentColor" opacity="1" />
                    <!-- Dorsal fin -->
                    <path d="M75 38 C80 30, 85 30, 82 38 Z" fill="currentColor" opacity="0.8" />
                    <!-- Tail fin -->
                    <path d="M115 45 C125 35, 135 40, 130 50 C135 60, 125 65, 115 55 Z" fill="currentColor" opacity="0.85" />
                    <!-- Pectoral fins -->
                    <ellipse cx="60" cy="58" rx="12" ry="6" fill="currentColor" opacity="0.75" transform="rotate(20 60 58)" />
                    <ellipse cx="65" cy="42" rx="12" ry="6" fill="currentColor" opacity="0.75" transform="rotate(-20 65 42)" />
                </g>
            </svg>
        </div>

        <div class="absolute top-[42%] right-[91%] text-blue-500 opacity-80 animate-dolphin-2">
            <svg width="140" height="90" viewBox="0 0 140 90" fill="currentColor" class="drop-shadow-xl">
                <g transform="rotate(15 70 45)">
                    <!-- Dolphin body -->
                    <ellipse cx="70" cy="45" rx="42" ry="11" fill="currentColor" opacity="0.9" />
                    <!-- Dolphin head -->
                    <ellipse cx="42" cy="43" rx="16" ry="9" fill="currentColor" opacity="0.95" />
                    <!-- Dolphin snout -->
                    <ellipse cx="27" cy="41" rx="7" ry="3.5" fill="currentColor" opacity="1" />
                    <!-- Dorsal fin -->
                    <path d="M70 34 C75 27, 80 27, 77 34 Z" fill="currentColor" opacity="0.8" />
                    <!-- Tail fin -->
                    <path d="M110 40 C120 31, 130 36, 125 45 C130 54, 120 59, 110 50 Z" fill="currentColor" opacity="0.85" />
                    <!-- Pectoral fins -->
                    <ellipse cx="57" cy="52" rx="11" ry="5" fill="currentColor" opacity="0.75" transform="rotate(20 57 52)" />
                    <ellipse cx="62" cy="38" rx="11" ry="5" fill="currentColor" opacity="0.75" transform="rotate(-20 62 38)" />
                </g>
            </svg>
        </div>

        <div class="absolute top-[79%] right-[26%] text-teal-500 opacity-60 animate-dolphin-3">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="currentColor" class="drop-shadow-lg">
                <g transform="rotate(-25 60 40)">
                    <!-- Smaller dolphin -->
                    <ellipse cx="60" cy="40" rx="35" ry="9" fill="currentColor" opacity="0.9" />
                    <ellipse cx="38" cy="38" rx="14" ry="8" fill="currentColor" opacity="0.95" />
                    <ellipse cx="25" cy="37" rx="6" ry="3" fill="currentColor" opacity="1" />
                    <path d="M60 32 C65 25, 70 25, 67 32 Z" fill="currentColor" opacity="0.8" />
                    <path d="M92 35 C102 26, 112 31, 107 40 C112 49, 102 54, 92 45 Z" fill="currentColor" opacity="0.85" />
                    <ellipse cx="50" cy="47" rx="10" ry="4" fill="currentColor" opacity="0.75" transform="rotate(20 50 47)" />
                </g>
            </svg>
        </div>

        <!-- Additional dolphins (positioned randomly in water) -->
        <div class="absolute top-[31%] left-[16%] text-sky-500 opacity-65 animate-dolphin-4">
            <svg width="130" height="85" viewBox="0 0 130 85" fill="currentColor" class="drop-shadow-lg">
                <g transform="rotate(20 65 42)">
                    <ellipse cx="65" cy="42" rx="38" ry="10" fill="currentColor" opacity="0.9" />
                    <ellipse cx="40" cy="40" rx="15" ry="8" fill="currentColor" opacity="0.95" />
                    <ellipse cx="26" cy="39" rx="7" ry="3" fill="currentColor" opacity="1" />
                    <path d="M65 33 C70 26, 75 26, 72 33 Z" fill="currentColor" opacity="0.8" />
                    <path d="M100 37 C110 28, 120 33, 115 42 C120 51, 110 56, 100 47 Z" fill="currentColor" opacity="0.85" />
                    <ellipse cx="52" cy="49" rx="11" ry="5" fill="currentColor" opacity="0.75" transform="rotate(20 52 49)" />
                </g>
            </svg>
        </div>

        <div class="absolute top-[66%] left-[93%] text-indigo-500 opacity-55 animate-dolphin-5">
            <svg width="110" height="75" viewBox="0 0 110 75" fill="currentColor" class="drop-shadow-md">
                <g transform="rotate(-5 55 37)">
                    <ellipse cx="55" cy="37" rx="32" ry="8" fill="currentColor" opacity="0.9" />
                    <ellipse cx="35" cy="36" rx="12" ry="7" fill="currentColor" opacity="0.95" />
                    <ellipse cx="24" cy="35" rx="5" ry="2.5" fill="currentColor" opacity="1" />
                    <path d="M55 30 C60 23, 65 23, 62 30 Z" fill="currentColor" opacity="0.8" />
                    <path d="M85 32 C95 23, 105 28, 100 37 C105 46, 95 51, 85 42 Z" fill="currentColor" opacity="0.85" />
                </g>
            </svg>
        </div>
        <div class="absolute top-[48%] right-[53%] text-blue-600 opacity-70 animate-dolphin-6">
            <svg width="125" height="80" viewBox="0 0 125 80" fill="currentColor" class="drop-shadow-lg">
                <g transform="rotate(-15 62 40)">
                    <ellipse cx="62" cy="40" rx="36" ry="9" fill="currentColor" opacity="0.9" />
                    <ellipse cx="38" cy="38" rx="14" ry="7" fill="currentColor" opacity="0.95" />
                    <ellipse cx="25" cy="37" rx="6" ry="3" fill="currentColor" opacity="1" />
                    <path d="M62 32 C67 25, 72 25, 69 32 Z" fill="currentColor" opacity="0.8" />
                    <path d="M95 35 C105 26, 115 31, 110 40 C115 49, 105 54, 95 45 Z" fill="currentColor" opacity="0.85" />
                    <ellipse cx="50" cy="47" rx="10" ry="4" fill="currentColor" opacity="0.75" transform="rotate(20 50 47)" />
                </g>
            </svg>
        </div>

        <!-- Middle Depth Fish -->
        <div class="absolute top-[43%] right-[29%] text-orange-400 opacity-60 animate-fish-1">
            <svg width="60" height="40" viewBox="0 0 60 40" fill="currentColor" class="drop-shadow-md">
                <!-- Fish body -->
                <ellipse cx="25" cy="20" rx="15" ry="8" fill="currentColor" opacity="0.9" />
                <!-- Fish tail -->
                <path d="M10 20 L2 15 L2 25 Z" fill="currentColor" opacity="0.8" />
                <!-- Fish fins -->
                <ellipse cx="30" cy="15" rx="4" ry="2" fill="currentColor" opacity="0.7" />
                <ellipse cx="30" cy="25" rx="4" ry="2" fill="currentColor" opacity="0.7" />
                <!-- Eye -->
                <circle cx="32" cy="18" r="2" fill="#ffffff" opacity="0.9" />
                <circle cx="33" cy="17" r="1" fill="#000000" opacity="1" />
            </svg>
        </div>

        <div class="absolute top-[51%] left-[18%] text-yellow-400 opacity-55 animate-fish-2">
            <svg width="50" height="35" viewBox="0 0 50 35" fill="currentColor" class="drop-shadow-sm">
                <!-- Small fish body -->
                <ellipse cx="20" cy="17" rx="12" ry="6" fill="currentColor" opacity="0.9" />
                <!-- Fish tail -->
                <path d="M8 17 L2 12 L2 22 Z" fill="currentColor" opacity="0.8" />
                <!-- Eye -->
                <circle cx="26" cy="15" r="1.5" fill="#ffffff" opacity="0.9" />
                <circle cx="26.5" cy="14.5" r="0.8" fill="#000000" opacity="1" />
            </svg>
        </div>

        <div class="absolute top-[47%] left-[82%] text-pink-400 opacity-65 animate-fish-4">
            <svg width="45" height="30" viewBox="0 0 45 30" fill="currentColor" class="drop-shadow-sm">
                <!-- Angelfish body -->
                <ellipse cx="22" cy="15" rx="12" ry="10" fill="currentColor" opacity="0.9" />
                <!-- Angelfish tall fins -->
                <path d="M15 5 L20 15 L15 25" stroke="currentColor" stroke-width="2" fill="none" opacity="0.8" />
                <path d="M30 5 L25 15 L30 25" stroke="currentColor" stroke-width="2" fill="none" opacity="0.8" />
                <!-- Tail -->
                <path d="M10 15 L3 10 L3 20 Z" fill="currentColor" opacity="0.8" />
                <!-- Eye -->
                <circle cx="28" cy="13" r="1.5" fill="#ffffff" opacity="0.9" />
                <circle cx="28.5" cy="12.5" r="0.7" fill="#000000" opacity="1" />
            </svg>
        </div>

        <!-- Bottom Depth Fish -->
        <div class="absolute top-[89%] right-[13%] text-purple-400 opacity-50 animate-fish-3">
            <svg width="70" height="45" viewBox="0 0 70 45" fill="currentColor" class="drop-shadow-md">
                <!-- Tropical fish body -->
                <ellipse cx="30" cy="22" rx="18" ry="10" fill="currentColor" opacity="0.9" />
                <!-- Decorative stripes -->
                <ellipse cx="30" cy="18" rx="15" ry="2" fill="#8b5cf6" opacity="0.6" />
                <ellipse cx="30" cy="26" rx="15" ry="2" fill="#8b5cf6" opacity="0.6" />
                <!-- Fish tail -->
                <path d="M12 22 L3 15 L3 29 Z" fill="currentColor" opacity="0.8" />
                <!-- Fish fins -->
                <ellipse cx="36" cy="14" rx="5" ry="3" fill="currentColor" opacity="0.7" />
                <ellipse cx="36" cy="30" rx="5" ry="3" fill="currentColor" opacity="0.7" />
                <!-- Eye -->
                <circle cx="40" cy="20" r="2.5" fill="#ffffff" opacity="0.9" />
                <circle cx="41" cy="19" r="1.2" fill="#000000" opacity="1" />
            </svg>
        </div>

        <div class="absolute top-[84%] right-[73%] text-cyan-400 opacity-70 animate-fish-5">
            <svg width="55" height="35" viewBox="0 0 55 35" fill="currentColor" class="drop-shadow-md">
                <!-- Clownfish body -->
                <ellipse cx="27" cy="17" rx="16" ry="9" fill="currentColor" opacity="0.9" />
                <!-- Clownfish stripes -->
                <rect x="20" y="10" width="3" height="14" fill="#ffffff" opacity="0.8" />
                <rect x="30" y="10" width="3" height="14" fill="#ffffff" opacity="0.8" />
                <!-- Tail -->
                <path d="M11 17 L3 12 L3 22 Z" fill="currentColor" opacity="0.8" />
                <!-- Fins -->
                <ellipse cx="35" cy="12" rx="4" ry="2" fill="currentColor" opacity="0.7" />
                <ellipse cx="35" cy="22" rx="4" ry="2" fill="currentColor" opacity="0.7" />
                <!-- Eye -->
                <circle cx="38" cy="15" r="2" fill="#ffffff" opacity="0.9" />
                <circle cx="39" cy="14" r="1" fill="#000000" opacity="1" />
            </svg>
        </div>
        <div class="absolute top-[91%] left-[56%] text-red-400 opacity-60 animate-fish-7">
            <svg width="65" height="40" viewBox="0 0 65 40" fill="currentColor" class="drop-shadow-md">
                <!-- Red snapper -->
                <ellipse cx="32" cy="20" rx="20" ry="11" fill="currentColor" opacity="0.9" />
                <!-- Distinctive fins -->
                <path d="M15 20 L5 15 L5 25 Z" fill="currentColor" opacity="0.8" />
                <ellipse cx="40" cy="13" rx="6" ry="3" fill="currentColor" opacity="0.7" />
                <ellipse cx="40" cy="27" rx="6" ry="3" fill="currentColor" opacity="0.7" />
                <!-- Dorsal fin -->
                <path d="M25 9 L35 9 L30 20" fill="currentColor" opacity="0.6" />
                <!-- Eye -->
                <circle cx="42" cy="18" r="2.5" fill="#ffffff" opacity="0.9" />
                <circle cx="43" cy="17" r="1.2" fill="#000000" opacity="1" />
            </svg>
        </div>

        <!-- School of Small Fish -->
        <div class="absolute top-[46%] right-[67%] text-gray-400 opacity-50 animate-school-1">
            <svg width="80" height="50" viewBox="0 0 80 50" fill="currentColor" class="drop-shadow-sm">
                <!-- Multiple small fish in formation -->
                <g opacity="0.7">
                    <ellipse cx="15" cy="15" rx="6" ry="3" fill="currentColor" />
                    <ellipse cx="25" cy="18" rx="6" ry="3" fill="currentColor" />
                    <ellipse cx="35" cy="22" rx="6" ry="3" fill="currentColor" />
                    <ellipse cx="45" cy="16" rx="6" ry="3" fill="currentColor" />
                    <ellipse cx="55" cy="20" rx="6" ry="3" fill="currentColor" />
                    <ellipse cx="65" cy="24" rx="6" ry="3" fill="currentColor" />
                </g>
                <g opacity="0.5">
                    <!-- Tails -->
                    <path d="M9 15 L5 13 L5 17 Z" fill="currentColor" />
                    <path d="M19 18 L15 16 L15 20 Z" fill="currentColor" />
                    <path d="M29 22 L25 20 L25 24 Z" fill="currentColor" />
                    <path d="M39 16 L35 14 L35 18 Z" fill="currentColor" />
                    <path d="M49 20 L45 18 L45 22 Z" fill="currentColor" />
                    <path d="M59 24 L55 22 L55 26 Z" fill="currentColor" />
                </g>
            </svg>
        </div>
        <!-- Underwater Plants/Seaweed -->
        <div class="absolute bottom-0 left-[10%] text-green-500 opacity-40 animate-seaweed-1">
            <svg width="30" height="150" viewBox="0 0 30 150" fill="currentColor" class="drop-shadow-sm">
                <path d="M15 150 Q10 140 15 130 Q20 120 15 110 Q10 100 15 90 Q20 80 15 70 Q10 60 15 50 Q20 40 15 30 Q10 20 15 10 Q20 0 15 0" stroke="currentColor" stroke-width="3" fill="none" opacity="0.8" />
                <path d="M18 150 Q22 140 18 130 Q14 120 18 110 Q22 100 18 90 Q14 80 18 70 Q22 60 18 50" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6" />
            </svg>
        </div>

        <div class="absolute bottom-0 left-[25%] text-emerald-500 opacity-50 animate-seaweed-2">
            <svg width="25" height="120" viewBox="0 0 25 120" fill="currentColor" class="drop-shadow-sm">
                <path d="M12 120 Q8 110 12 100 Q16 90 12 80 Q8 70 12 60 Q16 50 12 40 Q8 30 12 20 Q16 10 12 0" stroke="currentColor" stroke-width="4" fill="none" opacity="0.9" />
            </svg>
        </div>

        <div class="absolute bottom-0 right-[15%] text-teal-400 opacity-45 animate-seaweed-3">
            <svg width="35" height="140" viewBox="0 0 35 140" fill="currentColor" class="drop-shadow-sm">
                <path d="M17 140 Q12 130 17 120 Q22 110 17 100 Q12 90 17 80 Q22 70 17 60 Q12 50 17 40 Q22 30 17 20 Q12 10 17 0" stroke="currentColor" stroke-width="3" fill="none" opacity="0.8" />
                <path d="M20 140 Q24 130 20 120 Q16 110 20 100 Q24 90 20 80 Q16 70 20 60" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6" />
            </svg>
        </div>

        <div class="absolute bottom-0 right-[35%] text-green-400 opacity-35 animate-seaweed-4">
            <svg width="20" height="100" viewBox="0 0 20 100" fill="currentColor" class="drop-shadow-sm">
                <path d="M10 100 Q6 90 10 80 Q14 70 10 60 Q6 50 10 40 Q14 30 10 20 Q6 10 10 0" stroke="currentColor" stroke-width="3" fill="none" opacity="0.9" />
            </svg>
        </div>

        <!-- Additional Kelp and Sea Plants -->
        <div class="absolute bottom-0 left-[3%] text-green-600 opacity-45 animate-seaweed-5">
            <svg width="40" height="180" viewBox="0 0 40 180" fill="currentColor" class="drop-shadow-sm">
                <path d="M20 180 Q15 170 20 160 Q25 150 20 140 Q15 130 20 120 Q25 110 20 100 Q15 90 20 80 Q25 70 20 60 Q15 50 20 40 Q25 30 20 20 Q15 10 20 0" stroke="currentColor" stroke-width="4" fill="none" opacity="0.8" />
                <path d="M25 180 Q29 170 25 160 Q21 150 25 140 Q29 130 25 120 Q21 110 25 100" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6" />
                <path d="M15 180 Q11 170 15 160 Q19 150 15 140 Q11 130 15 120" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6" />
            </svg>
        </div>

        <div class="absolute bottom-0 left-[54%] text-emerald-400 opacity-50 animate-seaweed-6">
            <svg width="28" height="130" viewBox="0 0 28 130" fill="currentColor" class="drop-shadow-sm">
                <path d="M14 130 Q10 120 14 110 Q18 100 14 90 Q10 80 14 70 Q18 60 14 50 Q10 40 14 30 Q18 20 14 10 Q10 0 14 0" stroke="currentColor" stroke-width="3" fill="none" opacity="0.9" />
                <!-- Sea grass blades -->
                <path d="M12 130 Q8 125 12 120 Q16 115 12 110" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.7" />
                <path d="M16 130 Q20 125 16 120 Q12 115 16 110" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.7" />
            </svg>
        </div>

        <div class="absolute bottom-0 right-[8%] text-teal-500 opacity-55 animate-seaweed-7">
            <svg width="32" height="160" viewBox="0 0 32 160" fill="currentColor" class="drop-shadow-sm">
                <path d="M16 160 Q12 150 16 140 Q20 130 16 120 Q12 110 16 100 Q20 90 16 80 Q12 70 16 60 Q20 50 16 40 Q12 30 16 20 Q20 10 16 0" stroke="currentColor" stroke-width="3.5" fill="none" opacity="0.8" />
                <!-- Kelp fronds -->
                <ellipse cx="8" cy="140" rx="6" ry="12" fill="currentColor" opacity="0.6" transform="rotate(15 8 140)" />
                <ellipse cx="24" cy="120" rx="5" ry="10" fill="currentColor" opacity="0.6" transform="rotate(-10 24 120)" />
                <ellipse cx="10" cy="100" rx="4" ry="8" fill="currentColor" opacity="0.5" transform="rotate(20 10 100)" />
            </svg>
        </div>

        <div class="absolute bottom-0 left-[78%] text-green-500 opacity-40 animate-seaweed-8">
            <svg width="22" height="110" viewBox="0 0 22 110" fill="currentColor" class="drop-shadow-sm">
                <path d="M11 110 Q7 100 11 90 Q15 80 11 70 Q7 60 11 50 Q15 40 11 30 Q7 20 11 10 Q15 0 11 0" stroke="currentColor" stroke-width="3" fill="none" opacity="0.9" />
                <!-- Small leaves -->
                <circle cx="8" cy="90" r="3" fill="currentColor" opacity="0.6" />
                <circle cx="14" cy="70" r="2.5" fill="currentColor" opacity="0.6" />
                <circle cx="9" cy="50" r="2" fill="currentColor" opacity="0.5" />
            </svg>
        </div>

        <div class="absolute bottom-0 right-[65%] text-emerald-600 opacity-48 animate-seaweed-9">
            <svg width="26" height="125" viewBox="0 0 26 125" fill="currentColor" class="drop-shadow-sm">
                <path d="M13 125 Q9 115 13 105 Q17 95 13 85 Q9 75 13 65 Q17 55 13 45 Q9 35 13 25 Q17 15 13 5" stroke="currentColor" stroke-width="3" fill="none" opacity="0.8" />
                <!-- Branched seaweed -->
                <path d="M13 100 Q18 95 23 100" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6" />
                <path d="M13 80 Q8 75 3 80" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6" />
                <path d="M13 60 Q18 55 23 60" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6" />
            </svg>
        </div>

        <div class="absolute bottom-0 left-[43%] text-teal-400 opacity-42 animate-seaweed-10">
            <svg width="18" height="95" viewBox="0 0 18 95" fill="currentColor" class="drop-shadow-sm">
                <path d="M9 95 Q5 85 9 75 Q13 65 9 55 Q5 45 9 35 Q13 25 9 15 Q5 5 9 0" stroke="currentColor" stroke-width="2.5" fill="none" opacity="0.9" />
                <!-- Sea moss texture -->
                <circle cx="7" cy="80" r="1.5" fill="currentColor" opacity="0.5" />
                <circle cx="11" cy="75" r="1" fill="currentColor" opacity="0.4" />
                <circle cx="6" cy="60" r="1" fill="currentColor" opacity="0.5" />
                <circle cx="12" cy="55" r="1.5" fill="currentColor" opacity="0.4" />
            </svg>
        </div>

        <div class="absolute bottom-0 right-[88%] text-green-400 opacity-38 animate-seaweed-11">
            <svg width="24" height="115" viewBox="0 0 24 115" fill="currentColor" class="drop-shadow-sm">
                <path d="M12 115 Q8 105 12 95 Q16 85 12 75 Q8 65 12 55 Q16 45 12 35 Q8 25 12 15 Q16 5 12 0" stroke="currentColor" stroke-width="3" fill="none" opacity="0.8" />
                <!-- Sea fern fronds -->
                <path d="M12 90 Q15 88 18 85 Q21 82 19 78" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.6" />
                <path d="M12 70 Q9 68 6 65 Q3 62 5 58" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.6" />
                <path d="M12 50 Q15 48 18 45 Q21 42 19 38" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.6" />
            </svg>
        </div>

        <div class="absolute bottom-0 left-[68%] text-emerald-500 opacity-45 animate-seaweed-12">
            <svg width="30" height="140" viewBox="0 0 30 140" fill="currentColor" class="drop-shadow-sm">
                <path d="M15 140 Q11 130 15 120 Q19 110 15 100 Q11 90 15 80 Q19 70 15 60 Q11 50 15 40 Q19 30 15 20 Q11 10 15 0" stroke="currentColor" stroke-width="3.5" fill="none" opacity="0.8" />
                <!-- Wide kelp blades -->
                <ellipse cx="10" cy="110" rx="8" ry="15" fill="currentColor" opacity="0.5" transform="rotate(-15 10 110)" />
                <ellipse cx="20" cy="85" rx="6" ry="12" fill="currentColor" opacity="0.5" transform="rotate(10 20 85)" />
                <ellipse cx="8" cy="60" rx="5" ry="10" fill="currentColor" opacity="0.4" transform="rotate(-20 8 60)" />
            </svg>
        </div>

        <!-- Coral Reefs and Anemones -->
        <div class="absolute bottom-0 left-[87%] text-orange-400 opacity-45 animate-coral-1">
            <svg width="35" height="50" viewBox="0 0 35 50" fill="currentColor" class="drop-shadow-sm">
                <!-- Brain coral -->
                <ellipse cx="17" cy="42" rx="15" ry="8" fill="currentColor" opacity="0.8" />
                <path d="M5 35 Q12 30 17 35 Q22 30 30 35" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6" />
                <path d="M7 40 Q15 37 25 40" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.5" />
            </svg>
        </div>

        <div class="absolute bottom-0 left-[92%] text-pink-400 opacity-50 animate-coral-2">
            <svg width="25" height="40" viewBox="0 0 25 40" fill="currentColor" class="drop-shadow-sm">
                <!-- Sea anemone -->
                <ellipse cx="12" cy="35" rx="8" ry="5" fill="currentColor" opacity="0.7" />
                <!-- Tentacles -->
                <path d="M8 30 Q5 25 7 20" stroke="currentColor" stroke-width="2" fill="none" opacity="0.8" />
                <path d="M12 30 Q10 23 12 18" stroke="currentColor" stroke-width="2" fill="none" opacity="0.8" />
                <path d="M16 30 Q18 25 15 20" stroke="currentColor" stroke-width="2" fill="none" opacity="0.8" />
                <path d="M10 30 Q7 22 9 17" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.7" />
                <path d="M14 30 Q17 23 14 18" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.7" />
            </svg>
        </div>

        <div class="absolute bottom-0 left-[7%] text-purple-400 opacity-42 animate-coral-1">
            <svg width="40" height="45" viewBox="0 0 40 45" fill="currentColor" class="drop-shadow-sm">
                <!-- Staghorn coral -->
                <path d="M20 45 L20 35 Q18 30 15 25 Q12 20 10 15" stroke="currentColor" stroke-width="3" fill="none" opacity="0.8" />
                <path d="M20 35 Q22 30 25 25 Q28 20 30 15" stroke="currentColor" stroke-width="3" fill="none" opacity="0.8" />
                <path d="M15 30 Q12 25 8 20" stroke="currentColor" stroke-width="2" fill="none" opacity="0.7" />
                <path d="M25 30 Q28 25 32 20" stroke="currentColor" stroke-width="2" fill="none" opacity="0.7" />
            </svg>
        </div>

        <div class="absolute bottom-0 right-[92%] text-yellow-400 opacity-48 animate-coral-2">
            <svg width="30" height="35" viewBox="0 0 30 35" fill="currentColor" class="drop-shadow-sm">
                <!-- Table coral -->
                <ellipse cx="15" cy="25" rx="12" ry="3" fill="currentColor" opacity="0.8" />
                <rect x="14" y="25" width="2" height="10" fill="currentColor" opacity="0.9" />
                <!-- Support branches -->
                <path d="M15 30 Q10 32 8 35" stroke="currentColor" stroke-width="2" fill="none" opacity="0.7" />
                <path d="M15 30 Q20 32 22 35" stroke="currentColor" stroke-width="2" fill="none" opacity="0.7" />
            </svg>
        </div>

        <!-- Sponges and Soft Corals -->
        <div class="absolute bottom-0 left-[14%] text-cyan-400 opacity-40 animate-seaweed-13">
            <svg width="20" height="60" viewBox="0 0 20 60" fill="currentColor" class="drop-shadow-sm">
                <!-- Tube sponge -->
                <ellipse cx="10" cy="50" rx="6" ry="10" fill="currentColor" opacity="0.8" />
                <ellipse cx="10" cy="40" rx="5" ry="8" fill="currentColor" opacity="0.6" />
                <ellipse cx="10" cy="30" rx="4" ry="6" fill="currentColor" opacity="0.4" />
                <!-- Openings -->
                <ellipse cx="10" cy="25" rx="2" ry="1" fill="#000000" opacity="0.5" />
                <ellipse cx="10" cy="35" rx="2.5" ry="1.5" fill="#000000" opacity="0.5" />
            </svg>
        </div>

        <div class="absolute bottom-0 right-[7%] text-magenta-400 opacity-45 animate-coral-1">
            <svg width="28" height="55" viewBox="0 0 28 55" fill="currentColor" class="drop-shadow-sm">
                <!-- Soft coral polyps -->
                <circle cx="8" cy="45" r="4" fill="currentColor" opacity="0.7" />
                <circle cx="20" cy="50" r="5" fill="currentColor" opacity="0.8" />
                <circle cx="14" cy="40" r="3.5" fill="currentColor" opacity="0.6" />
                <!-- Polyp tentacles -->
                <circle cx="8" cy="41" r="1" fill="currentColor" opacity="0.5" />
                <circle cx="20" cy="45" r="1.2" fill="currentColor" opacity="0.5" />
                <circle cx="14" cy="36" r="0.8" fill="currentColor" opacity="0.4" />
            </svg>
        </div>

        <!-- More Advanced Plant Life -->
        <div class="absolute bottom-0 left-[58%] text-teal-400 opacity-38 animate-seaweed-14">
            <svg width="42" height="90" viewBox="0 0 42 90" fill="currentColor" class="drop-shadow-sm">
                <!-- Sea palm -->
                <rect x="20" y="60" width="2" height="30" fill="currentColor" opacity="0.9" />
                <!-- Fronds -->
                <ellipse cx="15" cy="65" rx="8" ry="15" fill="currentColor" opacity="0.6" transform="rotate(-30 15 65)" />
                <ellipse cx="27" cy="65" rx="8" ry="15" fill="currentColor" opacity="0.6" transform="rotate(30 27 65)" />
                <ellipse cx="12" cy="55" rx="6" ry="12" fill="currentColor" opacity="0.5" transform="rotate(-45 12 55)" />
                <ellipse cx="30" cy="55" rx="6" ry="12" fill="currentColor" opacity="0.5" transform="rotate(45 30 55)" />
            </svg>
        </div>

        <div class="absolute bottom-0 right-[38%] text-emerald-400 opacity-41 animate-seaweed-15">
            <svg width="26" height="70" viewBox="0 0 26 70" fill="currentColor" class="drop-shadow-sm">
                <!-- Wakame seaweed -->
                <path d="M13 70 Q9 60 13 50 Q17 40 13 30 Q9 20 13 10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.8" />
                <!-- Distinctive leaf-like structures -->
                <ellipse cx="8" cy="55" rx="6" ry="8" fill="currentColor" opacity="0.5" transform="rotate(-20 8 55)" />
                <ellipse cx="18" cy="45" rx="5" ry="7" fill="currentColor" opacity="0.5" transform="rotate(15 18 45)" />
                <ellipse cx="6" cy="35" rx="4" ry="6" fill="currentColor" opacity="0.4" transform="rotate(-25 6 35)" />
                <ellipse cx="20" cy="25" rx="4" ry="5" fill="currentColor" opacity="0.4" transform="rotate(20 20 25)" />
            </svg>
        </div>

        <!-- Main Login Container -->
        <div class="flex min-h-screen items-center justify-center p-4 relative z-10">
            <!-- Login Card - Designed like a diving bell/submarine window -->
            <div class="w-full max-w-md">
                <!-- School Badge -->
                <div class="text-center mb-6">
                    <div class="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-xs font-semibold mb-3 shadow-lg animate-float">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 5.5C14.8 4.1 13.6 3 12.1 3C10.6 3 9.4 4.1 9.2 5.5L3 7V9L9.2 7.5C9.4 8.9 10.6 10 12.1 10C13.6 10 14.8 8.9 15 7.5L21 9Z" />
                        </svg>
                        <span>FLIPPER'S INTERNATIONAL SCHOOL</span>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-1">Digital Library Access</h1>
                </div>
                <!-- Submarine-style Login Window -->
                <div class="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border-4 border-blue-200 relative overflow-hidden">
                    <!-- Porthole-style decorative rings -->
                    <div class="absolute inset-0 rounded-3xl border-8 border-gradient-to-br from-blue-300 to-cyan-300 opacity-20"></div>

                    <!-- Water ripple effect on focus -->
                    <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-3xl"></div>

                    <div class="relative z-10">
                        <h2 class="text-xl font-bold mb-1 text-center text-gray-800">Welcome Back</h2>
                        <p class="text-gray-600 mb-4 text-center text-sm">Please sign in to your account</p>
                        <div v-if="errorMessage" class="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 mb-6 rounded-r">
                            <div class="flex">
                                <i class="pi pi-exclamation-circle mr-2"></i>
                                <span>{{ errorMessage }}</span>
                            </div>
                        </div>
                        <form @submit.prevent="handleLogin" class="space-y-4">
                            <div>
                                <FloatLabel variant="on" class="w-full">
                                    <InputText
                                        id="login"
                                        v-model="login"
                                        type="text"
                                        class="w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                                        :class="{ 'p-invalid border-red-300': submitted && !login }"
                                        autocomplete="username"
                                        ref="loginInput"
                                    />
                                    <label for="login" class="text-blue-600 font-medium">Username or Email</label>
                                </FloatLabel>
                                <small v-if="submitted && !login" class="p-error">Username or email is required</small>
                            </div>

                            <div>
                                <div class="flex justify-end mb-1">
                                    <router-link to="/auth/forgot-password" class="text-sm text-blue-500 hover:text-blue-700 hover:underline transition-colors">Forgot password?</router-link>
                                </div>
                                <FloatLabel variant="on" class="w-full">
                                    <Password
                                        id="password"
                                        v-model="password"
                                        class="w-full"
                                        :class="{ 'p-invalid': submitted && !password }"
                                        :feedback="false"
                                        :toggleMask="true"
                                        inputClass="w-full p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                                        autocomplete="current-password"
                                    />
                                    <label for="password" class="text-blue-600 font-medium">Password</label>
                                </FloatLabel>
                                <small v-if="submitted && !password" class="p-error">Password is required</small>
                            </div>

                            <div class="flex items-center justify-between pt-2">
                                <div class="flex items-center">
                                    <Checkbox v-model="rememberMe" inputId="rememberMe" binary class="mr-2" />
                                    <label for="rememberMe" class="text-sm text-gray-600">Remember me</label>
                                </div>
                            </div>

                            <Button class="w-full" type="submit" label="Sign In" severity="info" icon="pi pi-sign-in" :loading="loading"> </Button>
                        </form>

                        <!-- Divider -->
                        <div class="relative flex items-center my-6">
                            <div class="flex-grow border-t border-blue-200"></div>
                            <span class="flex-shrink mx-3 text-blue-400 text-sm font-medium">or continue with</span>
                            <div class="flex-grow border-t border-blue-200"></div>
                        </div>

                        <!-- Social Login Buttons -->
                        <div class="grid grid-cols-2 gap-3 mb-6">
                            <Button type="button" @click="loginWithGoogle" class="p-button-outlined border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 py-3 px-4 rounded-xl transition-all duration-300" outlined>
                                <i class="pi pi-google mr-2"></i>
                                <span>Google</span>
                            </Button>

                            <Button type="button" @click="loginWithLinkedIn" class="p-button-outlined border-2 border-cyan-300 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-400 py-3 px-4 rounded-xl transition-all duration-300" outlined>
                                <i class="pi pi-linkedin mr-2"></i>
                                <span>LinkedIn</span>
                            </Button>
                        </div>
                        <div class="text-center text-sm text-gray-600">
                            <span>New to Digital Library?</span>
                            <router-link to="/auth/register" class="text-blue-500 font-medium hover:text-blue-700 hover:underline ml-1 transition-colors"> Create an account </router-link>
                        </div>
                    </div>
                </div>
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

/* Realistic Beach Wave Animations */
@keyframes ocean-deep {
    0% {
        d: path('M0,150 C120,130 180,170 300,155 C420,140 480,180 600,165 C720,150 780,190 900,175 C1020,160 1080,200 1200,185 C1300,175 1400,195 1400,195 L1400,800 L0,800 Z');
    }
    25% {
        d: path('M0,140 C140,110 190,160 310,145 C430,130 490,170 610,155 C730,140 790,180 910,165 C1030,150 1090,190 1210,175 C1310,165 1400,185 1400,185 L1400,800 L0,800 Z');
    }
    50% {
        d: path('M0,160 C110,140 170,180 290,165 C410,150 470,190 590,175 C710,160 770,200 890,185 C1010,170 1070,210 1190,195 C1290,185 1400,205 1400,205 L1400,800 L0,800 Z');
    }
    75% {
        d: path('M0,135 C130,115 200,155 320,140 C440,125 500,165 620,150 C740,135 800,175 920,160 C1040,145 1100,185 1220,170 C1320,160 1400,180 1400,180 L1400,800 L0,800 Z');
    }
    100% {
        d: path('M0,150 C120,130 180,170 300,155 C420,140 480,180 600,165 C720,150 780,190 900,175 C1020,160 1080,200 1200,185 C1300,175 1400,195 1400,195 L1400,800 L0,800 Z');
    }
}

@keyframes ocean-mid {
    0% {
        d: path('M0,240 C80,220 160,260 280,245 C400,230 480,270 620,255 C760,240 840,280 980,265 C1120,250 1200,290 1320,275 C1350,270 1400,285 1400,285 L1400,800 L0,800 Z');
    }
    20% {
        d: path('M0,245 C90,225 170,265 290,250 C410,235 490,275 630,260 C770,245 850,285 990,270 C1130,255 1210,295 1330,280 C1360,275 1400,290 1400,290 L1400,800 L0,800 Z');
    }
    40% {
        d: path('M0,235 C70,215 150,255 270,240 C390,225 470,265 610,250 C750,235 830,275 970,260 C1110,245 1190,285 1310,270 C1340,265 1400,280 1400,280 L1400,800 L0,800 Z');
    }
    60% {
        d: path('M0,250 C100,230 180,270 300,255 C420,240 500,280 640,265 C780,250 860,290 1000,275 C1140,260 1220,300 1340,285 C1370,280 1400,295 1400,295 L1400,800 L0,800 Z');
    }
    80% {
        d: path('M0,235 C85,215 165,255 285,240 C405,225 485,265 625,250 C765,235 845,275 985,260 C1125,245 1205,285 1325,270 C1355,265 1400,280 1400,280 L1400,800 L0,800 Z');
    }
    100% {
        d: path('M0,240 C80,220 160,260 280,245 C400,230 480,270 620,255 C760,240 840,280 980,265 C1120,250 1200,290 1320,275 C1350,270 1400,285 1400,285 L1400,800 L0,800 Z');
    }
}

@keyframes ocean-surface {
    0% {
        d: path('M0,320 C60,300 140,340 220,325 C300,310 380,350 480,335 C580,320 660,360 760,345 C860,330 940,370 1040,355 C1140,340 1220,380 1320,365 C1360,360 1400,375 1400,375 L1400,800 L0,800 Z');
    }
    15% {
        d: path('M0,325 C70,305 150,345 230,330 C310,315 390,355 490,340 C590,325 670,365 770,350 C870,335 950,375 1050,360 C1150,345 1230,385 1330,370 C1370,365 1400,380 1400,380 L1400,800 L0,800 Z');
    }
    30% {
        d: path('M0,315 C50,295 130,335 210,320 C290,305 370,345 470,330 C570,315 650,355 750,340 C850,325 930,365 1030,350 C1130,335 1210,375 1310,360 C1350,355 1400,370 1400,370 L1400,800 L0,800 Z');
    }
    45% {
        d: path('M0,330 C80,310 160,350 240,335 C320,320 400,360 500,345 C600,330 680,370 780,355 C880,340 960,380 1060,365 C1160,350 1240,390 1340,375 C1380,370 1400,385 1400,385 L1400,800 L0,800 Z');
    }
    60% {
        d: path('M0,320 C65,300 145,340 225,325 C305,310 385,350 485,335 C585,320 665,360 765,345 C865,330 945,370 1045,355 C1145,340 1225,380 1325,365 C1365,360 1400,375 1400,375 L1400,800 L0,800 Z');
    }
    75% {
        d: path('M0,315 C55,295 135,335 215,320 C295,305 375,345 475,330 C575,315 655,355 755,340 C855,325 935,365 1035,350 C1135,335 1215,375 1315,360 C1355,355 1400,370 1400,370 L1400,800 L0,800 Z');
    }
    90% {
        d: path('M0,325 C75,305 155,345 235,330 C315,315 395,355 495,340 C595,325 675,365 775,350 C875,335 955,375 1055,360 C1155,345 1235,385 1335,370 C1375,365 1400,380 1400,380 L1400,800 L0,800 Z');
    }
    100% {
        d: path('M0,320 C60,300 140,340 220,325 C300,310 380,350 480,335 C580,320 660,360 760,345 C860,330 940,370 1040,355 C1140,340 1220,380 1320,365 C1360,360 1400,375 1400,375 L1400,800 L0,800 Z');
    }
}

@keyframes wave-crest {
    0% {
        d: path('M0,350 C100,335 200,365 320,350 C440,335 560,375 680,360 C800,345 920,385 1040,370 C1160,355 1280,395 1400,380 L1400,800 L0,800 Z');
        opacity: 0.6;
    }
    25% {
        d: path('M0,345 C110,330 210,360 330,345 C450,330 570,370 690,355 C810,340 930,380 1050,365 C1170,350 1290,390 1400,375 L1400,800 L0,800 Z');
        opacity: 0.7;
    }
    50% {
        d: path('M0,355 C90,340 190,370 310,355 C430,340 550,380 670,365 C790,350 910,390 1030,375 C1150,360 1270,400 1400,385 L1400,800 L0,800 Z');
        opacity: 0.5;
    }
    75% {
        d: path('M0,340 C120,325 220,355 340,340 C460,325 580,365 700,350 C820,335 940,375 1060,360 C1180,345 1300,385 1400,370 L1400,800 L0,800 Z');
        opacity: 0.8;
    }
    100% {
        d: path('M0,350 C100,335 200,365 320,350 C440,335 560,375 680,360 C800,345 920,385 1040,370 C1160,355 1280,395 1400,380 L1400,800 L0,800 Z');
        opacity: 0.6;
    }
}

/* Legacy animations for fallback */
@keyframes deep-current {
    0%,
    100% {
        transform: translateX(0%);
    }
    50% {
        transform: translateX(-20%);
    }
}

@keyframes mid-current {
    0%,
    100% {
        transform: translateX(0%);
    }
    50% {
        transform: translateX(-15%);
    }
}

@keyframes swim-login-1 {
    0%,
    100% {
        transform: rotate(15deg) translateX(0px) translateY(0px);
    }
    25% {
        transform: rotate(25deg) translateX(40px) translateY(-20px);
    }
    50% {
        transform: rotate(5deg) translateX(80px) translateY(0px);
    }
    75% {
        transform: rotate(20deg) translateX(40px) translateY(20px);
    }
}

@keyframes swim-login-2 {
    0%,
    100% {
        transform: rotate(-25deg) translateX(0px) translateY(0px);
    }
    25% {
        transform: rotate(-15deg) translateX(-30px) translateY(-15px);
    }
    50% {
        transform: rotate(-35deg) translateX(-60px) translateY(0px);
    }
    75% {
        transform: rotate(-20deg) translateX(-30px) translateY(15px);
    }
}

@keyframes bubble-rise-1 {
    0%,
    100% {
        transform: translateY(0px) scale(1);
        opacity: 0.6;
    }
    25% {
        transform: translateY(-30px) scale(1.2);
        opacity: 0.8;
    }
    50% {
        transform: translateY(-60px) scale(1.4);
        opacity: 1;
    }
    75% {
        transform: translateY(-30px) scale(1.2);
        opacity: 0.8;
    }
}

@keyframes bubble-rise-2 {
    0%,
    100% {
        transform: translateY(0px) scale(1);
        opacity: 0.7;
    }
    25% {
        transform: translateY(-25px) scale(1.25);
        opacity: 0.9;
    }
    50% {
        transform: translateY(-50px) scale(1.5);
        opacity: 1;
    }
    75% {
        transform: translateY(-25px) scale(1.25);
        opacity: 0.9;
    }
}

@keyframes bubble-rise-3 {
    0%,
    100% {
        transform: translateY(0px) scale(1);
        opacity: 0.65;
    }
    25% {
        transform: translateY(-20px) scale(1.15);
        opacity: 0.85;
    }
    50% {
        transform: translateY(-40px) scale(1.3);
        opacity: 1;
    }
    75% {
        transform: translateY(-20px) scale(1.15);
        opacity: 0.85;
    }
}

/* Dolphin animations */
@keyframes dolphin-1 {
    0%,
    100% {
        transform: rotate(-10deg) translateX(0px) translateY(0px);
    }
    25% {
        transform: rotate(0deg) translateX(50px) translateY(-30px);
    }
    50% {
        transform: rotate(10deg) translateX(100px) translateY(0px);
    }
    75% {
        transform: rotate(-5deg) translateX(50px) translateY(30px);
    }
}

@keyframes dolphin-2 {
    0%,
    100% {
        transform: rotate(15deg) translateX(0px) translateY(0px);
    }
    25% {
        transform: rotate(25deg) translateX(-40px) translateY(-25px);
    }
    50% {
        transform: rotate(5deg) translateX(-80px) translateY(0px);
    }
    75% {
        transform: rotate(20deg) translateX(-40px) translateY(25px);
    }
}

@keyframes dolphin-3 {
    0%,
    100% {
        transform: rotate(-25deg) translateX(0px) translateY(0px);
    }
    33% {
        transform: rotate(-15deg) translateX(-60px) translateY(-20px);
    }
    66% {
        transform: rotate(-35deg) translateX(-120px) translateY(10px);
    }
}

@keyframes dolphin-4 {
    0%,
    100% {
        transform: rotate(20deg) translateX(0px) translateY(0px);
    }
    30% {
        transform: rotate(30deg) translateX(45px) translateY(-15px);
    }
    60% {
        transform: rotate(10deg) translateX(90px) translateY(15px);
    }
}

@keyframes dolphin-5 {
    0%,
    100% {
        transform: rotate(-5deg) translateX(0px) translateY(0px);
    }
    40% {
        transform: rotate(5deg) translateX(70px) translateY(-25px);
    }
    80% {
        transform: rotate(-15deg) translateX(140px) translateY(0px);
    }
}

@keyframes dolphin-6 {
    0%,
    100% {
        transform: rotate(-15deg) translateX(0px) translateY(0px);
    }
    35% {
        transform: rotate(-5deg) translateX(-55px) translateY(-18px);
    }
    70% {
        transform: rotate(-25deg) translateX(-110px) translateY(12px);
    }
}

/* Fish movement animations */
@keyframes fish-1 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    25% {
        transform: translateX(30px) translateY(-15px) rotate(5deg);
    }
    50% {
        transform: translateX(60px) translateY(0px) rotate(0deg);
    }
    75% {
        transform: translateX(30px) translateY(15px) rotate(-5deg);
    }
}

@keyframes fish-2 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    33% {
        transform: translateX(-20px) translateY(-10px) rotate(-8deg);
    }
    66% {
        transform: translateX(-40px) translateY(10px) rotate(8deg);
    }
}

@keyframes fish-3 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    25% {
        transform: translateX(45px) translateY(-20px) rotate(10deg);
    }
    50% {
        transform: translateX(90px) translateY(0px) rotate(0deg);
    }
    75% {
        transform: translateX(45px) translateY(20px) rotate(-10deg);
    }
}

@keyframes fish-4 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    40% {
        transform: translateX(-35px) translateY(-12px) rotate(-6deg);
    }
    80% {
        transform: translateX(-70px) translateY(12px) rotate(6deg);
    }
}

@keyframes fish-5 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    30% {
        transform: translateX(25px) translateY(-18px) rotate(7deg);
    }
    60% {
        transform: translateX(50px) translateY(0px) rotate(0deg);
    }
    90% {
        transform: translateX(25px) translateY(18px) rotate(-7deg);
    }
}

@keyframes fish-6 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    50% {
        transform: translateX(-60px) translateY(-25px) rotate(-12deg);
    }
}

@keyframes fish-7 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    35% {
        transform: translateX(40px) translateY(-22px) rotate(9deg);
    }
    70% {
        transform: translateX(80px) translateY(0px) rotate(0deg);
    }
}

@keyframes fish-8 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    25% {
        transform: translateX(-30px) translateY(-14px) rotate(-7deg);
    }
    75% {
        transform: translateX(-60px) translateY(14px) rotate(7deg);
    }
}

@keyframes fish-9 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    40% {
        transform: translateX(35px) translateY(-16px) rotate(8deg);
    }
    80% {
        transform: translateX(70px) translateY(16px) rotate(-8deg);
    }
}

@keyframes fish-10 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    30% {
        transform: translateX(-25px) translateY(-20px) rotate(-10deg);
    }
    60% {
        transform: translateX(-50px) translateY(0px) rotate(0deg);
    }
    90% {
        transform: translateX(-25px) translateY(20px) rotate(10deg);
    }
}

@keyframes fish-11 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    45% {
        transform: translateX(50px) translateY(-18px) rotate(12deg);
    }
    90% {
        transform: translateX(100px) translateY(18px) rotate(-12deg);
    }
}

@keyframes fish-12 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    33% {
        transform: translateX(-40px) translateY(-15px) rotate(-9deg);
    }
    66% {
        transform: translateX(-80px) translateY(15px) rotate(9deg);
    }
}

@keyframes school-1 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px);
    }
    50% {
        transform: translateX(-100px) translateY(-30px);
    }
}

/* Ship movement animations */
@keyframes ship-1 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px);
    }
    50% {
        transform: translateX(30px) translateY(-5px);
    }
}

@keyframes ship-2 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px);
    }
    50% {
        transform: translateX(-25px) translateY(3px);
    }
}

@keyframes ship-3 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px);
    }
    50% {
        transform: translateX(40px) translateY(-3px);
    }
}

@keyframes ship-4 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px);
    }
    50% {
        transform: translateX(-20px) translateY(4px);
    }
}
@keyframes turtle-1 {
    0%,
    100% {
        transform: rotate(5deg) translateX(0px) translateY(0px);
    }
    25% {
        transform: rotate(15deg) translateX(20px) translateY(-10px);
    }
    50% {
        transform: rotate(-5deg) translateX(40px) translateY(0px);
    }
    75% {
        transform: rotate(10deg) translateX(20px) translateY(10px);
    }
}

@keyframes turtle-2 {
    0%,
    100% {
        transform: rotate(-15deg) translateX(0px) translateY(0px);
    }
    33% {
        transform: rotate(-5deg) translateX(-30px) translateY(-15px);
    }
    66% {
        transform: rotate(-25deg) translateX(-60px) translateY(5px);
    }
}

@keyframes turtle-3 {
    0%,
    100% {
        transform: rotate(25deg) translateX(0px) translateY(0px);
    }
    40% {
        transform: rotate(35deg) translateX(35px) translateY(-20px);
    }
    80% {
        transform: rotate(15deg) translateX(70px) translateY(10px);
    }
}

/* Enhanced ship animations with wake effects */
@keyframes ship-5 {
    0%,
    100% {
        transform: translateX(0px) translateY(0px);
    }
    50% {
        transform: translateX(-35px) translateY(2px);
    }
}

/* Seaweed movement animations */
@keyframes seaweed-1 {
    0%,
    100% {
        transform: rotate(0deg);
    }
    25% {
        transform: rotate(3deg);
    }
    75% {
        transform: rotate(-3deg);
    }
}

@keyframes seaweed-2 {
    0%,
    100% {
        transform: rotate(0deg);
    }
    33% {
        transform: rotate(-2deg);
    }
    66% {
        transform: rotate(2deg);
    }
}

@keyframes seaweed-3 {
    0%,
    100% {
        transform: rotate(0deg);
    }
    40% {
        transform: rotate(4deg);
    }
    60% {
        transform: rotate(-2deg);
    }
}

@keyframes seaweed-4 {
    0%,
    100% {
        transform: rotate(0deg);
    }
    30% {
        transform: rotate(-3deg);
    }
    70% {
        transform: rotate(3deg);
    }
}

/* Coral movement animations */
@keyframes coral-1 {
    0%,
    100% {
        transform: scale(1) rotate(0deg);
    }
    50% {
        transform: scale(1.05) rotate(1deg);
    }
}

@keyframes coral-2 {
    0%,
    100% {
        transform: scale(1) rotate(0deg);
    }
    50% {
        transform: scale(1.03) rotate(-1deg);
    }
}

@keyframes float {
    0%,
    100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
}

/* Animation classes */
.animate-ocean-deep {
    animation: ocean-deep 12s ease-in-out infinite;
}

.animate-ocean-mid {
    animation: ocean-mid 10s ease-in-out infinite 2s;
}

.animate-ocean-surface {
    animation: ocean-surface 8s ease-in-out infinite 1s;
}

.animate-wave-crest {
    animation: wave-crest 9s ease-in-out infinite 1.5s;
}

.animate-deep-current {
    animation: deep-current 18s ease-in-out infinite;
}

.animate-mid-current {
    animation: mid-current 15s ease-in-out infinite 2s;
}

.animate-swim-login-1 {
    animation: swim-login-1 8s ease-in-out infinite;
}

.animate-swim-login-2 {
    animation: swim-login-2 10s ease-in-out infinite 3s;
}

.animate-bubble-rise-1 {
    animation: bubble-rise-1 2.5s ease-in-out infinite;
}

.animate-bubble-rise-2 {
    animation: bubble-rise-2 3s ease-in-out infinite 1s;
}

.animate-bubble-rise-3 {
    animation: bubble-rise-3 2.8s ease-in-out infinite 2s;
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}

.animate-dolphin-1 {
    animation: dolphin-1 14s ease-in-out infinite;
}

.animate-dolphin-2 {
    animation: dolphin-2 16s ease-in-out infinite 2s;
}

.animate-dolphin-3 {
    animation: dolphin-3 18s ease-in-out infinite 4s;
}

.animate-dolphin-4 {
    animation: dolphin-4 12s ease-in-out infinite 1s;
}

.animate-dolphin-5 {
    animation: dolphin-5 20s ease-in-out infinite 3s;
}

.animate-dolphin-6 {
    animation: dolphin-6 15s ease-in-out infinite 5s;
}

.animate-fish-1 {
    animation: fish-1 9s ease-in-out infinite;
}

.animate-fish-2 {
    animation: fish-2 11s ease-in-out infinite 1s;
}

.animate-fish-3 {
    animation: fish-3 13s ease-in-out infinite 2s;
}

.animate-fish-4 {
    animation: fish-4 10s ease-in-out infinite 0.5s;
}

.animate-fish-5 {
    animation: fish-5 12s ease-in-out infinite 1.5s;
}

.animate-fish-6 {
    animation: fish-6 8s ease-in-out infinite 3s;
}

.animate-fish-7 {
    animation: fish-7 14s ease-in-out infinite 2.5s;
}

.animate-fish-8 {
    animation: fish-8 10s ease-in-out infinite 1s;
}

.animate-fish-9 {
    animation: fish-9 11s ease-in-out infinite 3.5s;
}

.animate-fish-10 {
    animation: fish-10 9s ease-in-out infinite 2s;
}

.animate-fish-11 {
    animation: fish-11 13s ease-in-out infinite 4s;
}

.animate-fish-12 {
    animation: fish-12 12s ease-in-out infinite 0.8s;
}

.animate-ship-1 {
    animation: ship-1 8s ease-in-out infinite;
}

.animate-ship-2 {
    animation: ship-2 10s ease-in-out infinite 2s;
}

.animate-ship-3 {
    animation: ship-3 12s ease-in-out infinite 1s;
}

.animate-ship-4 {
    animation: ship-4 9s ease-in-out infinite 3s;
}

.animate-ship-1 {
    animation: ship-1 8s ease-in-out infinite;
}

.animate-ship-2 {
    animation: ship-2 10s ease-in-out infinite 2s;
}

.animate-ship-3 {
    animation: ship-3 12s ease-in-out infinite 1s;
}

.animate-ship-5 {
    animation: ship-5 9s ease-in-out infinite 3s;
}

.animate-turtle-1 {
    animation: turtle-1 14s ease-in-out infinite;
}

.animate-turtle-2 {
    animation: turtle-2 16s ease-in-out infinite 2s;
}

.animate-turtle-3 {
    animation: turtle-3 18s ease-in-out infinite 4s;
}

.animate-seaweed-1 {
    animation: seaweed-1 4s ease-in-out infinite;
}

.animate-seaweed-2 {
    animation: seaweed-2 5s ease-in-out infinite 1s;
}

.animate-seaweed-3 {
    animation: seaweed-3 6s ease-in-out infinite 2s;
}

.animate-seaweed-4 {
    animation: seaweed-4 4.5s ease-in-out infinite 1.5s;
}

.animate-coral-1 {
    animation: coral-1 8s ease-in-out infinite;
}

.animate-coral-2 {
    animation: coral-2 7s ease-in-out infinite 2s;
}

/* Additional seaweed and plant animations */
.animate-seaweed-13 {
    animation: seaweed-1 4.2s ease-in-out infinite 0.8s;
}

.animate-seaweed-14 {
    animation: seaweed-2 5.3s ease-in-out infinite 1.2s;
}

.animate-seaweed-15 {
    animation: seaweed-3 6.1s ease-in-out infinite 2.3s;
}

.animate-seaweed-16 {
    animation: seaweed-4 4.8s ease-in-out infinite 1.8s;
}

.animate-seaweed-17 {
    animation: seaweed-1 3.9s ease-in-out infinite 2.1s;
}

.animate-seaweed-18 {
    animation: seaweed-2 5.7s ease-in-out infinite 0.5s;
}

.animate-seaweed-19 {
    animation: seaweed-3 6.4s ease-in-out infinite 3.2s;
}

.animate-seaweed-20 {
    animation: seaweed-4 4.3s ease-in-out infinite 2.7s;
}

.animate-seaweed-21 {
    animation: seaweed-1 5.1s ease-in-out infinite 1.9s;
}

.animate-seaweed-22 {
    animation: seaweed-2 6.8s ease-in-out infinite 0.3s;
}

.animate-seaweed-23 {
    animation: seaweed-3 4.6s ease-in-out infinite 2.5s;
}

.animate-seaweed-24 {
    animation: seaweed-4 5.4s ease-in-out infinite 1.1s;
}

/* Interactive effects */
.login-page input:focus {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: scale(1.01);
}

.login-page .p-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.25);
}

/* Submarine window effect */
.login-page .bg-white\/95 {
    backdrop-filter: blur(10px);
    box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Floating elements on hover */
.login-page .bg-white\/95:hover {
    transform: translateY(-2px);
    transition: all 0.3s ease;
}

/* Ocean depth effect */
.login-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
        radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.1) 0%, transparent 60%), radial-gradient(ellipse at 100% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 60%), radial-gradient(ellipse at 0% 50%, rgba(8, 145, 178, 0.1) 0%, transparent 60%);
    pointer-events: none;
}

/* Ripple effect for buttons */
.login-page .p-button {
    position: relative;
    overflow: hidden;
}

.login-page .p-button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition:
        width 0.6s,
        height 0.6s;
}

.login-page .p-button:active::before {
    width: 300px;
    height: 300px;
}
</style>
