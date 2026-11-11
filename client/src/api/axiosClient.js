import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/authSlice";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && store.getState().auth.token) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
