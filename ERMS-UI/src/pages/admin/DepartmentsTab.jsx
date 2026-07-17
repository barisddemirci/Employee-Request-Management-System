import { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Chip, CircularProgress, Alert, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControlLabel, Switch, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { getDepartments, createDepartment, updateDepartment } from '../../api/admin';
import { parseApiError } from '../../utils/apiError';

export default function DepartmentsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', isActive: true });
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialogError, setDialogError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await getDepartments());
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', isActive: true });
    setFieldErrors({});
    setDialogError('');
    setOpen(true);
  }

  function openEdit(d) {
    setEditing(d);
    setForm({ name: d.name, isActive: d.isActive });
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
        await updateDepartment(editing.id, { name: form.name.trim(), isActive: form.isActive });
      } else {
        await createDepartment({ name: form.name.trim() });
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Yeni Departman</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 5, color: 'text.secondary' }}>Kayıt yok.</TableCell></TableRow>
            ) : (
              items.map((d) => (
                <TableRow key={d.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{d.name}</TableCell>
                  <TableCell>
                    <Chip size="small" label={d.isActive ? 'Aktif' : 'Pasif'} color={d.isActive ? 'success' : 'default'} variant={d.isActive ? 'filled' : 'outlined'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(d)}><EditIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Departmanı Düzenle' : 'Yeni Departman'}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Ad" fullWidth autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={Boolean(fieldErrors.name)} helperText={fieldErrors.name}
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
