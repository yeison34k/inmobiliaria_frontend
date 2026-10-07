import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@shared/ui/Badge.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { EmptyState } from '@shared/ui/EmptyState.jsx';
import { formatDateTime } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useSelectionMutations, useSelections } from '../../application/useSelectionsQueries.js';
import { SELECTION_STATUS_META, fueAbierta } from '../../domain/selection.js';
import { SelectionBuilderModal } from '../components/SelectionBuilderModal.jsx';
import { SelectionActivityModal } from '../components/SelectionActivityModal.jsx';

/**
 * Selecciones enviadas a clientes.
 * La columna que importa no es el estado sino la actividad: una seleccion
 * que el cliente nunca abrio es una llamada pendiente.
 */
export function SelectionsPage() {
  const toast = useToast();
  const [filtro, setFiltro] = useState('');
  const [armando, setArmando] = useState(null);
  const [viendo, setViendo] = useState(null);

  const { data: selecciones = [], isLoading, error, refetch } = useSelections(
    filtro ? { estado: filtro } : {},
  );
  const { send, archive } = useSelectionMutations({ onError: (e) => toast.error(e.displayMessage) });

  const copiarEnlace = async (seleccion) => {
    const enlace = `${window.location.origin}/seleccion/${seleccion.token}`;
    try {
      await navigator.clipboard.writeText(enlace);
      toast.success('Enlace copiado');
    } catch {
      toast.info(enlace);
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <section>
      <header className="page__header">
        <div>
          <h1>Selecciones</h1>
          <p className="page__subtitle">
            Varias propiedades en un solo enlace, y que hizo el cliente con ellas
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setArmando({ nueva: true })}>
          Nueva seleccion
        </button>
      </header>

      <div className="status-filter">
        {[['', 'Todas'], ['borrador', 'Borradores'], ['enviada', 'Enviadas'], ['archivada', 'Archivadas']]
          .map(([valor, label]) => (
            <button
              key={label}
              type="button"
              className={filtro === valor ? 'chip chip--active' : 'chip'}
              onClick={() => setFiltro(valor)}
            >
              {label}
            </button>
          ))}
      </div>

      {selecciones.length === 0 ? (
        <EmptyState
          title="Aun no ha armado ninguna seleccion"
          description="Arme una con tres o cuatro opciones y mandesela al cliente por un solo enlace."
          action={
            <button type="button" className="btn btn--primary" onClick={() => setArmando({ nueva: true })}>
              Armar la primera
            </button>
          }
        />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Seleccion</th>
                <th>Cliente</th>
                <th>Opciones</th>
                <th>Estado</th>
                <th>Actividad</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {selecciones.map((s) => {
                const meta = SELECTION_STATUS_META[s.estado] ?? { label: s.estado, tone: 'neutral' };
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{s.titulo}</strong>
                        <small>{s.codigo} · {formatDateTime(s.createdAt)}</small>
                      </div>
                    </td>
                    <td>{s.cliente ?? <span className="texto-tenue">sin asignar</span>}</td>
                    <td>{s.propiedades?.length ?? 0}</td>
                    <td>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      {s.vencida ? <small className="cell-note">vencida</small> : null}
                    </td>
                    <td>
                      {s.estado !== 'enviada' ? (
                        <span className="texto-tenue">—</span>
                      ) : fueAbierta(s) ? (
                        <div className="cell-stack">
                          <span>{s.aperturas} {s.aperturas === 1 ? 'apertura' : 'aperturas'}</span>
                          {s.favoritas ? <small>★ {s.favoritas} marcadas</small> : null}
                        </div>
                      ) : (
                        <span className="aviso-tenue">sin abrir</span>
                      )}
                    </td>
                    <td className="table__actions">
                      {s.estado === 'borrador' ? (
                        <>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => setArmando(s)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => send.mutate(s.id, {
                              onSuccess: (r) => {
                                toast.success('Seleccion lista para enviar');
                                copiarEnlace(r);
                              },
                            })}
                          >
                            Enviar
                          </button>
                        </>
                      ) : null}

                      {s.estado === 'enviada' ? (
                        <>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => copiarEnlace(s)}>
                            Copiar enlace
                          </button>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setViendo(s)}>
                            Actividad
                          </button>
                          <Link
                            className="btn btn--ghost btn--sm"
                            to={`/seleccion/${s.token}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Ver como el cliente
                          </Link>
                        </>
                      ) : null}

                      {s.estado !== 'archivada' ? (
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => archive.mutate(s.id)}
                        >
                          Archivar
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {armando ? (
        <SelectionBuilderModal
          seleccion={armando.nueva ? null : armando}
          onClose={() => setArmando(null)}
        />
      ) : null}

      {viendo ? (
        <SelectionActivityModal seleccionId={viendo.id} onClose={() => setViendo(null)} />
      ) : null}
    </section>
  );
}
