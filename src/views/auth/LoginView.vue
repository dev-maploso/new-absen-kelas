<script setup lang="ts">
import { ref } from "vue";
import { AxiosError } from "axios";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");

const onSubmit = async () => {
  error.value = "";

  if (!email.value || !password.value) {
    error.value = "Email dan password wajib diisi.";
    return;
  }

  try {
    await auth.login(email.value, password.value);
    console.log("TOKEN:", auth.token);
    console.log("USER:", auth.user);

    router.replace("/dashboard");
  } catch (err) {
    const axiosError = err as AxiosError<any>;

    error.value =
      axiosError.response?.data?.message ??
      "Login gagal. Silakan coba lagi.";
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Login Wali Kelas</h1>
      <p>Silakan masuk menggunakan akun Anda.</p>

      <div
        v-if="error"
        class="alert"
      >
        {{ error }}
      </div>

      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label>Email</label>

          <input
            v-model="email"
            type="email"
            placeholder="email@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label>Password</label>

          <input
            v-model="password"
            type="password"
            placeholder="********"
            autocomplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="auth.loading"
        >
          {{ auth.loading ? "Masuk..." : "Masuk" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.login-card h1 {
  margin: 0;
  font-size: 26px;
}

.login-card p {
  margin-top: 8px;
  margin-bottom: 28px;
  color: #666;
}

.alert {
  margin-bottom: 18px;
  padding: 12px;
  border-radius: 8px;
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  font-size: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

label {
  margin-bottom: 8px;
  font-weight: 600;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
}

input:focus {
  outline: none;
  border-color: #2563eb;
}

button {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: 0.2s;
}

button:hover:not(:disabled) {
  background: #1d4ed8;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
