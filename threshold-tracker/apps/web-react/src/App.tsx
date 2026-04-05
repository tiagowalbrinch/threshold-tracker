import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './features/login/Login';
import { Register } from './features/register/Register';
import { Dashboard } from './features/dashboard/Dashboard';
import { Profile } from './features/profile/Profile';
import { Leaderboard } from './features/leaderboard/Leaderboard';
import { TaskDetailsLogged } from './features/task-details/TaskDetailsLogged';
import { TaskDetailsPublic } from './features/task-details/TaskDetailsPublic';
import { AuthGuard } from './guards/AuthGuard';
import { TaskDetailGuard } from './guards/TaskDetailGuard';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      {
        path: 'task/:id',
        element: (
          <TaskDetailGuard>
            <TaskDetailsLogged />
          </TaskDetailGuard>
        ),
      },
      { path: 'task/:id/leaderboard', element: <TaskDetailsPublic /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      {
        path: 'profile',
        element: (
          <AuthGuard>
            <Profile />
          </AuthGuard>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
