<template>
  <div>
    <canvas class="p-10" ref="attendanceChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Chart, registerables, Colors } from 'chart.js';

Chart.register(...registerables);
Chart.register(Colors);

// Replace Options API props
const props = defineProps({
  label: { type: Array, required: true },
  chartData: { type: Array, required: true }
});

// Replaces this.$refs.attendanceChart
const attendanceChart = ref(null); 

onMounted(() => {
  new Chart(attendanceChart.value, {
    type: 'bar',
    data: {
      labels: props.label,
      datasets: [{ borderWidth: 1, data: props.chartData }]
    },
    options: {
      scales: {
        y: { ticks: { stepSize: 1 } },
        x: { gridLines: { display: false } } // Note: Chart.js 3+ uses 'grid' not 'gridLines', you may want to update this!
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Attendance Chart' }
      },
      responsive: true,
      maintainAspectRatio: true
    }
  });
});
</script>