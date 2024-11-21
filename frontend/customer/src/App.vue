<template>
  <header v-if="!isTVDisplay" class="border-b">
    <div class="max-w-4xl mx-auto px-4 py-4 flex items-center gap-8">
      <router-link to="/" class="text-2xl text-primary-600 font-bold flex-1"
        >Frisørsalong</router-link
      >
      <router-link to="/tv-display" class="text-2xl text-primary-600 font-bold flex-1"
        >TV View</router-link
      >
      <div class="flex-1 flex justify-end">
        <div class="w-[250px]">
          <WaitingTimeDisplay />
        </div>
      </div>
    </div>
  </header>

  <router-view />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import WaitingTimeDisplay from './components/WaitingTimeDisplay.vue'

const route = useRoute()
const isTVDisplay = computed(() => route.name === 'tv-display')
</script>
