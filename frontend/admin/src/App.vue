<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="isAuthenticated" class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Admin Kontrollpanel</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/dashboard"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="{
                  'border-indigo-500 text-gray-900':
                    $route.path === '/dashboard',
                }"
              >
                Kontrollpanel
              </router-link>
              <router-link
                to="/bookings"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="{
                  'border-indigo-500 text-gray-900':
                    $route.path.startsWith('/bookings'),
                }"
              >
                Bestillinger
              </router-link>
              <router-link
                to="/orders"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="{
                  'border-indigo-500 text-gray-900':
                    $route.path.startsWith('/orders'),
                }"
              >
                Ordre
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/employees"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="{
                  'border-indigo-500 text-gray-900':
                    $route.path.startsWith('/employees'),
                }"
              >
                Ansatte
              </router-link>
            </div>
          </div>
          <div class="flex items-center">
            <Button
              @click="handleLogout"
              variant="primary"
              className="ml-3"
            >
              Logg ut
            </Button>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import { storeToRefs } from "pinia";
import Button from "./components/base/Button.vue";

const router = useRouter();
const authStore = useAuthStore();
const { isAuthenticated, isAdmin } = storeToRefs(authStore);

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
