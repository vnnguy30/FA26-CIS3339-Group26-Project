// This pinia store contains state with respect to whether a user is logged in 
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { loginUser, logoutUser } from '../api/api' // import API calls
import jwt_decode from 'jwt-decode'; // import JSON Web Token decoder to decode the token into the user's information

//Notifications
const toast = useToast()

// Defining a store
export const useLoggedInUserStore = defineStore({
  id: 'loggedInUser',
  state: () => {
    return {
      name: "",
      role: "",
      isLoggedIn: false
    }
  },
  actions: {
    async login(username, password) {
      try {
        const token = await loginUser(username, password);
        // Get the user's name and role from the JWT token
        const decodedToken = jwt_decode(token);
        this.$patch({
          isLoggedIn: true,
          role: decodedToken.role,
          name: decodedToken.name
        });
        this.$router.push("/");
        toast.success("Login Sucessful!")

      } catch ( error ) {
        toast.error(error.message)
      }
    },
    restoreSession() {
      const token = localStorage.getItem('token');

      if (!token) {
        this.$patch({
          name: "",
          role: "",
          isLoggedIn: false
        });
        return null;
      }

      try {
        const decodedToken = jwt_decode(token);

        if (!decodedToken.exp || decodedToken.exp * 1000 <= Date.now()|| !decodedToken.name || !decodedToken.role) {
          localStorage.removeItem('token');

          this.$patch({
            name: "",
            role: "",
            isLoggedIn: false
          });

          return null;
        }

        this.$patch({
          isLoggedIn: true,
          role: decodedToken.role,
          name: decodedToken.name
        });

        return token;
      } catch (error) {
        localStorage.removeItem('token');

        this.$patch({
          name: "",
          role: "",
          isLoggedIn: false
        });

        return null;
      }
    },

    logout() {
      logoutUser();
      // Reset value after user log out
      this.$patch({
        name: "",
        role: "",
        isLoggedIn: false
      });
      this.$router.push("/");
      toast.info("You have been logged out!")
    }
  },
});
