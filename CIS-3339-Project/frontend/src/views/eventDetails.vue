<!-- This component allows a user to update a specific event's information. -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Event Details
      </h1>
    </div>
    <div class="px-10 py-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Event Details</h2>
        <!-- Event Name input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Event Name</span>
            <span style="color: #ff0000">*</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="event.name" />
            <span v-if="v$.event.name.$error" class="text-red-500">
              Event Name is required
            </span>
          </label>
        </div>

        <!-- Date input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Date</span>
            <span style="color: #ff0000">*</span>
            <input type="date"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="event.date" />
            <span v-if="v$.event.date.$error" class="text-red-500">
              <span v-if="v$.event.date.required.$invalid">
                Event Date is required
              </span>
              <span v-else-if="!v$.event.date.required.$invalid && v$.event.date.validDate.$invalid">
                Event Date must be a valid date
              </span>
            </span>
          </label>
        </div>

        <div></div>
        <div></div>
        <!-- Description input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Description</span>
            <textarea
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows="2" v-model="event.description"></textarea>
          </label>
        </div>
      </div>

      <!-- Services Offered at Event checkboxes -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-10">
        <h2 class="text-2xl font-bold">Services Offered at Event</h2>
        <div class="flex flex-col grid-cols-3">
          <div>
            <ul v-if="services.length" class="space-y-2">
              <li v-for="service in services" :key="service._id" :data-service-id="service._id"
                class="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 transition-colors relative">
                <label class="block w-full h-full">
                  <input type="checkbox" :id="service._id" :value="service._id"
                    :checked="event.services.includes(service._id)" v-model="event.services"
                    :disabled="service.status === 'Inactive'"
                    class="rounded border-gray-300 disabled:opacity-50 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 mr-2">
                  <span class="font-medium">{{ service.name }}</span>
                </label>
              </li>
            </ul>
            <!--If there are no active services for the user's organization, this will appear instead of list of checkboxes-->
            <p v-else class="text-gray-600">No Active Services Available</p>
          </div>
        </div>
      </div>

      <!-- grid container -->
      <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Address</h2>
        <!-- Address 1 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Address Line 1</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="event.address.line1" />
          </label>
        </div>
        <!-- Address 2 input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Address Line 2</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="event.address.line2" />
          </label>
        </div>
        <!-- City input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">City</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="event.address.city" />
          </label>
        </div>
        <div></div>
        <!-- County input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">County</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="event.address.county" />
          </label>
        </div>
        <!-- Zip Code input field -->
        <div class="flex flex-col">
          <label class="block">
            <span class="text-gray-700">Zip Code</span>
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder v-model="event.address.zip" />
          </label>
        </div>
      </div>

      <!-- grid container -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <!--Update Event button-->
        <div v-if="user.role === 'editor'" class="flex justify-between mt-10 mr-20">
          <button @click="submitEventUpdate" type="submit" class="bg-green-700 disabled:opacity-50 text-white rounded"
            :disabled="user.role === 'viewer'">
            Update Event
          </button>
        </div>
        <!--Delete Event button-->
        <div v-if="user.role === 'editor'" class="flex justify-between mt-10 mr-20">
          <button @click="submitDeleteEvent" type="submit" class="bg-red-700  disabled:opacity-50 text-white rounded"
            :disabled="user.role === 'viewer'">
            Delete Event
          </button>
          <!--Go back button-->
        </div>
        <div v-if="user.role === 'editor'" class="flex justify-between mt-10 mr-20">
          <button type="reset" class="border border-red-700 bg-white text-red-700 rounded" @click=this.$router.back()>
            Go back
          </button>
        </div>
      </div>

      <hr class="mt-10 mb-10" />

      <!-- grid container -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div>
          <h2 class="text-2xl font-bold">List of Attendees</h2>
          <h3 class="italic">Click table row to view client details</h3>
        </div>
        <!--Table showing the list of attendees for the selected event-->
        <div class="flex flex-col col-span-2">
          <table class="min-w-full shadow-md rounded">
            <thead class="bg-gray-50 text-xl">
              <tr>
                <th class="p-4 text-left">Name</th>
                <th class="p-4 text-left">City</th>
                <th class="p-4 text-left">Phone Number</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr @click="$router.push({name: 'clientdetails', params: { id: client._id } })" 
              v-for="client in clients" :key="client._id" class="cursor-pointer"
                :class="{ 'hoverRow': hoverId === client._id }" @mouseenter="hoverId = client._id"
                @mouseleave="hoverId = null">
                <td class="p-2 text-left">
                  {{ client.firstName + ' ' + client.lastName }}
                </td>
                <td class="p-2 text-left">{{ client.address.city }}</td>
                <td class="p-2 text-left">
                  {{ client.phoneNumber.primary }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useLoggedInUserStore } from "../store/loggedInUser";
import { useToast } from 'vue-toastification';
import { useApi } from '../composables/useApi';
import apiClient from '../api/api';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const user = useLoggedInUserStore();

const event = reactive({ name: '', services: [], date: '', address: { line1: '', line2: '', city: '', county: '', zip: '' }, description: '' });
const attendees = ref([]);
const services = ref([]);

const rules = { event: { name: { required }, date: { required } } };
const v$ = useVuelidate(rules, { event });

const { execute: fetchEvent, data: eData, error: eErr } = useApi(() => apiClient.get(`/events/${route.params.id}`));
const { execute: fetchAttendees, data: aData } = useApi(() => apiClient.get(`/events/attendees/${route.params.id}`));
const { execute: fetchServices, data: sData } = useApi(() => apiClient.get('/services'));
const { execute: updateEvent, error: uErr } = useApi((payload) => apiClient.put(`/events/${route.params.id}`, payload));
const { execute: deleteEventCall, error: dErr } = useApi(() => apiClient.delete(`/events/${route.params.id}`));

onMounted(async () => {
  await Promise.all([fetchEvent(), fetchAttendees(), fetchServices()]);
  
  if (eErr.value) toast.error(eErr.value);
  else if (eData.value) {
    eData.value.date = new Date(eData.value.date).toISOString().substring(0, 10);
    Object.assign(event, eData.value);
  }
  
  if (aData.value) attendees.value = aData.value;
  if (sData.value) services.value = sData.value;
});

const submitEventUpdate = async () => {
  v$.value.$validate();
  if (v$.value.$error) { toast.error('Fix validation errors'); return; }
  
  const payload = { ...event, services: event.services.map(s => s._id || s) };
  await updateEvent(payload);
  if (uErr.value) toast.error(uErr.value); else toast.success('Event updated');
};

const deleteEvent = async () => {
  if (confirm("Delete this event?")) {
    await deleteEventCall();
    if (dErr.value) toast.error(dErr.value); else { toast.success("Event deleted"); router.push('/findevents'); }
  }
};
</script>
