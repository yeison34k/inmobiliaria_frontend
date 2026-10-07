import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="empty">
      <h1>404</h1>
      <p>La pagina que busca no existe.</p>
      <Link className="btn btn--primary" to="/">Ir al inicio</Link>
    </div>
  );
}
