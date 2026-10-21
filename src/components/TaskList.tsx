import { Stack, Typography } from '@mui/material';

import TaskItem from './TaskItem';

import type { Task } from '../types/Task';

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onToggleTaskStatus: (taskId: string) => void;
}

// TaskList muestra las tareas en el orden recibido, ya priorizadas por ICE.
function TaskList({
  tasks,
  onDeleteTask,
  onEditTask,
  onToggleTaskStatus,
}: TaskListProps) {
  return (
    <Stack spacing={2}>
      <Typography color="text.secondary" variant="body2">
        Ordenadas por ICE (mayor a menor)
      </Typography>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          onDelete={onDeleteTask}
          onEdit={onEditTask}
          onToggleStatus={onToggleTaskStatus}
          task={task}
        />
      ))}
    </Stack>
  );
}

export default TaskList;
