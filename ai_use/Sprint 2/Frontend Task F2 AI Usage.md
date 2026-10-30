Frontend Task F2 \- Add a simple async-state composable and centralized API error handling&nbsp;  
Team member: Ambar C. Pineda&nbsp;  
AI tool: Gemini (Google)&nbsp;  
Dates: October 29-30th&nbsp;  
Repo: [https\://github.com/vnnguy30/FA26-CIS3339-Group26-Project.git](https://github.com/vnnguy30/FA26-CIS3339-Group26-Project.git)&nbsp;

This is what I asked the AI in regards to F2. The prompts are in my own words, and the AI's answers are summarized. The code shown is the final version I typed into the project.

### 1\. Starting the task

**User prompt:** I am in charge of doing f2. With the current state of the repository is it possible for me to complete this task or should I wait for other tasks to be complete? **Response:** The AI confirmed I could start immediately. It explained that F2 (API composable and Axios interceptor) is a foundational Phase 1 task that actually blocks other tasks like F1 and F3, so completing it unblocks the rest of the team.

### 2\. Building the Composable and Interceptor

**User prompt:** create f2 then **Response:** Provided the code for two main files. First, a new `useApi.js` composable to encapsulate loading, data, and error states. Second, it provided the updated `api.js` with a centralized response interceptor to handle 401 Unauthorized errors globally and standardize error messages.

```js
// composables/useApi.js
import { ref } from 'vue';
export function useApi(apiCall) {
    const data = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const execute = async (...args) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await apiCall(...args);
            data.value = response.data;
        } catch (err) {
            error.value = err.message || 'An unexpected error occurred';
        } finally {
            loading.value = false;
        }
    };
    return { data, loading, error, execute };
}
```

**User prompt:** Why am I replacing the entire api.js file with just this code... **Response:** Explained that the original template mixed HTTP networking with component logic and scattered try/catch blocks. Centralizing it eliminates duplicate error handling across the app, globally catches expired tokens (401 errors) to push users to the login screen, and cleanly separates the networking layer from the views.

**User prompt:** I don't need to do this \[implementing the API call in views\] for task f2 correct? **Response:** Correct. The AI clarified that F2 is strictly about building the foundational infrastructure. Updating the individual views is part of Task F1.

### 3\. Troubleshooting Build Errors

**User prompt:** I ran npm run dev and got an error... I haven't run npm isntall **Response:** Guided me to navigate into the correct `frontend` directory using `cd` and run `npm install` to download dependencies before trying to start the Vite server.

**User prompt:** I am seeing errors on my output \[No matching export...\] **Response:** Pointed out that by replacing `api.js`, I accidentally deleted old helper functions the existing Vue files were still trying to use. The AI suggested temporarily restoring the old helper functions at the bottom of the file until F1 is completed. I decided I would just wait until F1 is done to fully test the view integrations.

```js
// Centralized Response Interceptor inside api.js
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const store = useLoggedInUserStore();
            store.$reset();
            router.push('/login');
        }
        let errorMessage = "Unable to reach the server";
        if (error.response && error.response.data) {
            errorMessage = error.response.data.error || error.response.data.message || error.response.data || "An error occurred";
        }
        return Promise.reject(new Error(errorMessage));
    }
);
```

### 4\. Setting up the Forked Repo and Environment Variables

**User prompt:** I deleted my clone of the repo on my laptop and I am using a forked repo instead... What should I do with the new repo? **Response:** Provided a checklist for setting up a fresh clone: run `npm install` in both frontend and backend folders, and manually recreate the `.env` files since Git ignores them.

**User prompt:** How to do this? \[Create .env files\] **Response:** Walked me through creating `.env` in the frontend for `VITE_ROOT_API=http://localhost:3000` and `.env` in the backend for things like `PORT`, `MONGO_URL`, and `JWT_SECRET`.

**User prompt:** How do I know what I am using? \[Between local MongoDB or Atlas\] **Response:** Explained how to identify my database type. If I downloaded MongoDB Community Server/Compass, I'm using local (`mongodb://localhost:27017...`). If I created an account on a website, I'm using Atlas (`mongodb+srv://...`).

### 5\. Verification and pull request

* Coordinated with the F1 team member so the codebase wouldn't break while both tasks were in progress.  
* Ran `npm run dev` to ensure the infrastructure loaded without build errors after restoring the old API helper functions temporarily.  
* Tested that the local and backend environments were correctly linked via the new `.env` files.  
* Opened a pull request for the F2 foundational setup and assigned a teammate to review it.

### 6\. What the AI did vs. what I decided

**AI helped with:** Writing the initial composable and interceptor, explaining why the architectural changes were necessary, debugging missing dependency errors, and guiding me to creating a new forked repository.&nbsp;  
**I did / decided:** Asked clarifying questions about the scope of F2 versus F1, realized the old API helper functions needed to stay temporarily to avoid breaking the app, decided to hold off on full runtime testing until F1 was complete, and managed the Git repository switch to the new fork.

### What I learned

I learned the importance of foundational tasks in a project's critical path. I learned how an Axios interceptor works to catch and handle HTTP errors globally so that individual components don't have to rewrite the same logic. I also learned how to use Vue composables (`useApi`) to extract and reuse stateful logic (loading, error, data) across different views, and how `.env` files must be manually configured when cloning a repository.