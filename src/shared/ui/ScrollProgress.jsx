import { useEffect, useState } from 'react';

/** Barra de avance de lectura: da sensacion de recorrido continuo. */
export function ScrollProgress() {
  const [avance, setAvance] = useState(0);

  useEffect(() => {
    let frame = null;
    const calcular = () => {
      frame = null;
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      setAvance(alto > 0 ? Math.min(1, window.scrollY / alto) : 0);
    };
    const onScroll = () => { if (frame === null) frame = requestAnimationFrame(calcular); };

    calcular();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="avance" aria-hidden="true">
      <span style={{ transform: `scaleX(${avance})` }} />
    </div>
  );
}
