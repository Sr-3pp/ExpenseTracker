import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

import ExpenseForm from '../../app/components/Expense/Form.vue';

describe('ExpenseForm', () => {
  it('forwards cancel and submit through the form shell', async () => {
    const expense = {
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
      notes: []
    };

    const wrapper = await mountSuspended(ExpenseForm, {
      props: {
        expense
      },
      global: {
        stubs: {
          UForm: {
            props: ['state'],
            emits: ['submit'],
            template: `
              <div>
                <slot />
                <button @click="$emit('submit', { data: state })">Submit Shell</button>
              </div>
            `
          },
          UButton: {
            props: ['label'],
            emits: ['click'],
            template: '<button @click="$emit(\'click\')">{{ label }}</button>'
          },
          ExpenseFields: {
            template: '<div />'
          },
          ExpenseItemsEditor: {
            template: '<div />'
          },
          ExpenseNotesEditor: {
            template: '<div />'
          }
        }
      }
    });

    const buttons = wrapper.findAll('button');
    const cancelButton = buttons.find((button) => button.text() === 'Cancel');
    const submitShellButton = buttons.find((button) => button.text() === 'Submit Shell');

    await cancelButton!.trigger('click');
    await submitShellButton!.trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(wrapper.emitted('submit')).toEqual([[expense]]);
  });
});
