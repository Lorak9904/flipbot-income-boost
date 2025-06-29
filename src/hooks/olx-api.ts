import axios from "axios";

export const api = axios.create({
  baseURL: "/api",            // ← ścieżka relatywna; nginx/Vite proxy doda host:port
  withCredentials: true       // zależnie od potrzeb ciasteczek
});