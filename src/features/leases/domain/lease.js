/**
 * Dominio de Contratos de Arrendamiento y Liquidación a Propietarios.
 * Basado en las prácticas del mercado inmobiliario y la Ley 820 de Arrendamiento de Vivienda Urbana en Colombia.
 */

export const LEASE_STATUSES = {
  ACTIVO: 'activo',
  POR_VENCER: 'por_vencer',
  EN_MORA: 'en_mora',
  TERMINADO: 'terminado',
};

export const LEASE_STATUS_META = {
  [LEASE_STATUSES.ACTIVO]: {
    label: 'Vigente',
    badgeClass: 'badge--success',
    color: '#059669',
  },
  [LEASE_STATUSES.POR_VENCER]: {
    label: 'Por vencer (< 60 días)',
    badgeClass: 'badge--warning',
    color: '#d97706',
  },
  [LEASE_STATUSES.EN_MORA]: {
    label: 'En mora',
    badgeClass: 'badge--danger',
    color: '#dc2626',
  },
  [LEASE_STATUSES.TERMINADO]: {
    label: 'Finalizado',
    badgeClass: 'badge--muted',
    color: '#6b7280',
  },
};

export const DEFAULT_COMMISSION_PERCENT = 8.0; // 8% + IVA estándar del sector
export const IVA_PERCENT = 19.0; // IVA sobre comisión

/**
 * Calcula la liquidación contable mensual de un canon al propietario.
 *
 * Fórmula:
 * (+) Canon bruto recibido
 * (-) Honorario agencia = Canon * (comisionPct / 100)
 * (-) IVA honorario = Honorario * (ivaPct / 100)
 * (-) Deducciones autorizadas (administración, reparaciones, GMF 4x1000)
 * (=) Saldo neto a girar
 */
export function calculateSettlement({
  canon = 0,
  comisionPct = DEFAULT_COMMISSION_PERCENT,
  aplicaIva = true,
  ivaPct = IVA_PERCENT,
  deducciones = [],
}) {
  const canonNum = Number(canon) || 0;
  const comisionVal = Math.round(canonNum * (Number(comisionPct) / 100));
  const ivaVal = aplicaIva ? Math.round(comisionVal * (Number(ivaPct) / 100)) : 0;
  const honorarioTotalAgencia = comisionVal + ivaVal;

  const totalDeducciones = deducciones.reduce((acc, d) => acc + (Number(d.monto) || 0), 0);
  const totalDescuentos = honorarioTotalAgencia + totalDeducciones;
  const netoGirar = Math.max(0, canonNum - totalDescuentos);

  return {
    canon: canonNum,
    comisionPct: Number(comisionPct),
    comisionVal,
    aplicaIva,
    ivaPct: Number(ivaPct),
    ivaVal,
    honorarioTotalAgencia,
    totalDeducciones,
    totalDescuentos,
    netoGirar,
  };
}
