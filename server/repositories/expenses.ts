import { ObjectId } from 'mongodb';

import type { ExpenseRecord } from '~~/shared/types/expense';
import type { TicketExtraction } from '~~/shared/types/ticket';

import { getExpensesCollection } from '~~/server/utils/mongodb';

export async function saveExpense(expense: TicketExtraction): Promise<ExpenseRecord> {
  const now = new Date();
  const collection = await getExpensesCollection();

  const insertResult = await collection.insertOne({
    ...expense,
    createdAt: now,
    updatedAt: now
  });

  return {
    ...expense,
    id: insertResult.insertedId.toString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

export async function deleteExpense(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid expense id.'
    });
  }

  const collection = await getExpensesCollection();
  const result = await collection.deleteOne({
    _id: new ObjectId(id)
  });

  return result.deletedCount === 1;
}

export async function updateExpense(id: string, expense: TicketExtraction): Promise<ExpenseRecord | null> {
  if (!ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid expense id.'
    });
  }

  const collection = await getExpensesCollection();
  const now = new Date();
  const expenseId = new ObjectId(id);

  const result = await collection.findOneAndUpdate(
    { _id: expenseId },
    {
      $set: {
        ...expense,
        updatedAt: now
      }
    },
    {
      returnDocument: 'after'
    }
  );

  if (!result) {
    return null;
  }

  return {
    id: result._id.toString(),
    merchant: result.merchant ?? null,
    purchaseDate: result.purchaseDate ?? null,
    currency: result.currency ?? null,
    total: result.total ?? null,
    subtotal: result.subtotal ?? null,
    tax: result.tax ?? null,
    tip: result.tip ?? null,
    invoiceNumber: result.invoiceNumber ?? null,
    paymentMethod: result.paymentMethod ?? null,
    items: Array.isArray(result.items) ? result.items : [],
    notes: Array.isArray(result.notes) ? result.notes : [],
    createdAt: result.createdAt instanceof Date ? result.createdAt.toISOString() : new Date(result.createdAt).toISOString(),
    updatedAt: result.updatedAt instanceof Date ? result.updatedAt.toISOString() : now.toISOString()
  };
}
