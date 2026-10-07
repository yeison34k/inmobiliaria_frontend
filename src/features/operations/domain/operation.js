export const OperationStatus = Object.freeze({
  RESERVADA: 'reservada',
  CERRADA: 'cerrada',
  CAIDA: 'caida',
});

export const OPERATION_STATUS_META = Object.freeze({
  reservada: { label: 'Reservada', tone: 'warning' },
  cerrada: { label: 'Cerrada', tone: 'purple' },
  caida: { label: 'Caída', tone: 'danger' },
});

export const OPERATION_KIND_LABELS = Object.freeze({ venta: 'Venta', arriendo: 'Arriendo' });

export const Beneficiary = Object.freeze({
  AGENCIA: 'agencia',
  CAPTADOR: 'captador',
  VENDEDOR: 'vendedor',
  REFERIDO: 'referido',
  EXTERNO: 'externo',
});

export const BENEFICIARY_LABELS = Object.freeze({
  agencia: 'Agencia inmobiliaria',
  captador: 'Asesor captador',
  vendedor: 'Asesor cerrador / vendedor',
  referido: 'Referido comercial',
  externo: 'Agente / Broker externo',
});

export const PayoutStatus = Object.freeze({
  PENDIENTE: 'pendiente',
  FACTURADO: 'facturado',
  PAGADO: 'pagado',
});

export const PAYOUT_STATUS_META = Object.freeze({
  pendiente: { label: 'Pendiente', tone: 'neutral' },
  facturado: { label: 'Facturado', tone: 'warning' },
  pagado: { label: 'Pagado', tone: 'success' },
});

export const esActiva = (operacion) => operacion?.estado === OperationStatus.RESERVADA;

/** Comision estimada mientras el usuario escribe el precio de cierre. */
export const comisionEstimada = (precioCierre, porcentaje) => {
  const precio = Number(precioCierre);
  const pct = Number(porcentaje);
  if (!Number.isFinite(precio) || !Number.isFinite(pct)) return 0;
  return Math.round(precio * (pct / 100));
};
