<template>
  <div class="fixed inset-0 bg-[#0a0a0f] text-white overflow-hidden">
    <div class="h-full flex flex-col items-center">
      <!-- Status Text -->
      <div class="text-center mt-12 mb-4">
        <h1
          class="text-8xl font-bold"
          :class="store.hasAvailableSlot ? 'text-[#c2ff00]' : 'text-red-500'"
        >
          {{ store.hasAvailableSlot ? 'Ledig' : 'Opptatt' }}
        </h1>
        <h2 class="text-3xl text-white mt-10">Venteliste</h2>
      </div>

      <!-- Waiting List -->
      <div class="w-full max-w-6xl px-16 mt-12 py-8">
        <div v-if="store.isLoading && !store.waitingSlots.length" class="text-center text-gray-400">
          Laster...
        </div>
        <div v-else-if="store.error" class="text-center text-red-500">
          {{ store.error }}
        </div>
        <div v-else class="space-y-16">
          <div v-for="slot in store.waitingSlots" :key="slot.id" class="flex items-center">
            <div
              class="w-8 h-8 rounded-full mr-8 flex-shrink-0 border-2"
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
              <div v-if="slot.customerName" class="absolute -top-4 left-0 bg-[#0a0a0f] pr-6">
                <span class="text-xl font-medium">{{ slot.customerName }}</span>
                <span v-if="slot.estimatedTime !== undefined" class="text-gray-400 ml-4 text-lg">
                  {{ slot.estimatedTime }} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Employees -->
      <div class="w-full bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f] to-transparent pt-8 pb-8">
        <div class="max-w-6xl mx-auto px-16">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-8">
              <div class="flex items-center gap-3">
                <div
                  class="w-2.5 h-2.5 rounded-full"
                  :class="store.hasAvailableSlot ? 'bg-[#c2ff00]' : 'bg-red-500'"
                ></div>
                <span class="text-lg">{{ store.activeEmployees.length }} frisører på jobb</span>
              </div>
              <div class="flex gap-3">
                <div
                  v-for="employee in store.activeEmployees"
                  :key="employee.id"
                  class="flex items-center bg-[#1a1a1f] rounded-full px-4 py-2"
                  data-testid="employee"
                >
                  <div class="relative">
                    <div :class="employee.color" class="w-6 h-6 rounded-full"></div>
                    <div
                      class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#c2ff00] rounded-full border-2 border-[#0a0a0f]"
                    ></div>
                  </div>
                  <span class="text-sm ml-3 font-medium">{{ employee.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="text-xs text-gray-500 space-y-0.5">
            <div>Side 1/1</div>
            <div>Sist oppdatert: {{ formatLastUpdate() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDisplayStore } from '../stores/display'
import { onMounted, onUnmounted } from 'vue'

console.log('TVDisplayView script setup start')
const store = useDisplayStore()

const formatLastUpdate = () => {
  return store.lastUpdate.toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Start polling when component mounts
onMounted(() => {
  console.log('TVDisplayView mounted, starting polling')
  store.startPolling()
})

// Clean up when component unmounts
onUnmounted(() => {
  console.log('TVDisplayView unmounted, cleaning up')
  store.cleanup()
})
</script>

<style scoped>
/* Scoped styles only for TV display */
:deep(body) {
  background: transparent;
}
</style>
