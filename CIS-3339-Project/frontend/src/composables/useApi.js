import { ref } from 'vue';

// useApi: small async-state helper for an API call that returns an Axios response.
//
//   const { data, loading, error, execute } = useApi(() => apiClient.get('/clients/'))
//
// - loading: true only while a request is in flight
// - data:    the response body of the last successful call (null until then, null after a failure)
// - error:   a short readable string when the call failed, null otherwise
// - execute: runs the call; also used as the "Try again" handler
export function useApi(apiCall) {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Each call gets an id. If a newer call starts before an older one finishes
  // (e.g. two quick searches), the older result is ignored so stale rows
  // can never overwrite fresh ones.
  let latestCall = 0;

  const execute = async (...args) => {
    const callId = ++latestCall;
    loading.value = true;
    error.value = null; // Clear previous errors on retry
    try {
      const response = await apiCall(...args);
      if (callId === latestCall) {
        // Axios puts the response body in the .data property
        data.value = response.data;
      }
      return response.data;
    } catch (err) {
      if (callId === latestCall) {
        data.value = null;
        // The Axios interceptor in api/api.js already turned the error into a readable message
        error.value = err.message || 'An unexpected error occurred';
      }
      return null;
    } finally {
      if (callId === latestCall) {
        loading.value = false;
      }
    }
  };

  return { data, loading, error, execute };
}
