import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@features/auth';
import { ToastProvider } from '@shared/hooks/useToast.jsx';
import { LanguageProvider } from '@shared/i18n/index.js';
import { router } from './router.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => (error?.status >= 500 ? failureCount < 2 : false),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

/** Raiz de la aplicacion: proveedores globales + router. */
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
