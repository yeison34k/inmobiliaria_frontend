export const InquiryStatus = Object.freeze({
  NUEVA: 'nueva',
  ATENDIDA: 'atendida',
  DESCARTADA: 'descartada',
});

export const INQUIRY_STATUS_META = Object.freeze({
  nueva: { label: 'Nueva', tone: 'warning' },
  atendida: { label: 'Atendida', tone: 'success' },
  descartada: { label: 'Descartada', tone: 'neutral' },
});
