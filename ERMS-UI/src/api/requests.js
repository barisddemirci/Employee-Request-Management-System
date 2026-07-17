import api from './client';

// Talep türleri (giriş yapan herkes) — dropdown için
export async function getRequestTypes() {
  const { data } = await api.get('/api/request-types');
  return data; // [{ id, name, requiresApproval, isActive }]
}

// Kendi taleplerim (filtre + sayfalama)
export async function getMyRequests(filter = {}) {
  const params = {};
  if (filter.status) params.status = filter.status;
  if (filter.requestTypeId) params.requestTypeId = filter.requestTypeId;
  if (filter.search) params.search = filter.search;
  params.page = filter.page ?? 1;
  params.pageSize = filter.pageSize ?? 10;
  const { data } = await api.get('/api/requests', { params });
  return data; // { page, pageSize, totalCount, items: [...] }
}

export async function getRequestDetail(id) {
  const { data } = await api.get(`/api/requests/${id}`);
  return data;
}

export async function createRequest(body) {
  const { data } = await api.post('/api/requests', body);
  return data;
}

export async function submitRequest(id) {
  const { data } = await api.post(`/api/requests/${id}/submit`);
  return data;
}

export async function cancelRequest(id) {
  const { data } = await api.post(`/api/requests/${id}/cancel`);
  return data;
}

export async function addComment(id, content) {
  const { data } = await api.post(`/api/requests/${id}/comments`, { content });
  return data;
}
