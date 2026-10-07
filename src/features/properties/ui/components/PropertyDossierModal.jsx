import { useEffect } from 'react';
import { useTranslation } from '@shared/i18n/index.js';
import { specFor } from '../../domain/detailSpecs.js';

/**
 * Modal y Hoja de Impresión: Dossier Ejecutivo Comercial de Alta Gama
 * Incluye ficha financiera, especificaciones técnicas completas y
 * Código QR escaneable que abre el recorrido virtual Kuula 3D en smartphones.
 */
export function PropertyDossierModal({ propiedad, onClose }) {
  const { t, formatMoney, formatDate, typeLabel, operationLabel, isEn } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!propiedad) return null;

  const tourUrl = propiedad.historia?.tourUrl || `${window.location.origin}/propiedades/${propiedad.slug}#tour-3d`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(tourUrl)}&margin=4`;
  const specs = specFor(propiedad.tipo);

  return (
    <div className="dossier-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dossier-modal" onClick={(e) => e.stopPropagation()}>
        {/* Barra superior de acciones */}
        <div className="dossier-modal__topbar no-print">
          <div>
            <span className="badge badge--neutral">{t('dossier.tag')}</span>
            <span style={{ marginLeft: '0.5rem', fontSize: '0.82rem', color: 'var(--text-soft)' }}>
              {t('dossier.code')}: {propiedad.codigo}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => window.print()}
            >
              {t('dossier.printBtn')}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={onClose}
              aria-label={t('dossier.closeBtn')}
            >
              ✕ {t('dossier.closeBtn')}
            </button>
          </div>
        </div>

        {/* Hoja imprimible del Dossier */}
        <div className="dossier-sheet">
          {/* Encabezado Corporativo */}
          <header className="dossier-sheet__header">
            <div>
              <p className="dossier-brand">
                {isEn ? 'REAL ESTATE · PROPERTY DOSSIER' : 'INMOBILIARIA · DOSSIER DE PROPIEDAD'}
              </p>
              <h1 className="dossier-title">{propiedad.nombrePublico || propiedad.titulo}</h1>
              <p className="dossier-subtitle">
                {[propiedad.ubicacion?.barrio, propiedad.ubicacion?.ciudad].filter(Boolean).join(', ')} ·{' '}
                {typeLabel(propiedad.tipo)} {isEn ? 'for' : 'en'} {operationLabel(propiedad.operacion)}
              </p>
            </div>
            <div className="dossier-price-box">
              <span className="dossier-price-label">{t('dossier.price')}</span>
              <p className="dossier-price">
                {formatMoney(propiedad.precio, propiedad.moneda)}
                {propiedad.operacion === 'arriendo' && <small>{isEn ? '/mo' : '/mes'}</small>}
              </p>
              <span className="dossier-code">{t('dossier.code')}: {propiedad.codigo}</span>
            </div>
          </header>

          {/* Fotografía & Bloque QR */}
          <div className="dossier-sheet__media-row">
            <div className="dossier-sheet__hero-img">
              {propiedad.imagenPrincipal ? (
                <img src={propiedad.imagenPrincipal} alt={propiedad.titulo} />
              ) : (
                <div className="dossier-placeholder">{isEn ? 'No image available' : 'Sin imagen principal'}</div>
              )}
            </div>

            {/* Código QR con llamada al Tour 3D */}
            <div className="dossier-sheet__qr-card">
              <div className="dossier-qr-wrap">
                <img src={qrUrl} alt={isEn ? '3D Tour QR Code' : 'Código QR del Recorrido 3D'} width="140" height="140" />
              </div>
              <div className="dossier-qr-text">
                <span className="dossier-qr-badge">🥽 Kuula 360° Tour</span>
                <p>
                  {isEn ? (
                    <>
                      <strong>Scan this QR code with your smartphone</strong> to launch the interactive
                      high-definition 3D virtual walkthrough.
                    </>
                  ) : (
                    <>
                      <strong>Escanee este código con su smartphone</strong> para iniciar el recorrido
                      virtual inmersivo 3D interactivo en alta fidelidad.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Manifiesto y narrativa de la propiedad */}
          {propiedad.historia?.manifiesto && (
            <div className="dossier-sheet__manifesto">
              <h3>{isEn ? 'Architectural Concept & Review' : 'Concepto & Reseña Arquitectónica'}</h3>
              <p>{propiedad.historia.manifiesto}</p>
            </div>
          )}

          {/* Especificaciones y ficha técnica */}
          <div className="dossier-sheet__specs">
            <h3>{isEn ? 'Technical Specifications & Highlights' : 'Ficha Técnica & Características'}</h3>
            <div className="dossier-specs-grid">
              {specs.map((field) => {
                const valor = propiedad.detalles?.[field.name];
                if (valor === null || valor === undefined || valor === '') return null;
                const texto = field.type === 'boolean'
                  ? (valor ? (isEn ? 'Yes' : 'Sí') : (isEn ? 'No' : 'No'))
                  : field.format === 'money'
                  ? formatMoney(valor, propiedad.moneda)
                  : Array.isArray(valor)
                  ? valor.join(', ')
                  : String(valor);
                return (
                  <div key={field.name} className="dossier-spec-item">
                    <span>{field.label}</span>
                    <strong>{texto}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pie de página con datos de contacto */}
          <footer className="dossier-sheet__footer">
            <div>
              <p>
                <strong>{isEn ? 'Private Advisory & Viewings:' : 'Asesoría & Visitas Privadas:'}</strong> Inmobiliaria
              </p>
              <p>info@inmobiliaria.com · WhatsApp: (+57) 300 123 4567</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p>{isEn ? 'Confidential sheet generated for client use.' : 'Ficha generada para uso exclusivo del cliente.'}</p>
              <small>{formatDate(new Date())}</small>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
