<script setup></script>

<template>
    <!-- Ocean-themed Hero Section for Flipper's International School -->
    <section class="relative bg-white overflow-hidden">
        <!-- Water-themed Background -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50"></div>
        <!-- Horizontal Water Waves Background -->
        <div class="absolute inset-0 opacity-35">
            <svg class="absolute w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
                <defs>
                    <!-- Horizontal wave gradients for depth -->
                    <linearGradient id="deepWave" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color: #1e40af; stop-opacity: 0.4" />
                        <stop offset="30%" style="stop-color: #3b82f6; stop-opacity: 0.5" />
                        <stop offset="70%" style="stop-color: #06b6d4; stop-opacity: 0.4" />
                        <stop offset="100%" style="stop-color: #0891b2; stop-opacity: 0.3" />
                    </linearGradient>
                    <linearGradient id="surfaceWave" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color: #06b6d4; stop-opacity: 0.3" />
                        <stop offset="50%" style="stop-color: #0891b2; stop-opacity: 0.4" />
                        <stop offset="100%" style="stop-color: #0e7490; stop-opacity: 0.3" />
                    </linearGradient>
                    <linearGradient id="shallowWave" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color: #67e8f9; stop-opacity: 0.25" />
                        <stop offset="50%" style="stop-color: #22d3ee; stop-opacity: 0.35" />
                        <stop offset="100%" style="stop-color: #06b6d4; stop-opacity: 0.25" />
                    </linearGradient>
                </defs>
                <!-- Multiple horizontal wave layers -->
                <path d="M0,180 C300,120 400,220 800,170 C1000,140 1200,200 1200,200 L1200,0 L0,0 Z" fill="url(#deepWave)" class="animate-wave-horizontal-1" />
                <path d="M0,160 C320,100 420,200 800,150 C1000,120 1200,180 1200,180 L1200,0 L0,0 Z" fill="url(#surfaceWave)" class="animate-wave-horizontal-2" />
                <path d="M0,200 C280,140 500,240 900,190 C1100,160 1200,220 1200,220 L1200,0 L0,0 Z" fill="url(#shallowWave)" class="animate-wave-horizontal-3" />
            </svg>
        </div>
        <!-- Water Splashes and Bubbles -->
        <div class="absolute top-32 left-2/3 w-4 h-4 bg-blue-200 rounded-full opacity-60 animate-splash-bubble"></div>
        <div class="absolute top-48 left-1/2 w-6 h-6 bg-cyan-200 rounded-full opacity-50 animate-splash-big"></div>
        <div class="absolute bottom-20 left-3/4 w-3 h-3 bg-teal-200 rounded-full opacity-40 animate-splash-medium"></div>
        <div class="absolute top-72 right-2/3 w-5 h-5 bg-blue-100 rounded-full opacity-35 animate-splash-bubble"></div>
        <div class="absolute bottom-60 left-2/3 w-7 h-7 bg-cyan-100 rounded-full opacity-45 animate-splash-big"></div>
        <!-- Realistic Flippers Paradise - Much Bigger Professional Swimmers -->
        <div class="absolute top-1/3 right-1/4 text-blue-500 opacity-80 animate-swim-flipper-1">
            <svg width="180" height="180" viewBox="0 0 200 200" fill="currentColor" class="drop-shadow-2xl">
                <g transform="rotate(-15 100 100)">
                    <!-- Swimmer Body -->
                    <ellipse cx="100" cy="80" rx="12" ry="35" fill="currentColor" opacity="0.9" />
                    <!-- Head -->
                    <circle cx="100" cy="45" r="8" fill="currentColor" opacity="0.95" />
                    <!-- Arms in swimming position -->
                    <ellipse cx="80" cy="65" rx="25" ry="6" fill="currentColor" opacity="0.8" />
                    <ellipse cx="120" cy="95" rx="25" ry="6" fill="currentColor" opacity="0.8" />
                    <!-- Legs with flippers -->
                    <ellipse cx="92" cy="115" rx="4" ry="20" fill="currentColor" opacity="0.9" />
                    <ellipse cx="108" cy="115" rx="4" ry="20" fill="currentColor" opacity="0.9" />
                    <!-- Large Detailed Flippers -->
                    <ellipse cx="92" cy="140" rx="18" ry="6" fill="currentColor" opacity="0.7" />
                    <ellipse cx="108" cy="140" rx="18" ry="6" fill="currentColor" opacity="0.7" />
                    <!-- Flipper details -->
                    <ellipse cx="92" cy="140" rx="14" ry="4" fill="currentColor" opacity="0.5" />
                    <ellipse cx="108" cy="140" rx="14" ry="4" fill="currentColor" opacity="0.5" />
                </g>
            </svg>
        </div>

        <div class="absolute top-2/3 left-1/4 text-cyan-500 opacity-75 animate-swim-flipper-2">
            <svg width="140" height="140" viewBox="0 0 200 200" fill="currentColor" class="drop-shadow-2xl">
                <g transform="rotate(20 100 100)">
                    <!-- Swimmer Body -->
                    <ellipse cx="100" cy="80" rx="10" ry="28" fill="currentColor" opacity="0.9" />
                    <!-- Head -->
                    <circle cx="100" cy="50" r="7" fill="currentColor" opacity="0.95" />
                    <!-- Arms -->
                    <ellipse cx="85" cy="70" rx="20" ry="5" fill="currentColor" opacity="0.8" />
                    <ellipse cx="115" cy="90" rx="20" ry="5" fill="currentColor" opacity="0.8" />
                    <!-- Legs with flippers -->
                    <ellipse cx="95" cy="108" rx="3.5" ry="16" fill="currentColor" opacity="0.9" />
                    <ellipse cx="105" cy="108" rx="3.5" ry="16" fill="currentColor" opacity="0.9" />
                    <!-- Large Flippers -->
                    <ellipse cx="95" cy="128" rx="15" ry="5" fill="currentColor" opacity="0.7" />
                    <ellipse cx="105" cy="128" rx="15" ry="5" fill="currentColor" opacity="0.7" />
                    <!-- Flipper details -->
                    <ellipse cx="95" cy="128" rx="12" ry="3" fill="currentColor" opacity="0.5" />
                    <ellipse cx="105" cy="128" rx="12" ry="3" fill="currentColor" opacity="0.5" />
                </g>
            </svg>
        </div>

        <!-- Additional Large Background Swimmers -->
        <div class="absolute top-1/2 left-1/6 text-teal-400 opacity-40 animate-swim-flipper-3">
            <svg width="120" height="120" viewBox="0 0 200 200" fill="currentColor" class="drop-shadow-lg">
                <g transform="rotate(-30 100 100)">
                    <!-- Background swimmer -->
                    <ellipse cx="100" cy="80" rx="8" ry="24" fill="currentColor" opacity="0.8" />
                    <circle cx="100" cy="58" r="6" fill="currentColor" opacity="0.9" />
                    <ellipse cx="88" cy="70" rx="18" ry="4" fill="currentColor" opacity="0.7" />
                    <ellipse cx="112" cy="90" rx="18" ry="4" fill="currentColor" opacity="0.7" />
                    <ellipse cx="96" cy="104" rx="3" ry="14" fill="currentColor" opacity="0.8" />
                    <ellipse cx="104" cy="104" rx="3" ry="14" fill="currentColor" opacity="0.8" />
                    <!-- Large flippers -->
                    <ellipse cx="96" cy="122" rx="13" ry="4" fill="currentColor" opacity="0.6" />
                    <ellipse cx="104" cy="122" rx="13" ry="4" fill="currentColor" opacity="0.6" />
                </g>
            </svg>
        </div>

        <!-- Much Bigger Boats and Ships -->
        <div class="absolute top-16 right-1/4 text-blue-400 opacity-60 animate-boat-drift">
            <svg width="120" height="80" viewBox="0 0 150 90" fill="currentColor" class="drop-shadow-xl">
                <!-- Large Boat Hull -->
                <path d="M15,60 Q75,45 135,60 L130,75 Q75,65 20,75 Z" fill="currentColor" opacity="0.8" />
                <!-- Mast -->
                <rect x="72" y="15" width="3" height="45" fill="currentColor" opacity="0.9" />
                <!-- Large Sail -->
                <path d="M40,20 Q75,10 75,50 Q65,35 40,50 Z" fill="currentColor" opacity="0.6" />
                <!-- Additional sail details -->
                <path d="M50,25 Q70,20 70,45 Q65,35 50,45 Z" fill="currentColor" opacity="0.4" />
                <!-- Boat details -->
                <rect x="60" y="50" width="30" height="8" rx="2" fill="currentColor" opacity="0.7" />
            </svg>
        </div>

        <div class="absolute top-32 left-1/5 text-teal-400 opacity-50 animate-ship-cruise">
            <svg width="160" height="100" viewBox="0 0 200 120" fill="currentColor" class="drop-shadow-xl">
                <!-- Large Ship Hull -->
                <path d="M20,75 Q100,60 180,75 L175,90 Q100,80 25,90 Z" fill="currentColor" opacity="0.8" />
                <!-- Ship Structure -->
                <rect x="60" y="40" width="80" height="35" rx="3" fill="currentColor" opacity="0.7" />
                <!-- Multiple Chimneys -->
                <rect x="85" y="25" width="6" height="20" fill="currentColor" opacity="0.9" />
                <rect x="105" y="20" width="5" height="25" fill="currentColor" opacity="0.9" />
                <rect x="120" y="28" width="4" height="17" fill="currentColor" opacity="0.9" />
                <!-- Ship windows -->
                <rect x="70" y="50" width="60" height="4" rx="1" fill="currentColor" opacity="0.5" />
                <rect x="70" y="58" width="60" height="4" rx="1" fill="currentColor" opacity="0.5" />
                <!-- Deck details -->
                <rect x="65" y="70" width="70" height="3" rx="1" fill="currentColor" opacity="0.6" />
            </svg>
        </div>

        <!-- Background Large Ships -->
        <div class="absolute top-20 left-1/2 text-blue-300 opacity-35 animate-ship-background">
            <svg width="100" height="60" viewBox="0 0 140 80" fill="currentColor">
                <!-- Background ship -->
                <path d="M10,50 Q70,40 130,50 L125,60 Q70,55 15,60 Z" fill="currentColor" opacity="0.7" />
                <rect x="50" y="30" width="40" height="20" rx="2" fill="currentColor" opacity="0.6" />
                <rect x="65" y="20" width="3" height="15" fill="currentColor" opacity="0.8" />
                <rect x="75" y="18" width="2" height="17" fill="currentColor" opacity="0.8" />
            </svg>
        </div>

        <!-- Water Splashes from Flippers -->
        <div class="absolute top-1/3 right-1/4 transform translate-x-12 -translate-y-8">
            <div class="w-6 h-6 bg-blue-300 rounded-full opacity-50 animate-flipper-splash-1"></div>
        </div>
        <div class="absolute top-1/3 right-1/4 transform translate-x-16 translate-y-4">
            <div class="w-4 h-4 bg-cyan-300 rounded-full opacity-60 animate-flipper-splash-2"></div>
        </div>
        <div class="absolute top-2/3 left-1/3 transform translate-x-8 translate-y-6">
            <div class="w-5 h-5 bg-teal-300 rounded-full opacity-55 animate-flipper-splash-3"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <!-- Left Content -->
                <div class="text-center lg:text-left">
                    <!-- School Badge -->
                    <div class="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 5.5C14.8 4.1 13.6 3 12.1 3C10.6 3 9.4 4.1 9.2 5.5L3 7V9L9.2 7.5C9.4 8.9 10.6 10 12.1 10C13.6 10 14.8 8.9 15 7.5L21 9Z" />
                        </svg>
                        <span>FLIPPER'S INTERNATIONAL SCHOOL</span>
                    </div>

                    <!-- Main Heading -->
                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        Dive into
                        <span class="text-blue-600"> Learning </span>
                    </h1>

                    <!-- Subheading -->
                    <p class="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">Swim through knowledge at Flipper's International School. Explore our ocean of resources and make waves in your education.</p>

                    <!-- CTA Buttons -->
                    <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button class="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                            Start Learning
                        </button>
                        <button class="px-8 py-4 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold rounded-lg text-lg transition-all duration-200">Explore Resources</button>
                    </div>

                    <!-- Simple Stats -->
                    <div class="flex justify-center lg:justify-start gap-8 mt-12 pt-8 border-t border-gray-200">
                        <div class="text-center lg:text-left">
                            <div class="text-2xl font-bold text-blue-600">10K+</div>
                            <div class="text-sm text-gray-500">Resources</div>
                        </div>
                        <div class="text-center lg:text-left">
                            <div class="text-2xl font-bold text-blue-600">5K+</div>
                            <div class="text-sm text-gray-500">Students</div>
                        </div>
                        <div class="text-center lg:text-left">
                            <div class="text-2xl font-bold text-blue-600">50+</div>
                            <div class="text-sm text-gray-500">Subjects</div>
                        </div>
                    </div>
                </div>

                <!-- Right Content - Visual Elements -->
                <div class="relative">
                    <!-- Main Image Container -->
                    <div class="relative">
                        <!-- Background Card -->
                        <div class="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl transform rotate-3 scale-105"></div>

                        <!-- Main Image -->
                        <div class="relative bg-white rounded-2xl p-6 shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Students learning at Flipper's International School"
                                class="w-full h-80 object-cover rounded-xl"
                            />

                            <!-- Floating Cards -->
                            <div class="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 transform -rotate-6">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <i class="pi pi-book text-green-600"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-gray-900">E-Books</div>
                                        <div class="text-sm text-gray-600">5,000+ titles</div>
                                    </div>
                                </div>
                            </div>

                            <div class="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 transform rotate-6">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <i class="pi pi-play text-purple-600"></i>
                                    </div>
                                    <div>
                                        <div class="font-bold text-gray-900">Videos</div>
                                        <div class="text-sm text-gray-600">2,000+ hours</div>
                                    </div>
                                </div>
                            </div>

                            <div class="absolute top-1/2 -right-8 bg-white rounded-lg shadow-lg p-3 transform -translate-y-1/2">
                                <div class="flex items-center gap-2">
                                    <div class="flex -space-x-2">
                                        <img class="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Student 1" />
                                        <img class="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108755-2616b612b1e0?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Student 2" />
                                        <img class="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Student 3" />
                                    </div>
                                    <div class="text-xs font-medium text-gray-900">1000+ learners</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Bottom Wave -->
        <div class="absolute bottom-0 left-0 w-full overflow-hidden">
            <svg class="relative block w-full h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
            </svg>
        </div>
    </section>
