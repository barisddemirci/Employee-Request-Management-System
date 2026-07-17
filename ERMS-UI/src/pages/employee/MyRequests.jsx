import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Table, TableHead, TableBody, TableRow,
  TableCell, TableContainer, TablePagination, TextField, MenuItem, Stack, Chip,
  CircularProgress, Alert, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { getMyRequests, getRequestTypes } from '../../api/requests';
import { parseApiError } from '../../utils/apiError';
import { formatDate, formatAmount, PRIORITY_LABELS } from '../../utils/format';
import StatusChip from '../../components/StatusChip';

const STATUS_OPTIONS = ['Draft', 'Pending', 'Approved', 'Rejected', 'Cancelled'];
const STATUS_TR = {
  Draft: 'Taslak', Pending: 'Beklemede', Approved: 'Onaylandı',
  Rejected: 'Reddedildi', Cancelled: 'İptal Edildi',
};

export default function MyRequests() {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [data, setData] = useState({ items: [], totalCount: 0, page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtre durumu
  const [status, setStatus] = useState('');
  const [requestTypeId, setRequestTypeId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0); // MUI 0-indexli
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    getRequestTypes().then(setTypes).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyRequests({
        status: status || undefined,
        requestTypeId: requestTypeId || undefined,
        search: search || undefined,
        page: page + 1,
        pageSize,
      });
      setData(res);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [status, requestTypeId, search, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  function resetFilters() {
    setStatus('');
    setRequestTypeId('');
    setSearch('');
    setPage(0);
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Taleplerim</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/requests/new')}>
          Yeni Talep
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            select label="Durum" size="small" sx={{ minWidth: 160 }}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          >
            <MenuItem value="">Tümü</MenuItem>
            {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{STATUS_TR[s]}</MenuItem>)}
          </TextField>

          <TextField
            select label="Tür" size="small" sx={{ minWidth: 180 }}
            value={requestTypeId}
            onChange={(e) => { setRequestTypeId(e.target.value); setPage(0); }}
          >
            <MenuItem value="">Tümü</MenuItem>
            {types.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
          </TextField>

          <TextField
            label="Başlık ara" size="small" sx={{ minWidth: 220, flexGrow: 1 }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: (
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            ) }}
          />

          <Button onClick={resetFilters} disabled={!status && !requestTypeId && !search}>
            Temizle
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Tür</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Öncelik</TableCell>
                <TableCell>Tutar</TableCell>
                <TableCell>Oluşturulma</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : data.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Talep bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((r) => (
                  <TableRow
                    key={r.id} hover sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/requests/${r.id}`)}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{r.title}</TableCell>
                    <TableCell>{r.type}</TableCell>
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
        <TablePagination
          component="div"
          count={data.totalCount}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Sayfa başı"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
        />
      </Paper>
    </Box>
  );
}
