import { useState } from 'react';
import { DEFAULT_COMMISSION_PERCENT } from '../../domain/lease.js';

/**
 * Modal para registrar un Nuevo Contrato de Arrendamiento.
 */
export function NewLeaseModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    propiedadTitulo: 'Casa de descanso con piscina y solarium en Anapoima',
    ciudad: 'Anapoima',
    direccion: 'Km 3 Vía Anapoima - La Mesa',
    arrendatarioNombre: '',
    arrendatarioDoc: '',
    arrendatarioTelefono: '',
    arrendatarioEmail: '',
    codeudor: '',
    propietarioNombre: 'Andrés Villa',
    propietarioDoc: 'CC 79.442.810',
    propietarioBanco: 'Bancolombia - Cta Ahorros #245-881290-12',
    canon: 8500000,
    administracionPH: 650000,
    comisionPorcentaje: DEFAULT_COMMISSION_PERCENT,
    aplicaIva: true,
    aseguradora: 'Seguros Bolívar',
    polizaNumero: `POL-${Math.floor(10000 + Math.random() * 90000)}`,
    polizaVence: '2027-09-30',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '2027-09-29',
    duracionMeses: 12,
    clausulaReajuste: 'IPC Anual (Ley 820)',
    notas: 'Contrato residencial de arrendamiento afianzado.',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.arrendatarioNombre || !formData.canon) {
      alert('Por favor ingrese el nombre del arrendatario y el canon.');
      return;
    }
    onCreated(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content--wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div>
            <span className="modal-header__kicker">Nuevo Registro</span>
            <h3 className="modal-header__title">Crear Contrato de Arrendamiento</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Inmueble */}
            <div className="form-group">
              <label className="form-label">Propiedad en Arriendo *</label>
              <input
                type="text"
                name="propiedadTitulo"
                className="form-control"
                value={formData.propiedadTitulo}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  className="form-control"
                  value={formData.ciudad}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Dirección / Inmueble</label>
                <input
                  type="text"
                  name="direccion"
                  className="form-control"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Datos Inquilino */}
            <div style={{ background: 'var(--surface-muted)', padding: '0.85rem', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-soft)', display: 'block', marginBottom: '0.5rem' }}>
                Arrendatario (Inquilino)
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  name="arrendatarioNombre"
                  className="form-control"
                  placeholder="Nombre completo inquilino *"
                  value={formData.arrendatarioNombre}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="arrendatarioDoc"
                  className="form-control"
                  placeholder="CC / NIT *"
                  value={formData.arrendatarioDoc}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input
                  type="text"
                  name="arrendatarioTelefono"
                  className="form-control"
                  placeholder="Teléfono móvil"
                  value={formData.arrendatarioTelefono}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="arrendatarioEmail"
                  className="form-control"
                  placeholder="Correo electrónico"
                  value={formData.arrendatarioEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Condiciones Financieras */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Canon Mensual ($) *</label>
                <input
                  type="number"
                  name="canon"
                  className="form-control"
                  value={formData.canon}
                  onChange={handleChange}
                  step="50000"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Comisión Agencia (%)</label>
                <input
                  type="number"
                  name="comisionPorcentaje"
                  className="form-control"
                  value={formData.comisionPorcentaje}
                  onChange={handleChange}
                  step="0.5"
                  min="1"
                  max="30"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cuota Admon PH ($)</label>
                <input
                  type="number"
                  name="administracionPH"
                  className="form-control"
                  value={formData.administracionPH}
                  onChange={handleChange}
                  step="10000"
                />
              </div>
            </div>

            {/* Fianza y Póliza */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Aseguradora / Entidad Fianza</label>
                <select
                  name="aseguradora"
                  className="form-control"
                  value={formData.aseguradora}
                  onChange={handleChange}
                >
                  <option value="Seguros Bolívar">Seguros Bolívar</option>
                  <option value="El Libertador / SURA">El Libertador / SURA</option>
                  <option value="FianzaCrédito">FianzaCrédito</option>
                  <option value="Seguros del Estado">Seguros del Estado</option>
                  <option value="Mapfre">Mapfre</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Número de Póliza</label>
                <input
                  type="text"
                  name="polizaNumero"
                  className="form-control"
                  value={formData.polizaNumero}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Fechas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Fecha Inicio</label>
                <input
                  type="date"
                  name="fechaInicio"
                  className="form-control"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha Fin (Vencimiento)</label>
                <input
                  type="date"
                  name="fechaFin"
                  className="form-control"
                  value={formData.fechaFin}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              Guardar Contrato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
