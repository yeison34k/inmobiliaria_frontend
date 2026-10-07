/** API publica del feature propiedades: componentes y utilidades compartidas. */
export { PropertyCard, PropertyCardSkeleton } from './ui/components/PropertyCard.jsx';
export { PropertyStatusBadge } from './ui/components/PropertyStatusBadge.jsx';
export { PropertyPicker } from './ui/components/PropertyPicker.jsx';
export { HeroBackdrop } from './ui/components/home/HeroBackdrop.jsx';
export { CollectionGrid } from './ui/components/home/CollectionGrid.jsx';
export { FeaturedShowcase } from './ui/components/home/FeaturedShowcase.jsx';
export { useCatalogSearch, usePropertiesSearch, useCities, usePropertyPriceHistory } from './application/usePropertiesQueries.js';
export { PropertyStatus, STATUS_META, TYPE_LABELS, OPERATION_LABELS } from './domain/property.js';
export { CONCEPTS, CONCEPT_KEYS, conceptOf, SURROUNDING_META, SURROUNDING_KEYS, IMAGE_FORMATS, IMAGE_FORMAT_KEYS } from './domain/concepts.js';
