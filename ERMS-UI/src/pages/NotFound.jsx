import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFound() {
  return (
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h3" sx={{ fontWeight: 700 }}>404</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Sayfa bulunamadı.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Ana sayfaya dön
      </Button>
    </Box>
  );
}
