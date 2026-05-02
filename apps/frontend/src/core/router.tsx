import { createBrowserRouter, Navigate } from 'react-router-dom';
import { TaskListPage } from '@/presentation/pages/TaskListPage';
import { TaskCreatePage } from '@/presentation/pages/TaskCreatePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <TaskListPage />,
  },
  {
    path: '/create',
    element: <TaskCreatePage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
