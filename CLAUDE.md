# Gestor de Tareas ICE

Aplicación web de una sola página para gestionar tareas y priorizarlas con el modelo ICE: `ICE = (Impacto × Confianza) / Esfuerzo`, con valores enteros de 1 a 10. Una IA (Google Gemini) puede sugerir los tres valores a partir del título y la descripción. No hay backend ni persistencia: las tareas viven en memoria y se pierden al recargar.

## Stack

- React + TypeScript (`strict`) + Vite.
- Material UI (componentes e iconos), con Emotion como motor de estilos.
- Estado con hooks de React. Sin librería de estado global, router ni librería de formularios.
- Gemini se llama con `fetch` desde el navegador.
- No hay tests. Si se añaden, usa Vitest + Testing Library.

## Comandos

- Instalar: `npm install` y `cp .env.example .env`; pon la clave en `VITE_GEMINI_API_KEY`. Sin clave la app funciona, pero la sugerencia de IA devuelve un error.
- Arrancar: `npm run dev` (http://localhost:5173).
- Verificar: `npm run check` (tipos + ESLint + Prettier). Ejecútalo antes de dar una tarea por terminada.
- Corregir: `npm run lint:fix` y `npm run format`.
- Compilar: `npm run build` (comprueba tipos y genera `dist/`).

## Arquitectura

### Capas

Todo el código está en `src/`, agrupado por tipo de archivo. Cada capa importa solo de las que están por encima en la tabla.

| Capa          | Responsabilidad                                                      |
| ------------- | -------------------------------------------------------------------- |
| `types/`      | Tipos e interfaces del dominio.                                      |
| `utils/`      | Funciones puras y constantes del dominio (cálculo y validación ICE). |
| `services/`   | Entrada/salida externa (API de Gemini). Sin React ni estado.         |
| `hooks/`      | Estado y lógica con hooks de React.                                  |
| `components/` | Interfaz con Material UI.                                            |
| `App.tsx`     | Raíz: estado de las tareas y apertura del formulario.                |
| `main.tsx`    | Monta React con el tema de MUI y `CssBaseline`.                      |

- Un componente nunca importa de `services/`: accede a ellos a través de un hook.
- `services/` y `utils/` no importan React.

### Flujo de datos

- Lista: `useTaskManager` guarda las tareas en un `useState` y deriva `sortedTasks` (ICE descendente) con `useMemo`. `App` lo llama una sola vez y pasa la lista y los callbacks por props a `TaskList` → `TaskItem`. No hay Context.
- Formulario: `App` decide si `TaskFormDialog` está abierto y qué tarea se edita (`null` = nueva). El diálogo combina dos hooks:
  - `useTaskForm`: valores del formulario (`useReducer`), ICE calculado y `taskToSave`, que vale `null` mientras el formulario no sea válido.
  - `useIceSuggestion`: llama a `getIceSuggestion` (`aiIceService`) y expone `loading`, `error` y `suggestion`. Si la IA responde, el diálogo vuelca los valores en los sliders con `applyIceScore`.
- Al guardar, el diálogo entrega un `NewTask` a `App`, que llama a `createTask` o `updateTask`.

## Dónde va el código nuevo

- Tipo o interfaz del dominio → `src/types/<Entidad>.ts`.
- Función pura o constante del dominio → `src/utils/<nombreFuncion>.ts`.
- Llamada a una API externa → `src/services/<nombre>Service.ts`. Ningún otro archivo usa `fetch`.
- Estado o lógica con hooks → `src/hooks/use<Nombre>.ts`.
- Componente → `src/components/<Nombre>.tsx`, uno por archivo.
- Colores y tipografía → `createTheme` en `src/main.tsx`.
- Variable de entorno → con prefijo `VITE_`, declarada en `ImportMetaEnv` (`src/vite-env.d.ts`) y añadida a `.env.example`.

## Convenciones

### Nombres e idioma

- Identificadores en inglés. Textos de la interfaz, mensajes de error y comentarios en español, con tildes y ortografía correcta.
- Componentes: `function Nombre(...)` y `export default` al final del archivo. Hooks, utilidades y servicios: `export function` con nombre.
- Props: `interface <Componente>Props` encima del componente. Los callbacks recibidos se llaman `on<Acción>` (`onDelete`, `onToggleStatus`); los manejadores internos, `handle<Acción>`.
- Constantes de módulo en `UPPER_SNAKE_CASE`, al principio del archivo que las usa.
- Ordena alfabéticamente las props en JSX y las claves de los objetos que devuelven los hooks.
- Importa los tipos con `import type`.

### Código

- Cada función, hook y componente lleva encima un comentario de una línea: `// nombre hace…`.
- Las funciones auxiliares declaran su tipo de retorno; componentes y hooks lo infieren.
- Un componente no pasa de 150 líneas. Si crece, extrae subcomponentes o mueve lógica a un hook.
- La lógica de negocio va en `utils/` o en hooks. En un componente solo hay funciones auxiliares de presentación (como `formatTaskCount`).
- Estiliza con la prop `sx` y los tokens del tema (`'primary.main'`, `'text.secondary'`). No hay archivos CSS ni `styled`.
- Los botones que solo tienen icono llevan `aria-label` o un `Tooltip`.

### Estado y operaciones asíncronas

- Actualiza el estado sin mutarlo y con la forma funcional: `setTasks((currentTasks) => …)`.
- No guardes en el estado lo que se puede calcular: derívalo al renderizar o con `useMemo`.
- Un hook con una operación asíncrona expone `loading` y `error: string | null`. Al empezar, pone `error` a `null` y `loading` a `true`; en el `finally`, vuelve a poner `loading` a `false`. La interfaz muestra `CircularProgress` mientras carga y un `Alert` si hay error.
- Cada servicio lanza su propia clase de error (como `AiIceServiceError`) con un mensaje listo para el usuario. El hook muestra ese mensaje y usa uno genérico para cualquier otro error. Nunca muestres el error técnico.

## Trampas y decisiones poco evidentes

- `VITE_GEMINI_API_KEY` queda incrustada en el JavaScript compilado. No publiques un build con una clave real y no subas `.env`.
- La puntuación ICE nunca se guarda en `Task`: se calcula con `calculateIce`. No añadas un campo `iceScore`.
- En una tarea nueva, los valores ICE empiezan en `null` (`IceScoreDraft`), no en 1. Guardar sigue desactivado hasta que hay título y los tres valores son válidos.
- En `IceFields`, un slider sin valor no emite `onChange` al pulsar el mínimo; por eso también escucha `onChangeCommitted`. No lo quites.
- `TaskFormDialog` solo se monta mientras está abierto (`isFormOpen && …`), para que `useReducer` se inicialice con la tarea que se edita. Si lo dejas siempre montado y lo controlas con la prop `open`, el formulario arrastra los datos anteriores.
- `useTaskManager` crea su propio estado: llámalo solo en `App`. Una segunda llamada tendría una lista independiente.
- La sugerencia se pide con el título y la descripción unidos (`taskText`), así que basta con rellenar uno de los dos.
- La respuesta de Gemini se valida con `isValidIceValue` aunque la petición incluya un `responseSchema` que exige enteros. No quites esa validación. Si cambias el prompt o el esquema, mantenlos coherentes.
- `MIN_ICE_VALUE` y `MAX_ICE_VALUE` (`validateIceScore.ts`) controlan la validación y los sliders, pero el prompt de `aiIceService` escribe el rango «entre 1 y 10» como texto: si cambias el rango, actualiza también el prompt.
- Prettier también revisa los `.md`: tras editar documentación, ejecuta `npm run format` o `npm run check` fallará.
