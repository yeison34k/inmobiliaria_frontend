/** API publica del feature auth: el resto de la app solo importa de aqui. */
export { AuthProvider, useAuth } from './application/AuthProvider.jsx';
export { RequireAuth } from './ui/components/RequireAuth.jsx';
export { LoginPage } from './ui/pages/LoginPage.jsx';
export { UsersPage } from './ui/pages/UsersPage.jsx';
export { ProfilePage } from './ui/pages/ProfilePage.jsx';
export { UserRole, ROLE_LABELS, isAdmin, can } from './domain/session.js';
