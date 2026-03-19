import { updateExpense } from '~~/server/repositories/expenses';
import { ticketExtractionSchema } from '~~/server/utils/expense-schema';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing expense id.'
    });
  }

  const body = await readBody(event);
  const validatedExpense = ticketExtractionSchema.parse(body);
  const updatedExpense = await updateExpense(id, validatedExpense);

  if (!updatedExpense) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Expense not found.'
    });
  }

  return updatedExpense;
});
