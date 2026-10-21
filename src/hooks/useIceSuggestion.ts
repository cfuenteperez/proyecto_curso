import { useState } from 'react';

import { AiIceServiceError, getIceSuggestion } from '../services/aiIceService';

import type { IceScore } from '../types/IceScore';

const UNEXPECTED_ERROR_MESSAGE = 'No se pudo obtener la sugerencia de IA.';

// useIceSuggestion expone la sugerencia ICE de la IA junto a su estado de carga y error.
export function useIceSuggestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<IceScore | null>(null);

  // requestSuggestion pide a la IA valores ICE y devuelve null si la peticion falla.
  async function requestSuggestion(taskText: string): Promise<IceScore | null> {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const iceScore = await getIceSuggestion(taskText);
      setSuggestion(iceScore);

      return iceScore;
    } catch (requestError) {
      setError(
        requestError instanceof AiIceServiceError
          ? requestError.message
          : UNEXPECTED_ERROR_MESSAGE,
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  return { error, loading, requestSuggestion, suggestion };
}
