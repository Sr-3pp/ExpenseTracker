import { listExpenses } from '~~/server/repositories/expenses';

export default defineEventHandler(async () => {
  return listExpenses();
});
