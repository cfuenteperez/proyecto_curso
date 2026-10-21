import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';

import type { IceScore } from '../types/IceScore';

interface IceSuggestionPanelProps {
  canRequest: boolean;
  error: string | null;
  loading: boolean;
  suggestion: IceScore | null;
  onRequest: () => void;
}

// IceSuggestionPanel permite pedir una sugerencia ICE a la IA y muestra su resultado.
function IceSuggestionPanel({
  canRequest,
  error,
  loading,
  suggestion,
  onRequest,
}: IceSuggestionPanelProps) {
  return (
    <Stack spacing={1}>
      <Button
        disabled={!canRequest || loading}
        fullWidth
        onClick={onRequest}
        startIcon={
          loading ? <CircularProgress size={18} /> : <AutoAwesomeIcon />
        }
        variant="outlined"
      >
        {loading ? 'Calculando sugerencia...' : 'Sugerir ICE con IA'}
      </Button>
      {!canRequest && (
        <Typography color="text.secondary" variant="caption">
          Escribe un titulo o una descripcion para pedir la sugerencia.
        </Typography>
      )}
      {error !== null && (
        <Alert severity="error">
          {error} Puedes introducir los valores manualmente.
        </Alert>
      )}
      {suggestion !== null && (
        <Alert icon={<AutoAwesomeIcon fontSize="inherit" />} severity="info">
          Sugerencia de IA aplicada: Impacto {suggestion.impact} - Confianza{' '}
          {suggestion.confidence} - Esfuerzo {suggestion.effort}. Puedes
          ajustarla abajo.
        </Alert>
      )}
    </Stack>
  );
}

export default IceSuggestionPanel;