</template>

<style scoped>
/* Horizontal Wave Animations */
@keyframes wave-horizontal-1 {
    0%,
    100% {
        transform: translateX(0%);
    }
    50% {
        transform: translateX(-15%);
    }
}

@keyframes wave-horizontal-2 {
    0%,
    100% {
        transform: translateX(0%);
    }
    50% {
        transform: translateX(-20%);
    }
}

@keyframes wave-horizontal-3 {
    0%,
    100% {
        transform: translateX(0%);
    }
    50% {
        transform: translateX(-10%);
    }
}

/* Flipper Swimming Animations */
@keyframes swim-flipper-1 {
    0%,
    100% {
        transform: rotate(-15deg) translateX(0px) translateY(0px);
    }
    25% {
        transform: rotate(-10deg) translateX(15px) translateY(-8px);
    }
    50% {
        transform: rotate(-20deg) translateX(30px) translateY(0px);
    }
    75% {
        transform: rotate(-15deg) translateX(15px) translateY(8px);
    }
}

@keyframes swim-flipper-2 {
    0%,
    100% {
        transform: rotate(20deg) translateX(0px) translateY(0px);
    }
    25% {
        transform: rotate(25deg) translateX(-12px) translateY(-6px);
    }
    50% {
        transform: rotate(15deg) translateX(-25px) translateY(0px);
    }
    75% {
        transform: rotate(20deg) translateX(-12px) translateY(6px);
    }
}

