import { useState } from 'react';
import { useTranslation } from '@shared/i18n/index.js';

/**
 * Botón Flotante de WhatsApp Comercial con mensaje contextual prellenado.
 * Facilita la conversión inmediata del cliente potencial hacia el asesor.
 */
export function WhatsAppFloatingButton({ propiedad, telefono = '573001234567' }) {
  const { formatMoney, isEn } = useTranslation();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  if (!propiedad) return null;

  const nombre = propiedad.nombrePublico || propiedad.titulo;
  const precio = formatMoney(propiedad.precio, propiedad.moneda);
  const ref = propiedad.codigo || '';
  const lugar = [propiedad.ubicacion?.barrio, propiedad.ubicacion?.ciudad].filter(Boolean).join(', ');
  const link = window.location.href;

  const mensaje = isEn
    ? `Hello! I would like to receive advisory and schedule a viewing for:\n*${nombre}* (Ref: ${ref})\n💰 Price: ${precio}\n📍 Location: ${lugar}\n🔗 Link: ${link}`
    : `¡Hola! Me interesa recibir asesoría y agendar una visita para:\n*${nombre}* (Ref: ${ref})\n💰 Precio: ${precio}\n📍 Ubicación: ${lugar}\n🔗 Enlace: ${link}`;

  const whatsappHref = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  return (
    <aside className="exp-wa-floater" aria-label={isEn ? 'Contact via WhatsApp' : 'Contacto por WhatsApp'}>
      {tooltipVisible && (
        <div className="exp-wa-floater__tooltip">
          <span>{isEn ? '💬 Questions about this property?' : '💬 ¿Preguntas sobre este inmueble?'}</span>
          <strong>{isEn ? 'Chat directly via WhatsApp' : 'Escríbenos directamente por WhatsApp'}</strong>
        </div>
      )}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="exp-wa-floater__btn"
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        title={isEn ? 'Contact advisor via WhatsApp' : 'Contactar asesor por WhatsApp'}
      >
        <span className="exp-wa-floater__pulse" aria-hidden="true" />
        <svg
          className="exp-wa-floater__icon"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="currentColor"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.586-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.697.073-2.18-.541-1.614-.666-2.613-2.372-2.694-2.48-.08-.108-.66-88-.66-1.677 0-.796.417-1.189.566-1.351.149-.162.327-.202.435-.202.109 0 .218.001.313.006.101.005.236-.039.369.28.136.326.463 1.13.504 1.211.04.082.067.177.013.284-.053.107-.08.175-.16.269-.079.094-.167.21-.238.282-.08.082-.162.171-.07.328.093.158.411.678.882 1.097.606.539 1.116.707 1.274.786.158.079.251.069.344-.04.093-.108.399-.464.506-.624.106-.16.213-.133.359-.08.146.053.929.438 1.089.518.16.079.266.12.306.186.04.066.04.385-.104.79zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.659 1.438 5.169L2 22l4.985-1.408C8.423 21.523 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.159-.472-4.444-1.285l-.319-.202-2.956.834.843-2.887-.211-.336C4.053 14.996 3.6 13.535 3.6 12c0-4.632 3.768-8.4 8.4-8.4 4.633 0 8.4 3.768 8.4 8.4 0 4.632-3.767 8.4-8.4 8.4z" />
        </svg>
      </a>
    </aside>
  );
}
