<template>
  <div class="w-1/2">
    <canvas class="p-10" ref="zipChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// defineProps() replaces the Options API "props" option
const props = defineProps({
  label: { type: Array },
  chartData: { type: Array }
})

// a template ref replaces this.$refs.zipChart
const zipChart = ref(null)

// onMounted() replaces the Options API mounted() hook: draw the chart once the canvas exists
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
  })
})
</script>
