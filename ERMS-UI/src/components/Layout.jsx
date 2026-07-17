import { AppBar, Toolbar, Typography, Button, Box, Container, Chip } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '../auth/roles';

// Role göre gösterilecek gezinme sekmeleri.
const NAV_ITEMS = [
  { label: 'Taleplerim', to: '/requests', roles: [ROLES.Employee, ROLES.Manager, ROLES.Admin] },
  { label: 'Onaylar', to: '/approvals', roles: [ROLES.Manager, ROLES.Admin] },
  { label: 'Yönetim', to: '/admin', roles: [ROLES.Admin] },
];

export default function Layout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mr: 2 }}>
            ERMS
          </Typography>
          {items.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              color="inherit"
              sx={{
                fontWeight: location.pathname.startsWith(item.to) ? 700 : 400,
                textDecoration: location.pathname.startsWith(item.to) ? 'underline' : 'none',
              }}
            >
              {item.label}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {user.fullName}
              </Typography>
              <Chip label={role} size="small" color="secondary" sx={{ mr: 1 }} />
              <Button color="inherit" onClick={handleLogout}>
                Çıkış
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 3, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
