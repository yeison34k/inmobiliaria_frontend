const KEY = 'inmobiliaria.token';

/** Unico lugar que toca el almacenamiento del token. */
export const tokenStorage = {
  get() {
    try { return localStorage.getItem(KEY); } catch { return null; }
  },
  set(token) {
    try { localStorage.setItem(KEY, token); } catch { /* modo privado */ }
  },
  clear() {
    try { localStorage.removeItem(KEY); } catch { /* modo privado */ }
  },
};
