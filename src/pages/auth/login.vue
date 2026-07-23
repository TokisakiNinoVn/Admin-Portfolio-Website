<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <!-- Background decoration elements -->
    <div class="bg-shape bg-shape-1"></div>
    <div class="bg-shape bg-shape-2"></div>
    <div class="bg-shape bg-shape-3"></div>
    <div class="bg-shape bg-shape-4"></div>

    <div class="position-relative my-sm-16">
      <!-- 👉 Auth Card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
      >
        <VCardItem class="justify-center">
          <RouterLink to="/" class="app-logo">
            <img src="@/assets/images/logos/logo.jpg" class="logo-image" alt="" />
          </RouterLink>
        </VCardItem>

        <VCardText>
          <VForm @submit.prevent="handleLogin">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="email"
                  autofocus
                  label="Email"
                  type="email"
                  placeholder="giaovien@email.com"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="password"
                  label="Password"
                  placeholder="********"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="current-password"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <!-- remember me checkbox -->
                <div class="d-flex align-center justify-space-between flex-wrap my-6">
                  <VCheckbox v-model="rememberMe" label="Ghi nhớ đăng nhập" />
                  <a class="text-primary" href="/forgot-password">Quên mật khẩu?</a>
                </div>

                <!-- login button -->
                <VBtn block type="submit" :loading="isLoading">Đăng nhập</VBtn>
              </VCol>

              <VCol cols="12" class="d-flex align-center">
                <VDivider />
                <span class="mx-4 text-high-emphasis">hoặc</span>
                <VDivider />
              </VCol>

              <!-- 👉 Google Login Button -->
              <VCol cols="12">
                <VBtn
                  block
                  variant="outlined"
                  color="secondary"
                  :loading="isGoogleLoading"
                  @click="handleLoginGoogle"
                >
                  <template #prepend>
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      width="20"
                      height="20"
                      style="margin-right: 8px"
                    />
                  </template>
                  Đăng nhập bằng Google
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<script setup>
import AuthService from '@/services/auth.service';
import { useToast } from "@/stores/toast.store";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("trieuduytancbg@gmail.com");
const password = ref("");
const rememberMe = ref(false);
const isPasswordVisible = ref(false);
const isLoading = ref(false);
const isGoogleLoading = ref(false);

const toast = useToast();
const router = useRouter();

onMounted(async () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const savedEmail = localStorage.getItem("remember_email");
  const savedPassword = localStorage.getItem("remember_password");

  if (isLoggedIn === "true" && savedEmail && savedPassword) {
    try {
      await autoLogin(savedEmail, savedPassword);
      return;
    } catch (e) {
      console.warn("Tự động đăng nhập thất bại, yêu cầu đăng nhập lại.");
    }
  }

  if (savedEmail && savedPassword) {
    email.value = savedEmail;
    password.value = savedPassword;
    rememberMe.value = true;
  }
});

const saveUserSession = (data) => {
  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("email", data.user.email);
  localStorage.setItem("isLoggedIn", "true");
};

const isSuccess = (status) => status >= 200 && status < 300;

