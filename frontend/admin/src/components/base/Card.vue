<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center">
      <div
        :class="[
          'p-3 rounded-full',
          iconColorClasses[props.color]
        ]"
      >
        <slot name="icon"></slot>
      </div>
      <div class="ml-4">
        <h3 class="text-lg font-medium text-gray-900">{{ props.title }}</h3>
        <p
          class="mt-1 text-3xl font-semibold"
          :class="valueColorClasses[props.color]"
        >
          {{ props.value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CardProps, CardColor } from '@/types/components';

const props = withDefaults(defineProps<CardProps>(), {
  color: 'indigo'
});

const iconColorClasses: Record<CardColor, string> = {
  indigo: 'bg-indigo-100 text-indigo-600',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-600',
};

const valueColorClasses: Record<CardColor, string> = {
  indigo: 'text-indigo-600',
  green: 'text-green-600',
  blue: 'text-blue-600',
  red: 'text-red-600',
  yellow: 'text-yellow-600',
};
</script>