@keyframes swim-flipper-3 {
    0%,
    100% {
        transform: rotate(-30deg) translateX(0px) translateY(0px);
    }
    25% {
        transform: rotate(-25deg) translateX(20px) translateY(-10px);
    }
    50% {
        transform: rotate(-35deg) translateX(40px) translateY(0px);
    }
    75% {
        transform: rotate(-30deg) translateX(20px) translateY(10px);
    }
}

/* Large Ship and Boat Animations */
@keyframes boat-drift {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    25% {
        transform: translateX(10px) translateY(-3px) rotate(1deg);
    }
    50% {
        transform: translateX(20px) translateY(0px) rotate(0deg);
    }
    75% {
        transform: translateX(10px) translateY(3px) rotate(-1deg);
    }
}

@keyframes ship-cruise {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    25% {
        transform: translateX(-8px) translateY(-2px) rotate(-0.5deg);
    }
    50% {
        transform: translateX(-15px) translateY(0px) rotate(0deg);
    }
    75% {
        transform: translateX(-8px) translateY(2px) rotate(0.5deg);
    }
}

@keyframes ship-background {
    0%,
    100% {
        transform: translateX(0px) translateY(0px) rotate(0deg);
    }
    25% {
        transform: translateX(-5px) translateY(-1px) rotate(-0.3deg);
    }
    50% {
        transform: translateX(-10px) translateY(0px) rotate(0deg);
    }
    75% {
        transform: translateX(-5px) translateY(1px) rotate(0.3deg);
    }
}

