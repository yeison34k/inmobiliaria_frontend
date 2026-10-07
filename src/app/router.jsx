import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth, UserRole } from '@features/auth';
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { AdminLayout } from './layouts/AdminLayout.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { PageLoader } from '@shared/ui/PageLoader.jsx';

// Funciones de prefetching anticipado al pasar el cursor (Hover/Focus Intent)
export const prefetchCatalog = () => import('@features/properties/ui/pages/CatalogPage.jsx');
export const prefetchContact = () => import('./pages/ContactPage.jsx');
export const prefetchPropertyExperience = () => import('@features/properties/ui/pages/PropertyExperiencePage.jsx');

// Carga diferida (Lazy Load) de páginas públicas secundarias
const CatalogPage = lazy(() =>
  import('@features/properties/ui/pages/CatalogPage.jsx').then((m) => ({ default: m.CatalogPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage.jsx').then((m) => ({ default: m.ContactPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage.jsx').then((m) => ({ default: m.NotFoundPage }))
);
const PropertyExperiencePage = lazy(() =>
  import('@features/properties/ui/pages/PropertyExperiencePage.jsx').then((m) => ({ default: m.PropertyExperiencePage }))
);
const PublicSelectionPage = lazy(() =>
  import('@features/selections/ui/pages/PublicSelectionPage.jsx').then((m) => ({ default: m.PublicSelectionPage }))
);

// Carga diferida (Lazy Load) de páginas administrativas y autenticación
const LoginPage = lazy(() =>
  import('@features/auth/ui/pages/LoginPage.jsx').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import('@features/dashboard/ui/pages/DashboardPage.jsx').then((m) => ({ default: m.DashboardPage }))
);
const PropertiesAdminPage = lazy(() =>
  import('@features/properties/ui/pages/PropertiesAdminPage.jsx').then((m) => ({ default: m.PropertiesAdminPage }))
);
const PropertyFormPage = lazy(() =>
  import('@features/properties/ui/pages/PropertyFormPage.jsx').then((m) => ({ default: m.PropertyFormPage }))
);
const PropertyAdminDetailPage = lazy(() =>
  import('@features/properties/ui/pages/PropertyAdminDetailPage.jsx').then((m) => ({ default: m.PropertyAdminDetailPage }))
);
const PropertyExperienceEditor = lazy(() =>
  import('@features/properties/ui/pages/PropertyExperienceEditor.jsx').then((m) => ({ default: m.PropertyExperienceEditor }))
);
const MyDayPage = lazy(() =>
  import('./pages/MyDayPage.jsx').then((m) => ({ default: m.MyDayPage }))
);
const AgendaPage = lazy(() =>
  import('@features/visits/ui/pages/AgendaPage.jsx').then((m) => ({ default: m.AgendaPage }))
);
const MatchesPage = lazy(() =>
  import('@features/requirements/ui/pages/MatchesPage.jsx').then((m) => ({ default: m.MatchesPage }))
);
const SelectionsPage = lazy(() =>
  import('@features/selections/ui/pages/SelectionsPage.jsx').then((m) => ({ default: m.SelectionsPage }))
);
const OperationsPage = lazy(() =>
  import('@features/operations/ui/pages/OperationsPage.jsx').then((m) => ({ default: m.OperationsPage }))
);
const LeasesAdminPage = lazy(() =>
  import('@features/leases/ui/pages/LeasesAdminPage.jsx').then((m) => ({ default: m.LeasesAdminPage }))
);
const ContactsPage = lazy(() =>
  import('@features/contacts/ui/pages/ContactsPage.jsx').then((m) => ({ default: m.ContactsPage }))
);
const InquiriesPage = lazy(() =>
  import('@features/inquiries/ui/pages/InquiriesPage.jsx').then((m) => ({ default: m.InquiriesPage }))
);
const DocumentsAdminPage = lazy(() =>
  import('@features/documents/ui/pages/DocumentsAdminPage.jsx').then((m) => ({ default: m.DocumentsAdminPage }))
);
const PortalesAdminPage = lazy(() =>
  import('@features/portals/ui/pages/PortalesAdminPage.jsx').then((m) => ({ default: m.PortalesAdminPage }))
);
const SettingsPage = lazy(() =>
  import('@features/settings/ui/pages/SettingsPage.jsx').then((m) => ({ default: m.SettingsPage }))
);
const ProfilePage = lazy(() =>
  import('@features/auth/ui/pages/ProfilePage.jsx').then((m) => ({ default: m.ProfilePage }))
);
const UsersPage = lazy(() =>
  import('@features/auth/ui/pages/UsersPage.jsx').then((m) => ({ default: m.UsersPage }))
);

/**
 * Mapa de rutas con división de código (Code Splitting) y Lazy Loading:
 * El bundle inicial solo incluye el layout base y la portada (HomePage).
 * Todas las demás vistas se cargan bajo demanda reduciendo drásticamente el TTI y FCP.
 */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/propiedades', element: <CatalogPage /> },
      { path: '/contacto', element: <ContactPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // La landing de cada propiedad va sin layout: ocupa la pantalla completa
  {
    path: '/propiedades/:slug',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PropertyExperiencePage />
      </Suspense>
    ),
  },
  // La seleccion del cliente va sin layout: es un enlace que se abre solo
  {
    path: '/seleccion/:token',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicSelectionPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'propiedades', element: <PropertiesAdminPage /> },
          { path: 'propiedades/nueva', element: <PropertyFormPage /> },
          { path: 'propiedades/:id', element: <PropertyAdminDetailPage /> },
          { path: 'propiedades/:id/editar', element: <PropertyFormPage /> },
          { path: 'propiedades/:id/experiencia', element: <PropertyExperienceEditor /> },
          { path: 'mi-dia', element: <MyDayPage /> },
          { path: 'agenda', element: <AgendaPage /> },
          { path: 'oportunidades', element: <MatchesPage /> },
          { path: 'selecciones', element: <SelectionsPage /> },
          { path: 'operaciones', element: <OperationsPage /> },
          { path: 'arrendamientos', element: <LeasesAdminPage /> },
          { path: 'contactos', element: <ContactsPage /> },
          { path: 'consultas', element: <InquiriesPage /> },
          { path: 'documentos', element: <DocumentsAdminPage /> },
          { path: 'portales', element: <PortalesAdminPage /> },
          { path: 'configuracion', element: <SettingsPage /> },
          { path: 'perfil', element: <ProfilePage /> },
        ],
      },
      {
        element: <RequireAuth rol={UserRole.ADMIN} />,
        children: [
          {
            element: <AdminLayout />,
            children: [{ path: 'usuarios', element: <UsersPage /> }],
          },
        ],
      },
    ],
  },
]);
