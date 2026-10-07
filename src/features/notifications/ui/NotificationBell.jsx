import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useNotificationMutations } from '../application/useNotifications.js';

const hace = (fecha) => {
  const minutos = Math.round((Date.now() - new Date(fecha).getTime()) / 60_000);
  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.round(horas / 24)} d`;
};

/** Campana de avisos: lo que el asesor tiene que atender hoy. */
export function NotificationBell() {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const { data } = useNotifications();
  const { markRead, markAllRead } = useNotificationMutations();

  useEffect(() => {
    const fuera = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, []);

  const sinLeer = data?.sinLeer ?? 0;
  const items = data?.items ?? [];

  const abrir = (aviso) => {
    markRead.mutate(aviso.id);
    setAbierto(false);
    if (aviso.enlace) navigate(aviso.enlace);
  };

  return (
    <div className="campana" ref={ref}>
      <button
        type="button"
        className={sinLeer ? 'campana__boton tiene-avisos' : 'campana__boton'}
        onClick={() => setAbierto(!abierto)}
        aria-label={sinLeer ? `${sinLeer} avisos sin leer` : 'Avisos'}
      >
        <span aria-hidden="true">🔔</span>
        {sinLeer ? <span className="campana__punto">{sinLeer > 9 ? '9+' : sinLeer}</span> : null}
      </button>

      {abierto ? (
        <div className="campana__panel">
          <header>
            <strong>Avisos</strong>
            {sinLeer ? (
              <button type="button" onClick={() => markAllRead.mutate()}>Marcar todo leido</button>
            ) : null}
          </header>

          {items.length === 0 ? (
            <p className="campana__vacio">No hay avisos.</p>
          ) : (
            <ul>
              {items.map((aviso) => (
                <li key={aviso.id} className={aviso.leida ? '' : 'sin-leer'}>
                  <button type="button" onClick={() => abrir(aviso)}>
                    <strong>{aviso.titulo}</strong>
                    {aviso.detalle ? <span>{aviso.detalle}</span> : null}
                    <small>{hace(aviso.createdAt)}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
