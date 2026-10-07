export const UserRole = Object.freeze({ ADMIN: 'admin', AGENTE: 'agente' });

export const ROLE_LABELS = Object.freeze({
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.AGENTE]: 'Agente',
});

export const isAdmin = (usuario) => usuario?.rol === UserRole.ADMIN;

/** Permisos derivados del rol: la UI oculta lo que el backend tambien prohibe. */
export const can = Object.freeze({
  eliminarPropiedad: isAdmin,
  gestionarUsuarios: isAdmin,
  operarInventario: (usuario) => Boolean(usuario),
});
