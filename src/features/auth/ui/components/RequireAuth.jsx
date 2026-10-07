import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { useAuth } from '../../application/AuthProvider.jsx';

/** Guard de rutas privadas. Los permisos finos los valida el backend. */
export function RequireAuth({ rol }) {
  const { autenticado, cargando, usuario } = useAuth();
  const location = useLocation();

  if (cargando) return <Spinner label="Verificando sesion..." />;
  if (!autenticado) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (rol && usuario.rol !== rol) return <Navigate to="/admin" replace />;

  return <Outlet />;
}
