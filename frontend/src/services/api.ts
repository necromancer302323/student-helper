
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000
});

api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.error ??
      "Unable to reach the server. Check that the backend is running.";

    return Promise.reject(new Error(message));
  }
);
