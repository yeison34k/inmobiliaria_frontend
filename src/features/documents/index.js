/** API publica del feature documentos. */
export { DocumentsPanel } from './ui/components/DocumentsPanel.jsx';
export { DocumentsAdminPage } from './ui/pages/DocumentsAdminPage.jsx';
export { useDocuments, useAllDocuments, useExpiringDocuments, useDocumentMutations } from './application/useDocumentsQueries.js';
export { DOCUMENT_TYPES, DOCUMENT_TYPE_KEYS, VIGENCIA_META, faltaMandato } from './domain/document.js';
