<template>
  <div class="bg-white rounded-lg">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Chart, type TooltipItem } from 'chart.js/auto';
import type { Order } from '../types';

const props = defineProps({
  orders: {
    type: Array as () => Order[],
    required: true
  }
});

const chartRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function prepareChartData() {
  // Group orders by hour and calculate total amount for each hour
  const ordersByHour = props.orders.reduce((acc: Record<string, number>, order: Order) => {
    const date = new Date(order.completedAt);
    const hour = date.getHours().toString().padStart(2, '0') + ':00';
    acc[hour] = (acc[hour] || 0) + parseFloat(order.totalAmount);
    return acc;
  }, {});

  // Create array of all hours from 00:00 to 23:00
  const allHours = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  );

  // Sort hours and ensure all hours are represented
  const sortedHours = allHours.sort();
  const data = sortedHours.map(hour => ordersByHour[hour] || 0);

  return {
    labels: sortedHours,
    datasets: [{
      label: 'Omsetning per time',
      data: data,
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      borderColor: 'rgb(79, 70, 229)',
      borderWidth: 1
    }]
  };
}

function createChart(): void {
  if (!chartRef.value) return;

  const ctx = chartRef.value.getContext('2d');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'bar',
    data: prepareChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(tickValue: number | string): string {
              const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
              return new Intl.NumberFormat('nb-NO', {
                style: 'currency',
                currency: 'NOK',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value);
            }
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Omsetning per time',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem: TooltipItem<'bar'>): string {
              const value = typeof tooltipItem.raw === 'number' ? tooltipItem.raw : 0;
              return new Intl.NumberFormat('nb-NO', {
                style: 'currency',
                currency: 'NOK',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(value);
            }
          }
        }
      }
    }
  });
}

watch(() => props.orders, () => {
  createChart();
}, { deep: true });

onMounted(() => {
  createChart();
});
</script>
