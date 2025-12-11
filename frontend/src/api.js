import axios from 'axios';

// In production (Vercel/Render), this variable will be set.
// In dev, it falls back to localhost.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export default api;
