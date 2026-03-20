import { ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';

import IndexPage from '../../app/pages/index.vue';

const {
  loadExpensesMock,
  refreshMock,
  openEditModalMock,
  openDeleteModalMock
} = vi.hoisted(() => ({
  loadExpensesMock: vi.fn().mockResolvedValue(undefined),
  refreshMock: vi.fn().mockResolvedValue(undefined),
  openEditModalMock: vi.fn(),
  openDeleteModalMock: vi.fn()
}));

const expenses = ref([
  {
    id: 'expense-1',
    merchant: 'Store',
    purchaseDate: '2026-03-19',
    currency: 'MXN',
    total: 120,
    subtotal: 100,
    tax: 20,
    tip: null,
    invoiceNumber: 'INV-1',
    paymentMethod: 'cash' as const,
    items: [],
    notes: [],
    createdAt: '2026-03-19T10:00:00.000Z',
    updatedAt: '2026-03-19T10:00:00.000Z'
  }
]);

mockNuxtImport('useExpenses', () => () => ({
  expenses,
  isLoadingExpenses: ref(false),
  loadExpenses: loadExpensesMock
}));

mockNuxtImport('useModal', () => (name: string) => ({
  open: name === 'editExpense' ? openEditModalMock : openDeleteModalMock
}));

mockNuxtImport('useAsyncData', () => async (_key: string, handler: () => Promise<unknown>) => {
  await handler();

  return {
    refresh: refreshMock
  };
});

describe('IndexPage', () => {
  it('loads expenses and routes refresh/edit/delete actions through the container', async () => {
    const wrapper = await mountSuspended(IndexPage, {
      global: {
        stubs: {
          UMain: {
            template: '<div><slot /></div>'
          },
          ExpenseList: {
            props: ['expenses', 'loading'],
            emits: ['refresh', 'edit', 'delete'],
            template: `
              <div>
                <button @click="$emit('refresh')">Refresh</button>
                <button @click="$emit('edit', expenses[0])">Edit</button>
                <button @click="$emit('delete', expenses[0])">Delete</button>
              </div>
            `
          },
          ModalExpenseEdit: {
            template: '<div />'
          },
          ModalExpenseDelete: {
            template: '<div />'
          }
        }
      }
    });

    const buttons = wrapper.findAll('button');

    await buttons[0]!.trigger('click');
    await buttons[1]!.trigger('click');
    await buttons[2]!.trigger('click');

    expect(loadExpensesMock).toHaveBeenCalledTimes(1);
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(openEditModalMock).toHaveBeenCalledTimes(1);
    expect(openDeleteModalMock).toHaveBeenCalledTimes(1);
  });
});
