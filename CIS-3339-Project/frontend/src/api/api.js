// This file contains all API calls to the API endpoints.
// Error handling lives in the response interceptor below, so the helper
// functions do not use try/catch. They let the error bubble up already
// converted into a readable Error by the interceptor.

import axios from "axios";
import { useLoggedInUserStore } from "../store/loggedInUser";
import router from "../router";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_ROOT_API,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ------------------------------------------------------------------ */
/* Centralized response interceptor (F2)                               */
/* ------------------------------------------------------------------ */

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // On 401, clear the session and send the user back to login
    if (error.response && error.response.status === 401) {
      const store = useLoggedInUserStore();
      store.$reset();
      localStorage.removeItem("token");
      setAuthHeader(null);
      router.push("/login");
    }

    // Turn every failure into one short, readable message
    let errorMessage = "Unable to reach the server";

    if (error.response && error.response.data) {
      const body = error.response.data;
      errorMessage =
        body.error ||
        body.message ||
        (Array.isArray(body.errors) && body.errors[0]?.msg) ||
        (typeof body === "string" ? body : "An error occurred");
    }

    return Promise.reject(new Error(errorMessage));
  }
);

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export function setAuthHeader(token) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

export async function loginUser(username, password) {
  const response = await apiClient.post("/users/login", { username, password });
  const token = response.data.token;

  localStorage.setItem("token", token);
  setAuthHeader(token);

  return token;
}

export function logoutUser() {
  localStorage.removeItem("token");
  setAuthHeader(null);
}

/* ------------------------------------------------------------------ */
/* Organization                                                        */
/* ------------------------------------------------------------------ */

export async function getOrgName() {
  const response = await apiClient.get("/org");
  return response.data;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export const getEvents = async () => {
  const response = await apiClient.get("/events/");
  return response.data;
};

export const getEventById = async (id) => {
  const response = await apiClient.get(`/events/id/${id}`);
  return response.data;
};

export const searchEvents = async (query) => {
  const params = {};
  if (query.searchBy === "name") {
    params.searchBy = query.searchBy;
    params.name = query.name || "";
  } else if (query.searchBy === "date") {
    params.searchBy = "date";
    params.eventDate = query.eventDate || "";
  }
  const response = await apiClient.get("/events/search", { params });
  return response.data;
};

export const getClientEvents = async (id) => {
  const response = await apiClient.get(`/events/client/${id}`);
  return response.data;
};

export const getNonClientEvents = async (id) => {
  const response = await apiClient.get(`/events/client/${id}/not-registered`);
  return response.data;
};

export const getEventAttendees = async (id) => {
  const response = await apiClient.get(`/events/attendees/${id}`);
  return response.data;
};

export const getEventsByServiceId = async (id) => {
  const response = await apiClient.get(`/events/service/${id}`);
  return response.data;
};

export const createEvent = async (newEvent) => {
  const response = await apiClient.post("/events", newEvent);
  return response.data;
};

export const updateEvent = async (id, updatedEvent) => {
  const response = await apiClient.put(`/events/update/${id}`, updatedEvent);
  return response.data;
};

export const registerAttendee = async (eventId, clientId) => {
  const response = await apiClient.put(
    "/events/register",
    {},
    { params: { event: eventId, client: clientId } }
  );
  return response.data;
};

export const deregisterAttendee = async (eventId, clientId) => {
  const response = await apiClient.put(
    "/events/deregister",
    {},
    { params: { event: eventId, client: clientId } }
  );
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await apiClient.delete(`/events/${id}`);
  return response.data;
};

export const getAttendance = async () => {
  const response = await apiClient.get("/events/attendance");
  return response.data;
};

/* ------------------------------------------------------------------ */
/* Clients                                                             */
/* ------------------------------------------------------------------ */

export const getClients = async () => {
  const response = await apiClient.get("/clients/");
  return response.data;
};

export const getClientById = async (id) => {
  const response = await apiClient.get(`/clients/id/${id}`);
  return response.data;
};

export const searchClients = async (query) => {
  const params = {};
  if (query.searchBy === "name") {
    params.searchBy = query.searchBy;
    params.firstName = query.firstName || "";
    params.lastName = query.lastName || "";
  } else if (query.searchBy === "number") {
    params.searchBy = query.searchBy;
    params.phoneNumber = query.phoneNumber || "";
  }
  const response = await apiClient.get("/clients/search", { params });
  return response.data;
};

export const createClient = async (newClient) => {
  const response = await apiClient.post("/clients", newClient);
  return response.data;
};

export const updateClient = async (id, updatedClient) => {
  const response = await apiClient.put(`/clients/update/${id}`, updatedClient);
  return response.data;
};

export const deleteClientbyId = async (id) => {
  const response = await apiClient.delete(`/clients/${id}`);
  return response.data;
};

export const getClientsByZipCode = async () => {
  const response = await apiClient.get("/clients/byzip");
  return response.data;
};

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export const getServices = async () => {
  const response = await apiClient.get("/services/");
  return response.data;
};

export const getServiceById = async (id) => {
  const response = await apiClient.get(`/services/id/${id}`);
  return response.data;
};

export const searchServices = async (query) => {
  const params = {};
  params.searchBy = query.searchBy;
  if (query.searchBy === "name") {
    params.name = query.name || "";
  } else if (query.searchBy === "description") {
    params.description = query.description;
  }
  const response = await apiClient.get("/services/search", { params });
  return response.data;
};

export const createService = async (newService) => {
  const response = await apiClient.post("/services", newService);
  return response.data;
};

export const updateService = async (id, updatedService) => {
  const response = await apiClient.put(`/services/update/${id}`, updatedService);
  return response.data;
};

export const deleteService = async (id) => {
  const response = await apiClient.delete(`/services/${id}`);
  return response.data;
};

export default apiClient;
