import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Field } from '@shared/ui/Field.jsx';
import { useAuth } from '../../application/AuthProvider.jsx';

export function LoginPage() {
  const { login, autenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (autenticado) navigate('/admin', { replace: true });

  const onSubmit = async (event) => {
    event.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      await login(form);
      navigate(location.state?.from ?? '/admin', { replace: true });
    } catch (err) {
      setError(err.displayMessage ?? 'No se pudo iniciar sesion');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login">
      <form className="login__card" onSubmit={onSubmit}>
        <h1>Panel inmobiliario</h1>
        <p className="login__hint">Ingrese con su cuenta del equipo comercial.</p>

        <Field label="Email" required>
          <input
            type="email"
            value={form.email}
            autoComplete="username"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>

        <Field label="Contrasena" required>
          <input
            type="password"
            value={form.password}
            autoComplete="current-password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>

        {error ? <p className="field__error" role="alert">{error}</p> : null}

        <button type="submit" className="btn btn--primary" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>

        <Link className="login__back" to="/">Volver al sitio publico</Link>
      </form>
    </div>
  );
}
