# 🧠 Bilateral Translation API (Inference Service)

Microservicio minimalista desarrollado con **FastAPI** y **TensorFlow**, diseñado exclusivamente para la inferencia de lenguaje de señas.

##  Tecnologías
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
- `src/signs.py`: Catálogo de señas soportadas y ruta `/api/v1/signs`.
- `src/data/signs.json`: Los datos del catálogo. Agregar una seña se hace aquí, sin tocar código.

## 📡 Endpoints

### `POST /api/v1/predict`
Recibe una secuencia de keypoints de forma `(30, 1662)` y devuelve la seña reconocida.

### `GET /api/v1/signs`
Devuelve el catálogo de señas soportadas para el flujo Texto → Seña. El frontend
lo consume en lugar de mantener el mapeo palabra → video en su propio código.

```json
{
  "total": 10,
  "signs": [
    {
      "id": "hola",
      "word": "Hola",
      "aliases": ["saludo", "saludar", "buenas"],
      "videoUrl": "/videos/hola.mp4",
      "description": "Mano abierta a la altura de la sien, palma al frente...",
      "modelAction": "hello"
    }
  ]
}
```

`modelAction` es la etiqueta equivalente en el array `ACTIONS` de `src/ml.py`, o
`null` si el modelo todavía no reconoce esa seña.

#### Agregar una seña
1. Añade la entrada al array `signs` de `src/data/signs.json`.
2. Deja el archivo de video con el nombre que indica el campo `video`.

El catálogo se valida al arrancar: si el JSON tiene un id duplicado o le falta un
campo, la API falla al iniciar y no en la primera petición.

#### Dónde viven los videos
El archivo guarda solo el nombre (`hola.mp4`) y la API arma la URL con
`SIGNS_VIDEO_BASE_URL`. Por defecto vale `/videos`, que es donde el frontend los
sirve desde `client/public/videos/`. Para moverlos a un CDN basta con cambiar esa
variable de entorno, sin tocar los datos ni redesplegar el frontend:

```env
SIGNS_VIDEO_BASE_URL=https://cdn.ejemplo.com/signs
```

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