const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast.show("Vui lòng nhập đầy đủ email và mật khẩu.", "warning");
    return;
  }

  isLoading.value = true;

  try {
    const response = await AuthService.signInWithPassword(
      email.value,
      password.value
    );

    if (rememberMe.value) {
      localStorage.setItem("remember_email", email.value);
      localStorage.setItem("remember_password", password.value);
    } else {
      localStorage.removeItem("remember_email");
      localStorage.removeItem("remember_password");
    }

    saveUserSession({
      user: response.user,
      session: response.session,
    });

    toast.show("Đăng nhập thành công!", "success");

    router.push("/dashboard");
  } catch (error) {
    toast.show(
      error?.message || "Đăng nhập thất bại. Vui lòng thử lại.",
      "error"
    );

    console.error("Đăng nhập thất bại:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleLoginGoogle = async () => {
  isGoogleLoading.value = true;

  try {
    const googleAuth = await getGoogleAccessToken();

    // if (googleAuth.id_token === null) {
    //   toast.show(
    //     "googleAuth.id_token đang bị null - vui lòng thử lại",
    //     "error"
    //   );
    //   return;
    // }
    const response = await loginGoogle({
      access_token: googleAuth.access_token,
      id_token: googleAuth.id_token ?? null,
    });

    if (isSuccess(response.status)) {
      saveUserSession(response.data);
      toast.show("Đăng nhập Google thành công!", "success");
      router.push("/dashboard");
    } else {
      toast.show(
        response.data?.message ||
          "Đăng nhập Google thất bại. Có thể email bạn không tồn tại hoặc chưa được đăng ký!",
        "error"
      );
    }
  } catch (error) {
    // Người dùng đóng popup -> chỉ log, không toast lỗi
    if (error?.type === "popup_closed") {
      console.info("Người dùng đã đóng popup Google.");
    } else {
      toast.show(
        "Đăng nhập Google thất bại. Có thể email bạn không tồn tại hoặc chưa được đăng ký!",
        "error"
      );
      console.error("Google login error:", error);
    }
  } finally {
    // ✅ Luôn reset loading dù thành công, lỗi, hay đóng popup
    isGoogleLoading.value = false;
  }
};

const getGoogleAccessToken = () => {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts) {
      reject(
        new Error(
          "Google Identity Services chưa được tải. " +
          "Hãy thêm thẻ sau vào index.html: " +
          '<script src="https://accounts.google.com/gsi/client" async defer><\/script>'
        )
      );
      return;
    }

    const isDev = import.meta.env.VITE_ENVIRONMENT === "develop";

      const requiredKeys = [
        "VITE_ENVIRONMENT",
        "VITE_GOOGLE_CLIENT_ID_DEV",
        "VITE_GOOGLE_CLIENT_ID",
      ];

      // check xem key có tồn tại không
      for (const key of requiredKeys) {
        if (!(key in import.meta.env)) {
          reject(new Error(`Thiếu biến môi trường: ${key}`));
          return;
        }

        if (!import.meta.env[key]) {
          reject(new Error(`Biến môi trường ${key} đang bị rỗng`));
          return;
        }
      }

      const clientId = isDev
        ? import.meta.env.VITE_GOOGLE_CLIENT_ID_DEV
        : import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        reject(new Error("Google client_id không tồn tại hoặc rỗng"));
        return;
      }

      console.log("Environment:", import.meta.env.VITE_ENVIRONMENT);

    // const clientId =
    //   import.meta.env.VITE_ENVIRONMENT === "develop"
    //     ? import.meta.env.VITE_GOOGLE_CLIENT_ID_DEV
    //     : import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // ── Bước 1: Dùng FedCM / id.initialize để lấy id_token ──────────────
    // Không gọi prompt() — thay vào đó render một nút ẩn rồi click tự động,
    // hoặc dùng renderButton vào một div ẩn. Tuy nhiên cách đơn giản nhất
    // và không bị lỗi 403 là: chỉ dùng initTokenClient với scope "openid",
    // rồi sau khi có access_token, đổi lấy id_token qua userinfo endpoint
    // (khác với tokeninfo — userinfo trả về claims, không phải JWT).
    //
    // Để lấy id_token thực sự (JWT), cần dùng Authorization Code flow
    // hoặc google.accounts.id + renderButton. Cách an toàn nhất cho FE:
    // dùng renderButton ẩn → click tự động → nhận id_token qua callback.

    let idToken = null;

    // Khởi tạo id client để lấy id_token qua renderButton ẩn
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (credentialResponse) => {
        // credentialResponse.credential chính là id_token (JWT)
        idToken = credentialResponse.credential;

        // ── Bước 2: Sau khi có id_token, lấy tiếp access_token ──────────
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: (tokenResponse) => {
            if (tokenResponse.error) {
              const cancelErrors = [
                "access_denied",
                "popup_closed_by_user",
                "popup_failed_to_open",
              ];
              if (cancelErrors.includes(tokenResponse.error)) {
                reject({ type: "popup_closed" });
              } else {
                reject(new Error(tokenResponse.error));
              }
              return;
            }

            resolve({
              id_token: idToken,                         // ✅ JWT từ bước 1
              access_token: tokenResponse.access_token, // ✅ từ bước 2
              token_type: tokenResponse.token_type,
              expires_in: tokenResponse.expires_in,
              scope: tokenResponse.scope,
            });
          },
          error_callback: (error) => {
            if (
              error.type === "popup_failed_to_open" ||
              error.type === "popup_closed"
            ) {
              reject({ type: "popup_closed" });
            } else {
              reject(new Error(error.type ?? "unknown_google_error"));
            }
          },
        });

        // Không hỏi lại tài khoản ở bước 2 vì user đã chọn ở bước 1
        tokenClient.requestAccessToken({ prompt: "" });
      },
      // ux_mode: "popup" để tránh redirect, tránh lỗi 403 origin
      ux_mode: "popup",
    });

    // Render nút Google ẩn vào DOM rồi click tự động để trigger popup
    // (không dùng prompt() — tránh lỗi 403)
    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.display = "none";
    document.body.appendChild(hiddenDiv);

    window.google.accounts.id.renderButton(hiddenDiv, {
      type: "standard",
      theme: "outline",
      size: "large",
    });

    // Click vào nút ẩn để mở popup chọn tài khoản
    const googleBtn = hiddenDiv.querySelector("div[role=button]");
    if (googleBtn) {
      googleBtn.click();
    } else {
      // Fallback: nếu renderButton chưa kịp render thì đợi một tick
      setTimeout(() => {
        const btn = hiddenDiv.querySelector("div[role=button]");
        if (btn) {
          btn.click();
        } else {
          document.body.removeChild(hiddenDiv);
          reject(new Error("Không thể khởi tạo nút đăng nhập Google."));
        }
      }, 300);
    }

    // Dọn div ẩn sau khi xong (resolve hoặc reject)
    const cleanup = () => {
      if (document.body.contains(hiddenDiv)) {
        document.body.removeChild(hiddenDiv);
      }
    };
    // Wrap resolve/reject để cleanup tự động
    const originalResolve = resolve;
    const originalReject = reject;
    resolve = (val) => { cleanup(); originalResolve(val); };
    reject = (err) => { cleanup(); originalReject(err); };
  });
};

