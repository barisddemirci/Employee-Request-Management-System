import api from './client';

// ---- Talep Türleri ----
export async function getRequestTypesAdmin() {
  const { data } = await api.get('/api/admin/request-types');
  return data;
}
export async function createRequestType(body) {
  const { data } = await api.post('/api/admin/request-types', body); // { name, requiresApproval }
  return data;
}
export async function updateRequestType(id, body) {
  const { data } = await api.put(`/api/admin/request-types/${id}`, body); // { name, requiresApproval, isActive }
  return data;
}

// ---- Departmanlar ----
export async function getDepartments() {
  const { data } = await api.get('/api/admin/departments');
  return data;
}
export async function createDepartment(body) {
  const { data } = await api.post('/api/admin/departments', body); // { name }
  return data;
}
export async function updateDepartment(id, body) {
  const { data } = await api.put(`/api/admin/departments/${id}`, body); // { name, isActive }
  return data;
}

// ---- Kullanıcılar ----
export async function getUsers() {
  const { data } = await api.get('/api/admin/users');
  return data;
}
export async function createUser(body) {
  const { data } = await api.post('/api/admin/users', body);
  return data;
}
export async function updateUser(id, body) {
  const { data } = await api.put(`/api/admin/users/${id}`, body);
  return data;
}
