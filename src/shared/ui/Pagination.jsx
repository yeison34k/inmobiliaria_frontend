export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages, total } = meta;

  return (
    <nav className="pagination" aria-label="Paginacion">
      <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span>Pagina {page} de {totalPages} · {total} resultados</span>
      <button type="button" className="btn btn--ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Siguiente
      </button>
    </nav>
  );
}
