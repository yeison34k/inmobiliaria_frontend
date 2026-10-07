import { Link } from 'react-router-dom';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { Badge } from '@shared/ui/Badge.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { useAuth } from '@features/auth';
import { useAgenda } from '@features/visits';
import { useFollowUpQueue } from '@features/contacts';
import { useMatches, tonoPuntaje } from '@features/requirements';
import { CommissionPanel } from '@features/operations';

const hora = (valor) =>
  new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date(valor));

const telefonoLimpio = (t) => String(t ?? '').replace(/\D/g, '');

const whatsapp = (telefono, texto) => {
  const n = telefonoLimpio(telefono);
  if (!n) return null;
  const conIndicativo = n.length === 10 ? `57${n}` : n;
  return `https://wa.me/${conIndicativo}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
};

/**
 * El dia del asesor en una sola pantalla, pensada para el telefono.
 *
 * Tres cosas y nada mas: a quien visito hoy, a quien tengo que llamar y
 * que oportunidad nueva apareció. Todo con el contacto a un toque.
 */
export function MyDayPage() {
  const { usuario } = useAuth();
  const hoy = new Date();
  const diaLocal = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60_000)
    .toISOString().slice(0, 10);

  const { data: agenda, isLoading: cargandoAgenda } = useAgenda({ desde: diaLocal, dias: 1 });
  const { data: seguimiento, isLoading: cargandoSeguimiento } = useFollowUpQueue({ asesorId: usuario?.id });
  const { data: coincidencias = [] } = useMatches({ estado: 'nueva', asesorId: usuario?.id });

  if (cargandoAgenda || cargandoSeguimiento) return <Spinner label="Armando su dia..." />;

  const visitas = agenda?.dias?.[0]?.visitas ?? [];
  const pendientes = [...(seguimiento?.vencidos ?? []), ...(seguimiento?.hoy ?? [])];

  return (
    <section className="mi-dia">
      <header className="page__header">
        <div>
          <h1>Mi dia</h1>
          <p className="page__subtitle">
            {new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(hoy)}
          </p>
        </div>
      </header>

      <div className="mi-dia__resumen">
        <article>
          <p>{visitas.length}</p>
          <span>{visitas.length === 1 ? 'visita' : 'visitas'}</span>
        </article>
        <article className={pendientes.length ? 'es-urgente' : ''}>
          <p>{pendientes.length}</p>
          <span>por contactar</span>
        </article>
        <article>
          <p>{coincidencias.length}</p>
          <span>oportunidades</span>
        </article>
      </div>

      <CommissionPanel />

      {/* ----------------------------- visitas ----------------------------- */}
      <section className="mi-dia__bloque">
        <header>
          <h2>Visitas de hoy</h2>
          <Link to="/admin/agenda">Ver agenda</Link>
        </header>

        {visitas.length === 0 ? (
          <p className="panel__hint">No tiene visitas agendadas hoy.</p>
        ) : (
          <ul className="mi-dia__visitas">
            {visitas.map((v) => (
              <li key={v.id}>
                <span className="mi-dia__hora">{hora(v.fechaInicio)}</span>
                <div>
                  <Link to={`/admin/propiedades/${v.propiedadId}`}>
                    <strong>{v.propiedad?.titulo}</strong>
                  </Link>
                  <p>{v.cliente?.nombre}</p>
                  {v.propiedad?.direccion ? <small>{v.propiedad.direccion}</small> : null}
                </div>
                <div className="mi-dia__acciones">
                  {v.cliente?.telefono ? (
                    <>
                      <a className="btn btn--ghost btn--sm" href={`tel:${telefonoLimpio(v.cliente.telefono)}`}>
                        Llamar
                      </a>
                      <a
                        className="btn btn--ghost btn--sm"
                        href={whatsapp(v.cliente.telefono, `Hola ${v.cliente.nombre}, confirmo nuestra visita de hoy a las ${hora(v.fechaInicio)}.`)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    </>
                  ) : null}
                  {v.propiedad?.direccion ? (
                    <a
                      className="btn btn--ghost btn--sm"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.propiedad.direccion)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Como llegar
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* --------------------------- seguimiento --------------------------- */}
      <section className="mi-dia__bloque">
        <header>
          <h2>Por contactar</h2>
          <Link to="/admin/contactos">Ver contactos</Link>
        </header>

        {pendientes.length === 0 ? (
          <p className="panel__hint">Nada vencido. Buen trabajo.</p>
        ) : (
          <ul className="mi-dia__pendientes">
            {pendientes.map((c) => (
              <li key={c.id} className={c.seguimientoVencido ? 'es-vencido' : ''}>
                <div>
                  <strong>{c.nombreCompleto}</strong>
                  <p>{c.proximaAccion ?? 'Sin accion definida'}</p>
                  {c.seguimientoVencido ? <Badge tone="danger">vencido</Badge> : null}
                </div>
                <div className="mi-dia__acciones">
                  {c.telefono ? (
                    <>
                      <a className="btn btn--ghost btn--sm" href={`tel:${telefonoLimpio(c.telefono)}`}>Llamar</a>
                      <a
                        className="btn btn--ghost btn--sm"
                        href={whatsapp(c.telefono, `Hola ${c.nombre},`)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* -------------------------- oportunidades -------------------------- */}
      {coincidencias.length ? (
        <section className="mi-dia__bloque">
          <header>
            <h2>Oportunidades nuevas</h2>
            <Link to="/admin/oportunidades">Ver todas</Link>
          </header>

          <ul className="mi-dia__oportunidades">
            {coincidencias.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Badge tone={tonoPuntaje(c.puntaje)}>{c.puntaje}%</Badge>
                <div>
                  <strong>{c.propiedad.titulo}</strong>
                  <p>
                    {formatMoney(c.propiedad.precio, c.propiedad.moneda)} · para {c.cliente}
                  </p>
                </div>
                <Link className="btn btn--ghost btn--sm" to={`/admin/contactos?contacto=${c.contactoId}`}>
                  Abrir
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
