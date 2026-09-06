import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import LSTM
from fastapi import HTTPException
from src.schemas import KeypointsInput, PredictionResponse

class CustomLSTM(LSTM):
    def __init__(self, **kwargs):
        kwargs.pop('time_major', None)
        super().__init__(**kwargs)

ACTIONS = np.array(['hello', 'thanks', 'iloveyou'])

class InferenceModel:
    def __init__(self):
        self.model = None

    def load(self, model_path: str):
        self.model = tf.keras.models.load_model(
            model_path, 
            custom_objects={'LSTM': CustomLSTM}
        )
        print("Modelo cargado exitosamente.")

    def predict(self, input_data: KeypointsInput) -> PredictionResponse:
        if self.model is None:
            raise HTTPException(status_code=500, detail="El modelo no está cargado")
        
        data = np.array(input_data.sequence)

        if data.shape != (30, 1662):
            raise HTTPException(
                status_code=400, 
                detail=f"Dimensiones incorrectas. Se esperaba (30, 1662), recibido {data.shape}"
            )

        input_tensor = np.expand_dims(data, axis=0)
        predictions = self.model.predict(input_tensor, verbose=0)[0]
        
        predicted_index = int(np.argmax(predictions))
        predicted_action = ACTIONS[predicted_index]
        confidence = float(predictions[predicted_index])

        probabilities = {
            action: round(float(prob), 4) 
            for action, prob in zip(ACTIONS, predictions)
        }

        return PredictionResponse(
            prediction=predicted_action,
            confidence=round(confidence, 4),
            probabilities=probabilities
        )

inference_model = InferenceModel()
