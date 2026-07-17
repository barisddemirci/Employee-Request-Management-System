import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Chip, CircularProgress, Alert, Button, Stack,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getPendingApprovals } from '../../api/approvals';
import { parseApiError } from '../../utils/apiError';
import { formatDate, formatAmount, PRIORITY_LABELS } from '../../utils/format';
import StatusChip from '../../components/StatusChip';

export default function Approvals() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await getPendingApprovals());
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Bekleyen Onaylar</Typography>
        <Button startIcon={<RefreshIcon />} onClick={load}>Yenile</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Tür</TableCell>
                <TableCell>Talep Eden</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Öncelik</TableCell>
                <TableCell>Tutar</TableCell>
                <TableCell>Oluşturulma</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Bekleyen onay yok.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((r) => (
                  <TableRow
                    key={r.id} hover sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/requests/${r.id}?context=approval`)}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{r.title}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.requesterName}</TableCell>
                    <TableCell><StatusChip status={r.status} /></TableCell>
                    <TableCell>
                      <Chip size="small" variant="outlined" label={PRIORITY_LABELS[r.priority] ?? r.priority} />
                    </TableCell>
                    <TableCell>{formatAmount(r.amount)}</TableCell>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
