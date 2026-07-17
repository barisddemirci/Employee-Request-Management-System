import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Button, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Chip, CircularProgress, Alert, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, FormControlLabel, Switch, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { getUsers, createUser, updateUser, getDepartments } from '../../api/admin';
import { parseApiError } from '../../utils/apiError';
import { ROLE_LABELS } from '../../utils/format';

const ROLES = ['Employee', 'Manager', 'Admin'];

const emptyForm = {
  firstName: '', lastName: '', email: '', password: '',
  role: 'Employee', departmentId: '', managerId: '', isActive: true,
};

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialogError, setDialogError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [u, d] = await Promise.all([getUsers(), getDepartments()]);
      setUsers(u);
      setDepartments(d);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deptName = useMemo(() => {
    const m = new Map(departments.map((d) => [d.id, d.name]));
    return (id) => m.get(id) ?? '—';
  }, [departments]);

  const userName = useMemo(() => {
    const m = new Map(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));
    return (id) => (id ? m.get(id) ?? '—' : '—');
  }, [users]);

  // Manager dropdown: sadece Manager rolündekiler
  const managers = useMemo(() => users.filter((u) => u.role === 'Manager'), [users]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFieldErrors({});
    setDialogError('');
    setOpen(true);
  }

  function openEdit(u) {
    setEditing(u);
    setForm({
      firstName: u.firstName, lastName: u.lastName, email: u.email, password: '',
      role: u.role, departmentId: u.departmentId ?? '',
      managerId: u.managerId ?? '', isActive: u.isActive,
    });
    setFieldErrors({});
    setDialogError('');
    setOpen(true);
  }

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  }

  async function save() {
    setSaving(true);
    setDialogError('');
    setFieldErrors({});
    try {
      const managerId = form.managerId === '' ? null : Number(form.managerId);
      const departmentId = form.departmentId === '' ? null : Number(form.departmentId);
      if (editing) {
        await updateUser(editing.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: form.role,
          departmentId,
          managerId,
          isActive: form.isActive,
        });
      } else {
        await createUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          departmentId,
          managerId,
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

  const canSave = form.firstName.trim() && form.lastName.trim() &&
    (editing || (form.email.trim() && form.password)) && form.departmentId !== '';

  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Yeni Kullanıcı</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Departman</TableCell>
              <TableCell>Yönetici</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>Kayıt yok.</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Chip size="small" label={ROLE_LABELS[u.role] ?? u.role} /></TableCell>
                  <TableCell>{deptName(u.departmentId)}</TableCell>
                  <TableCell>{userName(u.managerId)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={u.isActive ? 'Aktif' : 'Pasif'} color={u.isActive ? 'success' : 'default'} variant={u.isActive ? 'filled' : 'outlined'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Ad" fullWidth value={form.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
                error={Boolean(fieldErrors.firstName)} helperText={fieldErrors.firstName}
              />
              <TextField
                label="Soyad" fullWidth value={form.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
                error={Boolean(fieldErrors.lastName)} helperText={fieldErrors.lastName}
              />
            </Stack>

            {!editing && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="E-posta" type="email" fullWidth value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  error={Boolean(fieldErrors.email)} helperText={fieldErrors.email}
                />
                <TextField
                  label="Şifre" type="password" fullWidth value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  error={Boolean(fieldErrors.password)} helperText={fieldErrors.password}
                />
              </Stack>
            )}
            {editing && (
              <TextField label="E-posta" fullWidth value={form.email} disabled
                helperText="E-posta düzenlenemez." />
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select label="Rol" fullWidth value={form.role}
                onChange={(e) => setField('role', e.target.value)}
                error={Boolean(fieldErrors.role)} helperText={fieldErrors.role}
              >
                {ROLES.map((r) => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
              </TextField>
              <TextField
                select label="Departman" fullWidth required value={form.departmentId}
                onChange={(e) => setField('departmentId', e.target.value)}
                error={Boolean(fieldErrors.departmentId)} helperText={fieldErrors.departmentId}
              >
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
            </Stack>

            <TextField
              select label="Yönetici (opsiyonel)" fullWidth value={form.managerId}
              onChange={(e) => setField('managerId', e.target.value)}
              error={Boolean(fieldErrors.managerId)} helperText={fieldErrors.managerId}
            >
              <MenuItem value="">— Yok —</MenuItem>
              {managers
                .filter((m) => !editing || m.id !== editing.id)
                .map((m) => <MenuItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</MenuItem>)}
            </TextField>

            {editing && (
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} />}
                label="Aktif"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Vazgeç</Button>
          <Button variant="contained" onClick={save} disabled={saving || !canSave}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
