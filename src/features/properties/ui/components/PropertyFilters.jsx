import { useState } from 'react';
import { TYPE_LABELS } from '../../domain/property.js';
import { useCities } from '../../application/usePropertiesQueries.js';
import { useTranslation } from '@shared/i18n/index.js';

const HABITACIONES_VALORES = [undefined, 1, 2, 3, 4];
const BANOS_VALORES = [undefined, 1, 2, 3];

/**
 * Filtros del catalogo.
 * Lo que mas se usa (operacion y tipo) va como chips a un clic; el resto
 * vive detras de "Mas filtros" para no abrumar en la primera pantalla.
 */
export function PropertyFilters({ valores, onChange, total }) {
  const { t, typeLabel, isEn } = useTranslation();
  const { data: ciudades = [] } = useCities();
  const [abierto, setAbierto] = useState(false);
  const set = (patch) => onChange({ ...valores, ...patch, page: 1 });

  const operaciones = [
    { valor: undefined, label: t('catalog.filters.operation.all') },
    { valor: 'venta', label: t('catalog.filters.operation.buy') },
    { valor: 'arriendo', label: t('catalog.filters.operation.rent') },
  ];

  const sortOptions = [
    { value: 'recientes', label: t('catalog.filters.sortOptions.recientes') },
    { value: 'precio_asc', label: t('catalog.filters.sortOptions.precio_asc') },
    { value: 'precio_desc', label: t('catalog.filters.sortOptions.precio_desc') },
    { value: 'area_desc', label: t('catalog.filters.sortOptions.area_desc') },
  ];

  const avanzadosActivos = ['precioMin', 'precioMax', 'habitacionesMin', 'banosMin', 'areaMin', 'solo3d']
    .filter((k) => valores[k] !== undefined && valores[k] !== '').length;

  const limpiarAvanzados = () => {
    set({
      precioMin: undefined,
      precioMax: undefined,
      habitacionesMin: undefined,
      banosMin: undefined,
      areaMin: undefined,
      solo3d: undefined,
    });
  };

  return (
    <div className="buscador">
      <div className="buscador__principal">
        <label className="buscador__campo">
          <span className="buscador__icono" aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder={t('catalog.filters.searchPlaceholder')}
            value={valores.q ?? ''}
            onChange={(e) => set({ q: e.target.value })}
          />
        </label>

        <div className="segmentado" role="group" aria-label={t('catalog.filters.operation.all')}>
          {operaciones.map((op) => (
            <button
              key={op.label}
              type="button"
              className={valores.operacion === op.valor ? 'is-activo' : ''}
              onClick={() => set({ operacion: op.valor })}
            >
              {op.label}
            </button>
          ))}
        </div>

        <select
          aria-label={isEn ? 'City' : 'Ciudad'}
          className="buscador__select"
          value={valores.ciudad ?? ''}
          onChange={(e) => set({ ciudad: e.target.value || undefined })}
        >
          <option value="">{t('catalog.filters.allCities')}</option>
          {ciudades.map((c) => <option key={c.ciudad} value={c.ciudad}>{c.ciudad}</option>)}
        </select>

        <select
          aria-label={t('catalog.filters.sort')}
          className="buscador__select"
          value={valores.orden ?? 'recientes'}
          onChange={(e) => set({ orden: e.target.value })}
        >
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="buscador__tipos">
        <button
          type="button"
          className={!valores.tipos ? 'pildora is-activa' : 'pildora'}
          onClick={() => set({ tipos: undefined })}
        >
          {t('catalog.filters.types.all')}
        </button>
        {Object.keys(TYPE_LABELS).map((valor) => (
          <button
            key={valor}
            type="button"
            className={valores.tipos === valor ? 'pildora is-activa' : 'pildora'}
            onClick={() => set({ tipos: valores.tipos === valor ? undefined : valor })}
          >
            {typeLabel(valor)}
          </button>
        ))}

        <button
          type="button"
          className={valores.solo3d ? 'pildora is-activa' : 'pildora'}
          style={{ borderColor: valores.solo3d ? '#0284c7' : undefined }}
          onClick={() => set({ solo3d: valores.solo3d ? undefined : 'true' })}
          title={isEn ? 'Show only properties with interactive 3D virtual tour' : 'Mostrar solo propiedades con recorrido virtual 3D interactivo'}
        >
          {t('catalog.filters.solo3d')}
        </button>

        <button
          type="button"
          className={abierto || avanzadosActivos ? 'pildora pildora--mas is-activa' : 'pildora pildora--mas'}
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
        >
          {abierto ? t('catalog.filters.hideFilters') : t('catalog.filters.moreFilters')}{' '}
          {avanzadosActivos ? `(${avanzadosActivos})` : ''}
        </button>

        {typeof total === 'number' ? (
          <span className="buscador__total">
            {total} {total === 1 ? (isEn ? 'result' : 'resultado') : (isEn ? 'results' : 'resultados')}
          </span>
        ) : null}
      </div>

      {abierto ? (
        <div className="buscador__avanzados">
          <label>
            <span>{t('catalog.filters.priceMin')}</span>
            <input
              type="number" min="0" placeholder="0"
              value={valores.precioMin ?? ''}
              onChange={(e) => set({ precioMin: e.target.value || undefined })}
            />
          </label>

          <label>
            <span>{t('catalog.filters.priceMax')}</span>
            <input
              type="number" min="0" placeholder={isEn ? 'No limit' : 'Sin límite'}
              value={valores.precioMax ?? ''}
              onChange={(e) => set({ precioMax: e.target.value || undefined })}
            />
          </label>

          <div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-faint)', display: 'block', marginBottom: '0.25rem' }}>
              {t('catalog.filters.rooms')}
            </span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {HABITACIONES_VALORES.map((h) => {
                const label = h === undefined ? t('catalog.filters.roomsAll') : `${h}+`;
                return (
                  <button
                    key={label}
                    type="button"
                    className={`btn btn--ghost btn--sm ${valores.habitacionesMin === h ? 'is-activo' : ''}`}
                    style={{
                      padding: '0.25rem 0.55rem',
                      fontSize: '0.78rem',
                      background: valores.habitacionesMin === h ? 'var(--text)' : undefined,
                      color: valores.habitacionesMin === h ? '#ffffff' : undefined,
                    }}
                    onClick={() => set({ habitacionesMin: h })}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-faint)', display: 'block', marginBottom: '0.25rem' }}>
              {t('catalog.filters.baths')}
            </span>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {BANOS_VALORES.map((b) => {
                const label = b === undefined ? t('catalog.filters.bathsAll') : `${b}+`;
                return (
                  <button
                    key={label}
                    type="button"
                    className={`btn btn--ghost btn--sm ${valores.banosMin === b ? 'is-activo' : ''}`}
                    style={{
                      padding: '0.25rem 0.55rem',
                      fontSize: '0.78rem',
                      background: valores.banosMin === b ? 'var(--text)' : undefined,
                      color: valores.banosMin === b ? '#ffffff' : undefined,
                    }}
                    onClick={() => set({ banosMin: b })}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <label>
            <span>{t('catalog.filters.areaMin')}</span>
            <input
              type="number" min="0" placeholder="0"
              value={valores.areaMin ?? ''}
              onChange={(e) => set({ areaMin: e.target.value || undefined })}
            />
          </label>

          {avanzadosActivos > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={limpiarAvanzados}
                style={{ width: '100%', color: 'var(--color-danger, #ef4444)' }}
              >
                {isEn ? 'Reset advanced filters' : 'Limpiar filtros avanzados'}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
