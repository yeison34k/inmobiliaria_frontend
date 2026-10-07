import { useState } from 'react';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useTranslation } from '@shared/i18n/index.js';
import { PropertyDossierModal } from './PropertyDossierModal.jsx';

export function ShareButtons({ propiedad }) {
  const toast = useToast();
  const { isEn } = useTranslation();
  const [copiado, setCopiado] = useState(false);
  const [dossierAbierto, setDossierAbierto] = useState(false);

  const url = window.location.href;
  const texto = isEn
    ? `Take a look at this property: ${propiedad.nombrePublico || propiedad.titulo} - ${url}`
    : `Mira esta propiedad: ${propiedad.nombrePublico || propiedad.titulo} - ${url}`;

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      toast.success(isEn ? 'Link copied to clipboard' : 'Enlace copiado al portapapeles');
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.error(isEn ? 'Could not copy link' : 'No se pudo copiar el enlace');
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(texto)}`;

  return (
    <>
      <div className="share-bar" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--ghost btn--sm"
          style={{ color: '#16a34a', borderColor: '#86efac' }}
          title={isEn ? 'Share via WhatsApp' : 'Compartir por WhatsApp'}
        >
          💬 WhatsApp
        </a>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={copiarEnlace}
          title={isEn ? 'Copy link' : 'Copiar enlace'}
        >
          {copiado ? (isEn ? '✓ Copied' : '✓ Copiado') : (isEn ? '🔗 Copy link' : '🔗 Copiar link')}
        </button>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setDossierAbierto(true)}
          style={{ borderColor: '#38bdf8', color: '#0284c7' }}
          title={isEn ? 'View Executive Dossier with 3D Tour QR Code' : 'Ver Dossier Ejecutivo de Inversión con Código QR al Tour 3D'}
        >
          {isEn ? '📄 PDF Dossier & 3D QR' : '📄 Dossier & QR 3D'}
        </button>
      </div>

      {dossierAbierto && (
        <PropertyDossierModal
          propiedad={propiedad}
          onClose={() => setDossierAbierto(false)}
        />
      )}
    </>
  );
}
