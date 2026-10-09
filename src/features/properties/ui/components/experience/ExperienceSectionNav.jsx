import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from '@shared/i18n/index.js';

/**
 * Barra Flotante de Navegación Rápida & ScrollSpy (Section Dock).
 * Permite saltar instantáneamente entre los 8 bloques de la experiencia inmersiva
 * sin fatiga de scroll (en páginas de más de 8.000px de altura), e indica en tiempo real
 * la sección visible.
 */
export function ExperienceSectionNav({ propiedad }) {
  const { isEn } = useTranslation();
  const [activeSection, setActiveSection] = useState('');
  const [visible, setVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Calcular las secciones disponibles según los datos reales del inmueble
  const sections = useMemo(() => [
    {
      id: 'seccion-historia',
      label: isEn ? 'Story' : 'Historia',
      icon: '🏛️',
      available: Boolean(propiedad?.historia?.manifiesto || propiedad?.descripcion),
    },
    {
      id: 'seccion-galeria',
      label: isEn ? 'Photos' : 'Fotos',
      icon: '📸',
      available: Boolean((propiedad?.imagenes || []).length || propiedad?.imagenPrincipal),
    },
    {
      id: 'tour-3d',
      label: 'Tour 3D',
      icon: '🥽',
      available: Boolean(propiedad?.historia?.tourUrl),
    },
    {
      id: 'seccion-plantas',
      label: isEn ? 'Layout' : 'Planos',
      icon: '📐',
      available: true,
    },
    {
      id: 'seccion-ficha',
      label: isEn ? 'Specs' : 'Ficha',
      icon: '📋',
      available: true,
    },
    {
      id: 'seccion-entorno',
      label: isEn ? 'Area' : 'Entorno',
      icon: '🗺️',
      available: Boolean((propiedad?.entorno || []).length || propiedad?.ubicacion),
    },
    {
      id: 'calculadora-hipotecaria',
      label: isEn ? 'Mortgage' : 'Simulador',
      icon: '💰',
      available: propiedad?.operacion === 'venta',
    },
    {
      id: 'seccion-contacto',
      label: isEn ? 'Contact' : 'Contacto',
      icon: '✉️',
      available: true,
    },
  ].filter((s) => s.available), [propiedad, isEn]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setVisible(scrollY > window.innerHeight * 0.45);
          setShowScrollTop(scrollY > 1100);

          // ScrollSpy: identificar qué sección está en el viewport
          for (let i = sections.length - 1; i >= 0; i--) {
            const el = document.getElementById(sections[i].id);
            if (el) {
              const rect = el.getBoundingClientRect();
              if (rect.top <= window.innerHeight * 0.42) {
                setActiveSection(sections[i].id);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <>
      <nav
        className="exp-section-dock"
        aria-label={isEn ? 'Section navigation' : 'Navegación de secciones'}
      >
        <div className="exp-section-dock__track">
          {sections.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`exp-section-dock__btn ${activeSection === sec.id ? 'is-active' : ''}`}
              onClick={() => scrollTo(sec.id)}
              aria-label={sec.label}
              title={sec.label}
            >
              <span className="exp-section-dock__icon" aria-hidden="true">{sec.icon}</span>
              <span className="exp-section-dock__label">{sec.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {showScrollTop && (
        <button
          type="button"
          className="exp-scroll-top-btn"
          onClick={scrollToTop}
          aria-label={isEn ? 'Back to top' : 'Volver arriba'}
          title={isEn ? 'Back to top' : 'Volver arriba'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
    </>
  );
}
