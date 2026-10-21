import type { IceScore, IceScoreDraft } from '../types/IceScore';

export const MIN_ICE_VALUE = 1;
export const MAX_ICE_VALUE = 10;

// isValidIceValue comprueba que un valor ICE sea entero y este dentro del rango permitido.
export function isValidIceValue(value: number): boolean {
  return (
    Number.isInteger(value) && value >= MIN_ICE_VALUE && value <= MAX_ICE_VALUE
  );
}

// validateIceScore comprueba que impacto, confianza y esfuerzo sean valores ICE validos.
export function validateIceScore({
  impact,
  confidence,
  effort,
}: IceScore): boolean {
  return [impact, confidence, effort].every(isValidIceValue);
}

// getValidIceScore devuelve los valores ICE completos y validos, o null si falta alguno.
export function getValidIceScore({
  impact,
  confidence,
  effort,
}: IceScoreDraft): IceScore | null {
  if (impact === null || confidence === null || effort === null) {
    return null;
  }

  const iceScore = { impact, confidence, effort };

  return validateIceScore(iceScore) ? iceScore : null;
}
