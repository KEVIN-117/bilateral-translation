# 🧠 Bilateral Translation API (Inference Service)

Microservicio minimalista desarrollado con **FastAPI** y **TensorFlow**, diseñado exclusivamente para la inferencia de lenguaje de señas.

## 🚀 Tecnologías
- Python >= 3.13
- FastAPI
- TensorFlow
- Pydantic
- uv (Gestor de dependencias y ejecución)

## 📂 Estructura del Código
El código se enfoca únicamente en machine learning y servicio de peticiones rápidas, sin integraciones a base de datos ni lógica de negocio externa:
- `src/main.py`: Punto de entrada, arranca FastAPI y carga el modelo en memoria durante el evento `lifespan`.
- `src/ml.py`: Clase adaptadora que carga el modelo `.h5`/`.keras` encapsulando toda la lógica de validación, dimensionalidad y predicción tensorial.
- `src/router.py`: Controlador de las rutas (`/api/v1/predict`).
- `src/schemas.py`: Contratos Pydantic que dictan cómo deben llegar y salir los datos (Request/Response).
- `src/config.py`: Manejo y tipado de variables de entorno (espera `MODEL_PATH`).

## 🛠️ Ejecución Local

1. Asegúrate de tener un archivo `.env` en la raíz de `api/` con la variable del modelo apuntando a tu modelo pre-entrenado, por ejemplo:
```env
MODEL_PATH=model.h5
```

2. Ejecuta el servidor usando el entorno gestionado por `uv`:
```bash
uv run uvicorn src.main:app --reload
```

3. Explora la documentación autogenerada de la API (Swagger UI) en: `http://127.0.0.1:8000/docs`.