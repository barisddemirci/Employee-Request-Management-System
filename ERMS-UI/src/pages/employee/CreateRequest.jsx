import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, MenuItem, Button, Stack, Alert,
  CircularProgress, Divider, FormHelperText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getRequestTypes, createRequest } from '../../api/requests';
import { parseApiError } from '../../utils/apiError';

const PRIORITIES = ['Low', 'Normal', 'High'];
const PRIORITY_TR = { Low: 'Düşük', Normal: 'Normal', High: 'Yüksek' };

// Türe özel zorunluluklar tür ADI üzerinden belirlenir (backend de ada göre zorluyor).
function typeRules(typeName) {
  const name = (typeName || '').toLocaleLowerCase('tr');
  return {
    requiresDates: name.includes('izin'),
    requiresAmount: name.includes('masraf'),
  };
}

export default function CreateRequest() {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [form, setForm] = useState({
    requestTypeId: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    amount: '',
    priority: 'Normal',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRequestTypes()
      .then((t) => setTypes(t.filter((x) => x.isActive)))
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoadingTypes(false));
  }, []);

  const selectedType = useMemo(
    () => types.find((t) => t.id === Number(form.requestTypeId)),
    [types, form.requestTypeId]
  );
  const rules = typeRules(selectedType?.name);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: undefined }));
  }

  // İstemci tarafı ön doğrulama (backend zaten teyit ediyor)
  function validate() {
    const fe = {};
    if (!form.requestTypeId) fe.requestTypeId = 'Tür seçiniz.';
    if (!form.title.trim()) fe.title = 'Başlık zorunludur.';
    if (rules.requiresDates) {
      if (!form.startDate) fe.startDate = 'Başlangıç tarihi zorunludur.';
      if (!form.endDate) fe.endDate = 'Bitiş tarihi zorunludur.';
      if (form.startDate && form.endDate && form.endDate < form.startDate) {
        fe.endDate = 'Bitiş tarihi başlangıçtan önce olamaz.';
      }
    }
    if (rules.requiresAmount) {
      if (form.amount === '' || Number(form.amount) <= 0) {
        fe.amount = 'Tutar pozitif olmalıdır.';
      }
    }
    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  }

  function buildBody(saveAsDraft) {
    return {
      requestTypeId: Number(form.requestTypeId),
      title: form.title.trim(),
      description: form.description.trim(),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      amount: form.amount === '' ? null : Number(form.amount),
      priority: form.priority,
      saveAsDraft,
    };
  }

  async function handleSubmit(saveAsDraft) {
    setError('');
    // Taslakta bile başlık/tür istiyoruz; türe özel kurallar taslakta gevşetilebilir
    // ama backend zorluyorsa 400 döner ve alan hatasını gösteririz.
    if (!saveAsDraft && !validate()) return;
    if (saveAsDraft) {
      // taslak için asgari kontrol
      const fe = {};
      if (!form.requestTypeId) fe.requestTypeId = 'Tür seçiniz.';
      if (!form.title.trim()) fe.title = 'Başlık zorunludur.';
      setFieldErrors(fe);
      if (Object.keys(fe).length) return;
    }

    setSubmitting(true);
    try {
      const result = await createRequest(buildBody(saveAsDraft));
      navigate(`/requests/${result.id}`, { replace: true });
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.hasFieldErrors) {
        setFieldErrors(parsed.fieldErrors);
        setError('Lütfen işaretli alanları düzeltin.');
      } else {
        setError(parsed.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingTypes) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/requests')} sx={{ mb: 1 }}>
        Taleplerim
      </Button>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Yeni Talep</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            select required label="Tür"
            value={form.requestTypeId}
            onChange={(e) => setField('requestTypeId', e.target.value)}
            error={Boolean(fieldErrors.requestTypeId)}
            helperText={fieldErrors.requestTypeId}
          >
            {types.length === 0 && <MenuItem value="" disabled>Aktif tür yok</MenuItem>}
            {types.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}{t.requiresApproval ? ' (onay gerektirir)' : ''}
              </MenuItem>
            ))}
          </TextField>

          {(rules.requiresDates || rules.requiresAmount) && (
            <Alert severity="info">
              {rules.requiresDates && 'Bu tür için başlangıç ve bitiş tarihi zorunludur. '}
              {rules.requiresAmount && 'Bu tür için pozitif bir tutar zorunludur.'}
            </Alert>
          )}

          <TextField
            required label="Başlık"
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            error={Boolean(fieldErrors.title)}
            helperText={fieldErrors.title}
          />

          <TextField
            label="Açıklama" multiline minRows={3}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            error={Boolean(fieldErrors.description)}
            helperText={fieldErrors.description}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Başlangıç Tarihi" type="date" fullWidth
              InputLabelProps={{ shrink: true }}
              required={rules.requiresDates}
              value={form.startDate}
              onChange={(e) => setField('startDate', e.target.value)}
              error={Boolean(fieldErrors.startDate)}
              helperText={fieldErrors.startDate}
            />
            <TextField
              label="Bitiş Tarihi" type="date" fullWidth
              InputLabelProps={{ shrink: true }}
              required={rules.requiresDates}
              value={form.endDate}
              onChange={(e) => setField('endDate', e.target.value)}
              error={Boolean(fieldErrors.endDate)}
              helperText={fieldErrors.endDate}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Tutar (₺)" type="number" fullWidth
              required={rules.requiresAmount}
              inputProps={{ min: 0, step: '0.01' }}
              value={form.amount}
              onChange={(e) => setField('amount', e.target.value)}
              error={Boolean(fieldErrors.amount)}
              helperText={fieldErrors.amount}
            />
            <TextField
              select label="Öncelik" fullWidth
              value={form.priority}
              onChange={(e) => setField('priority', e.target.value)}
            >
              {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{PRIORITY_TR[p]}</MenuItem>)}
            </TextField>
          </Stack>

          <Divider />
          <FormHelperText>
            “Taslak Kaydet” talebi taslak olarak saklar. “Gönder” talebi onaya/işleme sunar.
          </FormHelperText>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" disabled={submitting} onClick={() => handleSubmit(true)}>
              Taslak Kaydet
            </Button>
            <Button variant="contained" disabled={submitting} onClick={() => handleSubmit(false)}>
              {submitting ? <CircularProgress size={22} color="inherit" /> : 'Gönder'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
