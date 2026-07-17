import { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Chip, CircularProgress, Alert, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControlLabel, Switch, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { getRequestTypesAdmin, createRequestType, updateRequestType } from '../../api/admin';
import { parseApiError } from '../../utils/apiError';

export default function RequestTypesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null=oluştur, obj=düzenle
  const [form, setForm] = useState({ name: '', requiresApproval: false, isActive: true });
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialogError, setDialogError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await getRequestTypesAdmin());
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', requiresApproval: false, isActive: true });
    setFieldErrors({});
    setDialogError('');
    setOpen(true);
  }

  function openEdit(t) {
    setEditing(t);
    setForm({ name: t.name, requiresApproval: t.requiresApproval, isActive: t.isActive });
    setFieldErrors({});
    setDialogError('');
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    setDialogError('');
    setFieldErrors({});
    try {
      if (editing) {
        await updateRequestType(editing.id, {
          name: form.name.trim(),
          requiresApproval: form.requiresApproval,
          isActive: form.isActive,
        });
      } else {
        await createRequestType({
          name: form.name.trim(),
          requiresApproval: form.requiresApproval,
        });
      }
      setOpen(false);
      await load();
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.hasFieldErrors) setFieldErrors(parsed.fieldErrors);
      else setDialogError(parsed.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Yeni Tür</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Onay Gerektirir</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5, color: 'text.secondary' }}>Kayıt yok.</TableCell></TableRow>
            ) : (
              items.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{t.name}</TableCell>
                  <TableCell>
                    <Chip size="small" label={t.requiresApproval ? 'Evet' : 'Hayır'} color={t.requiresApproval ? 'info' : 'default'} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={t.isActive ? 'Aktif' : 'Pasif'} color={t.isActive ? 'success' : 'default'} variant={t.isActive ? 'filled' : 'outlined'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(t)}><EditIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Türü Düzenle' : 'Yeni Tür'}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Ad" fullWidth autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={Boolean(fieldErrors.name)} helperText={fieldErrors.name}
            />
            <FormControlLabel
              control={<Switch checked={form.requiresApproval} onChange={(e) => setForm((f) => ({ ...f, requiresApproval: e.target.checked }))} />}
              label="Onay gerektirir"
            />
            {editing && (
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />}
                label="Aktif"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Vazgeç</Button>
          <Button variant="contained" onClick={save} disabled={saving || !form.name.trim()}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
