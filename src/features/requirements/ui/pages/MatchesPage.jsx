import { Link } from 'react-router-dom';
import { Badge } from '@shared/ui/Badge.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { EmptyState } from '@shared/ui/EmptyState.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useAuth } from '@features/auth';
import { useMatches, useRequirementMutations } from '../../application/useRequirementsQueries.js';
import { tonoPuntaje } from '../../domain/requirement.js';

/**
 * Oportunidades: propiedades del inventario que encajan con lo que
 * algun cliente pidio. Es la lista de llamadas del dia.
 */
export function MatchesPage() {
  const toast = useToast();
  const { usuario } = useAuth();
  const { data: coincidencias = [], isLoading, error, refetch } = useMatches({ estado: 'nueva' });
  const { updateMatch } = useRequirementMutations({ onError: (e) => toast.error(e.displayMessage) });

  if (isLoading) return <Spinner label="Cruzando inventario con lo que buscan sus clientes..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const mias = coincidencias.filter((c) => !usuario || c.asesorId === usuario.id || !c.asesorId);
  const lista = mias.length ? mias : coincidencias;

  return (
    <section>
      <header className="page__header">
        <div>
          <h1>Oportunidades</h1>
          <p className="page__subtitle">
            {lista.length
              ? `${lista.length} ${lista.length === 1 ? 'propiedad encaja' : 'propiedades encajan'} con lo que pidieron sus clientes`
              : 'Nada nuevo por ahora'}
          </p>
        </div>
      </header>

      {lista.length === 0 ? (
        <EmptyState
          title="Sin coincidencias pendientes"
          description="Registre en cada cliente que esta buscando: cuando entre una propiedad que encaje, aparecera aqui."
          action={<Link className="btn btn--primary" to="/admin/contactos">Ir a contactos</Link>}
        />
      ) : (
        <ul className="oportunidades">
          {lista.map((c) => (
            <li key={c.id}>
              <div className="oportunidades__puntaje">
                <Badge tone={tonoPuntaje(c.puntaje)}>{c.puntaje}%</Badge>
              </div>

              {c.propiedad.imagen
                ? <img className="oportunidades__foto" src={c.propiedad.imagen} alt="" />
                : <span className="oportunidades__foto oportunidades__foto--vacia" />}

              <div className="oportunidades__cuerpo">
                <Link to={`/admin/propiedades/${c.propiedadId}`}>
                  <strong>{c.propiedad.titulo}</strong>
                </Link>
                <p>
                  {formatMoney(c.propiedad.precio, c.propiedad.moneda)} · {c.propiedad.ubicacion}
                </p>
                <p className="oportunidades__cliente">
                  Para <strong>{c.cliente}</strong>
                  {c.requerimientoTitulo ? ` · ${c.requerimientoTitulo}` : ''}
                </p>
                {c.motivos.length ? (
                  <p className="oportunidades__motivos">{c.motivos.join(' · ')}</p>
                ) : null}
              </div>

              <div className="oportunidades__acciones">
                <Link className="btn btn--primary btn--sm" to={`/admin/contactos?contacto=${c.contactoId}`}>
                  Ver cliente
                </Link>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => updateMatch.mutate({ id: c.id, estado: 'enviada' },
                    { onSuccess: () => toast.success('Marcada como enviada') })}
                >
                  Ya se la mande
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => updateMatch.mutate({ id: c.id, estado: 'descartada' })}
                >
                  No sirve
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
