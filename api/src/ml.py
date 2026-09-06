import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.layers import LSTM
from fastapi import HTTPException
from huggingface_hub import hf_hub_download
from src.schemas import KeypointsInput, PredictionResponse
from src.config import settings

class CustomLSTM(LSTM):
    def __init__(self, **kwargs):
        kwargs.pop('time_major', None)
        super().__init__(**kwargs)

ACTIONS = np.array(['hello', 'thanks', 'iloveyou'])

class InferenceModel:
    def __init__(self):
        self.model = None

    def load(self):
        # Determine the path: Use local model_path if set and exists, otherwise download from HF
        if settings.model_path and os.path.exists(settings.model_path):
            print(f"Cargando modelo local desde {settings.model_path}...")
            final_path = settings.model_path
        else:
            print(f"Descargando modelo desde Hugging Face ({settings.hf_repo_id}/{settings.hf_filename})...")
            try:
                final_path = hf_hub_download(
                    repo_id=settings.hf_repo_id, 
                    filename=settings.hf_filename
                )
                print("✅ Modelo descargado exitosamente desde Hugging Face.")
            except Exception as e:
                raise Exception(f"❌ Error descargando el modelo de Hugging Face: {e}")

        # Cargar el modelo en TensorFlow
        try:
            self.model = tf.keras.models.load_model(
                final_path, 
                custom_objects={'LSTM': CustomLSTM}
            )
            print("✅ Modelo cargado en TensorFlow exitosamente.")
        except Exception as e:
            raise Exception(f"❌ Error cargando el modelo en Keras: {e}")

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
