/** API publica del feature contactos. */
export { ContactsPage } from './ui/pages/ContactsPage.jsx';
export { ContactPicker } from './ui/components/ContactPicker.jsx';
export { ContactFormModal } from './ui/components/ContactFormModal.jsx';
export { ContactDetailModal } from './ui/components/ContactDetailModal.jsx';
export { ContactPipelineView } from './ui/components/ContactPipelineView.jsx';
export { useContacts, useContact, useFollowUpQueue, useInteractions } from './application/useContactsQueries.js';
export { ContactType, CONTACT_TYPE_LABELS, ContactStage, STAGE_LABELS,
  FINANCIACION_LABELS, PLAZO_LABELS, TEMPERATURA_META } from './domain/contact.js';
