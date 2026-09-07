import { z } from "zod";

/** Frames por secuencia que espera el modelo LSTM */
export const SEQUENCE_LENGTH = 30;

/**
 * Valores por frame: pose 33x4 + cara 468x3 + mano izq 21x3 + mano der 21x3.
 * El orden de concatenación es parte del contrato: cambiarlo no produce error,
 * produce predicciones incorrectas
 */
export const FEATURE_LENGTH = 1662;

/** Espejo de KeypointsInput en api/src/schemas.py */
export const keypointsInputSchema = z.object({
  sequence: z
    .array(z.array(z.number()).length(FEATURE_LENGTH))
    .length(SEQUENCE_LENGTH),
});

/** Espejo de PredictionResponse en api/src/schemas.py */
export const predictionResponseSchema = z.object({
  prediction: z.string(),
  confidence: z.number(),
  probabilities: z.record(z.string(), z.number()),
});

export type KeypointsInput = z.infer<typeof keypointsInputSchema>;
export type PredictionResponse = z.infer<typeof predictionResponseSchema>;

export type PredictionErrorKind =
  | "invalid-sequence"
  | "network"
  | "timeout"
  | "server"
  | "invalid-response";

/** Error tipado para que la UI decida qué mensaje mostrar sin parsear strings */
export class PredictionError extends Error {
  readonly kind: PredictionErrorKind;
  readonly status?: number;

  constructor(kind: PredictionErrorKind, message: string, status?: number) {
    super(message);
    this.name = "PredictionError";
    this.kind = kind;
    this.status = status;
  }
}
