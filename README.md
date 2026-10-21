# Gestor de Tareas ICE

Aplicación web para gestionar tareas y priorizarlas con el modelo ICE, con sugerencias de una IA (Google Gemini).

## Lanzar la aplicación

Necesitas Node.js y npm.

```sh
npm install
cp .env.example .env
```

Abre `.env` y pon tu clave de Gemini en `VITE_GEMINI_API_KEY` (se consigue gratis en https://aistudio.google.com/apikey). Sin clave la aplicación funciona, pero no puede sugerir valores con IA.

```sh
npm run dev
```

Abre en el navegador la dirección que muestra la consola (normalmente http://localhost:5173).

## Compilar

```sh
npm run build
```

Comprueba los tipos y genera la versión de producción en la carpeta `dist/`.

La clave de Gemini queda incluida en el JavaScript compilado: no publiques esa versión con una clave real.

## Documentación

- `docs/app-screens.png`: bocetos de las pantallas.
- `design/app-screens.svg`: los mismos bocetos en formato SVG.
- `archivos-arnes-claude-code.docx`: guía del curso sobre los archivos de configuración de Claude Code.
