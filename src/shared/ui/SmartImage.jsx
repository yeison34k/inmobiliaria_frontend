import { useEffect, useRef, useState } from 'react';

/**
 * Imagen que entra con un fundido en vez de aparecer de golpe.
 *
 * Mientras carga muestra el fondo del contenedor; al terminar sube de
 * opacidad y suelta un desenfoque minimo. Si la imagen ya estaba en cache,
 * se marca cargada en el primer render para no parpadear.
 */
export function SmartImage({
  src,
  alt = '',
  className = '',
  style,
  loading = 'lazy',
  fetchPriority = 'auto',
  decoding = 'async',
  ...rest
}) {
  const ref = useRef(null);
  const [cargada, setCargada] = useState(false);

  useEffect(() => {
    setCargada(false);
    if (ref.current?.complete && ref.current.naturalWidth > 0) setCargada(true);
  }, [src]);

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
      onLoad={() => setCargada(true)}
      className={`img-suave ${cargada ? 'is-cargada' : ''} ${className}`.trim()}
      style={style}
      {...rest}
    />
  );
}
