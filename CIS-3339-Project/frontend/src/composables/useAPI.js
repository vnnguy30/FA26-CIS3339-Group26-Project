import { ref } from 'vue';

export function useApi(apiCall) {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const execute = async (...args) => {
    loading.value = true;
    error.value = null; // Clear previous errors on retry
    try {
      const response = await apiCall(...args);
      // Axios puts the response body in the .data property
      data.value = response.data; 
    } catch (err) {
      // The interceptor below formats the error as a readable string
      error.value = err.message || 'An unexpected error occurred';
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, error, execute };
}