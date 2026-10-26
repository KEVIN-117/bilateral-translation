# 🤟 Bilateral Translation System (MVP)

Un sistema de traducción bidireccional de lenguaje de señas construido con inteligencia artificial y desarrollo web moderno. Este proyecto es un **MVP** (Producto Mínimo Viable) diseñado para traducir secuencias en lenguaje de señas a texto mediante una cámara web, y viceversa, utilizando un catálogo de videos para la traducción de texto a seña.

## 🏗️ Arquitectura del Proyecto

El repositorio está estructurado en dos módulos principales completamente desacoplados:

### ⚙️ Backend: `api/` (FastAPI + TensorFlow)
Un microservicio dedicado exclusivamente a la predicción y procesamiento de Machine Learning.
- **Tecnologías:** FastAPI, TensorFlow / Keras, Python 3.13.
- **Funcionalidad:** Carga un modelo neuronal pre-entrenado de forma aislada y expone endpoints ligeros para realizar inferencia sobre capturas.

### 💻 Frontend: `client/` (Next.js)
La capa de presentación que interactúa directamente con el usuario, procesa la cámara y renderiza los resultados.
- **Tecnologías:** Next.js (App Router), Tailwind CSS, shadcn/ui.
- **Funcionalidad:** Interfaz gráfica para iniciar la cámara, previsualizar en tiempo real, enviar frames a la API de predicción y mostrar resultados o buscar en el diccionario (Texto -> Seña).

---

## 🚀 Guía de Inicialización Rápida

### 1. Iniciar la API (Backend)
```bash
cd api
# Asegúrate de tener 'uv' instalado para la gestión de dependencias y ejecución
uv run uvicorn src.main:app --reload
```
La API estará corriendo en `http://127.0.0.1:8000`.

### 2. Iniciar el Cliente Web (Frontend)
```bash
cd client
npm install
npm run dev
```
La aplicación web estará disponible en `http://localhost:3000`.

## 🐳 Despliegue con Docker

Las imágenes se construyen para `linux/amd64` y se publican en Docker Hub al hacer push a `main` o crear una etiqueta `v*`. Los pull requests ejecutan la construcción de ambas imágenes sin publicarlas.

1. En Docker Hub, crea los repositorios `bilateral-translation-api` y `bilateral-translation-client` bajo el namespace indicado por `DOCKERHUB_USERNAME`.
2. En GitHub, configura los secrets del repositorio `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN`. El token debe ser un Access Token de Docker Hub con permiso de escritura.
3. Copia `.env.deploy.example` a `.env` en el servidor y completa `DOCKERHUB_USERNAME`, `HF_REPO_ID` y, si el repositorio del modelo es privado, `HF_TOKEN`.
4. Descarga y levanta las imágenes publicadas:

```bash
docker compose pull
docker compose up -d
```

El cliente queda disponible en el puerto `CLIENT_PORT` (3000 por defecto). FastAPI solo se expone dentro de la red de Compose; Next.js reenvía las peticiones del navegador a la API. La API descarga el modelo de Hugging Face al iniciar, por lo que su primer arranque puede tardar varios minutos. El endpoint `/health` permite a Compose esperar a que termine esa carga.

Para seleccionar una publicación versionada, cambia `IMAGE_TAG` en `.env` (por ejemplo, `v1.2.0` o `sha-<commit>`). El valor predeterminado `latest` se actualiza desde `main`.

---

## 📌 Enfoque de Desarrollo
Este proyecto se rige por metodologías ágiles e incrementales. Actualmente el desarrollo está organizado en Issues dentro del repositorio, enfocándose inicialmente en un MVP funcional para demostrar la viabilidad de la arquitectura técnica antes de integrar flujos complejos en tiempo real.
