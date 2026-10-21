import { useMemo, useState } from 'react';

import { calculateIce } from '../utils/calculateIce';

import type { NewTask, Task, TaskUpdate } from '../types/Task';

// createTaskId genera un identificador local suficiente para el MVP sin persistencia.
function createTaskId(): string {
  return `task-${crypto.randomUUID()}`;
}

// sortTasksByIce devuelve una nueva lista ordenada por puntuacion ICE descendente.
function sortTasksByIce(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (firstTask, secondTask) =>
      calculateIce(secondTask) - calculateIce(firstTask),
  );
}

// useTaskManager centraliza la gestion local de tareas y expone datos derivados.
export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const sortedTasks = useMemo(() => sortTasksByIce(tasks), [tasks]);

  // createTask anade una nueva tarea pendiente al estado local.
  function createTask(task: NewTask): void {
    setTasks((currentTasks) => [
      ...currentTasks,
      {
        ...task,
        id: createTaskId(),
        status: 'pending',
      },
    ]);
  }

  // updateTask actualiza los campos editables de una tarea existente.
  function updateTask(taskId: string, updates: TaskUpdate): void {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    );
  }

  // toggleTaskStatus alterna una tarea entre pendiente y completada.
  function toggleTaskStatus(taskId: string): void {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'pending' : 'completed',
            }
          : task,
      ),
    );
  }

  // deleteTask elimina una tarea del estado local.
  function deleteTask(taskId: string): void {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
  }

  return {
    createTask,
    deleteTask,
    sortedTasks,
    tasks,
    toggleTaskStatus,
    updateTask,
  };
}
