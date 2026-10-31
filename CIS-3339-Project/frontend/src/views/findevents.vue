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
            <div class="flex flex-col col-span-2">
        <DataTable
          :columns="columns"
          :rows="events"
          @row-click="event => $router.push({ name: 'eventdetails', params: { id: event._id } })"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import DataTable from '../components/DataTable.vue';
import { useApi } from '../composables/useApi';
import apiClient from '../api/api';

const router = useRouter();
const toast = useToast();

const columns = [
  { label: 'Event Name', field: 'name' },
  { label: 'Event Date', field: 'date', render: e => formatDate(e.date) },
  { label: 'Event Address', field: 'address', render: e => e.address?.line1 }
];

const searchBy = ref('');
const name = ref('');
const eventDate = ref('');

const { data: events, error, execute: fetchEvents } = useApi((isSearch, params) => {
  return isSearch ? apiClient.get('/events/search', { params }) : apiClient.get('/events');
});

const loadData = async () => {
  searchBy.value = ''; name.value = ''; eventDate.value = '';
  await fetchEvents(false);
  if (error.value) toast.error(error.value);
};

const handleSubmitForm = async () => {
  if (searchBy.value === 'Event Name' && name.value) {
    await fetchEvents(true, { searchBy: 'name', name: name.value });
  } else if (searchBy.value === 'Event Date' && eventDate.value) {
    const formattedDate = new Date(eventDate.value).toISOString().substring(0, 10);
    await fetchEvents(true, { searchBy: 'date', eventDate: formattedDate });
  }
  if (error.value) toast.error(error.value);
};

const formatDate = (date) => {
  const d = new Date(date);
  return `${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}/${d.getUTCFullYear()}`;
};

onMounted(() => loadData());
</script>
