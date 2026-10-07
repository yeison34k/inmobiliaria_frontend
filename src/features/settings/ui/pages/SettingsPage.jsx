import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../infrastructure/settingsApi.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { ErrorState } from '@shared/ui/ErrorState.jsx';
import { TemplatesPanel } from '@features/templates';

export function SettingsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [tabActiva, setTabActiva] = useState('legal'); // 'legal' | 'comercial' | 'contacto' | 'plantillas'

  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['configuracion-inmobiliaria'],
    queryFn: () => settingsApi.get(),
  });

  const [formData, setFormData] = useState({
    razonSocial: '',
    nit: '',
    matriculaArrendador: '',
    registroMercantil: '',
    telefono: '',
    whatsapp: '',
    emailContacto: '',
    emailNotificaciones: '',
    direccion: '',
    comisionVentaUrbana: 3.0,
    comisionVentaRural: 4.0,
    honorariosArriendo: 8.0,
    participacionAsesor: 40.0,
    ivaPorcentaje: 19.0,
    redes: {
      instagram: '',
      facebook: '',
      linkedin: '',
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        razonSocial: settings.razonSocial || '',
        nit: settings.nit || '',
        matriculaArrendador: settings.matriculaArrendador || '',
        registroMercantil: settings.registroMercantil || '',
        telefono: settings.telefono || '',
        whatsapp: settings.whatsapp || '',
        emailContacto: settings.emailContacto || '',
        emailNotificaciones: settings.emailNotificaciones || '',
        direccion: settings.direccion || '',
        comisionVentaUrbana: settings.comisionVentaUrbana ?? 3.0,
        comisionVentaRural: settings.comisionVentaRural ?? 4.0,
        honorariosArriendo: settings.honorariosArriendo ?? 8.0,
        participacionAsesor: settings.participacionAsesor ?? 40.0,
        ivaPorcentaje: settings.ivaPorcentaje ?? 19.0,
        redes: {
          instagram: settings.redes?.instagram || '',
          facebook: settings.redes?.facebook || '',
          linkedin: settings.redes?.linkedin || '',
        },
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (payload) => settingsApi.update(payload),
    onSuccess: () => {
      toast.success('Configuración guardada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['configuracion-inmobiliaria'] });
    },
    onError: (err) => {
      toast.error(err.displayMessage || 'Error al guardar configuración');
    },
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name.startsWith('redes.')) {
      const red = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        redes: { ...prev.redes, [red]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <Spinner label="Cargando configuración institucional..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <section className="settings-page">
      <header className="page__header">
        <div>
          <h1>Ajustes Institucionales</h1>
          <p className="page__subtitle">
            Parámetros legales, matrícula inmobiliaria, comisiones base y canales oficiales
          </p>
        </div>
      </header>

      {/* Navegación por pestañas */}
      <div className="segmentado" style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={tabActiva === 'legal' ? 'is-activo' : ''}
          onClick={() => setTabActiva('legal')}
        >
          ⚖️ Identidad Legal & Ley 820
        </button>
        <button
          type="button"
          className={tabActiva === 'comercial' ? 'is-activo' : ''}
          onClick={() => setTabActiva('comercial')}
        >
          💰 Comisiones & Parámetros
        </button>
        <button
          type="button"
          className={tabActiva === 'contacto' ? 'is-activo' : ''}
          onClick={() => setTabActiva('contacto')}
        >
          📞 Contacto & Redes
        </button>
        <button
          type="button"
          className={tabActiva === 'plantillas' ? 'is-activo' : ''}
          onClick={() => setTabActiva('plantillas')}
        >
          ✉️ Plantillas de mensaje
        </button>
      </div>

      {tabActiva === 'plantillas' ? (
        <div className="panel" style={{ maxWidth: '820px' }}>
          <TemplatesPanel />
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="panel" style={{ maxWidth: '820px' }}>
        {tabActiva === 'legal' && (
          <div className="form-grid">
            <div className="field">
              <label htmlFor="razonSocial">Razón Social Oficial</label>
              <input
                id="razonSocial"
                name="razonSocial"
                type="text"
                required
                value={formData.razonSocial}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="nit">NIT / Identificación Tributaria</label>
              <input
                id="nit"
                name="nit"
                type="text"
                required
                value={formData.nit}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="matriculaArrendador">
                Matrícula de Arrendador (Ley 820)
                <small style={{ display: 'block', color: 'var(--text-faint)', fontWeight: 400 }}>
                  Expedida por la Subdirección de Control de Vivienda de la Alcaldía
                </small>
              </label>
              <input
                id="matriculaArrendador"
                name="matriculaArrendador"
                type="text"
                placeholder="Ej. MA-2024-0089"
                value={formData.matriculaArrendador}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="registroMercantil">Registro Mercantil</label>
              <input
                id="registroMercantil"
                name="registroMercantil"
                type="text"
                value={formData.registroMercantil}
                onChange={handleChange}
              />
            </div>

            <div className="field" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="direccion">Dirección Sede Principal</label>
              <input
                id="direccion"
                name="direccion"
                type="text"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {tabActiva === 'comercial' && (
          <div className="form-grid">
            <div className="field">
              <label htmlFor="comisionVentaUrbana">Comisión Venta Urbana (%)</label>
              <input
                id="comisionVentaUrbana"
                name="comisionVentaUrbana"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.comisionVentaUrbana}
                onChange={handleChange}
              />
              <span className="field__hint">Estándar en el mercado colombiano: 3.0%</span>
            </div>

            <div className="field">
              <label htmlFor="comisionVentaRural">Comisión Venta Rural / Campestre (%)</label>
              <input
                id="comisionVentaRural"
                name="comisionVentaRural"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.comisionVentaRural}
                onChange={handleChange}
              />
              <span className="field__hint">Estándar en predios campestres o lotes: 4.0% - 5.0%</span>
            </div>

            <div className="field">
              <label htmlFor="honorariosArriendo">Honorarios Administración de Arriendo (%)</label>
              <input
                id="honorariosArriendo"
                name="honorariosArriendo"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.honorariosArriendo}
                onChange={handleChange}
              />
              <span className="field__hint">Porcentaje descontado del canon mensual (suele ser 8% a 10%)</span>
            </div>

            <div className="field">
              <label htmlFor="participacionAsesor">Participación del asesor (%)</label>
              <input
                id="participacionAsesor"
                name="participacionAsesor"
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.participacionAsesor}
                onChange={handleChange}
              />
              <span className="field__hint">
                Con este porcentaje se le proyecta al asesor lo que tiene en reservas.
                El reparto real se sigue definiendo operación por operación al cerrar.
              </span>
            </div>

            <div className="field">
              <label htmlFor="ivaPorcentaje">Tarifa IVA General (%)</label>
              <input
                id="ivaPorcentaje"
                name="ivaPorcentaje"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.ivaPorcentaje}
                onChange={handleChange}
              />
              <span className="field__hint">Tarifa legal vigente en Colombia: 19%</span>
            </div>
          </div>
        )}

        {tabActiva === 'contacto' && (
          <div className="form-grid">
            <div className="field">
              <label htmlFor="telefono">Teléfono PBX / Fijo</label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">WhatsApp Comercial Oficial</label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="text"
                placeholder="+57 310..."
                value={formData.whatsapp}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="emailContacto">Email Atención al Cliente</label>
              <input
                id="emailContacto"
                name="emailContacto"
                type="email"
                value={formData.emailContacto}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="emailNotificaciones">Email Notificaciones Judiciales</label>
              <input
                id="emailNotificaciones"
                name="emailNotificaciones"
                type="email"
                value={formData.emailNotificaciones}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="instagram">Perfil Instagram</label>
              <input
                id="instagram"
                name="redes.instagram"
                type="url"
                placeholder="https://instagram.com/..."
                value={formData.redes.instagram}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="facebook">Página Facebook</label>
              <input
                id="facebook"
                name="redes.facebook"
                type="url"
                placeholder="https://facebook.com/..."
                value={formData.redes.facebook}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </form>
      )}
    </section>
  );
}
