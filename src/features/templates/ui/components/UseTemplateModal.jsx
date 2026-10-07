import { useEffect, useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { Badge } from '@shared/ui/Badge.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useAuth } from '@features/auth';
import { useTemplateMutations, useTemplates } from '../../application/useTemplatesQueries.js';
import { CHANNEL_META } from '../../domain/template.js';

const soloDigitos = (t) => String(t ?? '').replace(/\D/g, '');

const enlaceWhatsapp = (telefono, texto) => {
  const n = soloDigitos(telefono);
  if (!n) return null;
  const conIndicativo = n.length === 10 ? `57${n}` : n;
  return `https://wa.me/${conIndicativo}?text=${encodeURIComponent(texto)}`;
};

const enlaceCorreo = (email, asunto, cuerpo) => {
  if (!email) return null;
  const partes = [];
  if (asunto) partes.push(`subject=${encodeURIComponent(asunto)}`);
  partes.push(`body=${encodeURIComponent(cuerpo)}`);
  return `mailto:${email}?${partes.join('&')}`;
};

/**
 * Elegir una plantilla, revisarla y mandarla.
 *
 * El mensaje sale del WhatsApp o del correo del asesor, no del sistema:
 * aqui solo se arma el texto y se abre el canal. El texto es editable a
 * proposito, porque ninguna plantilla cubre el caso particular.
 */
export function UseTemplateModal({ contacto, datos = {}, onClose }) {
  const toast = useToast();
  const { usuario } = useAuth();
  const [clave, setClave] = useState('');
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [registrar, setRegistrar] = useState(true);
  const [faltantes, setFaltantes] = useState([]);

  const { data: plantillas = [] } = useTemplates();
  const { render } = useTemplateMutations({ onError: (e) => toast.error(e.displayMessage) });

  const elegida = plantillas.find((p) => p.clave === clave) ?? null;

  useEffect(() => {
    if (!elegida) {
      setAsunto('');
      setCuerpo('');
      setFaltantes([]);
      return;
    }
    render.mutateAsync({
      clave: elegida.clave,
      telefono: contacto?.telefono ?? undefined,
      datos: {
        cliente: contacto?.nombre ?? contacto?.nombreCompleto,
        asesor: usuario?.nombre,
        ...datos,
      },
    })
      .then((mensaje) => {
        setAsunto(mensaje.asunto ?? '');
        setCuerpo(mensaje.cuerpo ?? '');
        setFaltantes(mensaje.faltantes ?? []);
      })
      .catch(() => {});
    // El render depende solo de la plantilla elegida; los datos del
    // contacto no cambian mientras el modal esta abierto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  const canal = elegida?.canal ?? 'whatsapp';
  const destino = canal === 'correo'
    ? enlaceCorreo(contacto?.email, asunto, cuerpo)
    : enlaceWhatsapp(contacto?.telefono, cuerpo);

  const faltaDato = canal === 'correo' ? !contacto?.email : !soloDigitos(contacto?.telefono);

  // Marcas que siguen en el texto: el asesor las ve y las resuelve
  const pendientes = faltantes.filter((v) => cuerpo.includes(`{{${v}}}`) || asunto.includes(`{{${v}}}`));

  /** Abre el canal del asesor y, si lo pidio, deja la huella en la bitacora. */
  const enviar = () => {
    if (!destino) return;
    window.open(destino, '_blank', 'noopener,noreferrer');
    if (registrar) {
      onClose({
        registrar: {
          tipo: canal === 'correo' ? 'correo' : 'whatsapp',
          resumen: cuerpo,
        },
      });
      return;
    }
    onClose();
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(cuerpo);
      toast.success('Mensaje copiado');
    } catch {
      toast.info('No se pudo copiar; seleccione el texto a mano');
    }
  };

  return (
    <Modal title="Usar una plantilla" onClose={() => onClose()} wide>
      {plantillas.length === 0 ? (
        <p className="panel__hint">
          Todavia no hay plantillas. Se crean en Ajustes y quedan disponibles para todo el equipo.
        </p>
      ) : (
        <>
          <Field label="Plantilla">
            <select value={clave} onChange={(e) => setClave(e.target.value)}>
              <option value="">Elija una...</option>
              {plantillas.map((p) => (
                <option key={p.id} value={p.clave}>
                  {p.nombre} · {CHANNEL_META[p.canal]?.label ?? p.canal}
                </option>
              ))}
            </select>
          </Field>

          {elegida ? (
            <>
              {canal === 'correo' ? (
                <Field label="Asunto">
                  <input value={asunto} onChange={(e) => setAsunto(e.target.value)} />
                </Field>
              ) : null}

              <Field label="Mensaje" hint="Reviselo antes de enviar: puede ajustarlo como quiera">
                <textarea rows={8} value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} />
              </Field>

              {pendientes.length ? (
                <p className="plantillas__alerta">
                  {pendientes.length === 1
                    ? `Falta un dato: ${pendientes[0]}. Complete el texto antes de enviar.`
                    : `Faltan datos: ${pendientes.join(', ')}. Complete el texto antes de enviar.`}
                </p>
              ) : null}

              {faltaDato ? (
                <p className="plantillas__alerta">
                  {canal === 'correo'
                    ? 'Este contacto no tiene correo registrado. Copie el mensaje o agregue el correo en su ficha.'
                    : 'Este contacto no tiene telefono registrado. Copie el mensaje o agregue el telefono en su ficha.'}
                </p>
              ) : null}

              <label className="checkbox">
                <input type="checkbox" checked={registrar} onChange={(e) => setRegistrar(e.target.checked)} />
                <span>Dejar registro en la bitacora del contacto</span>
              </label>

              <div className="form-actions">
                <button type="button" className="btn btn--ghost" onClick={copiar}>Copiar texto</button>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={!destino || !cuerpo.trim() || pendientes.length > 0}
                  onClick={enviar}
                >
                  {canal === 'correo' ? 'Abrir correo' : 'Abrir WhatsApp'}
                </button>
              </div>

              {elegida.variablesDesconocidas?.length ? (
                <p className="plantillas__alerta">
                  <Badge tone="danger">revisar</Badge>{' '}
                  Esta plantilla usa variables que el sistema no reemplaza:{' '}
                  {elegida.variablesDesconocidas.map((v) => `{{${v}}}`).join(', ')}
                </p>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </Modal>
  );
}
