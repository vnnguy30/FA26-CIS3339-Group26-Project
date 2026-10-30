import axios from 'axios';
import { useLoggedInUserStore } from '../store/loggedInUser';
import router from '../router';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_ROOT_API,
});

// Centralized Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Pass successful responses through untouched
    return response;
  },
  (error) => {
    // 1. Handle 401 Unauthorized (FE3)
    if (error.response && error.response.status === 401) {
      const store = useLoggedInUserStore();
      
      // Clear Pinia session state and token
      store.$reset(); 
      // Note: If you have a specific store action like store.logout(), call that instead
      
      // Redirect to login page
      router.push('/login');
    }

    // 2. Standardize Error Messages (FE3)
    let errorMessage = "Unable to reach the server"; // Default for network failures

    if (error.response && error.response.data) {
      // Extract the message from the backend. The target shape is { "error": "message" }
      errorMessage = error.response.data.error || error.response.data.message || error.response.data || "An error occurred";
    }

    // Reject the promise with a standard Error object containing the readable string
    return Promise.reject(new Error(errorMessage));
  }
);

export function setAuthHeader(token) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}
export async function loginUser(username, password) {
  const response = await apiClient.post('/login', {
    username: username,
    password: password
  });

  const token = response.data.token;

  localStorage.setItem('token', token);
  setAuthHeader(token);

  return token;
}
export function logoutUser() {
  localStorage.removeItem('token');
  setAuthHeader(null);
}
export default apiClient;