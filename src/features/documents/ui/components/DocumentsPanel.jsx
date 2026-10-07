import { useRef, useState } from 'react';
import { Badge } from '@shared/ui/Badge.jsx';
import { Field } from '@shared/ui/Field.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { formatDate } from '@shared/lib/format.js';
import { useToast } from '@shared/hooks/useToast.jsx';
import { useDocumentMutations, useDocuments } from '../../application/useDocumentsQueries.js';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_KEYS, VIGENCIA_META, faltaMandato } from '../../domain/document.js';

const formatoVacio = { tipo: 'mandato', venceAt: '', notas: '' };

const peso = (bytes) => (bytes ? `${Math.round(bytes / 1024)} KB` : '');

/**
 * Documentos de respaldo de una propiedad, operacion o contacto.
 * Avisa si falta el mandato: sin el no hay autorizacion para comercializar.
 */
export function DocumentsPanel({ propiedadId, operacionId, contactoId, titulo = 'Documentos' }) {
  const toast = useToast();
  const archivoRef = useRef(null);
  const filtros = { propiedadId, operacionId, contactoId };

  const { data: documentos = [], isLoading } = useDocuments(filtros);
  const { attach, remove } = useDocumentMutations({ onError: (e) => toast.error(e.displayMessage) });
  const [form, setForm] = useState(formatoVacio);

  const subir = (archivo) => {
    if (!archivo) return;
    attach.mutate({
      archivo,
      ...filtros,
      tipo: form.tipo,
      venceAt: form.venceAt || undefined,
      notas: form.notas || undefined,
    }, {
      onSuccess: () => {
        toast.success('Documento adjuntado');
        setForm(formatoVacio);
        if (archivoRef.current) archivoRef.current.value = '';
      },
    });
  };

  const sinMandato = propiedadId && !isLoading && faltaMandato(documentos);

  return (
    <article className="panel">
      <h2>{titulo} <span className="panel__count">{documentos.length}</span></h2>

      {sinMandato ? (
        <p className="panel__warning">
          Falta el mandato vigente. Sin ese documento no hay autorizacion del
          propietario para comercializar el inmueble.
        </p>
      ) : null}

      <div className="form-grid">
        <Field label="Tipo" hint={DOCUMENT_TYPES[form.tipo]?.ayuda}>
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {DOCUMENT_TYPE_KEYS.map((clave) => (
              <option key={clave} value={clave}>{DOCUMENT_TYPES[clave].label}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Vence el"
          hint={DOCUMENT_TYPES[form.tipo]?.caduca ? 'Recomendado para este tipo' : 'Opcional'}
        >
          <input
            type="date"
            value={form.venceAt}
            onChange={(e) => setForm({ ...form, venceAt: e.target.value })}
          />
        </Field>
      </div>

      <div className="campo-archivo">
        <input
          ref={archivoRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          onChange={(e) => subir(e.target.files?.[0])}
        />
        {attach.isPending ? <span className="field__hint">Subiendo...</span> : null}
      </div>

      {isLoading ? <Spinner /> : null}

      {documentos.length === 0 && !isLoading ? (
        <p className="panel__hint">Aun no hay documentos adjuntos.</p>
      ) : (
        <ul className="documentos">
          {documentos.map((doc) => {
            const vigencia = VIGENCIA_META[doc.vigencia] ?? VIGENCIA_META.sin_vencimiento;
            return (
              <li key={doc.id}>
                <div className="documentos__info">
                  <a href={doc.url} target="_blank" rel="noreferrer">{doc.nombre}</a>
                  <small>
                    {doc.tipoLabel}
                    {doc.tamanoBytes ? ` · ${peso(doc.tamanoBytes)}` : ''}
                    {doc.venceAt ? ` · vence ${formatDate(doc.venceAt)}` : ''}
                    {doc.usuario ? ` · ${doc.usuario}` : ''}
                  </small>
                </div>
                <div className="documentos__acciones">
                  <Badge tone={vigencia.tone}>
                    {doc.vigencia === 'por_vencer' ? `${doc.diasParaVencer} dias` : vigencia.label}
                  </Badge>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => {
                      if (confirm(`Eliminar ${doc.nombre}?`)) remove.mutate(doc.id);
                    }}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
