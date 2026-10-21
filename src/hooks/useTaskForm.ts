import { useMemo, useReducer } from 'react';

import { calculateIce } from '../utils/calculateIce';
import { getValidIceScore } from '../utils/validateIceScore';

import type { IceField, IceScore, IceScoreDraft } from '../types/IceScore';
import type { NewTask, Task } from '../types/Task';

type TaskTextField = 'title' | 'description';

interface TaskFormValues extends IceScoreDraft {
  title: string;
  description: string;
}

type TaskFormAction =
  | { type: 'changeText'; field: TaskTextField; value: string }
  | { type: 'changeIce'; field: IceField; value: number }
  | { type: 'applyIce'; value: IceScore };

const EMPTY_FORM_VALUES: TaskFormValues = {
  confidence: null,
  description: '',
  effort: null,
  impact: null,
  title: '',
};

// getInitialValues prepara el formulario vacio o con los datos de la tarea a editar.
function getInitialValues(task: Task | null): TaskFormValues {
  if (task === null) {
    return EMPTY_FORM_VALUES;
  }

  return {
    confidence: task.confidence,
    description: task.description,
    effort: task.effort,
    impact: task.impact,
    title: task.title,
  };
}

// taskFormReducer aplica cada cambio creando un nuevo objeto de valores.
function taskFormReducer(
  values: TaskFormValues,
  action: TaskFormAction,
): TaskFormValues {
  switch (action.type) {
    case 'changeText':
    case 'changeIce':
      return { ...values, [action.field]: action.value };
    case 'applyIce':
      return { ...values, ...action.value };
  }
}

// calculateDraftIce devuelve la puntuacion ICE o null si faltan valores validos.
function calculateDraftIce(values: TaskFormValues): number | null {
  const iceScore = getValidIceScore(values);

  return iceScore === null ? null : calculateIce(iceScore);
}

// buildTaskText une titulo y descripcion para pedir la sugerencia ICE a la IA.
function buildTaskText(values: TaskFormValues): string {
  return [values.title.trim(), values.description.trim()]
    .filter((text) => text !== '')
    .join('\n');
}

// buildTaskToSave devuelve la tarea lista para guardar, o null si el formulario no es valido.
function buildTaskToSave(values: TaskFormValues): NewTask | null {
  const title = values.title.trim();
  const iceScore = getValidIceScore(values);

  if (title === '' || iceScore === null) {
    return null;
  }

  return { ...iceScore, description: values.description.trim(), title };
}

// useTaskForm expone los valores del formulario de tarea, su ICE y la tarea lista para guardar.
export function useTaskForm(taskToEdit: Task | null) {
  const [values, dispatch] = useReducer(
    taskFormReducer,
    taskToEdit,
    getInitialValues,
  );

  const calculatedIce = useMemo(() => calculateDraftIce(values), [values]);
  const taskText = buildTaskText(values);
  const taskToSave = buildTaskToSave(values);

  // changeText actualiza el titulo o la descripcion.
  function changeText(field: TaskTextField, value: string): void {
    dispatch({ type: 'changeText', field, value });
  }

  // changeIce actualiza uno de los valores Impacto, Confianza o Esfuerzo.
  function changeIce(field: IceField, value: number): void {
    dispatch({ type: 'changeIce', field, value });
  }

  // applyIceScore rellena a la vez Impacto, Confianza y Esfuerzo.
  function applyIceScore(iceScore: IceScore): void {
    dispatch({ type: 'applyIce', value: iceScore });
  }

  return {
    applyIceScore,
    calculatedIce,
    changeIce,
    changeText,
    taskText,
    taskToSave,
    values,
  };
}
