<!-- This view shows a list of services. Users can search for services and click on a service to be redirected to another component that displays the service's details -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Services
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Service By</h2>
        <!-- Displays Service Name and Description selection -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Service Name">Service Name</option>
            <option value="Service Description">Service Description</option>
          </select>
        </div>
        <!--Display service name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Service Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="name" v-on:keyup.enter="handleSubmitForm" placeholder="Enter service name" />
          </label>
        </div>
        <!--Display service description search field-->
        <div class="flex flex-col" v-if="searchBy === 'Service Description'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="description" v-on:keyup.enter="handleSubmitForm" placeholder="Enter service description" />
          </label>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <div class="mt-5 grid-cols-2">
          <!--Clear Search button-->
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="submit">
            Clear Search
          </button>
          <!--Search Service button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">
            Search Service
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <!--List of Services table-->
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Services</h2>
        <h3 class="italic">Click table row to view service details</h3>
      </div>
      <!--Loading state-->
      <div v-if="loading" class="flex flex-col col-span-2 items-center py-10">
        <p class="text-2xl font-bold text-gray-500 animate-pulse">Loading services...</p>
      </div>
      <!--Error state with a retry button-->
      <div v-else-if="error" class="flex flex-col col-span-2 bg-red-50 rounded">
        <h3 class="px-4 py-1 text-2xl font-bold text-white bg-red-800">Could not load services</h3>
        <p class="p-4 text-lg text-red-900">{{ error }}</p>
        <button class="m-4 w-32 bg-red-700 text-white rounded" type="button" @click="execute()">Try again</button>
      </div>
      <!--Empty state-->
      <div v-else-if="!rows.length" class="flex flex-col col-span-2 items-center py-10">
        <p class="text-xl text-gray-600">No services have been added yet, or none match your search.</p>
      </div>
      <!--Table-->
      <div v-else class="flex flex-col col-span-2">
        <DataTable
          :columns="columns"
          :rows="rows"
          @row-click="service => $router.push({ name: 'servicedetails', params: { id: service._id } })"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import apiClient from '../api/api'
import { useApi } from '../composables/useApi'
import DataTable from '../components/DataTable.vue'

// columns for the reusable DataTable
const columns = [
  { label: 'Service Name', field: 'name' },
  { label: 'Service Description', field: 'description' }
]

// Parameters for search to occur (ref() replaces the Options API data())
const searchBy = ref('')
const name = ref('')
const description = ref('')

// The request that useApi runs. It starts as "get all services"; a search swaps it,
// so the "Try again" button always repeats whatever the user last asked for.
let currentCall = () => apiClient.get('/services/')

// F2: useApi gives us data, loading, error and execute (run / retry)
const { data: services, loading, error, execute } = useApi(() => currentCall())

// rows for the table (empty until the first successful load)
const rows = computed(() => services.value ?? [])

// Resets the search fields and loads every service (runs on mount and on Clear Search)
function loadData() {
  searchBy.value = ''
  name.value = ''
  description.value = ''
  currentCall = () => apiClient.get('/services/')
  return execute()
}

// Called when the user searches for services
function handleSubmitForm() {
  if (searchBy.value === 'Service Name' && name.value) {
    const params = { searchBy: 'name', name: name.value }
    currentCall = () => apiClient.get('/services/search', { params })
    execute()
  } else if (searchBy.value === 'Service Description' && description.value) {
    const params = { searchBy: 'description', description: description.value }
    currentCall = () => apiClient.get('/services/search', { params })
    execute()
  }
}

// onMounted() replaces the Options API mounted() hook
onMounted(loadData)
</script>
