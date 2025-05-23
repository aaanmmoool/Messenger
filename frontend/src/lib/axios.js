import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" 
  ? window.location.hostname === "localhost" 
    ? "http://localhost:5001/api" 
    : `http://${window.location.hostname}:5001/api`
  : `${window.location.origin}/api`;

console.log("API Base URL:", BASE_URL);

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
