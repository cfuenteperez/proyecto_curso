# Gestor de Tareas ICE

Aplicación web de una sola página para crear tareas y priorizarlas con el modelo ICE. Una IA (Google Gemini) puede sugerir los valores de cada tarea.

Stack: React, TypeScript estricto, Vite y MUI. No hay backend, router, estado global ni persistencia.

## Comandos

- `npm install`: instala las dependencias.
- `cp .env.example .env` y rellena `VITE_GEMINI_API_KEY`. Sin clave la app funciona, pero la sugerencia de IA muestra un error.
- `npm run dev`: servidor de desarrollo en http://localhost:5173.
- `npm run build`: comprueba los tipos y genera la versión de producción en `dist/`.
- `npm run check`: ejecuta `typecheck`, `lint` y `format:check`. Pásalo antes de dar una tarea por terminada.
- `npm run lint:fix` y `npm run format`: corrigen automáticamente lo que marcan `lint` y `format:check`.
- No hay tests ni runner de tests. La verificación es `npm run check` más `npm run build`.

## Arquitectura

Todo el código está en `src/`, organizado en capas de la más baja a la más alta:

| Capa          | Responsabilidad                                                         | Puede importar de                           |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| `types/`      | Tipos del dominio (`Task`, `IceScore`). Sin lógica.                     | `types/`                                    |
| `utils/`      | Funciones puras: cálculo y validación del ICE.                          | `types/`                                    |
| `services/`   | Llamadas externas (Gemini con `fetch`).                                 | `utils/`, `types/`                          |
| `hooks/`      | Estado y lógica de React.                                               | `services/`, `utils/`, `types/`             |
| `components/` | Presentación con MUI. Reciben datos y callbacks por props.              | `components/`, `hooks/`, `utils/`, `types/` |
| `App.tsx`     | Raíz de composición: dueña de la lista de tareas y del diálogo abierto. | `components/`, `hooks/`, `types/`           |
| `main.tsx`    | Monta `App` con `StrictMode`, el tema de MUI y `CssBaseline`.           | `App.tsx`                                   |

- Ninguna capa importa de una capa superior.
- Los componentes no importan de `services/`: usan la IA a través de `useIceSuggestion`.
- `types/`, `utils/` y `services/` no importan React.

### Flujo de datos

- **Lista**: `useTaskManager`, que solo usa `App`, guarda las tareas con `useState` y expone `sortedTasks`, ordenada por ICE de mayor a menor. `App` la pasa a `TaskList` → `TaskItem`, y las acciones suben como callbacks.
- **Formulario**: `App` monta `TaskFormDialog` con la tarea que se edita, o con `null` para crear una. `useTaskForm` guarda el borrador en un reducer y deriva `calculatedIce` y `taskToSave`. `taskToSave` es `null` mientras el formulario no es válido, y eso desactiva «Guardar». Al guardar, `App` llama a `createTask` o a `updateTask`.
- **IA**: `TaskFormDialog` pide la sugerencia a `useIceSuggestion`, que llama a `getIceSuggestion`. Si llega, `applyIceScore` rellena los tres valores; si falla, `IceSuggestionPanel` muestra el mensaje y el usuario los introduce a mano.

### Modelo ICE

- `ICE = (impact × confidence) / effort`. Se calcula en `utils/calculateIce.ts` y se muestra con un decimal.
- Cada valor es un entero entre `MIN_ICE_VALUE` y `MAX_ICE_VALUE` (1 y 10), definidos en `utils/validateIceScore.ts`. Usa esas constantes; no escribas el rango a mano.
- En el borrador del formulario, un valor sin indicar es `null` (`IceScoreDraft`). Convierte el borrador en `IceScore` con `getValidIceScore`.
- El ICE no se guarda en `Task`: calcúlalo siempre con `calculateIce`.
- Las tareas nuevas empiezan en `pending`. El estado solo cambia con `toggleTaskStatus`; el formulario no lo edita.

## Dónde va el código nuevo

