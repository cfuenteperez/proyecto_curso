import { AppBar, Chip, Toolbar, Typography } from '@mui/material';

interface AppHeaderProps {
  taskCount: number;
}

// formatTaskCount devuelve el texto del contador con el plural correcto.
function formatTaskCount(taskCount: number): string {
  return taskCount === 1 ? '1 tarea' : `${taskCount} tareas`;
}

// AppHeader muestra el titulo de la aplicacion y el numero de tareas.
function AppHeader({ taskCount }: AppHeaderProps) {
  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography component="h1" variant="h6">
          Mis Tareas
        </Typography>
        {taskCount > 0 && (
          <Chip
            label={formatTaskCount(taskCount)}
            size="small"
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'inherit' }}
          />
        )}
      </Toolbar>
    </AppBar>
  );
}

export default AppHeader;
