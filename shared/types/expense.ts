import type { TicketExtraction } from '~~/shared/types/ticket';

export type ExpenseRecord = TicketExtraction & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
