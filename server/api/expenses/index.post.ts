import { saveExpense } from '~~/server/repositories/expenses';
import { ticketExtractionSchema } from '~~/server/utils/expense-schema';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validatedExpense = ticketExtractionSchema.parse(body);

  return saveExpense(validatedExpense);
});