/* Water Splash Animations */
@keyframes splash-bubble {
    0%,
    100% {
        transform: scale(1) translateY(0px);
        opacity: 0.6;
    }
    25% {
        transform: scale(1.3) translateY(-5px);
        opacity: 0.8;
    }
    50% {
        transform: scale(1.6) translateY(-10px);
        opacity: 1;
    }
    75% {
        transform: scale(1.3) translateY(-5px);
        opacity: 0.8;
    }
}

@keyframes splash-big {
    0%,
    100% {
        transform: scale(1) translateY(0px);
        opacity: 0.5;
    }
    25% {
        transform: scale(1.4) translateY(-8px);
        opacity: 0.7;
    }
    50% {
        transform: scale(1.8) translateY(-15px);
        opacity: 0.9;
    }
    75% {
        transform: scale(1.4) translateY(-8px);
        opacity: 0.7;
    }
}

@keyframes splash-medium {
    0%,
    100% {
        transform: scale(1) translateY(0px);
        opacity: 0.4;
    }
    25% {
        transform: scale(1.2) translateY(-4px);
        opacity: 0.6;
    }
    50% {
        transform: scale(1.5) translateY(-8px);
        opacity: 0.8;
    }
    75% {
        transform: scale(1.2) translateY(-4px);
        opacity: 0.6;
    }
}

