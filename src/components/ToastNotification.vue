<template>
    <transition name="slide-fade">
        <div v-if="visible && toastMessage" :class="['toast', typeClass]" @mouseenter="pauseTimer" @mouseleave="resumeTimer">
            <span class="toast-message">{{ toastMessage }}</span>
            <div class="toast-timer-bar" :style="{ width: timerWidth + '%' }"></div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { useToast } from '@/stores/toast.store';
import { computed, ref, watch } from 'vue';

const { showToast, toastMessage, toastType, toastDuration } = useToast();

const visible = ref(false);
const timerWidth = ref(100);

const typeClass = computed(
    () =>
        ({
            success: 'toast-success',
            error: 'toast-error',
            info: 'toast-info',
            warning: 'toast-warning'
        })[toastType.value || 'info']
);

let intervalId: ReturnType<typeof setInterval> | null = null;
let elapsed = 0;
const interval = 30;
let isPaused = false;

const startTimer = () => {
    const total = toastDuration.value || 3000;
    clearInterval(intervalId!);
    elapsed = 0;

    intervalId = setInterval(() => {
        if (!isPaused) {
            elapsed += interval;
            timerWidth.value = Math.max(0, 100 - (elapsed / total) * 100);
            if (elapsed >= total) {
                visible.value = false;
                clearInterval(intervalId!);
            }
        }
    }, interval);
};

const pauseTimer = () => {
    isPaused = true;
};
const resumeTimer = () => {
    isPaused = false;
};

// Khi có showToast, hiển thị toast và reset thanh thời gian
watch(showToast, (val) => {
    if (val) {
        visible.value = true;
        timerWidth.value = 100;
        startTimer();
    }
});
</script>

<style scoped>
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    min-width: 280px;
    width: max-content;
    max-width: 400px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    color: white;
    font-size: 14px;
    opacity: 1;
    animation: fadein 0.4s ease-out;
    transform: translateY(0);
    overflow: hidden;
}

.toast-message {
    word-break: break-word;
}

.toast-success {
    background-color: #16a34a;
}

.toast-error {
    background-color: #dc2626;
}

.toast-info {
    background-color: #2563eb;
}

.toast-warning {
    background-color: #facc15;
    color: black;
}

.toast-timer-bar {
    height: 4px;
    background-color: rgba(255, 255, 255, 0.6);
    transition: width 0.1s linear;
    border-radius: 2px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition:
        opacity 0.4s ease,
        transform 0.4s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateX(40px) scale(0.95);
}

@keyframes fadein {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
