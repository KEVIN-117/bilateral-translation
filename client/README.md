# 💻 Bilateral Translation Client (UI)

Interfaz web para el **Sistema de Traducción de Señas Bidireccional**. Proporciona una experiencia de usuario simple e intuitiva para interactuar con los módulos de predicción (cámara a texto) y el diccionario estático (texto a seña).

## 🚀 Tecnologías Principales
- **Framework:** [Next.js](https://nextjs.org/) (App Router).
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) para prototipado rápido y diseño responsivo.
- **Componentes:** [shadcn/ui](https://ui.shadcn.com/) para accesibilidad y diseño limpio.

## 🧩 Funcionalidades (MVP)
- **Cámara (Seña → Texto):** Habilita la cámara web en tiempo real. Captura el input visual del usuario y se comunica vía HTTP con el microservicio Backend para renderizar la seña predicha junto con su nivel de confianza.
- **Diccionario (Texto → Seña):** Buscador integrado que mapea palabras escritas a un catálogo de videos pregrabados locales, demostrando de forma interactiva cómo realizar una seña.

## 🛠️ Instalación y Configuración Local

Para levantar este cliente en tu entorno local:

1. Instala las dependencias de Node.js:
```bash
npm install
```

2. Si la API corre en un puerto distinto, configura la variable apuntando a tu backend. Por defecto asume `localhost:8000`.

3. Inicia el servidor de desarrollo en modo watch (con HMR):
```bash
npm run dev
```

La plataforma de traducción estará accesible en tu navegador ingresando a [http://localhost:3000](http://localhost:3000).