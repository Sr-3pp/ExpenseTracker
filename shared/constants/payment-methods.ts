export const paymentMethodOptions = [
  'cash',
  'credit card',
  'debit card',
  'bank transfer',
  'digital wallet',
  'other'
] as const;

export type PaymentMethodOption = (typeof paymentMethodOptions)[number];

const paymentMethodAliases: Record<string, PaymentMethodOption> = {
  cash: 'cash',
  efectivo: 'cash',
  'credit card': 'credit card',
  credit: 'credit card',
  credito: 'credit card',
  'tarjeta de credito': 'credit card',
  'credit/debit card': 'credit card',
  card: 'credit card',
  'debit card': 'debit card',
  debit: 'debit card',
  debito: 'debit card',
  'tarjeta de debito': 'debit card',
  transfer: 'bank transfer',
  'bank transfer': 'bank transfer',
  'wire transfer': 'bank transfer',
  spei: 'bank transfer',
  transferencia: 'bank transfer',
  'digital wallet': 'digital wallet',
  wallet: 'digital wallet',
  'apple pay': 'digital wallet',
  'google pay': 'digital wallet',
  paypal: 'digital wallet',
  'mercado pago': 'digital wallet',
  other: 'other',
  unknown: 'other'
};

export const normalizePaymentMethod = (value: unknown): PaymentMethodOption | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

  if (!normalized) {
    return null;
  }

  return paymentMethodAliases[normalized] ?? 'other';
};
