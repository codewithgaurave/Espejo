// src/apis/http.js
import axios from "axios";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://glassadminpanelapi-zvz4.onrender.com";

const http = axios.create({
  baseURL: VITE_API_BASE_URL,
});

// Attach token for every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-token"); // same key as AuthContext
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
