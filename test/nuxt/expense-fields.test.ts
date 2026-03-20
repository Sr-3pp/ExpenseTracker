import { reactive } from 'vue';
import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';

import ExpenseFields from '../../app/components/Expense/Fields.vue';

describe('ExpenseFields', () => {
  it('normalizes nullable string and payment method updates into the shared state', async () => {
    const state = reactive({
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
    });

    const wrapper = await mountSuspended(ExpenseFields, {
      props: { state },
      global: {
        stubs: {
          UFormField: {
            template: '<div><slot /></div>'
          },
          UInput: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<button @click="$emit(\'update:modelValue\', undefined)">Clear Input</button>'
          },
          USelect: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<button @click="$emit(\'update:modelValue\', undefined)">Clear Select</button>'
          },
          UInputNumber: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<input />'
          }
        }
      }
    });

    const buttons = wrapper.findAll('button');

    await buttons[0]!.trigger('click');
    await buttons[3]!.trigger('click');

    expect(state.merchant).toBeNull();
    expect(state.paymentMethod).toBeNull();
  });
});
