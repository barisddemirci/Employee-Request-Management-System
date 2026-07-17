// Backend rolleri string olarak dönüyor: "Employee", "Manager", "Admin".
export const ROLES = {
  Employee: 'Employee',
  Manager: 'Manager',
  Admin: 'Admin',
};

// Her rolün giriş sonrası açılış rotası.
export const HOME_ROUTE_BY_ROLE = {
  Employee: '/requests',
  Manager: '/approvals',
  Admin: '/admin',
};

export function homeRouteForRole(role) {
  return HOME_ROUTE_BY_ROLE[role] ?? '/requests';
}
