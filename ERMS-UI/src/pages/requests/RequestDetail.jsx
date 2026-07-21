import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Stack, Button, Divider, Chip, Alert,
  CircularProgress, TextField, List, ListItem, ListItemText, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import {
  getRequestDetail, submitRequest, cancelRequest, addComment,
} from '../../api/requests';
import { approveRequest, rejectRequest } from '../../api/approvals';
import { parseApiError } from '../../utils/apiError';
import { formatDate, formatDateTime, formatAmount, statusLabel, PRIORITY_LABELS, STATUS_COLORS } from '../../utils/format';
import StatusChip from '../../components/StatusChip';
import { useAuth } from '../../auth/AuthContext';
import { ROLES } from '../../auth/roles';

function InfoRow({ label, children, full }) {
  return (
    <Box sx={{ gridColumn: full ? { sm: '1 / -1' } : undefined }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{children}</Typography>
    </Box>
  );
}

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isApprovalContext = searchParams.get('context') === 'approval';
  const { role } = useAuth();
  const canApprove = isApprovalContext && (role === ROLES.Manager || role === ROLES.Admin);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const [comment, setComment] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectError, setRejectError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDetail(await getRequestDetail(id));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function runAction(fn, successBack) {
    setBusy(true);
    setActionError('');
    try {
      await fn();
      if (successBack) {
        navigate(successBack, { replace: true });
      } else {
        await load();
      }
    } catch (err) {
      setActionError(parseApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAddComment() {
    if (!comment.trim()) return;
    setCommentBusy(true);
    setCommentError('');
    try {
      await addComment(id, comment.trim());
      setComment('');
      await load();
    } catch (err) {
      const parsed = parseApiError(err);
      setCommentError(parsed.fieldErrors.content || parsed.message);
    } finally {
      setCommentBusy(false);
    }
  }

  async function handleReject() {
    if (!rejectComment.trim()) {
      setRejectError('Reddetme gerekçesi zorunludur.');
      return;
    }
    setBusy(true);
    setRejectError('');
    try {
      await rejectRequest(id, rejectComment.trim());
      setRejectOpen(false);
      navigate('/approvals', { replace: true });
    } catch (err) {
      const parsed = parseApiError(err);
      setRejectError(parsed.fieldErrors.comment || parsed.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }
  if (error) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Geri</Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  if (!detail) return null;

  const status = detail.status;
  // Aksiyonlar bağlama ve duruma göre
  const showSubmit = !isApprovalContext && status === 'Draft';
  const showCancel = !isApprovalContext && status === 'Pending';
  const showApprovalActions = canApprove && status === 'Pending';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(isApprovalContext ? '/approvals' : '/requests')}
        sx={{ mb: 1 }}
      >
        {isApprovalContext ? 'Onaylar' : 'Taleplerim'}
      </Button>

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{detail.title}</Typography>
        <StatusChip status={status} size="medium" />
      </Stack>

      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <InfoRow label="Tür">{detail.type}</InfoRow>
          <InfoRow label="Talep Eden">{detail.requesterName}</InfoRow>
          <InfoRow label="Öncelik">
            <Chip size="small" variant="outlined" label={PRIORITY_LABELS[detail.priority] ?? detail.priority} />
          </InfoRow>
          <InfoRow label="Tutar">{formatAmount(detail.amount)}</InfoRow>
          <InfoRow label="Başlangıç">{formatDate(detail.startDate)}</InfoRow>
          <InfoRow label="Bitiş">{formatDate(detail.endDate)}</InfoRow>
          <InfoRow label="Oluşturulma">{formatDateTime(detail.createdAt)}</InfoRow>
          <InfoRow label="Açıklama" full>
            <Typography variant="body1" component="span" sx={{ whiteSpace: 'pre-wrap' }}>
              {detail.description || '—'}
            </Typography>
          </InfoRow>
        </Box>

        {(showSubmit || showCancel || showApprovalActions) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {showSubmit && (
                <Button
                  variant="contained" startIcon={<SendIcon />} disabled={busy}
                  onClick={() => runAction(() => submitRequest(id))}
                >
                  Gönder
                </Button>
              )}
              {showCancel && (
                <Button
                  variant="outlined" color="warning" startIcon={<CancelScheduleSendIcon />} disabled={busy}
                  onClick={() => runAction(() => cancelRequest(id))}
                >
                  İptal Et
                </Button>
              )}
              {showApprovalActions && (
                <>
                  <Button
                    variant="outlined" color="error" startIcon={<CloseIcon />} disabled={busy}
                    onClick={() => { setRejectComment(''); setRejectError(''); setRejectOpen(true); }}
                  >
                    Reddet
                  </Button>
                  <Button
                    variant="contained" color="success" startIcon={<CheckIcon />} disabled={busy}
                    onClick={() => runAction(() => approveRequest(id, ''), '/approvals')}
                  >
                    Onayla
                  </Button>
                </>
              )}
            </Stack>
          </>
        )}
      </Paper>

      {/* Durum geçmişi */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Durum Geçmişi</Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        {(!detail.history || detail.history.length === 0) ? (
          <Typography color="text.secondary">Kayıt yok.</Typography>
        ) : (
          <List dense>
            {detail.history.map((h) => (
              <ListItem key={h.id} divider>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {h.oldStatus && (
                        <>
                          <Chip size="small" variant="outlined" label={statusLabel(h.oldStatus)} />
                          <span>→</span>
                        </>
                      )}
                      <StatusChip status={h.newStatus} />
                    </Stack>
                  }
                  secondary={`${h.changedByName} · ${formatDateTime(h.changedAt)}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Onay/Red kararları */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Onay/Red Kararları</Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        {(!detail.approvals || detail.approvals.length === 0) ? (
          <Typography color="text.secondary">Henüz karar verilmedi.</Typography>
        ) : (
          <List dense disablePadding>
            {detail.approvals.map((a) => {
              const rejected = a.decision === 'Rejected';
              return (
                <ListItem key={a.id} alignItems="flex-start" divider sx={{ px: 0 }}>
                  <Avatar sx={{ mr: 2, bgcolor: rejected ? 'error.main' : 'success.main' }}>
                    {rejected ? <CloseIcon fontSize="small" /> : <CheckIcon fontSize="small" />}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip
                          size="small"
                          color={STATUS_COLORS[a.decision] ?? 'default'}
                          label={statusLabel(a.decision)}
                        />
                        <Typography variant="subtitle2">{a.decidedByName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(a.decidedAt)}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      a.comment ? (
                        <Alert
                          severity={rejected ? 'error' : 'info'}
                          icon={false}
                          sx={{ mt: 1, py: 0.5, whiteSpace: 'pre-wrap' }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                            {rejected ? 'Reddetme Gerekçesi' : 'Açıklama'}
                          </Typography>
                          {a.comment}
                        </Alert>
                      ) : rejected ? (
                        <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                          Gerekçe belirtilmedi.
                        </Typography>
                      ) : null
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      {/* Yorumlar */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Yorumlar</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {(!detail.comments || detail.comments.length === 0) ? (
          <Typography color="text.secondary" sx={{ mb: 2 }}>Henüz yorum yok.</Typography>
        ) : (
          <List>
            {detail.comments.map((c) => (
              <ListItem key={c.id} alignItems="flex-start" divider sx={{ px: 0 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {(c.authorName || '?').charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="baseline">
                      <Typography variant="subtitle2">{c.authorName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(c.createdAt)}
                      </Typography>
                    </Stack>
                  }
                  secondary={<Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{c.content}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="flex-start">
          <TextField
            fullWidth size="small" placeholder="Yorum ekle…" multiline maxRows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            error={Boolean(commentError)}
            helperText={commentError}
          />
          <Button
            variant="contained" disabled={commentBusy || !comment.trim()}
            onClick={handleAddComment} sx={{ mt: 0.5 }}
          >
            {commentBusy ? <CircularProgress size={20} color="inherit" /> : 'Ekle'}
          </Button>
        </Stack>
      </Paper>

      {/* Reddet diyaloğu */}
      <Dialog open={rejectOpen} onClose={() => !busy && setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Talebi Reddet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Reddetme gerekçesi zorunludur; talep edene iletilecektir.
          </Typography>
          <TextField
            autoFocus fullWidth multiline minRows={3} label="Gerekçe"
            value={rejectComment}
            onChange={(e) => { setRejectComment(e.target.value); setRejectError(''); }}
            error={Boolean(rejectError)}
            helperText={rejectError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)} disabled={busy}>Vazgeç</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={busy}>
            {busy ? <CircularProgress size={20} color="inherit" /> : 'Reddet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
