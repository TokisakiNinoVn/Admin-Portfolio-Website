<template>
  <div class="login-wrapper">
    <!-- Background decorative blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <div class="login-card">
      <!-- Step indicator -->
      <div class="step-indicator">
        <div
          v-for="i in 3"
          :key="i"
          class="step-dot"
          :class="{ active: step >= i, current: step === i }"
        ></div>
      </div>

      <!-- Header -->
      <div class="header">
        <!-- Icon per step -->
        <div class="step-icon">
          <svg v-if="step === 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <svg v-if="step === 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <svg v-if="step === 3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h2 class="title">
          <span v-if="step === 1">Quên mật khẩu?</span>
          <span v-if="step === 2">Xác minh OTP</span>
          <span v-if="step === 3">Mật khẩu mới</span>
        </h2>

        <p class="subtitle">
          <span v-if="step === 1">Nhập email và chúng tôi sẽ gửi mã xác minh đến hộp thư của bạn</span>
          <span v-if="step === 2">Mã OTP đã được gửi đến <strong>{{ email }}</strong></span>
          <span v-if="step === 3">Tạo mật khẩu mới an toàn cho tài khoản của bạn</span>
        </p>
      </div>

      <!-- FORM -->
      <form @submit.prevent="handleSubmit" class="form">

        <!-- STEP 1: EMAIL -->
        <div v-if="step === 1" class="form-group">
          <label>Địa chỉ Email</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <input
              type="email"
              placeholder="example@email.com"
              v-model="email"
              required
              autocomplete="username"
            />
          </div>
        </div>

        <!-- STEP 2: OTP -->
        <div v-if="step === 2" class="form-group">
          <label>Mã xác minh OTP</label>
          <div class="otp-container">
            <input
              v-for="(digit, index) in otpDigits"
              :key="index"
              :ref="el => otpInputs[index] = el"
              type="text"
              maxlength="1"
              class="otp-input"
              v-model="otpDigits[index]"
              @input="handleOtpInput(index, $event)"
              @keydown="handleOtpKeydown(index, $event)"
              @paste="handleOtpPaste"
            />
          </div>
          <p class="resend-text">
            Không nhận được mã?
            <button type="button" class="resend-btn" @click="resendOtp">Gửi lại</button>
          </p>
        </div>

        <!-- STEP 3: RESET PASSWORD -->
        <div v-if="step === 3">
          <div class="form-group">
            <label>Mật khẩu mới</label>
            <div class="input-wrapper">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Tối thiểu 8 ký tự"
                v-model="newPassword"
                required
              />
              <button type="button" class="toggle-pw" @click="showNewPassword = !showNewPassword">
                <svg v-if="!showNewPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
            <!-- Password strength bar -->
            <div class="pw-strength" v-if="newPassword">
              <div class="pw-strength-bar">
                <div class="pw-strength-fill" :class="passwordStrengthClass" :style="{ width: passwordStrengthWidth }"></div>
              </div>
              <span class="pw-strength-label" :class="passwordStrengthClass">{{ passwordStrengthLabel }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Xác nhận mật khẩu</label>
            <div class="input-wrapper" :class="{ 'mismatch': confirmPassword && newPassword !== confirmPassword }">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Nhập lại mật khẩu"
                v-model="confirmPassword"
                required
              />
              <button type="button" class="toggle-pw" @click="showConfirmPassword = !showConfirmPassword">
                <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
            <p class="error-msg" v-if="confirmPassword && newPassword !== confirmPassword">
              Mật khẩu xác nhận không khớp
            </p>
          </div>
        </div>

        <!-- BUTTON -->
        <button class="submit-btn" :disabled="loading" :class="{ loading }">
          <span v-if="!loading" class="btn-content">
            <template v-if="step === 1">Gửi mã OTP</template>
            <template v-if="step === 2">Xác nhận OTP</template>
            <template v-if="step === 3">Đặt lại mật khẩu</template>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
          <span v-else class="loader"></span>
        </button>

        <!-- Back to login -->
        <div class="back-link" v-if="step === 1">
          <a href="/login">← Quay lại đăng nhập</a>
        </div>
        <div class="back-link" v-if="step > 1">
          <button type="button" @click="step--">← Quay lại bước trước</button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { checkOTP, resetPassword, sendOTP } from "@/apis/modules/auth.api";
import { useToast } from "@/stores/toast.store";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

const toast = useToast();
const router = useRouter();

const step = ref(1);
const email = ref("");
const otp = ref("");
const otpDigits = ref(["", "", "", "", "", ""]);
const otpInputs = ref([]);
const newPassword = ref("");
const confirmPassword = ref("");
const otpToken = ref("");
const loading = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Sync otpDigits array to otp string
watch(otpDigits, (val) => {
  otp.value = val.join("");
}, { deep: true });

// OTP input handlers
const handleOtpInput = (index, event) => {
  const val = event.target.value.replace(/\D/g, "");
  otpDigits.value[index] = val.slice(-1);
  if (val && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }
};

const handleOtpKeydown = (index, event) => {
  if (event.key === "Backspace" && !otpDigits.value[index] && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
};

const handleOtpPaste = (event) => {
  const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
  pasted.split("").forEach((char, i) => {
    otpDigits.value[i] = char;
  });
  event.preventDefault();
};

const resendOtp = async () => {
  try {
    loading.value = true;
    await sendOTP({ email: email.value });
  } catch (error) {
    console.error("Error resending OTP:", error);
  } finally {
    loading.value = false;
  }
};

// Password strength
const passwordStrength = computed(() => {
  const pw = newPassword.value;
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
});

const passwordStrengthWidth = computed(() => {
  return `${(passwordStrength.value / 4) * 100}%`;
});

const passwordStrengthClass = computed(() => {
  const s = passwordStrength.value;
  if (s <= 1) return "weak";
  if (s === 2) return "fair";
  if (s === 3) return "good";
  return "strong";
});

const passwordStrengthLabel = computed(() => {
  const map = { weak: "Yếu", fair: "Trung bình", good: "Khá tốt", strong: "Mạnh" };
  return map[passwordStrengthClass.value];
});

const handleSubmit = async () => {
  if (step.value === 1) await sendOTPHandler();
  else if (step.value === 2) await checkOTPHandler();
  else if (step.value === 3) await resetPasswordHandler();
};

const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const sendOTPHandler = async () => {
  if (!email.value) {
    toast.show("Vui lòng nhập email.", "error");
    return;
  }

  if (!isValidEmail(email.value)) {
    toast.show("Email không đúng định dạng.", "error");
    return;
  }

  try {
    loading.value = true;

    await sendOTP({
      email: email.value,
      role: "teacher",
    });

    step.value = 2;

  } catch (error) {
    console.error("Error sending OTP:", error);

    if (error?.response?.status === 422) {
      toast.show("Email không tồn tại trong hệ thống.", "error");
    } else {
      toast.show("Không thể gửi OTP. Vui lòng thử lại.", "error");
    }

  } finally {
    loading.value = false;
  }
};

const checkOTPHandler = async () => {
  try {
    loading.value = true;

    const res = await checkOTP({
      email: email.value,
      otp: otp.value,
      role: "teacher"
    });

    otpToken.value = res?.data?.otp_token;
    step.value = 3;

  } catch (error) {
    console.error("Error checking OTP:", error);

    if (error?.response?.status === 422) {
      toast.show("Mã OTP không chính xác.", "error");
    } else {
      toast.show("Có lỗi xảy ra, vui lòng thử lại.", "error");
    }

  } finally {
    loading.value = false;
  }
};


const resetPasswordHandler = async () => {
  try {
    if (newPassword.value !== confirmPassword.value) {
      toast.show("Mật khẩu xác nhận không khớp.", "warning");
      return;
    }

    loading.value = true;

    if (!otpToken.value) {
      toast.show("OTP token bị thiếu. Vui lòng thử lại.", "warning");
      return;
    }

    await resetPassword({
      email: email.value,
      otp_token: otpToken.value,
      password: newPassword.value,
      password_confirmation: confirmPassword.value,
      role: "teacher",
    });

    toast.show("Đặt lại mật khẩu thành công", "success");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // router.push("/login");
    window.location.href = "/login";
  } catch (error) {
    console.error("Error resetting password:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-wrapper {
  font-family: 'Be Vietnam Pro', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4ff;
  position: relative;
  overflow: hidden;
}

/* Blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.45;
  animation: float 8s ease-in-out infinite;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: #c7d4fd;
  top: -150px;
  left: -100px;
  animation-delay: 0s;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: #ddd6fe;
  bottom: -100px;
  right: -80px;
  animation-delay: 3s;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: #bae6fd;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

/* Card */
.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border: 1px solid #e8edf8;
  border-radius: 24px;
  padding: 40px 36px;
  box-shadow: 0 8px 40px rgba(79, 110, 247, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Step indicator */
.step-indicator {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 28px;
}

.step-dot {
  width: 32px;
  height: 4px;
  border-radius: 2px;
  background: #e2e8f0;
  transition: all 0.4s ease;
}

.step-dot.active {
  background: #a5b8fb;
}

.step-dot.current {
  background: #4f6ef7;
  box-shadow: 0 0 8px rgba(79, 110, 247, 0.4);
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 28px;
}

.step-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #eef1fe, #f3eeff);
  border: 1px solid #d4dcfc;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f6ef7;
}

.step-icon svg {
  width: 24px;
  height: 24px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 13.5px;
  color: #94a3b8;
  line-height: 1.6;
}

.subtitle strong {
  color: #475569;
  font-weight: 600;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group {
  margin-bottom: 14px;
}

label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper.mismatch input {
  border-color: #fca5a5;
  background: #fff5f5;
}

.input-icon {
  position: absolute;
  left: 14px;
  width: 16px;
  height: 16px;
  color: #cbd5e1;
  pointer-events: none;
  flex-shrink: 0;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 42px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  color: #1e293b;
  font-size: 14px;
  font-family: 'Be Vietnam Pro', sans-serif;
  transition: all 0.2s ease;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #cbd5e1;
}

.input-wrapper input:focus {
  border-color: #4f6ef7;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
}

.input-wrapper input:focus + .input-icon,
.input-wrapper:focus-within .input-icon {
  color: #4f6ef7;
}

.toggle-pw {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #cbd5e1;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.toggle-pw:hover {
  color: #64748b;
}

.toggle-pw svg {
  width: 16px;
  height: 16px;
}

/* OTP input */
.otp-container {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.otp-input {
  width: 48px;
  height: 54px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  font-family: 'Be Vietnam Pro', sans-serif;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
  caret-color: #4f6ef7;
}

.otp-input:focus {
  border-color: #4f6ef7;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.12);
  transform: translateY(-1px);
}

.resend-text {
  text-align: center;
  margin-top: 14px;
  font-size: 13px;
  color: #94a3b8;
}

.resend-btn {
  background: none;
  border: none;
  color: #4f6ef7;
  font-size: 13px;
  font-family: 'Be Vietnam Pro', sans-serif;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s;
  padding: 0;
  margin-left: 4px;
}

.resend-btn:hover {
  color: #3b55d4;
}

/* Password strength */
.pw-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.pw-strength-bar {
  flex: 1;
  height: 3px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.pw-strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease, background 0.4s ease;
}

.pw-strength-fill.weak { background: #ef4444; }
.pw-strength-fill.fair { background: #f59e0b; }
.pw-strength-fill.good { background: #3b82f6; }
.pw-strength-fill.strong { background: #10b981; }

.pw-strength-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.pw-strength-label.weak { color: #ef4444; }
.pw-strength-label.fair { color: #f59e0b; }
.pw-strength-label.good { color: #3b82f6; }
.pw-strength-label.strong { color: #10b981; }

/* Error */
.error-msg {
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
}

/* Submit button */
.submit-btn {
  width: 100%;
  padding: 14px;
  margin-top: 8px;
  background: linear-gradient(135deg, #4f6ef7, #7c3aed);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Be Vietnam Pro', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #3b55d4, #6d28d9);
  opacity: 0;
  transition: opacity 0.2s;
}

.submit-btn:hover::before {
  opacity: 1;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(79, 110, 247, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-content svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.submit-btn:hover .btn-content svg {
  transform: translateX(3px);
}

/* Loader */
.loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Back link */
.back-link {
  text-align: center;
  margin-top: 16px;
}

.back-link a,
.back-link button {
  font-size: 13px;
  color: #94a3b8;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Be Vietnam Pro', sans-serif;
  transition: color 0.2s;
}

.back-link a:hover,
.back-link button:hover {
  color: #475569;
}
</style>
