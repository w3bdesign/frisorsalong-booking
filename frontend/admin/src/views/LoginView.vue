<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
      <div>
        <h1 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Kontrollpanel
        </h1>
        <p class="mt-2 text-center text-sm text-gray-600" id="login-description">
          Logg inn for å administrere salongen din
        </p>
      </div>
      <form 
        class="mt-8 space-y-6" 
        @submit.prevent="handleLogin"
        aria-labelledby="login-description"
        novalidate
      >
        <div class="rounded-md -space-y-px">
          <div class="mb-5">
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-1"
              >E-postadresse</label
            >
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              aria-required="true"
              aria-invalid="false"
              aria-describedby="email-error"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="admin@example.com"
            />
            <div id="email-error" class="mt-1 text-sm text-red-600" role="alert" v-if="emailError">
              {{ emailError }}
            </div>
          </div>
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Passord</label
            >
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              aria-required="true"
              aria-invalid="false"
              aria-describedby="password-error"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="••••••••"
            />
            <div id="password-error" class="mt-1 text-sm text-red-600" role="alert" v-if="passwordError">
              {{ passwordError }}
            </div>
          </div>
        </div>

        <div 
          v-if="error" 
          class="rounded-md bg-red-50 p-4"
          role="alert"
          aria-live="polite"
        >
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-busy="isLoading"
          >
            <span 
              class="absolute left-0 inset-y-0 flex items-center pl-3"
              aria-hidden="true"
            >
              <svg
                class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ isLoading ? "Logger inn..." : "Logg inn" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { storeToRefs } from "pinia";

const router = useRouter();
const authStore = useAuthStore();
const { error, isLoading } = storeToRefs(authStore);

const email = ref("");
const password = ref("");
const emailError = ref("");
const passwordError = ref("");

const validateForm = () => {
  let isValid = true;
  emailError.value = "";
  passwordError.value = "";

  if (!email.value) {
    emailError.value = "E-postadresse er påkrevd";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = "Vennligst skriv inn en gyldig e-postadresse";
    isValid = false;
  }

  if (!password.value) {
    passwordError.value = "Passord er påkrevd";
    isValid = false;
  }

  return isValid;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  const success = await authStore.login({
    email: email.value,
    password: password.value,
  });

  if (success) {
    router.push("/dashboard");
  }
};
</script>
