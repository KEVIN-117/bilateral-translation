export interface KeypointsInput {
    sequence: number[][];
}

export interface PredictionResponse {
    prediction: string;
    confidence: number;
    probabilities: Record<string, number>;
}