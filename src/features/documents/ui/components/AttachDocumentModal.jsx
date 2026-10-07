import { useRef, useState } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { PropertyPicker } from '@features/properties';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useDocumentMutations } from '../../application/useDocumentsQueries.js';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_KEYS } from '../../domain/document.js';

const formatoInicial = {
  propiedadId: '',
  tipo: 'mandato',
  nombre: '',
  venceAt: '',
  notas: '',
};

export function AttachDocumentModal({ onClose, propiedadPreseleccionada = null }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    ...formatoInicial,
    propiedadId: propiedadPreseleccionada?.id || '',
  });
  const [archivo, setArchivo] = useState(null);
  const [errorValidacion, setErrorValidacion] = useState('');

  const { attach } = useDocumentMutations({
    onError: (err) => {
      toast.error(err.displayMessage || 'Error al adjuntar el documento');
    },
    onSuccess: () => {
      toast.success('Documento legal adjuntado exitosamente');
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorValidacion('');

    if (!form.propiedadId) {
      setErrorValidacion('Debe seleccionar el inmueble al que pertenece el documento.');
      return;
    }

    if (!archivo) {
      setErrorValidacion('Debe seleccionar o adjuntar un archivo (PDF o imagen).');
      return;
    }

    attach.mutate({
      archivo,
      propiedadId: form.propiedadId,
      tipo: form.tipo,
      nombre: form.nombre.trim() || undefined,
      venceAt: form.venceAt || undefined,
      notas: form.notas.trim() || undefined,
    });
  };

  const tipoMeta = DOCUMENT_TYPES[form.tipo];

  return (
    <Modal
      title="Adjuntar Documento Legal"
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={attach.isPending}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={attach.isPending}
          >
            {attach.isPending ? 'Subiendo y registrando...' : 'Adjuntar Documento'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="attach-doc-form">
        {errorValidacion ? (
          <p className="panel__warning" style={{ marginBottom: '1rem' }}>
            {errorValidacion}
          </p>
        ) : null}

        <div className="picker-container" style={{ marginBottom: '1.25rem' }}>
          <PropertyPicker
            label="Inmueble de respaldo *"
            required
            value={form.propiedadId}
            onChange={(id) => setForm((prev) => ({ ...prev, propiedadId: id }))}
          />
        </div>

        <div className="form-grid">
          <Field label="Tipo de documento *" hint={tipoMeta?.ayuda}>
            <select
              value={form.tipo}
              onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
            >
              {DOCUMENT_TYPE_KEYS.map((clave) => (
                <option key={clave} value={clave}>
                  {DOCUMENT_TYPES[clave].label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Fecha de vencimiento"
            hint={tipoMeta?.caduca ? 'Recomendado (activa el semáforo de alertas)' : 'Opcional'}
          >
            <input
              type="date"
              value={form.venceAt}
              onChange={(e) => setForm((prev) => ({ ...prev, venceAt: e.target.value }))}
            />
          </Field>
        </div>

        <Field
          label="Título o referencia del documento"
          hint="Opcional. Si lo dejas vacío, tomará el nombre del archivo original"
        >
          <input
            type="text"
            placeholder="Ej: Certificado de Tradición y Libertad - Folio 040-12345"
            value={form.nombre}
            maxLength={160}
            onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
          />
        </Field>

        <Field label="Archivo de respaldo *" hint="Formatos permitidos: PDF, JPEG, PNG, WEBP (hasta 12MB)">
          <div className="file-dropzone" style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', textAlign: 'center', background: 'var(--surface-muted)' }}>
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload-input"
              style={{ display: 'none' }}
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
            {archivo ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>📄 {archivo.name}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
                  ({Math.round(archivo.size / 1024)} KB)
                </span>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    setArchivo(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--text-soft)', fontSize: 'var(--text-sm)' }}>
                  Selecciona un archivo PDF o imagen legal
                </p>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Examinar archivos...
                </button>
              </div>
            )}
          </div>
        </Field>

        <Field label="Notas internas o radicado" hint="Anotaciones para el equipo legal o administrativo">
          <textarea
            rows={2}
            placeholder="Ej: Vigencia expedida por SNR con menos de 30 días, folio al día sin gravámenes."
            value={form.notas}
            maxLength={400}
            onChange={(e) => setForm((prev) => ({ ...prev, notas: e.target.value }))}
          />
        </Field>
      </form>
    </Modal>
  );
}
