# **Frontend Task F4 \- Session Restoration and Route Guards (AI Usage Report)**

Frontend Task F4 \- Session Restoration and Authentication Route Guards

Team member: Imelda Odei

AI tool: ChatGPT (OpenAI)

Dates: October 30, 2026

Repo: [https\://github.com/vnnguy30/FA26-CIS3339-Group26-Project.git](https://www.google.com/search?q=https://github.com/vnnguy30/FA26-CIS3339-Group26-Project.git)

This is a log of my AI conversation regarding Task F4. The prompts are in my own words, and the AI's answers are summarized. The code shown reflects the final implementation integrated into the project.

### **1\. Connecting Backend Auth to Frontend API**

**User prompt:** I am trying to get authentication working, but my store calls loginUser() and api.js doesn't define it. Here is what searching for /login returned in my backend\[cite: 2\].

**Response:** The AI confirmed that the backend /login route in routes/users.js was already implemented and returned a signed JWT token (res.json({ token })). It instructed me to create loginUser(username, password) and logoutUser() in api.js to send user credentials, store the resulting JWT token in localStorage, set Axios defaults via setAuthHeader(token), and return the token to Pinia.

// frontend/src/api/api.js

export function setAuthHeader(token) {

    if (token) {

        apiClient.defaults.headers.common\['Authorization'\] \= \`Bearer \${token}\`;

    } else {

        delete apiClient.defaults.headers.common\['Authorization'\];

    }

}

export async function loginUser(username, password) {

    const response \= await apiClient.post('/login', {

        username: username,

        password: password

    });

    const token \= response.data.token;

    localStorage.setItem('token', token);

    setAuthHeader(token);

    return token;

}

export function logoutUser() {

    localStorage.removeItem('token');

    setAuthHeader(null);

}

### **2\. Restoring the Session on Application Startup**

**User prompt:** Here is my main.js. How do I make the app restore the user's session when it first loads without creating circular dependencies?

**Response:** The AI advised updating main.js so that Pinia initializes first, followed immediately by calling loggedInUserStore.restoreSession() before the Vue Router is mounted. This structure extracts the token from local storage, configures setAuthHeader(token) before any protected route loads or network requests fire, and avoids circular imports between the store and api.js.

// frontend/src/main.js

import { createApp, markRaw } from "vue";

import router from "./router";

import App from "./App.vue";

import "./index.css";

import Toast from "vue-toastification";

import "vue-toastification/dist/index.css";

import { createPinia } from 'pinia';

import { useLoggedInUserStore } from './store/loggedInUser';

import { setAuthHeader } from './api/api';

const app \= createApp(App);

const pinia \= createPinia();

pinia.use(({ store }) \=\> {

    store.\$router \= markRaw(router);

});

app.use(pinia);

// Restore session before router installation

const loggedInUserStore \= useLoggedInUserStore(pinia);

const token \= loggedInUserStore.restoreSession();

setAuthHeader(token);

app.use(router);

const options \= {

    position: 'bottom-right'

};

app.use(Toast, options);

app.mount("\#app");

### **3\. Handling Expiration and Silent Failure in Pinia**

**User prompt:** Here is my restoreSession() inside loggedInUser.js. It calls this.logout() when the token is missing or expired, but is that right\[cite: 5, 7\]?

**Response:** The AI identified that calling this.logout() during startup causes unwanted side effects—triggering an immediate redirect to / and displaying an unnecessary "You have been logged out\!" toast notification on normal page visits\[cite: 5, 7\]. It restructured restoreSession() to silently validate expiration (decodedToken.exp \* 1000 \<= Date.now()), check for valid payload properties, patch Pinia state, and return null if the token is invalid or missing\[cite: 10, 12\].

JavaScript

// frontend/src/store/loggedInUser.js (restoreSession action)

restoreSession() {

    const token \= localStorage.getItem('token');

    if (\!token) {

        this.\$patch({

            name: "",

            role: "",

            isLoggedIn: false

        });

        return null;

    }

    try {

        const decodedToken \= jwt\_decode(token);

        if (\!decodedToken.exp \|\| decodedToken.exp \* 1000 \<= Date.now() \|\| \!decodedToken.name \|\| \!decodedToken.role) {

            localStorage.removeItem('token');

            this.\$patch({

                name: "",

                role: "",

                isLoggedIn: false

            });

            return null;

        }

        // Restore user state

        this.\$patch({

            isLoggedIn: true,

            role: decodedToken.role,

            name: decodedToken.name

        });

        return token;

    } catch (error) {

        localStorage.removeItem('token');

        this.\$patch({

            name: "",

            role: "",

            isLoggedIn: false

        });

        return null;

    }

}

### **4\. Resolving Build Blockers and Missing API Exports**

**User prompt:** Vite dev server runs, but views are failing to compile because they import functions like getClients, createClient, and getAttendance which aren't in api.js.

**Response:** The AI explained that while F4 focuses on authentication, the existing template views depend on client, event, and service API helpers that were stripped or missing\[cite: 14, 16\]. Instead of guessing URLs, the AI analyzed the backend route files (routes/clients.js, routes/events.js, routes/services.js) and cross-referenced them with view imports (clientdetails.vue, findclient.vue, home.vue) to map the exact endpoints needed so the application compiles without breaking F4 auth\[cite: 23\].

### **5\. Verification and Testing**

* Ran npm run dev and verified the application compiles cleanly without missing export errors.  
* Tested valid user login and inspected Chrome DevTools \> Application \> Local Storage to ensure the JWT token string is stored under token\[cite: 13\].  
* Verified session restoration: refreshed the page and navigated across tabs while confirming user session state and headers remained intact\[cite: 11, 13\].  
* Tested session expiration and malformed token handling: ensured clearing or corrupting the token keeps the user logged out cleanly without triggering unprompted toast alerts or crashes\[cite: 8, 10, 12\].  
* Tested logout flow: verified clicking Logout deletes token from localStorage and resets Axios authorization headers\[cite: 4\].

  ### **6\. What the AI Did vs. What I Decided**

**AI helped with:** Tracing routes between Express backend files and frontend API calls, diagnosing unintended toast notifications caused by this.logout() in store initialization, providing the startup flow for main.js, and mapping missing API endpoints to backend routes.

**I did / decided:** Located and extracted backend route code and view import signatures in VS Code, tested authentication and token persistence directly in the browser across page reloads, ensured non-auth API helpers remained intact so teammates' views could compile, and applied the necessary state updates in the Pinia store.

### **What I Learned**

I learned how the authentication state persists across browser reloads by coupling browser localStorage with Pinia and Axios defaults on startup\[cite: 3, 5\]. I learned how JWT expiration payloads work (exp \* 1000\) and why startup checks must handle missing or expired tokens silently without firing disruptive route redirects or notification side effects. Additionally, I learned how frontend route guards and backend API headers depend on clean token initialization before router mounting to prevent unauthorized access and circular import issues\[cite: 5\].