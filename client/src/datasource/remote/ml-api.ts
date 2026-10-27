import axios from "axios";

/**
 * Cliente del servicio FastAPI de inferencia.
 *
 * Usa la ruta del mismo origen que Next reescribe hacia FastAPI. Así el navegador
 * no depende del hostname interno de Docker ni requiere CORS en producción.
 */
export const mlApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ML_API_URL ?? "/api/ml",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
