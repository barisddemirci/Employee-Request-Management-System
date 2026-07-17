import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './auth/ProtectedRoute';
import { ROLES } from './auth/roles';
import RootRedirect from './pages/RootRedirect';
import MyRequests from './pages/employee/MyRequests';
import CreateRequest from './pages/employee/CreateRequest';
import RequestDetail from './pages/requests/RequestDetail';
import Approvals from './pages/manager/Approvals';
import AdminHome from './pages/admin/AdminHome';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Giriş yapmış tüm roller ortak layout altında */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<RootRedirect />} />

          {/* Talepler — tüm roller */}
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/requests/new" element={<CreateRequest />} />
          <Route path="/requests/:id" element={<RequestDetail />} />

          {/* Onaylar — Manager + Admin */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.Manager, ROLES.Admin]} />}>
            <Route path="/approvals" element={<Approvals />} />
          </Route>

          {/* Yönetim — sadece Admin */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.Admin]} />}>
            <Route path="/admin" element={<AdminHome />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