const autoLogin = async (savedEmail, savedPassword) => {
  const response = await login({ email: savedEmail, password: savedPassword });
  saveUserSession(response.data);
  toast.show("Tự động đăng nhập thành công!", "success");
  router.push("/dashboard");
};
</script>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.logo-image {
  width: 200px;
}

.auth-wrapper {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #f5576c 75%,
    #4facfe 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow: hidden;

  .bg-shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    animation: float 6s ease-in-out infinite;

    &.bg-shape-1 {
      width: 200px;
      height: 200px;
      top: 10%;
      left: 5%;
      animation-delay: 0s;
    }

    &.bg-shape-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      left: 10%;
      animation-delay: 2s;
    }

    &.bg-shape-3 {
      width: 100px;
      height: 100px;
      top: 20%;
      right: 10%;
      animation-delay: 4s;
    }

    &.bg-shape-4 {
      width: 180px;
      height: 180px;
      bottom: 10%;
      right: 5%;
      animation-delay: 1s;
    }
  }

  .auth-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05);

    .app-logo {
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 12px;

      .app-logo-title {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
      }
    }
  }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
  100% { transform: translateY(0px) rotate(360deg); }
}

@media (max-width: 960px) {
  .auth-wrapper {
    .bg-shape { display: none; }
    .auth-card { margin: 0 16px; }
  }
}

@media (prefers-color-scheme: dark) {
  .auth-wrapper {
    .auth-card {
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
