import { z } from 'zod';
import { normalizePaymentMethod, paymentMethodOptions } from '~~/shared/constants/payment-methods';

export const ticketLineItemSchema = z.object({
  name: z.string(),
  quantity: z.number().nullable(),
  unitPrice: z.number().nullable(),
  totalPrice: z.number().nullable()
});

export const ticketExtractionSchema = z.object({
  merchant: z.string().nullable(),
  purchaseDate: z.string().nullable(),
  currency: z.string().nullable(),
  total: z.number().nullable(),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  tip: z.number().nullable(),
  invoiceNumber: z.string().nullable(),
  paymentMethod: z.preprocess(
    (value) => normalizePaymentMethod(value),
    z.enum(paymentMethodOptions).nullable()
  ),
  items: z.array(ticketLineItemSchema),
  notes: z.array(z.string())
});
