import AddIcon from '@mui/icons-material/Add';
import { Box, Container, Fab } from '@mui/material';
import { useState } from 'react';

import AppHeader from './components/AppHeader';
import EmptyState from './components/EmptyState';
import TaskFormDialog from './components/TaskFormDialog';
import TaskList from './components/TaskList';
import { useTaskManager } from './hooks/useTaskManager';

import type { NewTask, Task } from './types/Task';

// App coordina el estado local de tareas y las acciones principales del MVP.
function App() {
  const { createTask, deleteTask, sortedTasks, toggleTaskStatus, updateTask } =
    useTaskManager();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);

  // openCreateForm abre el formulario vacio para una nueva tarea.
  function openCreateForm(): void {
    setTaskBeingEdited(null);
    setIsFormOpen(true);
  }

  // openEditForm abre el formulario con los datos de la tarea elegida.
  function openEditForm(task: Task): void {
    setTaskBeingEdited(task);
    setIsFormOpen(true);
  }

  // closeForm cierra el formulario sin guardar cambios.
  function closeForm(): void {
    setIsFormOpen(false);
  }

  // handleSaveTask crea una tarea nueva o actualiza la que se esta editando.
  function handleSaveTask(task: NewTask): void {
    if (taskBeingEdited === null) {
      createTask(task);
    } else {
      updateTask(taskBeingEdited.id, task);
    }

    closeForm();
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader taskCount={sortedTasks.length} />

      <Container component="main" maxWidth="sm" sx={{ pb: 12, pt: 4 }}>
        {sortedTasks.length === 0 ? (
          <EmptyState onCreateTask={openCreateForm} />
        ) : (
          <TaskList
            onDeleteTask={deleteTask}
            onEditTask={openEditForm}
            onToggleTaskStatus={toggleTaskStatus}
            tasks={sortedTasks}
          />
        )}
      </Container>

      <Fab
        aria-label="Crear tarea"
        color="primary"
        onClick={openCreateForm}
        sx={{ bottom: 24, position: 'fixed', right: 24 }}
      >
        <AddIcon />
      </Fab>

      {isFormOpen && (
        <TaskFormDialog
          onClose={closeForm}
          onSave={handleSaveTask}
          task={taskBeingEdited}
        />
      )}
    </Box>
  );
}

export default App;
