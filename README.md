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

---

## 📌 Enfoque de Desarrollo
Este proyecto se rige por metodologías ágiles e incrementales. Actualmente el desarrollo está organizado en Issues dentro del repositorio, enfocándose inicialmente en un MVP funcional para demostrar la viabilidad de la arquitectura técnica antes de integrar flujos complejos en tiempo real.
