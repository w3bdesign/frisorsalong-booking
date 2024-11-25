<template>
  <div class="bg-white p-4 rounded-lg shadow">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
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
  // Group orders by date and calculate total amount for each date
  const ordersByDate = props.orders.reduce((acc: Record<string, number>, order: Order) => {
    const date = new Date(order.completedAt).toLocaleDateString('nb-NO');
    acc[date] = (acc[date] || 0) + parseFloat(order.totalAmount);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(ordersByDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  return {
    labels: sortedDates,
    datasets: [{
      label: 'Omsetning per dag',
      data: sortedDates.map(date => ordersByDate[date]),
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
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: number): string {
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
        tooltip: {
          callbacks: {
            label: function(context: { raw: number }): string {
              return new Intl.NumberFormat('nb-NO', {
                style: 'currency',
                currency: 'NOK',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(context.raw);
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
