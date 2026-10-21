import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useIceSuggestion } from '../hooks/useIceSuggestion';
import { useTaskForm } from '../hooks/useTaskForm';

import IceFields from './IceFields';
import IceScoreBadge from './IceScoreBadge';
import IceSuggestionPanel from './IceSuggestionPanel';

import type { NewTask, Task } from '../types/Task';
import type { FormEvent } from 'react';

interface TaskFormDialogProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: NewTask) => void;
}

// TaskFormDialog permite crear una tarea o editar una existente con su puntuacion ICE.
function TaskFormDialog({ task, onClose, onSave }: TaskFormDialogProps) {
  const {
    applyIceScore,
    calculatedIce,
    changeIce,
    changeText,
    taskText,
    taskToSave,
    values,
  } = useTaskForm(task);
  const { error, loading, requestSuggestion, suggestion } = useIceSuggestion();

  // handleRequestSuggestion pide la sugerencia ICE y la aplica a los campos manuales.
  async function handleRequestSuggestion(): Promise<void> {
    const iceScore = await requestSuggestion(taskText);

    if (iceScore !== null) {
      applyIceScore(iceScore);
    }
  }

  // handleSubmit guarda la tarea solo si el formulario es valido.
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (taskToSave !== null) {
      onSave(taskToSave);
    }
  }

  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open>
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <DialogTitle sx={{ pr: 6 }}>
          {task === null ? 'Nueva tarea' : 'Editar tarea'}
        </DialogTitle>
        <IconButton
          aria-label="Cerrar"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              autoFocus
              fullWidth
              label="Titulo"
              onChange={(event) => changeText('title', event.target.value)}
              required
              value={values.title}
            />
            <TextField
              fullWidth
              label="Descripcion"
              minRows={3}
              multiline
              onChange={(event) =>
                changeText('description', event.target.value)
              }
              value={values.description}
            />
            <Typography color="text.secondary" variant="overline">
              Puntuacion ICE
            </Typography>
            <IceSuggestionPanel
              canRequest={taskText !== ''}
              error={error}
              loading={loading}
              onRequest={handleRequestSuggestion}
              suggestion={suggestion}
            />
            <IceFields onChange={changeIce} values={values} />
            <Box textAlign="center">
              <IceScoreBadge score={calculatedIce} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            disabled={taskToSave === null}
            type="submit"
            variant="contained"
          >
            Guardar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default TaskFormDialog;
