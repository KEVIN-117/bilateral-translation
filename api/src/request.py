import requests
import numpy as np

# Crear datos sintéticos de prueba con forma (30, 1662)
dummy_data = np.zeros((30, 1662)).tolist()

# Enviar petición POST a FastAPI
url = "http://127.0.0.1:8000/api/v1/predict"
payload = {"sequence": dummy_data}


response = requests.post(url, json=payload)
print(response.json())