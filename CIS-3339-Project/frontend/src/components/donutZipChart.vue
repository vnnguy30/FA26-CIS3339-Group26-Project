<template>
  <div class="w-1/2">
    <canvas class="p-10" ref="zipChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Chart, registerables, Colors } from 'chart.js';

Chart.register(...registerables);
Chart.register(Colors);

const props = defineProps({
  label: { type: Array, required: true },
  chartData: { type: Array, required: true }
});

const zipChart = ref(null);

onMounted(() => {
  new Chart(zipChart.value, {
    type: 'doughnut',
    data: {
      labels: props.label,
      datasets: [{ borderWidth: 1, data: props.chartData }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Clients by Zip Code' }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  });
});
</script>
