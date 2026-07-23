// src/store/toast.store.js
import { ref } from 'vue';

const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('info');
const toastDuration = ref(3000);

export function useToast() {
    const show = (message, type = 'info', duration = 3000) => {
        toastMessage.value = message;
        toastType.value = type;
        toastDuration.value = duration;
        showToast.value = true;

        setTimeout(() => {
            showToast.value = false;
        }, duration);
    };

    return {
        show,
        showToast,
        toastMessage,
        toastType,
        toastDuration,
    };
}
