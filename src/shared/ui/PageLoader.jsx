import { Spinner } from './Spinner.jsx';

/**
 * Placeholder estilizado para Suspense durante la carga asíncrona de rutas o componentes pesados.
 */
export function PageLoader({ label = 'Cargando vista...' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
      }}
    >
      <Spinner label={label} />
    </div>
  );
}
