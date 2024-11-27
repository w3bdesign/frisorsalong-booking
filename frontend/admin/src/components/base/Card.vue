<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center">
      <div 
        :class="[
          'p-3 rounded-full',
          `bg-${color}-100 text-${color}-600`
        ]"
      >
        <slot name="icon"></slot>
      </div>
      <div class="ml-4">
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <p 
          class="mt-1 text-3xl font-semibold"
          :class="`text-${color}-600`"
        >
          {{ value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  value: string | number;
  color?: 'indigo' | 'green' | 'blue' | 'red' | 'yellow';
}

withDefaults(defineProps<Props>(), {
  color: 'indigo'
});
</script>
