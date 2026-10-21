import { isValidIceValue } from '../utils/validateIceScore';

import type { IceScore } from '../types/IceScore';

const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 15000;

const ERROR_MESSAGES = {
  invalidKey:
    'El servicio de IA rechazo la peticion. Revisa que la clave de Gemini sea valida.',
  invalidResponse: 'La IA devolvio una respuesta con un formato inesperado.',
  missingKey:
    'Falta la clave de la API de Gemini. Configura VITE_GEMINI_API_KEY en el archivo .env.',
  network:
    'No se pudo conectar con el servicio de IA. Revisa tu conexion e intentalo de nuevo.',
  quotaExceeded:
    'Se ha superado el limite gratuito de la API de IA. Espera un momento y vuelve a intentarlo.',
  unavailable:
    'El servicio de IA no esta disponible ahora mismo. Intentalo mas tarde.',
};

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

// AiIceServiceError representa un fallo de la sugerencia ICE con un mensaje apto para el usuario.
export class AiIceServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiIceServiceError';
  }
}

function buildIcePrompt(taskText: string): string {
  return `Analiza la siguiente tarea y estima sus valores ICE.

Tarea:
"${taskText}"

Devuelve solo JSON válido con este formato:
{
  "impact": number,
  "confidence": number,
  "effort": number
}

Reglas:
- impact debe estar entre 1 y 10.
- confidence debe estar entre 1 y 10.
- effort debe estar entre 1 y 10.
- No añadas explicación.`;
}

// buildRequestBody pide a Gemini una respuesta JSON con tres enteros obligatorios.
function buildRequestBody(taskText: string) {
  return {
    contents: [{ role: 'user', parts: [{ text: buildIcePrompt(taskText) }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          impact: { type: 'INTEGER' },
          confidence: { type: 'INTEGER' },
          effort: { type: 'INTEGER' },
        },
        required: ['impact', 'confidence', 'effort'],
      },
    },
  };
}

// getHttpErrorMessage traduce el codigo HTTP de Gemini a un mensaje legible.
function getHttpErrorMessage(status: number): string {
  if (status === 429) {
    return ERROR_MESSAGES.quotaExceeded;
  }

  if (status === 400 || status === 401 || status === 403) {
    return ERROR_MESSAGES.invalidKey;
  }

  return ERROR_MESSAGES.unavailable;
}

// isIceValue comprueba que un valor externo sea un entero ICE valido.
function isIceValue(value: unknown): value is number {
  return typeof value === 'number' && isValidIceValue(value);
}

// parseIceScore extrae y valida los valores ICE del texto JSON devuelto por la IA.
function parseIceScore(text: string): IceScore {
  const parsed: unknown = JSON.parse(text);

  if (typeof parsed !== 'object' || parsed === null) {
    throw new AiIceServiceError(ERROR_MESSAGES.invalidResponse);
  }

  const { impact, confidence, effort } = parsed as Record<string, unknown>;

  if (!isIceValue(impact) || !isIceValue(confidence) || !isIceValue(effort)) {
    throw new AiIceServiceError(ERROR_MESSAGES.invalidResponse);
  }

  return { impact, confidence, effort };
}

// readIceScore obtiene los valores ICE del cuerpo de la respuesta de Gemini.
async function readIceScore(response: Response): Promise<IceScore> {
  try {
    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text === undefined) {
      throw new AiIceServiceError(ERROR_MESSAGES.invalidResponse);
    }

    return parseIceScore(text);
  } catch (error) {
    if (error instanceof AiIceServiceError) {
      throw error;
    }

    throw new AiIceServiceError(ERROR_MESSAGES.invalidResponse);
  }
}

// getIceSuggestion pide a Gemini una estimacion ICE para la tarea indicada.
export async function getIceSuggestion(taskText: string): Promise<IceScore> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new AiIceServiceError(ERROR_MESSAGES.missingKey);
  }

  let response: Response;

  try {
    response = await fetch(GEMINI_API_URL, {
      body: JSON.stringify(buildRequestBody(taskText)),
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      method: 'POST',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new AiIceServiceError(ERROR_MESSAGES.network);
  }

  if (!response.ok) {
    throw new AiIceServiceError(getHttpErrorMessage(response.status));
  }

  return readIceScore(response);
}
