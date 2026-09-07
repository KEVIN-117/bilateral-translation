import type {
    KeypointsInput,
    PredictionResponse,
} from "@/types/prediction";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function predictSign(
    sequence: number[][]
): Promise<PredictionResponse> {
    const body: KeypointsInput = {
        sequence,
    };

    const response = await fetch(`${API_URL}/api/v1/predict`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(
            `Error del servidor: ${response.status}`
        );
    }

    return response.json();
}