"use client";

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { predictionService } from "@/actions/prediction";
import {
  PredictionError,
  type PredictionResponse,
} from "@/model/prediction.schema";

export type PredictionStatus = "idle" | "loading" | "success" | "error";

interface PredictionState {
  status: PredictionStatus;
  result: PredictionResponse | null;
  error: PredictionError | null;
}

const IDLE_STATE: PredictionState = {
  status: "idle",
  result: null,
  error: null,
};

/**
 * Maneja el ciclo de vida de una predicción: carga, resultado y error.
 *
 * Cancela la petición anterior antes de lanzar una nueva y descarta respuestas
 * que llegan tarde, para que la pantalla no parpadee entre predicciones viejas
 * y nuevas cuando se dispara varias veces seguidas
 */
export function useSignPrediction() {
  const [state, setState] = useState<PredictionState>(IDLE_STATE);
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  // Al desmontar no debe quedar una petición viva escribiendo en un estado muerto
  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const predict = useCallback(async (sequence: number[][]) => {
    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    setState({ status: "loading", result: null, error: null });

    try {
      const result = await predictionService.predict(sequence, {
        signal: controller.signal,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({ status: "success", result, error: null });
    } catch (error) {
      if (axios.isCancel(error) || requestId !== requestIdRef.current) {
        return;
      }

      setState({
        status: "error",
        result: null,
        error:
          error instanceof PredictionError
            ? error
            : new PredictionError("network", "Error inesperado al predecir"),
      });
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    requestIdRef.current += 1;
    setState(IDLE_STATE);
  }, []);

  return { ...state, predict, reset };
}
