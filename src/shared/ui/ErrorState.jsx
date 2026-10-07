export function ErrorState({ error, onRetry }) {
  const message = error?.displayMessage ?? error?.message ?? 'Ocurrio un error inesperado';
  return (
    <div className="error-state" role="alert">
      <strong>No se pudo completar la operacion</strong>
      <p>{message}</p>
      {onRetry ? <button type="button" className="btn btn--ghost" onClick={onRetry}>Reintentar</button> : null}
    </div>
  );
}
