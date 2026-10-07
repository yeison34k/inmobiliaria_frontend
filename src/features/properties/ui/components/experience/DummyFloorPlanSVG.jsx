/**
 * Componente de plano arquitectónico vectorial esquemático (Dummy).
 * Se renderiza cuando la propiedad no tiene un plano cargado o como respaldo visual.
 * Diseñado con estética de plano técnico / blueprint (muros con grosor, mobiliario,
 * cotas acotadas en metros, escala gráfica, rosa de los vientos y rótulo profesional).
 */
export function DummyFloorPlanSVG({ nombre = 'Planta Arquitectónica', areaM2 = 120, tipo = 'apartamento', codigo = '' }) {
  const n = (nombre || '').toLowerCase();
  const esSocial = n.includes('social') || n.includes('baja') || n.includes('galer') || n.includes('acceso') || n.includes('marítima');
  const esPrivado = n.includes('privad') || n.includes('alta') || n.includes('suite') || n.includes('dormitori') || n.includes('alcoba');
  const esEstudio = n.includes('estudio') || n.includes('loft') || n.includes('mono') || n.includes('única') || n.includes('unica');
  const esLote = tipo === 'lote';

  // Si es un lote, renderizamos un plano topográfico de linderos
  if (esLote) {
    return (
      <svg
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        className="dummy-floorplan-svg"
        style={{ width: '100%', height: '100%', display: 'block', background: '#f8fafc' }}
      >
        <defs>
          <pattern id="lote-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* Fondo cuadriculado topográfico */}
        <rect width="100%" height="100%" fill="url(#lote-grid)" />

        {/* Curvas de nivel topográficas suaves */}
        <path d="M 50,150 Q 250,120 450,180 T 750,140" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="6 4" />
        <path d="M 50,280 Q 280,240 500,310 T 750,260" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="6 4" />
        <path d="M 50,420 Q 300,380 520,440 T 750,400" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="6 4" />

        {/* Polígono del Lote */}
        <polygon
          points="140,90 680,110 640,490 160,470"
          fill="rgba(15, 118, 110, 0.06)"
          stroke="#0f766e"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Área proyectada de construcción (huella edificable) */}
        <rect
          x="280"
          y="200"
          width="260"
          height="180"
          rx="4"
          fill="rgba(15, 118, 110, 0.12)"
          stroke="#0f766e"
          strokeWidth="1.8"
          strokeDasharray="8 5"
        />
        <text x="410" y="285" textAnchor="middle" fill="#0f766e" fontSize="13" fontWeight="700" letterSpacing="0.08em">
          ÁREA EDIFICABLE ESTIMADA
        </text>
        <text x="410" y="305" textAnchor="middle" fill="#64748b" fontSize="11">
          (Índice de ocupación proyectado)
        </text>

        {/* Cotas de linderos */}
        {/* Frente */}
        <line x1="140" y1="70" x2="680" y2="90" stroke="#0f172a" strokeWidth="1.2" markerEnd="url(#arrow)" />
        <text x="410" y="65" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="600">
          FRENTE: ~45.00 m
        </text>

        {/* Fondo */}
        <line x1="705" y1="110" x2="665" y2="490" stroke="#0f172a" strokeWidth="1.2" />
        <text x="700" y="300" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="600" transform="rotate(84 700 300)">
          FONDO: ~72.00 m
        </text>

        {/* Rosa de los vientos / Norte */}
        <g transform="translate(100, 100)">
          <circle cx="0" cy="0" r="24" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
          <polygon points="0,-20 6,-4 0,0" fill="#0f766e" />
          <polygon points="0,-20 -6,-4 0,0" fill="#1e293b" />
          <text x="0" y="-24" textAnchor="middle" fill="#0f766e" fontSize="11" fontWeight="800">N</text>
        </g>

        {/* Rótulo arquitectónico */}
        <g transform="translate(480, 515)">
          <rect width="280" height="65" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
          <text x="14" y="22" fill="#0f172a" fontSize="11" fontWeight="700" letterSpacing="0.04em">
            PLANO TOPOGRÁFICO DE LINDEROS
          </text>
          <text x="14" y="38" fill="#64748b" fontSize="10">
            ÁREA TOTAL: {areaM2 ? `${areaM2} m²` : 'Terreno'}
          </text>
          <text x="14" y="52" fill="#94a3b8" fontSize="9" letterSpacing="0.08em">
            LEVANTAMIENTO ESQUEMÁTICO DUMMY · ESCALA 1:250
          </text>
        </g>
      </svg>
    );
  }

  // Plano arquitectónico para casas o apartamentos
  return (
    <svg
      viewBox="0 0 880 640"
      xmlns="http://www.w3.org/2000/svg"
      className="dummy-floorplan-svg"
      style={{ width: '100%', height: '100%', display: 'block', background: '#f8fafc' }}
    >
      <defs>
        <pattern id="fp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="0.6" />
        </pattern>
        <marker id="fp-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
        </marker>
      </defs>

      {/* Trama de cuadrícula arquitectónica */}
      <rect width="100%" height="100%" fill="url(#fp-grid)" />

      {/* ================= MUROS EXTERIORES (Espesor 12px) ================= */}
      <rect x="70" y="60" width="740" height="490" rx="2" fill="#ffffff" stroke="#1e293b" strokeWidth="10" />

      {/* Ventanales perimetrales (vidrios dobles en azul arquitectónico) */}
      <rect x="180" y="55" width="200" height="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
      <rect x="460" y="55" width="180" height="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
      <rect x="65" y="160" width="6" height="140" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
      <rect x="805" y="140" width="6" height="180" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />

      {esPrivado ? (
        /* ================= LAYOUT ZONA PRIVADA (HABITACIONES & SUITES) ================= */
        <g id="layout-privado">
          {/* Muro divisor horizontal */}
          <line x1="70" y1="310" x2="810" y2="310" stroke="#1e293b" strokeWidth="8" />
          {/* Muro divisor vertical central */}
          <line x1="450" y1="60" x2="450" y2="310" stroke="#1e293b" strokeWidth="8" />
          <line x1="400" y1="310" x2="400" y2="550" stroke="#1e293b" strokeWidth="8" />

          {/* Master Suite (Cuadrante Superior Izquierdo) */}
          <g transform="translate(100, 85)">
            {/* Cama King */}
            <rect x="90" y="30" width="140" height="150" rx="4" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
            <rect x="100" y="36" width="55" height="30" rx="3" fill="#ffffff" stroke="#94a3b8" />
            <rect x="165" y="36" width="55" height="30" rx="3" fill="#ffffff" stroke="#94a3b8" />
            {/* Mesas de noche */}
            <rect x="52" y="30" width="30" height="30" rx="2" fill="#f8fafc" stroke="#94a3b8" />
            <rect x="238" y="30" width="30" height="30" rx="2" fill="#f8fafc" stroke="#94a3b8" />
            <text x="160" y="140" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="700">
              MASTER SUITE
            </text>
            <text x="160" y="158" textAnchor="middle" fill="#64748b" fontSize="11">
              28.5 m²
            </text>
          </g>

          {/* Vestier & Baño Principal (Cuadrante Superior Derecho) */}
          <g transform="translate(480, 85)">
            <rect x="20" y="20" width="120" height="180" rx="2" fill="none" stroke="#94a3b8" strokeDasharray="5 3" />
            <text x="80" y="105" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">
              WALK-IN CLOSET
            </text>
            {/* Tina exenta en baño */}
            <rect x="175" y="40" width="120" height="60" rx="25" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.5" />
            <circle cx="195" cy="70" r="5" fill="#0284c7" />
            <text x="235" y="130" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700">
              BAÑO PRINCIPAL
            </text>
          </g>

          {/* Habitación 2 (Inferior Izquierda) */}
          <g transform="translate(100, 340)">
            <rect x="70" y="30" width="110" height="130" rx="4" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
            <rect x="80" y="36" width="90" height="25" rx="3" fill="#ffffff" stroke="#94a3b8" />
            <text x="125" y="125" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700">
              HABITACIÓN 2
            </text>
            <text x="125" y="142" textAnchor="middle" fill="#64748b" fontSize="11">
              16.0 m²
            </text>
          </g>

          {/* Estar Familiar / Terraza (Inferior Derecha) */}
          <g transform="translate(430, 340)">
            {/* Sofá */}
            <rect x="70" y="30" width="180" height="50" rx="6" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
            <rect x="110" y="100" width="100" height="45" rx="4" fill="#ffffff" stroke="#94a3b8" />
            <text x="160" y="126" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700">
              ESTAR FAMILIAR & BALCÓN
            </text>
            <text x="160" y="144" textAnchor="middle" fill="#64748b" fontSize="11">
              22.0 m²
            </text>
          </g>
        </g>
      ) : esEstudio ? (
        /* ================= LAYOUT ESTUDIO / LOFT ================= */
        <g id="layout-estudio">
          {/* Muro Baño */}
          <rect x="70" y="370" width="220" height="180" fill="none" stroke="#1e293b" strokeWidth="8" />
          <text x="180" y="465" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700">
            BAÑO COMPLETO
          </text>

          {/* Cama alcoba */}
          <g transform="translate(520, 100)">
            <rect x="0" y="0" width="130" height="150" rx="4" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
            <rect x="10" y="10" width="110" height="30" rx="3" fill="#ffffff" stroke="#94a3b8" />
            <text x="65" y="100" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700">
              ZONA ALCOBA
            </text>
          </g>

          {/* Cocina & Sala Abierta */}
          <g transform="translate(140, 110)">
            <rect x="0" y="0" width="240" height="40" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
            <circle cx="40" cy="20" r="10" fill="#cbd5e1" />
            <circle cx="70" cy="20" r="10" fill="#cbd5e1" />
            <text x="120" y="25" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="700">
              COCINA INTEGRADA
            </text>
            {/* Sofá */}
            <rect x="40" y="110" width="160" height="45" rx="6" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
            <text x="120" y="190" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="700">
              SALÓN INTEGRADO
            </text>
          </g>
        </g>
      ) : (
        /* ================= LAYOUT ZONA SOCIAL (DEFAULT RESIDENCIAL) ================= */
        <g id="layout-social">
          {/* Muro divisor de cocina y servicios */}
          <line x1="510" y1="60" x2="510" y2="400" stroke="#1e293b" strokeWidth="8" />
          <line x1="510" y1="400" x2="810" y2="400" stroke="#1e293b" strokeWidth="8" />

          {/* Sala Principal */}
          <g transform="translate(130, 100)">
            {/* Sofá en L */}
            <path
              d="M 20,40 L 190,40 A 10,10 0 0,1 200,50 L 200,160 A 10,10 0 0,1 190,170 L 150,170 A 10,10 0 0,1 140,160 L 140,90 A 10,10 0 0,0 130,80 L 20,80 Z"
              fill="#f1f5f9"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {/* Mesa de centro */}
            <rect x="50" y="95" width="75" height="50" rx="4" fill="#ffffff" stroke="#94a3b8" />
            <text x="110" y="215" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="700">
              GRAN SALÓN SOCIAL
            </text>
            <text x="110" y="235" textAnchor="middle" fill="#64748b" fontSize="11">
              34.0 m²
            </text>
          </g>

          {/* Comedor */}
          <g transform="translate(140, 360)">
            {/* Mesa rectangular y sillas */}
            <rect x="40" y="40" width="160" height="75" rx="6" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
            {/* Sillas */}
            <rect x="55" y="20" width="30" height="15" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
            <rect x="105" y="20" width="30" height="15" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
            <rect x="155" y="20" width="30" height="15" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
            <rect x="55" y="120" width="30" height="15" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
            <rect x="105" y="120" width="30" height="15" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
            <rect x="155" y="120" width="30" height="15" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
            <text x="120" y="85" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="700">
              COMEDOR PRINCIPAL
            </text>
          </g>

          {/* Cocina Gourmet con Isla */}
          <g transform="translate(540, 100)">
            {/* Mesón perimetral */}
            <rect x="15" y="15" width="220" height="40" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
            {/* Fregadero e inducción */}
            <rect x="35" y="22" width="40" height="25" rx="3" fill="#e2e8f0" stroke="#94a3b8" />
            <circle cx="140" cy="35" r="10" fill="#cbd5e1" />
            <circle cx="170" cy="35" r="10" fill="#cbd5e1" />
            {/* Isla central */}
            <rect x="40" y="100" width="170" height="60" rx="4" fill="#ffffff" stroke="#0f766e" strokeWidth="2" />
            <text x="125" y="135" textAnchor="middle" fill="#0f766e" fontSize="12" fontWeight="700">
              ISLA GOURMET
            </text>
            <text x="125" y="210" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="700">
              COCINA ABIERTA
            </text>
            <text x="125" y="228" textAnchor="middle" fill="#64748b" fontSize="11">
              18.5 m²
            </text>
          </g>

          {/* Terraza / Balcón Panorámico */}
          <g transform="translate(540, 430)">
            <rect x="15" y="10" width="220" height="85" rx="4" fill="rgba(15, 118, 110, 0.05)" stroke="#0f766e" strokeDasharray="4 3" />
            <text x="125" y="45" textAnchor="middle" fill="#0f766e" fontSize="12" fontWeight="700">
              TERRAZA PANORÁMICA
            </text>
            <text x="125" y="65" textAnchor="middle" fill="#64748b" fontSize="10">
              Acabado deck teca
            </text>
          </g>
        </g>
      )}

      {/* Arcos de Puertas (Representación técnica de vanos) */}
      <path d="M 510,260 A 40,40 0 0,0 470,300" fill="none" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 3" />
      <line x1="510" y1="260" x2="510" y2="300" stroke="#1e293b" strokeWidth="2" />

      {/* ================= COTAS Y DIMENSIONES EN METROS ================= */}
      {/* Cota horizontal superior */}
      <line x1="70" y1="36" x2="810" y2="36" stroke="#64748b" strokeWidth="1" markerStart="url(#fp-arrow)" markerEnd="url(#fp-arrow)" />
      <text x="440" y="30" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700" letterSpacing="0.04em">
        13.50 m
      </text>

      {/* Cota vertical lateral izquierda */}
      <line x1="42" y1="60" x2="42" y2="550" stroke="#64748b" strokeWidth="1" markerStart="url(#fp-arrow)" markerEnd="url(#fp-arrow)" />
      <text x="32" y="310" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700" letterSpacing="0.04em" transform="rotate(-90 32 310)">
        9.20 m
      </text>

      {/* ================= ELEMENTOS TÉCNICOS ARQUITECTÓNICOS ================= */}
      {/* Rosa de los vientos / Norte */}
      <g transform="translate(740, 110)">
        <circle cx="0" cy="0" r="22" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
        <polygon points="0,-18 5,-4 0,0" fill="#0f766e" />
        <polygon points="0,-18 -5,-4 0,0" fill="#1e293b" />
        <text x="0" y="-22" textAnchor="middle" fill="#0f766e" fontSize="10" fontWeight="800">N</text>
      </g>

      {/* Escala Gráfica */}
      <g transform="translate(100, 580)">
        <line x1="0" y1="0" x2="160" y2="0" stroke="#1e293b" strokeWidth="2" />
        <line x1="0" y1="-5" x2="0" y2="5" stroke="#1e293b" strokeWidth="2" />
        <line x1="40" y1="-5" x2="40" y2="5" stroke="#1e293b" strokeWidth="2" />
        <line x1="80" y1="-5" x2="80" y2="5" stroke="#1e293b" strokeWidth="2" />
        <line x1="160" y1="-5" x2="160" y2="5" stroke="#1e293b" strokeWidth="2" />
        <text x="0" y="16" fontSize="9" fill="#64748b" textAnchor="middle">0m</text>
        <text x="40" y="16" fontSize="9" fill="#64748b" textAnchor="middle">1m</text>
        <text x="80" y="16" fontSize="9" fill="#64748b" textAnchor="middle">2m</text>
        <text x="160" y="16" fontSize="9" fill="#64748b" textAnchor="middle">4m</text>
        <text x="80" y="30" fontSize="9" fill="#94a3b8" textAnchor="middle" letterSpacing="0.06em">ESCALA 1:100</text>
      </g>

      {/* Rótulo de identificación arquitectónica profesional */}
      <g transform="translate(490, 560)">
        <rect width="320" height="60" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
        <text x="14" y="20" fill="#0f172a" fontSize="11" fontWeight="700" letterSpacing="0.03em">
          {String(nombre).toUpperCase()}
        </text>
        <text x="14" y="36" fill="#0f766e" fontSize="10" fontWeight="600">
          ÁREA APROVECHABLE: {areaM2 ? `${areaM2} m²` : 'Referencia técnica'} {codigo ? `· REF: ${codigo}` : ''}
        </text>
        <text x="14" y="50" fill="#94a3b8" fontSize="8.5" letterSpacing="0.06em">
          ESQUEMA ARQUITECTÓNICO DE DISTRIBUCIÓN DUMMY
        </text>
      </g>
    </svg>
  );
}