/* Flipper Splash Effects */
@keyframes flipper-splash-1 {
    0%,
    100% {
        transform: scale(1) translateY(0px) translateX(0px);
        opacity: 0.5;
    }
    25% {
        transform: scale(1.3) translateY(-6px) translateX(2px);
        opacity: 0.7;
    }
    50% {
        transform: scale(1.6) translateY(-12px) translateX(4px);
        opacity: 0.9;
    }
    75% {
        transform: scale(1.3) translateY(-6px) translateX(2px);
        opacity: 0.7;
    }
}

@keyframes flipper-splash-2 {
    0%,
    100% {
        transform: scale(1) translateY(0px) translateX(0px);
        opacity: 0.6;
    }
    25% {
        transform: scale(1.2) translateY(-4px) translateX(-2px);
        opacity: 0.8;
    }
    50% {
        transform: scale(1.4) translateY(-8px) translateX(-4px);
        opacity: 1;
    }
    75% {
        transform: scale(1.2) translateY(-4px) translateX(-2px);
        opacity: 0.8;
    }
}

@keyframes flipper-splash-3 {
    0%,
    100% {
        transform: scale(1) translateY(0px) translateX(0px);
        opacity: 0.55;
    }
    25% {
        transform: scale(1.25) translateY(-5px) translateX(1px);
        opacity: 0.75;
    }
    50% {
        transform: scale(1.5) translateY(-10px) translateX(2px);
        opacity: 0.95;
    }
    75% {
        transform: scale(1.25) translateY(-5px) translateX(1px);
        opacity: 0.75;
    }
}

@keyframes float-delayed {
    0%,
    100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-15px);
    }
}

@keyframes float-slow {
    0%,
    100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-8px);
    }
}

