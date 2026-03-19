import { z } from 'zod';

export const ticketExtractionSchema = z.object({
  merchant: z.string().nullable(),
  purchaseDate: z.string().nullable(),
  currency: z.string().nullable(),
  total: z.number().nullable(),
  subtotal: z.number().nullable(),
  tax: z.number().nullable(),
  tip: z.number().nullable(),
  invoiceNumber: z.string().nullable(),
  paymentMethod: z.string().nullable(),
  items: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().nullable(),
      unitPrice: z.number().nullable(),
      totalPrice: z.number().nullable()
    })
  ),
  notes: z.array(z.string())
});
