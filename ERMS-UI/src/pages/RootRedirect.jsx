import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { homeRouteForRole } from '../auth/roles';

// Kök "/" isteğini role göre doğru ana sayfaya yönlendirir.
export default function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={homeRouteForRole(role)} replace />;
}
