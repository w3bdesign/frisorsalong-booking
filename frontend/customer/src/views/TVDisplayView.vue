<template>
  <div class="fixed inset-0 bg-[#0a0a0f] text-white overflow-hidden">
    <!-- Waiting List -->
    <div class="p-12 h-full">
      <div class="max-w-6xl space-y-16">
        <div v-for="slot in store.waitingSlots" :key="slot.id" class="flex items-center">
          <div
            class="w-10 h-10 rounded-full mr-8 flex-shrink-0 border-[3px]"
            :class="[
              slot.assignedTo
                ? `${store.employees.find((e) => e.id === slot.assignedTo)?.color} border-white/20`
                : 'bg-[#c2ff00] border-[#c2ff00]',
            ]"
          ></div>
          <div
            class="h-[1px] w-full relative"
            :class="slot.assignedTo ? 'bg-white/20' : 'bg-[#c2ff00]'"
          >
            <div v-if="slot.customerName" class="absolute -top-5 left-0 bg-[#0a0a0f] pr-6">
              <span class="text-xl font-medium">{{ slot.customerName }}</span>
              <span v-if="slot.estimatedTime" class="text-gray-400 ml-4 text-lg">
                {{ slot.estimatedTime }} min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Employees -->
    <div
      class="fixed bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f] to-transparent h-48"
    >
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-3">
            <div
              class="w-3 h-3 rounded-full"
              :class="store.hasAvailableSlot ? 'bg-[#c2ff00]' : 'bg-red-500'"
            ></div>
            <span class="text-lg">{{ store.activeEmployees.length }} frisører på jobb</span>
          </div>
          <div class="flex gap-3">
            <div
              v-for="employee in store.activeEmployees"
              :key="employee.id"
              class="flex items-center bg-[#1a1a1f] rounded-full px-4 py-2"
            >
              <div class="relative">
                <div :class="employee.color" class="w-7 h-7 rounded-full"></div>
                <div
                  class="absolute -top-1 -right-1 w-3 h-3 bg-[#c2ff00] rounded-full border-2 border-[#0a0a0f]"
                ></div>
              </div>
              <span class="text-base ml-3 font-medium">{{ employee.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Metadata -->
      <div class="text-xs text-gray-500 space-y-0.5">
        <div>Side 1/1</div>
        <div>Last update: {{ formatLastUpdate() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDisplayStore } from '@/stores/display'

const store = useDisplayStore()

const formatLastUpdate = () => {
  return store.lastUpdate.toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Auto refresh last update time
setInterval(() => {
  store.updateLastUpdate()
}, 1000)
</script>

<style>
/* Ensure full height and remove any margins */
html,
body {
  height: 100%;
  margin: 0;
  background: #0a0a0f;
  overflow: hidden;
}
</style>
