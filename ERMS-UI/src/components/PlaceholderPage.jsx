import { Paper, Typography, Box } from '@mui/material';

// Faz 2-4'te gerçek ekranlarla değiştirilecek geçici sayfa.
export default function PlaceholderPage({ title, description }) {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">
          {description || 'Bu ekran sonraki fazda geliştirilecek.'}
        </Typography>
      </Paper>
    </Box>
  );
}
