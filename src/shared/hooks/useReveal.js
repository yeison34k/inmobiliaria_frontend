import { useEffect, useRef, useState } from 'react';

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Aparicion al entrar en pantalla.
 * Si el visitante pidio menos movimiento en su sistema, el contenido
 * aparece de inmediato: la animacion nunca bloquea la lectura.
 */
export function useReveal({ threshold = 0.18, once = true } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => prefiereMenosMovimiento());

  useEffect(() => {
    if (prefiereMenosMovimiento()) return undefined;
    const nodo = ref.current;
    if (!nodo || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(nodo);
    return () => observer.disconnect();
  }, [threshold, once]);

  return [ref, visible];
}

/**
 * Desplazamiento sutil ligado al scroll (parallax).
 * Devuelve un desplazamiento en px para aplicar con translate3d.
 *
 * `limite` acota el recorrido a una fraccion de la altura del elemento: sin
 * ese tope la imagen se sale del marco recortado y el hueco queda vacio.
 * El `scale` del CSS debe dejar al menos ese margen (2 * limite).
 */
export function useParallax(intensidad = 0.14, limite = 0.18) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (prefiereMenosMovimiento()) return undefined;
    const nodo = ref.current;
    if (!nodo) return undefined;

    let isInView = false;
    let frame = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView) calcular();
      },
      { rootMargin: '120px' }
    );
    observer.observe(nodo);

    const calcular = () => {
      frame = null;
      if (!isInView) return;
      const rect = nodo.getBoundingClientRect();
      if (!rect.height) return;
      const centro = rect.top + rect.height / 2 - window.innerHeight / 2;
      const tope = rect.height * limite;
      const nuevoOffset = Math.round(Math.max(-tope, Math.min(tope, -centro * intensidad)));

      const img = nodo.querySelector('img');
      if (img) {
        img.style.transform = `translate3d(0, ${nuevoOffset}px, 0) scale(1.22)`;
      } else {
        setOffset((prev) => (Math.abs(prev - nuevoOffset) >= 1 ? nuevoOffset : prev));
      }
    };

    const onScroll = () => {
      if (isInView && frame === null) {
        frame = requestAnimationFrame(calcular);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [intensidad, limite]);

  return [ref, offset];
}
