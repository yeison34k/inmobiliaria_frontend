import { useEffect, useState, Suspense } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ScrollProgress } from '@shared/ui/ScrollProgress.jsx';
import { BackToTop } from '@shared/ui/BackToTop.jsx';
import { PageLoader } from '@shared/ui/PageLoader.jsx';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher.jsx';
import { useTranslation } from '@shared/i18n/index.js';
import { prefetchCatalog, prefetchContact } from '../router.jsx';

export function PublicLayout() {
  const { pathname, search } = useLocation();
  const [compacto, setCompacto] = useState(false);
  const { t } = useTranslation();

  // Cada navegacion empieza arriba y con un fundido de entrada
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [pathname]);

  // La barra se encoge al bajar: deja respirar el contenido
  useEffect(() => {
    const onScroll = () => setCompacto(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="public">
      <ScrollProgress />

      <header className={compacto ? 'topbar is-compacta' : 'topbar'}>
        <Link to="/" className="brand">{t('nav.brand')}</Link>
        <nav className="topbar__nav">
          <NavLink to="/propiedades?operacion=venta" onMouseEnter={prefetchCatalog} onFocus={prefetchCatalog}>{t('nav.buy')}</NavLink>
          <NavLink to="/propiedades?operacion=arriendo" onMouseEnter={prefetchCatalog} onFocus={prefetchCatalog}>{t('nav.rent')}</NavLink>
          <NavLink to="/propiedades" end onMouseEnter={prefetchCatalog} onFocus={prefetchCatalog}>{t('nav.all')}</NavLink>
          <NavLink to="/contacto" onMouseEnter={prefetchContact} onFocus={prefetchContact}>{t('nav.contact')}</NavLink>
          <LanguageSwitcher />
          <Link to="/admin" className="btn btn--ghost btn--sm">{t('nav.admin')}</Link>
        </nav>
      </header>

      {/* La clave fuerza el remontaje: cada pagina entra con su propia transicion */}
      <main className="public__main pagina" key={pathname + search}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="footer">
        <p>{t('footer.credits')}</p>
      </footer>

      <BackToTop />
    </div>
  );
}
