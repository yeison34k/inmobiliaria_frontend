import { InquiryForm } from '@features/inquiries';
import { Reveal } from '@shared/ui/Reveal.jsx';
import { useTranslation } from '@shared/i18n/index.js';

export function ContactPage() {
  const { t, isEn } = useTranslation();

  const waText = isEn
    ? 'Hello, I would like to receive real estate advisory'
    : 'Hola, quisiera recibir asesoría inmobiliaria';

  return (
    <div className="pagina-contacto container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <header className="page__header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p className="portada__kicker" style={{ justifyContent: 'center' }}>
          {t('contactPage.kicker')}
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0.5rem 0' }}>
          {t('contactPage.title')}
        </h1>
        <p className="page__subtitle" style={{ maxWidth: '650px', margin: '0 auto' }}>
          {t('contactPage.subtitle')}
        </p>
      </header>

      <div className="contacto-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        {/* Columna Izquierda: Información Institucional */}
        <Reveal className="contacto-info">
          <div className="panel panel--bordered" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', padding: '2rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>📍 {t('contactPage.mainOffice')}</h3>
              <p className="text-muted" style={{ margin: 0 }}>
                Carrera 43A # 1-50, Edificio Square<br />
                El Poblado, Medellín, Colombia
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>📞 {t('contactPage.phoneNumbers')}</h3>
              <p style={{ margin: '0 0 0.25rem' }}>
                <strong>{t('contactPage.directLine')}</strong> +57 (604) 444-1234
              </p>
              <p style={{ margin: 0 }}>
                <strong>{t('contactPage.whatsappAdvice')}</strong>{' '}
                <a
                  href={`https://wa.me/573001234567?text=${encodeURIComponent(waText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#16a34a', fontWeight: 600 }}
                >
                  +57 300 123 4567 💬
                </a>
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '0.5rem' }}>⏰ {t('contactPage.hours')}</h3>
              <p className="text-muted" style={{ margin: '0 0 0.25rem' }}>
                {t('contactPage.weekdays')}
              </p>
              <p className="text-muted" style={{ margin: 0 }}>
                {t('contactPage.saturdays')}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>{t('contactPage.consignTitle')}</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                {t('contactPage.consignText')}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Columna Derecha: Formulario de Contacto */}
        <Reveal delay={100} className="contacto-formulario">
          <InquiryForm />
        </Reveal>
      </div>
    </div>
  );
}
