import type { TicketExtraction } from '~~/types/ticket';

export type ExpenseRecord = TicketExtraction & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
