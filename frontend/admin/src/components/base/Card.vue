<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center">
      <div 
        :class="[
          'p-3 rounded-full',
          `bg-${props.color}-100 text-${props.color}-600`
        ]"
      >
        <slot name="icon"></slot>
      </div>
      <div class="ml-4">
        <h3 class="text-lg font-medium text-gray-900">{{ props.title }}</h3>
        <p 
          class="mt-1 text-3xl font-semibold"
          :class="`text-${props.color}-600`"
        >
          {{ props.value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CardProps } from '@/types/components';

const props = withDefaults(defineProps<CardProps>(), {
  color: 'indigo'
});
</script>
