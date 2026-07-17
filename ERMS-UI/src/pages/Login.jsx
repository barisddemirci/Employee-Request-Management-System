import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, CircularProgress,
} from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { homeRouteForRole } from '../auth/roles';

export default function Login() {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Zaten girişliyse login'de durma, ana sayfaya git.
  if (isAuthenticated) {
    return <Navigate to={homeRouteForRole(role)} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const next = await login(email, password);
      const from = location.state?.from?.pathname;
      navigate(from || homeRouteForRole(next.user?.role), { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 400) {
        setError('E-posta veya şifre hatalı.');
      } else if (err?.code === 'ERR_NETWORK') {
        setError('Sunucuya ulaşılamadı. API çalışıyor mu? (https://localhost:7299)');
      } else {
        setError('Giriş sırasında bir hata oluştu.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          ERMS Giriş
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Talep yönetim sistemine giriş yapın.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="E-posta"
            type="email"
            fullWidth
            required
            autoFocus
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Şifre"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting}
            sx={{ mt: 3 }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
