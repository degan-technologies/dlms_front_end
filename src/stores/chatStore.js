import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatStore = defineStore('chat', () => {
    // Chat states
    const isChatOpen = ref(false);
    const isTawkOpen = ref(false);

    // Chat actions
    const openChat = () => {
        isChatOpen.value = true;
        closeTawk(); // Close Tawk when opening custom chat
    };

    const closeChat = () => {
        isChatOpen.value = false;
    };

    const toggleChat = () => {
        if (isChatOpen.value) {
            closeChat();
        } else {
            openChat();
        }
    };

    // Tawk.to actions
    const openTawk = () => {
        if (window.Tawk_API?.maximize) {
            window.Tawk_API.maximize();
            isTawkOpen.value = true;
            closeChat(); // Close custom chat when opening Tawk
        }
    };

    const closeTawk = () => {
        if (window.Tawk_API?.hideWidget) {
            window.Tawk_API.hideWidget();
            isTawkOpen.value = false;
        }
    };

    const toggleTawk = (visible = true) => {
        if (window.Tawk_API?.toggleVisibility) {
            if (visible) {
                window.Tawk_API.showWidget();
                isTawkOpen.value = true;
            } else {
                window.Tawk_API.hideWidget();
                isTawkOpen.value = false;
            }
        }
    };

    return {
        // States
        isChatOpen,
        isTawkOpen,
        
        // Actions
        openChat,
        closeChat,
        toggleChat,
        openTawk,
        closeTawk,
        toggleTawk
    };
});