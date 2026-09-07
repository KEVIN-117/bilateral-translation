import axios from "axios";

/**
 * Cliente del servicio FastAPI de inferencia.
 *
 * Va directo al backend, sin pasar por el BFF: la petición no lleva credenciales
 * y el payload pesa cerca de 1 MB, así que rebotarlo por un Route Handler
 * duplicaría la transferencia sin ganar nada. El CORS de la API ya autoriza
 * a localhost:3000
 */
export const mlApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ML_API_URL ?? "http://127.0.0.1:8000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
