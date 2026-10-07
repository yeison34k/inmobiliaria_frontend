import { useRef, useState } from 'react';
import { useToast } from '@shared/hooks/useToast.jsx';
import { usePropertyImageMutations } from '../../application/usePropertiesQueries.js';

/**
 * Galeria editable. Las imagenes se suben al proveedor externo y la API
 * guarda solo la URL: ninguna imagen viaja hacia la base de datos.
 */
export function PropertyImageManager({ propiedad }) {
  const toast = useToast();
  const fileInput = useRef(null);
  const [url, setUrl] = useState('');
  const mutations = usePropertyImageMutations(propiedad.id, {
    onError: (error) => toast.error(error.displayMessage),
  });

  const onFiles = async (files) => {
    for (const file of files) {
      await mutations.upload.mutateAsync(file).catch(() => {});
    }
    if (fileInput.current) fileInput.current.value = '';
    toast.success('Imagenes actualizadas');
  };

  return (
    <section className="images">
      <header className="images__header">
        <h3>Imagenes ({propiedad.imagenes.length}/20)</h3>
        <div className="images__actions">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFiles([...e.target.files])}
          />
        </div>
      </header>

      <div className="images__url">
        <input
          type="url"
          placeholder="...o pegue una URL de Cloudinary / CDN"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          className="btn btn--ghost"
          disabled={!url || mutations.addByUrl.isPending}
          onClick={() => mutations.addByUrl.mutate({ url }, { onSuccess: () => setUrl('') })}
        >
          Agregar por URL
        </button>
      </div>

      {propiedad.imagenes.length === 0 ? (
        <p className="images__empty">
          Aun no hay imagenes. Una propiedad sin imagenes no se puede publicar.
        </p>
      ) : (
        <ul className="images__grid">
          {propiedad.imagenes.map((imagen) => (
            <li key={imagen.id} className={imagen.esPrincipal ? 'thumb thumb--main' : 'thumb'}>
              <img src={imagen.url} alt={imagen.alt ?? propiedad.titulo} />
              <div className="thumb__actions">
                {!imagen.esPrincipal ? (
                  <button type="button" onClick={() => mutations.setMain.mutate(imagen.id)}>
                    Principal
                  </button>
                ) : <span className="thumb__tag">Principal</span>}
                <button type="button" onClick={() => mutations.remove.mutate(imagen.id)}>Quitar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
