# 🤖 Módulo de Entrenamiento (Training Pipeline)

Este directorio contiene los cuadernos (Jupyter Notebooks) y scripts aislados responsables de la recolección de datos, extracción de keypoints (MediaPipe) y entrenamiento del modelo neuronal (LSTM) para el reconocimiento de señas.

Forma parte del ecosistema del **Bilateral Translation System**, separando estrictamente el ciclo de vida de experimentación (MLOps) del código de la API de producción.

## 📂 Archivos Principales

- `Train.ipynb` / `RealTimeSignLanguageDetection.ipynb`: Cuadernos interactivos con el flujo de machine learning paso a paso (recolección, preprocesamiento, arquitectura del modelo LSTM, entrenamiento y métricas).
- `model.h5` / `model_weights.h5`: Los artefactos locales serializados que resultan del entrenamiento.
- `upload_model.py`: Script para automatizar la subida del modelo resultante al Model Registry.

## 🚀 Flujo de Trabajo (Hugging Face Hub)

Para evitar inflar el historial de Git con modelos pesados, hemos adoptado **Hugging Face Hub** como nuestro registro central de modelos. El ciclo de vida de desarrollo de un modelo es el siguiente:

1. **Entrenamiento Local:** Abre y ejecuta los Notebooks en tu entorno. Al finalizar, el código sobrescribirá el archivo `model.h5` local.
2. **Validación:** Comprueba en las últimas celdas del Notebook que el `confidence` y el `accuracy` de validación sean aceptables.
3. **Publicación en Hugging Face:** 
   No hagas `git add model.h5`. En su lugar, ejecuta el script de subida para actualizar la versión del modelo en la nube:
   ```bash
   python upload_model.py
   ```
4. **Despliegue:** Una vez en Hugging Face, la API (Backend) podrá descargar la última versión optimizada automáticamente durante su proceso de construcción o arranque.

## 🛠️ Requisitos del Entorno (Machine Learning)

El entorno para entrenar requiere dependencias mucho más pesadas que las de la API. Debes instalar:
- `tensorflow`
- `mediapipe`
- `opencv-python`
- `numpy`
- `scikit-learn`
- `matplotlib`
- `huggingface_hub`

> **Tip:** Se recomienda mantener activo el entorno virtual (`.venv/`) aislado dentro de este directorio al trabajar con Jupyter o VSCode.

## ➕ Cómo añadir nuevas señas al MVP
Si necesitas que el modelo reconozca nuevas palabras:
1. Recolecta un nuevo set de carpetas con secuencias (usando OpenCV y MediaPipe).
2. Agrega la nueva etiqueta al array `ACTIONS` en tu código.
3. Re-entrena el modelo modificando la capa de salida (Dense layer) para ajustarse al nuevo número de clases.
4. Sube la nueva versión a Hugging Face Hub.