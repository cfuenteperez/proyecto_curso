import { Chip } from '@mui/material';

interface IceScoreBadgeProps {
  score: number | null;
  muted?: boolean;
}

// formatIceScore muestra la puntuacion ICE con una precision estable, o un guion si aun no existe.
function formatIceScore(score: number | null): string {
  return score === null ? 'ICE —' : `ICE ${score.toFixed(1)}`;
}

// IceScoreBadge muestra la puntuacion ICE calculada.
function IceScoreBadge({ score, muted = false }: IceScoreBadgeProps) {
  const isHighlighted = score !== null && !muted;

  return (
    <Chip
      color={isHighlighted ? 'primary' : 'default'}
      label={formatIceScore(score)}
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}

export default IceScoreBadge;
