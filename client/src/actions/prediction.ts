import axios from "axios";
import { mlApiClient } from "@/datasource/remote/ml-api";
import {
  FEATURE_LENGTH,
  PredictionError,
  type PredictionResponse,
  predictionResponseSchema,
  SEQUENCE_LENGTH,
} from "@/model/prediction.schema";

const PREDICT_PATH = "/api/v1/predict";

/**
 * Valida la secuencia antes de gastar red.
 *
 * No usa el schema de Zod a propósito: recorrer 49.860 números con Zod en cada
 * envío es mucho más caro que este bucle, y el schema queda igual como la
 * definición del contrato
 */
function assertValidSequence(sequence: number[][]): void {
  if (sequence.length !== SEQUENCE_LENGTH) {
    throw new PredictionError(
      "invalid-sequence",
      `La secuencia debe tener ${SEQUENCE_LENGTH} frames, tiene ${sequence.length}`,
    );
  }

  for (let frame = 0; frame < sequence.length; frame++) {
    const values = sequence[frame];

    if (values.length !== FEATURE_LENGTH) {
      throw new PredictionError(
        "invalid-sequence",
        `El frame ${frame} tiene ${values.length} valores, se esperaban ${FEATURE_LENGTH}`,
      );
    }

    for (let index = 0; index < values.length; index++) {
      // NaN e Infinity se serializan como null y el backend responde 422
      if (!Number.isFinite(values[index])) {
        throw new PredictionError(
          "invalid-sequence",
          `El frame ${frame} tiene un valor no numérico en la posición ${index}`,
        );
      }
    }
  }
}

/** Traduce cualquier fallo de axios a un PredictionError con causa identificable */
function toPredictionError(error: unknown): PredictionError {
  if (error instanceof PredictionError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new PredictionError(
        "timeout",
        "El servidor tardó demasiado en responder",
      );
    }

    if (!error.response) {
      return new PredictionError(
        "network",
        "No se pudo conectar al servidor de predicción",
      );
    }

    const { status, data } = error.response;
    const detail = data?.detail;

    // HTTPException manda un string; los 422 de Pydantic mandan un array de objetos
    let message = "El servidor rechazó la petición";
    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = "El servidor rechazó el formato de los datos enviados";
    }

    return new PredictionError("server", message, status);
  }

  return new PredictionError(
    "network",
    "Error inesperado al pedir la predicción",
  );
}

interface PredictOptions {
  /** Para cancelar una petición que quedó obsoleta */
  signal?: AbortSignal;
}

export const predictionService = {
  /**
   * Envía una secuencia de keypoints y devuelve la seña reconocida.
   *
   * Lanza PredictionError en cualquier fallo. Las cancelaciones se propagan
   * tal cual para que quien llama pueda ignorarlas
   */
  predict: async (
    sequence: number[][],
    options: PredictOptions = {},
  ): Promise<PredictionResponse> => {
    assertValidSequence(sequence);

    try {
      const response = await mlApiClient.post(
        PREDICT_PATH,
        { sequence },
        { signal: options.signal },
      );

      const parsed = predictionResponseSchema.safeParse(response.data);

      if (!parsed.success) {
        throw new PredictionError(
          "invalid-response",
          "El servidor respondió con un formato inesperado",
        );
      }

      return parsed.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }

      throw toPredictionError(error);
    }
  },
};
