<!-- This view displays a list of events. Users can search for events, and click on an event to be redirected to another component to view that event's details -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        List of Events
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Event By</h2>
        <!-- Displays Event Name or Event Date selection -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Event Name">Event Name</option>
            <option value="Event Date">Event Date</option>
          </select>
        </div>
        <!--Displays event name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Event Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="name" v-on:keyup.enter="handleSubmitForm" placeholder="Enter event name" />
          </label>
        </div>
        <!-- Displays event date search field -->
        <div class="flex flex-col" v-if="searchBy === 'Event Date'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="date" v-model="eventDate" v-on:keyup.enter="handleSubmitForm" />
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
          <!--Search Event button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">
            Search Event
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <!-- Display Found Data -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <!--Table showing List of Events-->
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Events</h2>
        <h3 class="italic">Click table row to view event details</h3>
      </div>
      <!--Loading state-->
      <div v-if="loading" class="flex flex-col col-span-2 items-center py-10">
        <p class="text-2xl font-bold text-gray-500 animate-pulse">Loading events...</p>
      </div>
      <!--Error state with a retry button-->
      <div v-else-if="error" class="flex flex-col col-span-2 bg-red-50 rounded">
        <h3 class="px-4 py-1 text-2xl font-bold text-white bg-red-800">Could not load events</h3>
        <p class="p-4 text-lg text-red-900">{{ error }}</p>
        <button class="m-4 w-32 bg-red-700 text-white rounded" type="button" @click="execute()">Try again</button>
      </div>
      <!--Empty state-->
      <div v-else-if="!rows.length" class="flex flex-col col-span-2 items-center py-10">
        <p class="text-xl text-gray-600">No events scheduled or matching your search. Click Clear Search to see all events.</p>
      </div>
      <!--Table-->
      <div v-else class="flex flex-col col-span-2">
        <DataTable
          :columns="columns"
          :rows="rows"
          @row-click="event => $router.push({ name: 'eventdetails', params: { id: event._id } })"
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

// Formats an event date as MM/DD/YYYY for the table
function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

// columns for the reusable DataTable
const columns = [
  { label: 'Event Name', field: 'name' },
  { label: 'Event Date', field: 'date', render: e => formatDate(e.date) },
  { label: 'Event Address', field: 'address', render: e => e.address?.line1 }
]

// Parameters for search to occur (ref() replaces the Options API data())
const searchBy = ref(null)
const name = ref(null)
const eventDate = ref(null)

// The request that useApi runs. It starts as "get all events"; a search swaps it,
// so the "Try again" button always repeats whatever the user last asked for.
let currentCall = () => apiClient.get('/events/')

// F2: useApi gives us data, loading, error and execute (run / retry)
const { data: events, loading, error, execute } = useApi(() => currentCall())

// rows for the table (empty until the first successful load)
const rows = computed(() => events.value ?? [])

// Resets the search fields and loads every event (runs on mount and on Clear Search)
function loadData() {
  searchBy.value = null
  name.value = null
  eventDate.value = null
  currentCall = () => apiClient.get('/events/')
  return execute()
}

// Called when the user searches for events
function handleSubmitForm() {
  if (searchBy.value === 'Event Name' && name.value) {
    const params = { searchBy: 'name', name: name.value }
    currentCall = () => apiClient.get('/events/search', { params })
    execute()
  } else if (searchBy.value === 'Event Date' && eventDate.value) {
    const params = {
      searchBy: 'date',
      eventDate: new Date(eventDate.value).toISOString().substring(0, 10)
    }
    currentCall = () => apiClient.get('/events/search', { params })
    execute()
  }
}

// onMounted() replaces the Options API mounted() hook
onMounted(loadData)
</script>
