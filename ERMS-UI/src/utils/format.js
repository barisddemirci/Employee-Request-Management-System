// Tarih/tutar biçimlendirme ve enum → Türkçe etiket / renk eşlemeleri.

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatAmount(value) {
  if (value === null || value === undefined || value === '') return '—';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
}

// Backend status enum'ları → Türkçe etiket
export const STATUS_LABELS = {
  Draft: 'Taslak',
  Pending: 'Beklemede',
  Approved: 'Onaylandı',
  Rejected: 'Reddedildi',
  Cancelled: 'İptal Edildi',
};

// MUI Chip renkleri
export const STATUS_COLORS = {
  Draft: 'default',
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
  Cancelled: 'default',
};

export const PRIORITY_LABELS = {
  Low: 'Düşük',
  Normal: 'Normal',
  High: 'Yüksek',
};

export const PRIORITY_COLORS = {
  Low: 'default',
  Normal: 'info',
  High: 'error',
};

export const ROLE_LABELS = {
  Employee: 'Çalışan',
  Manager: 'Yönetici',
  Admin: 'Yönetici (Admin)',
};

export function statusLabel(s) {
  return STATUS_LABELS[s] ?? s ?? '—';
}
