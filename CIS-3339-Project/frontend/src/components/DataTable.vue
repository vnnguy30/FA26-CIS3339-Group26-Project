<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] }
})

const emit = defineEmits(['row-click'])

// Get the value to show: use render() if the column has one
function cellValue(row, col) {
  return col.render ? col.render(row) : row[col.field]
}

// Sorting
const sortField = ref('')
const sortDir = ref('')

function toggleSort(field) {
  if (sortField.value !== field) {
    sortField.value = field
    sortDir.value = 'asc'
  } else if (sortDir.value === 'asc') {
    sortDir.value = 'desc'
  } else {
    sortField.value = ''
    sortDir.value = ''
  }
}

const sortedRows = computed(() => {
  if (!sortField.value) return props.rows
  const col = props.columns.find(c => c.field === sortField.value)
  return [...props.rows].sort((a, b) => {
    const x = cellValue(a, col) ?? ''
    const y = cellValue(b, col) ?? ''
    const result = String(x).localeCompare(String(y), undefined, { numeric: true })
    return sortDir.value === 'asc' ? result : -result
  })
})

// Pagination
const pageSize = 10
const currentPage = ref(1)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedRows.value.length / pageSize))
)

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedRows.value.slice(start, start + pageSize)
})

const startRow = computed(() =>
  sortedRows.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize + 1
)
const endRow = computed(() =>
  Math.min(currentPage.value * pageSize, sortedRows.value.length)
)

// New data or new sort: go back to page 1
watch(() => props.rows, () => { currentPage.value = 1 })
watch([sortField, sortDir], () => { currentPage.value = 1 })
</script>

<template>
<div>
  <table class="min-w-full shadow-md rounded">
    <thead class="bg-gray-50 text-xl">
      <tr>
        <th v-for="col in columns" :key="col.field"
            class="p-4 text-left cursor-pointer select-none"
            @click="toggleSort(col.field)">
          {{ col.label }}
          <span v-if="sortField === col.field">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
        </th>
      </tr>
    </thead>

    <tbody class="divide-y divide-gray-300">
      <tr v-if="rows.length === 0">
        <td :colspan="columns.length" class="p-4 text-center text-gray-500">
          No results
        </td>
      </tr>
      <tr v-for="(row, i) in pagedRows" :key="row._id || i"
          class="cursor-pointer hover:bg-gray-100"
          @click="emit('row-click', row)">
        <td v-for="col in columns" :key="col.field" class="p-2 text-left">
          {{ cellValue(row, col) }}
        </td>
      </tr>
    </tbody>

  </table>
    <div class="flex justify-between items-center mt-4">
    <span class="text-gray-600">
      Showing {{ startRow }}–{{ endRow }} of {{ sortedRows.length }}
    </span>
    <div class="flex gap-2 items-center">
      <button class="border px-3 py-1 rounded disabled:opacity-50"
              :disabled="currentPage === 1"
              @click="currentPage--">
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button class="border px-3 py-1 rounded disabled:opacity-50"
              :disabled="currentPage === totalPages"
              @click="currentPage++">
        Next
      </button>
    </div>
  </div>
  </div>
</template>