<template>
  <header v-if="!isTVDisplay" class="border-b">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <router-link to="/" class="text-2xl text-primary-600 font-bold">Hair Salon</router-link>
      <WaitingTimeDisplay />
    </div>
  </header>

  <router-view />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import WaitingTimeDisplay from '@/components/WaitingTimeDisplay.vue'

const route = useRoute()
const isTVDisplay = computed(() => route.name === 'tv-display')
</script>
