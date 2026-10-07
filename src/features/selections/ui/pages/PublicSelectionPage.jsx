import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { SmartImage } from '@shared/ui/SmartImage.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { usePublicSelection, useTrackSelection } from '../../application/useSelectionsQueries.js';

/** Filas de la tabla comparativa: lo que de verdad decide una compra. */
const FILAS = [
  { clave: 'precio', label: 'Precio', formato: (p) => formatMoney(p.precio, p.moneda) },
  { clave: 'ubicacion', label: 'Ubicacion', formato: (p) => p.ubicacion ?? '-' },
  { clave: 'area', label: 'Area', formato: (p) => (p.area ? `${p.area} m²` : '-') },
  { clave: 'habitaciones', label: 'Habitaciones', formato: (p) => p.habitaciones ?? '-' },
  { clave: 'banos', label: 'Banos', formato: (p) => p.banos ?? '-' },
  { clave: 'parqueaderos', label: 'Parqueaderos', formato: (p) => p.parqueaderos ?? '-' },
  {
    clave: 'administracion',
    label: 'Administracion',
    formato: (p) => (p.administracion ? formatMoney(p.administracion, p.moneda) : 'No aplica'),
  },
];

/**
 * Lo que abre el cliente cuando su asesor le manda varias opciones.
 *
 * No pide registro ni cuenta: es un enlace y ya. Lo que el cliente marca
 * aqui le llega al asesor, que es el punto de toda la funcion.
 */
export function PublicSelectionPage() {
  const { token } = useParams();
  const { data, isLoading, error } = usePublicSelection(token);
  const registrar = useTrackSelection(token);
  const [favoritas, setFavoritas] = useState(new Set());
  const [descartadas, setDescartadas] = useState(new Set());

  useEffect(() => {
    if (data) document.title = `${data.titulo} | Inmobiliaria`;
  }, [data]);

  if (isLoading) return <Spinner label="Abriendo su seleccion..." />;

  if (error) {
    return (
      <div className="sel-publica sel-publica--error">
        <h1>Este enlace ya no esta disponible</h1>
        <p>Es posible que haya vencido. Pidale a su asesor que se lo envie de nuevo.</p>
        <Link className="btn btn--primary" to="/propiedades">Ver propiedades disponibles</Link>
      </div>
    );
  }

  const alternar = (conjunto, setter, id, tipo) => {
    const copia = new Set(conjunto);
    if (copia.has(id)) copia.delete(id);
    else {
      copia.add(id);
      registrar(tipo, id);
    }
    setter(copia);
  };

  const visibles = data.propiedades.filter((p) => !descartadas.has(p.id));

  return (
    <div className="sel-publica">
      <header className="sel-publica__portada">
        <p className="sel-publica__kicker">Seleccion preparada para usted</p>
        <h1>{data.titulo}</h1>
        {data.mensaje ? <p className="sel-publica__mensaje">{data.mensaje}</p> : null}
        {data.asesor ? <p className="sel-publica__asesor">Su asesor: {data.asesor}</p> : null}
      </header>

      <section className="sel-publica__tarjetas">
        {visibles.map((propiedad) => (
          <article
            key={propiedad.id}
            className={favoritas.has(propiedad.id) ? 'sel-tarjeta es-favorita' : 'sel-tarjeta'}
          >
            <Link
              to={`/propiedades/${propiedad.slug}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => registrar('vio_propiedad', propiedad.id)}
            >
              <span className="sel-tarjeta__foto">
                {propiedad.imagen
                  ? <SmartImage src={propiedad.imagen} alt={propiedad.nombre} />
                  : <span className="sel-tarjeta__vacia">Sin imagen</span>}
              </span>
            </Link>

            <div className="sel-tarjeta__cuerpo">
              <h2>{propiedad.nombre}</h2>
              {propiedad.titular ? <p className="sel-tarjeta__titular">{propiedad.titular}</p> : null}
              <p className="sel-tarjeta__precio">{formatMoney(propiedad.precio, propiedad.moneda)}</p>
              {propiedad.nota ? (
                <p className="sel-tarjeta__nota">
                  <strong>Nota de su asesor:</strong> {propiedad.nota}
                </p>
              ) : null}
            </div>

            <div className="sel-tarjeta__acciones">
              <button
                type="button"
                className={favoritas.has(propiedad.id) ? 'btn btn--primary btn--sm' : 'btn btn--ghost btn--sm'}
                onClick={() => alternar(favoritas, setFavoritas, propiedad.id, 'marco_favorita')}
              >
                {favoritas.has(propiedad.id) ? '★ Me interesa' : '☆ Me interesa'}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => alternar(descartadas, setDescartadas, propiedad.id, 'descarto')}
              >
                No, gracias
              </button>
            </div>
          </article>
        ))}
      </section>

      {visibles.length > 1 ? (
        <section className="sel-publica__comparativa">
          <h2>Comparelas lado a lado</h2>
          <div className="tabla-comparativa">
            <table>
              <thead>
                <tr>
                  <th />
                  {visibles.map((p) => <th key={p.id}>{p.nombre}</th>)}
                </tr>
              </thead>
              <tbody>
                {FILAS.map((fila) => (
                  <tr key={fila.clave}>
                    <th scope="row">{fila.label}</th>
                    {visibles.map((p) => <td key={p.id}>{fila.formato(p)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <footer className="sel-publica__cierre">
        <h2>Quiere conocer alguna en persona?</h2>
        <p>Avisele a su asesor y coordinamos la visita en el horario que prefiera.</p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => registrar('pidio_visita')}
        >
          Quiero agendar una visita
        </button>
        {descartadas.size ? (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setDescartadas(new Set())}
          >
            Volver a ver las {descartadas.size} descartadas
          </button>
        ) : null}
      </footer>
    </div>
  );
}
