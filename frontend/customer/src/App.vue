<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <router-link to="/" class="text-2xl font-bold text-primary-600"> Hair Salon </router-link>

        <!-- Current wait time display -->
        <WaitingTimeDisplay class="max-w-xs" />
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import WaitingTimeDisplay from '@/components/WaitingTimeDisplay.vue'
</script>
