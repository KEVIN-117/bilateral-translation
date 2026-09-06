import { z } from "zod";

/**
 * Contrato de una entrada del diccionario "Texto -> Seña".
 * Se define con Zod para poder validar el catálogo cuando deje de ser
 * estático y pase a venir de la API (ver BACK-3).
 */
export const signEntrySchema = z.object({
  /** Identificador estable, en minúsculas y sin tildes. */
  id: z.string().min(1),
  /** Palabra tal como se le muestra al usuario. */
  word: z.string().min(1),
  /** Sinónimos y variantes que deben resolver a esta misma seña. */
  aliases: z.array(z.string()).default([]),
  /** Ruta pública del video demostrativo. */
  videoUrl: z.string().min(1),
  /** Descripción corta de cómo se ejecuta la seña. */
  description: z.string().min(1),
  /**
   * Etiqueta equivalente en el modelo LSTM (`ACTIONS` en api/src/ml.py).
   * `null` significa que el modelo todavía no reconoce esta seña.
   */
  modelAction: z.string().nullable().default(null),
});

export type SignEntry = z.infer<typeof signEntrySchema>;

/** Estado del buscador: sin buscar, con resultado, o sin coincidencias. */
export type SignLookupResult =
  | { status: "idle" }
  | { status: "found"; entry: SignEntry }
  | { status: "not-found"; term: string };

/**
 * Normaliza un término para comparaciones: quita tildes, pasa a minúsculas
 * y colapsa espacios. Así "HOLA", "hola" y "  Holá " resuelven igual.
 */
export function normalizeWord(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