@keyframes wave {
    0%,
    100% {
        transform: translateX(0%);
    }
    50% {
        transform: translateX(-25%);
    }
}

@keyframes wave-slow {
    0%,
    100% {
        transform: translateX(0%);
    }
    50% {
        transform: translateX(-15%);
    }
}

@keyframes swim {
    0%,
    100% {
        transform: translateX(0px) translateY(0px);
    }
    25% {
        transform: translateX(10px) translateY(-5px);
    }
    50% {
        transform: translateX(20px) translateY(0px);
    }
    75% {
        transform: translateX(10px) translateY(5px);
    }
}

@keyframes swim-reverse {
    0%,
    100% {
        transform: translateX(0px) translateY(0px);
    }
    25% {
        transform: translateX(-10px) translateY(5px);
    }
    50% {
        transform: translateX(-20px) translateY(0px);
    }
    75% {
        transform: translateX(-10px) translateY(-5px);
    }
}

@keyframes swim-slow {
    0%,
    100% {
        transform: translateX(0px) translateY(0px);
    }
    25% {
        transform: translateX(5px) translateY(-3px);
    }
    50% {
        transform: translateX(10px) translateY(0px);
    }
    75% {
        transform: translateX(5px) translateY(3px);
    }
}

@keyframes swim-reverse-slow {
    0%,
    100% {
        transform: translateX(0px) translateY(0px);
    }
    25% {
        transform: translateX(-5px) translateY(3px);
    }
    50% {
        transform: translateX(-10px) translateY(0px);
    }
    75% {
        transform: translateX(-5px) translateY(-3px);
    }
}

@keyframes dive-big {
    0%,
    100% {
        transform: translateY(-50%) translateX(0px) rotate(0deg);
    }
    25% {
        transform: translateY(-45%) translateX(15px) rotate(-5deg);
    }
    50% {
        transform: translateY(-55%) translateX(30px) rotate(-10deg);
    }
    75% {
        transform: translateY(-45%) translateX(15px) rotate(-5deg);
    }
}

@keyframes wave-deep {
    0%,
    100% {
        transform: translateX(0%);
    }
    50% {
        transform: translateX(-20%);
    }
}

@keyframes current-flow {
    0%,
    100% {
        transform: translateX(-100%);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: translateX(100%);
        opacity: 0;
    }
}

@keyframes current-flow-reverse {
    0%,
    100% {
        transform: translateX(100%);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: translateX(-100%);
        opacity: 0;
    }
}

@keyframes splash-1 {
    0%,
    100% {
        transform: translateY(0px) translateX(0px) scale(1);
        opacity: 0.4;
    }
    25% {
        transform: translateY(-8px) translateX(2px) scale(1.2);
        opacity: 0.6;
    }
    50% {
        transform: translateY(-12px) translateX(4px) scale(1.4);
        opacity: 0.8;
    }
    75% {
        transform: translateY(-8px) translateX(2px) scale(1.2);
        opacity: 0.6;
    }
}

@keyframes splash-2 {
    0%,
    100% {
        transform: translateY(0px) translateX(0px) scale(1);
        opacity: 0.5;
    }
    25% {
        transform: translateY(-6px) translateX(-3px) scale(1.3);
        opacity: 0.7;
    }
    50% {
        transform: translateY(-10px) translateX(-6px) scale(1.5);
        opacity: 0.9;
    }
    75% {
        transform: translateY(-6px) translateX(-3px) scale(1.3);
        opacity: 0.7;
    }
}

@keyframes splash-3 {
    0%,
    100% {
        transform: translateY(0px) translateX(0px) scale(1);
        opacity: 0.6;
    }
    25% {
        transform: translateY(-4px) translateX(1px) scale(1.1);
        opacity: 0.8;
    }
    50% {
        transform: translateY(-8px) translateX(2px) scale(1.3);
        opacity: 1;
    }
    75% {
        transform: translateY(-4px) translateX(1px) scale(1.1);
        opacity: 0.8;
    }
}

@keyframes ripple {
    0%,
    100% {
        transform: scale(1);
        opacity: 0.2;
    }
    50% {
        transform: scale(1.1);
        opacity: 0.4;
    }
}