- Componente: `src/components/<Nombre>.tsx`, uno por archivo, con `export default`.
- Lógica de React con estado: `src/hooks/use<Nombre>.ts`.
- Llamada a un servicio externo: `src/services/<nombre>Service.ts`.
- Función pura: `src/utils/<nombreFuncion>.ts`. El archivo se llama como su función principal.
- Tipo del dominio: `src/types/<Nombre>.ts`.
- Colores y tema: el `createTheme` de `src/main.tsx`.
- Variable de entorno: prefijo `VITE_`, tipo en `ImportMetaEnv` (`src/vite-env.d.ts`) y una línea comentada en `.env.example`.

## Convenciones

- Escribe los identificadores en inglés. Escribe en español, sin tildes ni eñes, los textos de la interfaz, los mensajes de error y los comentarios (`Titulo`, `anade`). La única excepción es el texto del prompt de Gemini.
- Pon un comentario de una línea encima de cada función, componente y manejador, que empiece por su nombre: `// calculateIce devuelve la puntuacion ICE ...`.
- Declara los componentes como `function Nombre({ ... }: NombreProps)`, con la interfaz `NombreProps` justo encima y `export default Nombre` al final. No uses funciones flecha ni `React.FC` para los componentes.
- En las interfaces de props, pon primero los datos y después los callbacks `on<Accion>`. Llama `handle<Accion>` a los manejadores internos que responden a un evento o callback.
- Usa exports con nombre en hooks, servicios, utilidades y tipos. Los hooks devuelven un objeto, no una tupla.
- Importa los tipos con `import type`.
- Importa cada icono por su ruta (`import AddIcon from '@mui/icons-material/Add'`), nunca desde `@mui/icons-material`.
- Representa la ausencia de valor con `null`, no con `undefined`, y compárala de forma explícita (`task === null`).
- No mutes el estado: usa `setState` con función, spread y copias (`[...tasks].sort(...)`).
- Estiliza con la prop `sx` y los tokens del tema (`'primary.main'`, `'background.default'`). No crees archivos CSS ni uses `styled`.
- Ordena alfabéticamente las props en JSX y las propiedades del objeto que devuelve cada hook. `impact`, `confidence` y `effort` siguen siempre ese orden.
- Declara el tipo de retorno de las funciones auxiliares y de los manejadores.
- Escribe las constantes de módulo en `UPPER_SNAKE_CASE`.

## Trampas y decisiones no evidentes

- No hay persistencia, por decisión del MVP: las tareas viven en memoria y se pierden al recargar. No añadas `localStorage` ni un backend si no te lo piden.
- `App` monta `TaskFormDialog` solo mientras está abierto, para que `useTaskForm` se reinicie en cada apertura. Si lo dejas siempre montado y lo controlas con `open`, el formulario conservará los datos anteriores.
- La clave de Gemini se envía desde el navegador y queda dentro del JavaScript de `dist/`. No publiques un build hecho con una clave real ni copies la clave fuera de `.env`.
- `getIceSuggestion` solo lanza `AiIceServiceError`, con un mensaje en español listo para mostrar. Si añades un caso de error, añade su mensaje a `ERROR_MESSAGES` y no dejes escapar otro tipo de error.
- La respuesta de Gemini se valida con `isValidIceValue` aunque la petición ya incluye un `responseSchema`. No quites esa validación.
- El rango 1–10 también está escrito en el texto de `buildIcePrompt`. Si cambias `MIN_ICE_VALUE` o `MAX_ICE_VALUE`, actualiza el prompt.
- Los ids de las tareas usan `crypto.randomUUID()`, que solo funciona en `localhost` o con HTTPS. Si abres la app por `http://<IP>` (por ejemplo, con `npm run dev -- --host` desde el móvil), crear una tarea falla.
- Los bocetos (`design/app-screens.svg` y `docs/app-screens.png`) son orientativos. Muestran menús en la barra, un chip «NUEVA», el aviso «Tarea guardada» y colores del ICE por rango que la app no tiene. Si difieren, vale el código: no implementes esas piezas si no te lo piden.
- En Windows con `core.autocrlf=true`, la copia de trabajo tiene finales de línea CRLF y Prettier espera LF, así que `format:check` (y por tanto `check`) marca todos los archivos a la vez. No es un fallo de formato: comprueba el formato real con `npx prettier . --check --end-of-line auto`, y `typecheck` y `lint` por separado.
