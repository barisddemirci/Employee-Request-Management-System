import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { homeRouteForRole } from './roles';

// allowedRoles verilmezse sadece giriş şartı aranır.
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Yetkisi olmayan rol kendi ana sayfasına yönlenir.
    return <Navigate to={homeRouteForRole(role)} replace />;
  }

  return <Outlet />;
}
