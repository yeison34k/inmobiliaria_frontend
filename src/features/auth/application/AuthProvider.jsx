import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { tokenStorage } from '@shared/api/tokenStorage.js';
import { authApi } from '../infrastructure/authApi.js';

const AuthContext = createContext(null);

/**
 * Estado de sesion de la aplicacion.
 * Encapsula el token: ningun componente lo lee directamente.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(Boolean(tokenStorage.get()));

  useEffect(() => {
    if (!tokenStorage.get()) return;
    authApi.me()
      .then(setUsuario)
      .catch(() => { tokenStorage.clear(); setUsuario(null); })
      .finally(() => setCargando(false));
  }, []);

  const login = useCallback(async (credenciales) => {
    const { token, usuario: perfil } = await authApi.login(credenciales);
    tokenStorage.set(token);
    setUsuario(perfil);
    return perfil;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUsuario(null);
  }, []);

  const actualizarPerfil = useCallback((nuevoPerfil) => {
    setUsuario((prev) => (prev ? { ...prev, ...nuevoPerfil } : nuevoPerfil));
  }, []);

  const refrescarPerfil = useCallback(async () => {
    try {
      const perfil = await authApi.me();
      setUsuario(perfil);
      return perfil;
    } catch {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      autenticado: Boolean(usuario),
      login,
      logout,
      actualizarPerfil,
      refrescarPerfil,
    }),
    [usuario, cargando, login, logout, actualizarPerfil, refrescarPerfil],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
