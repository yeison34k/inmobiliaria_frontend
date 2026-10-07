import { createBrowserRouter } from 'react-router-dom';
import { LoginPage, ProfilePage, RequireAuth, UserRole, UsersPage } from '@features/auth';
import {
  CatalogPage, PropertiesAdminPage, PropertyAdminDetailPage,
  PropertyExperienceEditor, PropertyExperiencePage, PropertyFormPage,
} from '@features/properties';
import { DocumentsAdminPage } from '@features/documents';
import { OperationsPage } from '@features/operations';
import { AgendaPage } from '@features/visits';
import { MatchesPage } from '@features/requirements';
import { SelectionsPage, PublicSelectionPage } from '@features/selections';
import { MyDayPage } from './pages/MyDayPage.jsx';
import { ContactsPage } from '@features/contacts';
import { InquiriesPage } from '@features/inquiries';
import { DashboardPage } from '@features/dashboard';
import { LeasesAdminPage } from '@features/leases';
import { SettingsPage } from '@features/settings';
import { PortalesAdminPage } from '@features/portals';
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { AdminLayout } from './layouts/AdminLayout.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

/**
 * Mapa de rutas: el sitio publico y el panel viven en arboles separados,
 * cada uno con su layout. Las rutas privadas pasan por RequireAuth.
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
  { path: '/propiedades/:slug', element: <PropertyExperiencePage /> },
  // La seleccion del cliente va sin layout: es un enlace que se abre solo
  { path: '/seleccion/:token', element: <PublicSelectionPage /> },
  { path: '/admin/login', element: <LoginPage /> },
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