@keyframes ripple-delayed {
    0%,
    100% {
        transform: scale(1);
        opacity: 0.15;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.3;
    }
}

@keyframes sway {
    0%,
    100% {
        transform: rotate(-2deg);
    }
    50% {
        transform: rotate(2deg);
    }
}

@keyframes sway-reverse {
    0%,
    100% {
        transform: rotate(2deg);
    }
    50% {
        transform: rotate(-2deg);
    }
}

@keyframes sway-slow {
    0%,
    100% {
        transform: rotate(-1deg);
    }
    50% {
        transform: rotate(1deg);
    }
}

.animate-float {
    animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
    animation: float-delayed 4s ease-in-out infinite;
}

.animate-float-slow {
    animation: float-slow 5s ease-in-out infinite;
}

.animate-wave {
    animation: wave 8s ease-in-out infinite;
}

.animate-wave-slow {
    animation: wave-slow 12s ease-in-out infinite;
}

.animate-wave-deep {
    animation: wave-deep 15s ease-in-out infinite;
}

.animate-swim {
    animation: swim 6s ease-in-out infinite;
}

.animate-swim-reverse {
    animation: swim-reverse 7s ease-in-out infinite;
}

.animate-swim-slow {
    animation: swim-slow 8s ease-in-out infinite;
}

.animate-swim-reverse-slow {
    animation: swim-reverse-slow 9s ease-in-out infinite;
}

.animate-dive-big {
    animation: dive-big 10s ease-in-out infinite;
}

.animate-current-flow {
    animation: current-flow 8s linear infinite;
}

.animate-current-flow-reverse {
    animation: current-flow-reverse 12s linear infinite;
}

.animate-splash-1 {
    animation: splash-1 2s ease-in-out infinite;
}

.animate-splash-2 {
    animation: splash-2 2.5s ease-in-out infinite 0.3s;
}

.animate-splash-3 {
    animation: splash-3 3s ease-in-out infinite 0.6s;
}

.animate-ripple {
    animation: ripple 4s ease-in-out infinite;
}

.animate-ripple-delayed {
    animation: ripple-delayed 5s ease-in-out infinite 1s;
}

.animate-sway {
    animation: sway 4s ease-in-out infinite;
}

.animate-sway-reverse {
    animation: sway-reverse 5s ease-in-out infinite;
}

.animate-sway-slow {
    animation: sway-slow 6s ease-in-out infinite;
}

/* Animation Classes */
.animate-wave-horizontal-1 {
    animation: wave-horizontal-1 8s ease-in-out infinite;
}

.animate-wave-horizontal-2 {
    animation: wave-horizontal-2 12s ease-in-out infinite 1s;
}

.animate-wave-horizontal-3 {
    animation: wave-horizontal-3 15s ease-in-out infinite 2s;
}

.animate-swim-flipper-1 {
    animation: swim-flipper-1 8s ease-in-out infinite;
}

.animate-swim-flipper-2 {
    animation: swim-flipper-2 9s ease-in-out infinite 1s;
}

.animate-swim-flipper-3 {
    animation: swim-flipper-3 10s ease-in-out infinite 2s;
}

.animate-boat-drift {
    animation: boat-drift 12s ease-in-out infinite;
}

.animate-ship-cruise {
    animation: ship-cruise 15s ease-in-out infinite 2s;
}

.animate-ship-background {
    animation: ship-background 18s ease-in-out infinite 3s;
}

.animate-splash-bubble {
    animation: splash-bubble 2s ease-in-out infinite;
}

.animate-splash-big {
    animation: splash-big 3s ease-in-out infinite 0.5s;
}

.animate-splash-medium {
    animation: splash-medium 2.5s ease-in-out infinite 1s;
}

.animate-flipper-splash-1 {
    animation: flipper-splash-1 2s ease-in-out infinite;
}

.animate-flipper-splash-2 {
    animation: flipper-splash-2 2.5s ease-in-out infinite 0.3s;
}

.animate-flipper-splash-3 {
    animation: flipper-splash-3 3s ease-in-out infinite 0.6s;
}

/* Custom hover effects */
.hero-card:hover {
    transform: translateY(-4px);
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
