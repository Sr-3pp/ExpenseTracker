import { deleteExpense } from '~~/server/repositories/expenses';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing expense id.'
    });
  }

  const deleted = await deleteExpense(id);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Expense not found.'
    });
  }

  return {
    success: true
  };
});
