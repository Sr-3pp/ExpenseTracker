import type { z } from 'zod';
import type { ticketExtractionSchema, ticketLineItemSchema } from '~~/shared/schemas/ticket';

export type TicketLineItem = z.infer<typeof ticketLineItemSchema>;

export type TicketExtraction = z.infer<typeof ticketExtractionSchema>;
