import { ObjectId } from 'mongodb';

import type { ExpenseRecord } from '~~/types/expense';
import type { TicketExtraction } from '~~/types/ticket';

import { getExpensesCollection } from '~~/server/utils/mongodb';

function toExpenseRecord(document: Record<string, any>): ExpenseRecord {
  return {
    id: document._id.toString(),
    merchant: document.merchant ?? null,
    purchaseDate: document.purchaseDate ?? null,
    currency: document.currency ?? null,
    total: document.total ?? null,
    subtotal: document.subtotal ?? null,
    tax: document.tax ?? null,
    tip: document.tip ?? null,
    invoiceNumber: document.invoiceNumber ?? null,
    paymentMethod: document.paymentMethod ?? null,
    items: Array.isArray(document.items) ? document.items : [],
    notes: Array.isArray(document.notes) ? document.notes : [],
    createdAt: document.createdAt instanceof Date ? document.createdAt.toISOString() : new Date(document.createdAt).toISOString(),
    updatedAt: document.updatedAt instanceof Date ? document.updatedAt.toISOString() : new Date(document.updatedAt).toISOString()
  };
}

export async function listExpenses(): Promise<ExpenseRecord[]> {
  const collection = await getExpensesCollection();
  const documents = await collection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return documents.map((document) => toExpenseRecord(document));
}

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

  return toExpenseRecord({
    ...result,
    updatedAt: result.updatedAt ?? now
  });
}
