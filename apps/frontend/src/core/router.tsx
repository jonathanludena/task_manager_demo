import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/presentation/components/atoms/Layout';
import { TaskListPage } from '@/presentation/pages/TaskListPage';
import { TaskCreatePage } from '@/presentation/pages/TaskCreatePage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <TaskListPage /> },
      { path: '/create', element: <TaskCreatePage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
