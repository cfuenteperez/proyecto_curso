import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { calculateIce } from '../utils/calculateIce';

import IceScoreBadge from './IceScoreBadge';

import type { Task } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onToggleStatus: (taskId: string) => void;
}

// getTaskStatusLabel devuelve el texto visible para el estado de una tarea.
function getTaskStatusLabel(task: Task): string {
  return task.status === 'completed' ? 'Completada' : 'Pendiente';
}

// getToggleStatusLabel describe la accion que alterna el estado de la tarea.
function getToggleStatusLabel(task: Task): string {
  return task.status === 'completed'
    ? 'Marcar como pendiente'
    : 'Completar tarea';
}

// TaskItem muestra una tarea con su puntuacion ICE y sus acciones.
function TaskItem({ task, onDelete, onEdit, onToggleStatus }: TaskItemProps) {
  const isCompleted = task.status === 'completed';

  return (
    <Card sx={{ opacity: isCompleted ? 0.68 : 1 }} variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography
              component="h2"
              sx={{ textDecoration: isCompleted ? 'line-through' : 'none' }}
              variant="h6"
            >
              {task.title}
            </Typography>
            <IceScoreBadge muted={isCompleted} score={calculateIce(task)} />
          </Stack>
          <Typography color="text.secondary">{task.description}</Typography>
          <Typography color="text.secondary" variant="body2">
            Impacto {task.impact} - Confianza {task.confidence} - Esfuerzo{' '}
            {task.effort}
          </Typography>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
          >
            <Chip
              color={isCompleted ? 'success' : 'info'}
              label={getTaskStatusLabel(task)}
              size="small"
              variant="outlined"
            />
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={getToggleStatusLabel(task)}>
                <IconButton
                  color="success"
                  onClick={() => onToggleStatus(task.id)}
                  size="small"
                >
                  {isCompleted ? (
                    <ReplayIcon fontSize="small" />
                  ) : (
                    <CheckCircleOutlineIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar tarea">
                <IconButton onClick={() => onEdit(task)} size="small">
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar tarea">
                <IconButton
                  color="error"
                  onClick={() => onDelete(task.id)}
                  size="small"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default TaskItem;
