import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

export function TaskDetailGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const { id } = useParams();

  if (!isLoggedIn) {
    return <Navigate to={`/task/${id}/leaderboard`} replace />;
  }

  return <>{children}</>;
}
