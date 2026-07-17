// Backend hata gövdesini forma/uyarıya uygun hale getirir.
// 400: { code:"VALIDATION_ERROR", message, errors: { PascalField: [msg] } }
// 403: { code:"FORBIDDEN", message }, 404/409: { code, message }

// "Title" → "title" (FluentValidation PropertyName → form alan adı)
function toCamel(key) {
  if (!key) return key;
  return key.charAt(0).toLowerCase() + key.slice(1);
}

export function parseApiError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;

  const fieldErrors = {};
  if (data?.errors && typeof data.errors === 'object') {
    for (const [key, msgs] of Object.entries(data.errors)) {
      fieldErrors[toCamel(key)] = Array.isArray(msgs) ? msgs.join(' ') : String(msgs);
    }
  }

  let message = data?.message;
  if (!message) {
    if (err?.code === 'ERR_NETWORK') {
      message = 'Sunucuya ulaşılamadı. API çalışıyor mu?';
    } else if (status === 403) {
      message = 'Bu işlem için yetkiniz yok.';
    } else if (status === 404) {
      message = 'Kayıt bulunamadı.';
    } else {
      message = 'Beklenmeyen bir hata oluştu.';
    }
  }
  // 403 için backend mesajı jenerikse yine de net bir metin garanti et
  if (status === 403 && !data?.message) {
    message = 'Bu işlem için yetkiniz yok.';
  }

  return { status, message, fieldErrors, hasFieldErrors: Object.keys(fieldErrors).length > 0 };
}
