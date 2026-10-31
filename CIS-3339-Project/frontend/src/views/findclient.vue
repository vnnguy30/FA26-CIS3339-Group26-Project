<!-- This view displays a list of clients. The user can search for clients, and click on a client to redirect to another component to view that client's information -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Client
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <!--Search Client By selection-->
        <h2 class="text-2xl font-bold">Search Client By</h2>
        <!-- Displays Client Name search field -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Client Name">Client Name</option>
            <option value="Client Number">Client Number</option>
          </select>
        </div>
        <!--Input box for searching by Client First Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="firstName" v-on:keyup.enter="handleSubmitForm" placeholder="Enter first name" />
          </label>
        </div>
        <!--Input box for searching by Client Last Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="lastName" v-on:keyup.enter="handleSubmitForm" placeholder="Enter last name" />
          </label>
        </div>
        <!-- Displays Client Number search field -->
        <div class="flex flex-col" v-if="searchBy === 'Client Number'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text" v-model="phoneNumber" v-on:keyup.enter="handleSubmitForm"
            placeholder="Enter Client Phone Number" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <!--Clear Search button-->
        <div class="mt-5 grid-cols-2">
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="submit">
            Clear Search
          </button>
          <!--Search Client button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">
            Search Client
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Clients</h2>
        <h3 class="italic">Click table row to view client details</h3>
      </div>
      <!--Table showing list of Clients-->
      <!--Loading state-->
      <div v-if="loading" class="flex flex-col col-span-2 items-center py-10">
        <p class="text-2xl font-bold text-gray-500 animate-pulse">Loading clients...</p>
      </div>
      <!--Error state with a retry button-->
      <div v-else-if="error" class="flex flex-col col-span-2 bg-red-50 rounded">
        <h3 class="px-4 py-1 text-2xl font-bold text-white bg-red-800">Could not load clients</h3>
        <p class="p-4 text-lg text-red-900">{{ error }}</p>
        <button class="m-4 w-32 bg-red-700 text-white rounded" type="button" @click="execute()">Try again</button>
      </div>
      <!--Empty state-->
      <div v-else-if="!rows.length" class="flex flex-col col-span-2 items-center py-10">
        <p class="text-xl text-gray-600">No clients found. Try a different search or click Clear Search.</p>
      </div>
      <!--Table-->
      <div v-else class="flex flex-col col-span-2">
        <DataTable
          :columns="columns"
          :rows="rows"
          @row-click="client => $router.push({ name: 'clientdetails', params: { id: client._id } })"
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
  { label: 'Name', field: 'name', render: c => c.firstName + ' ' + c.lastName },
  { label: 'Phone number', field: 'phone', render: c => c.phoneNumber?.primary },
  { label: 'City', field: 'city', render: c => c.address?.city }
]

// Parameters for search to occur (ref() replaces the Options API data())
const searchBy = ref('')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')

// The request that useApi runs. It starts as "get all clients"; a search swaps it,
// so the "Try again" button always repeats whatever the user last asked for.
let currentCall = () => apiClient.get('/clients/')

// F2: useApi gives us data, loading, error and execute (run / retry)
const { data: clients, loading, error, execute } = useApi(() => currentCall())

// rows for the table (empty until the first successful load)
const rows = computed(() => clients.value ?? [])

// Resets the search fields and loads every client (runs on mount and on Clear Search)
function loadData() {
  searchBy.value = ''
  firstName.value = ''
  lastName.value = ''
  phoneNumber.value = ''
  currentCall = () => apiClient.get('/clients/')
  return execute()
}

// Called when the user searches for clients
function handleSubmitForm() {
  if (searchBy.value === 'Client Name' && (firstName.value || lastName.value)) {
    const params = { searchBy: 'name', firstName: firstName.value, lastName: lastName.value }
    currentCall = () => apiClient.get('/clients/search', { params })
    execute()
  } else if (searchBy.value === 'Client Number' && phoneNumber.value) {
    const params = { searchBy: 'number', phoneNumber: phoneNumber.value }
    currentCall = () => apiClient.get('/clients/search', { params })
    execute()
  }
}

// onMounted() replaces the Options API mounted() hook
onMounted(loadData)
</script>
