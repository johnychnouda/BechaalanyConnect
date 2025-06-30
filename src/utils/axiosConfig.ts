import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/",
  withCredentials: false, // For Laravel Sanctum/cookie auth
  headers: {
    "Content-Type": "application/json",
    // Add Authorization header here if you use token-based auth
  },
});

export default api;