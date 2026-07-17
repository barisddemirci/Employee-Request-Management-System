import api from './client';

export async function getPendingApprovals() {
  const { data } = await api.get('/api/approvals/pending');
  return data; // RequestResponseDto[]
}

export async function approveRequest(requestId, comment) {
  const { data } = await api.post(`/api/approvals/${requestId}/approve`, { comment: comment || null });
  return data;
}

export async function rejectRequest(requestId, comment) {
  const { data } = await api.post(`/api/approvals/${requestId}/reject`, { comment });
  return data;
}
