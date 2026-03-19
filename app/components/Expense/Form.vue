<script setup lang="ts">
import type { PaymentMethodOption } from '~~/shared/constants/payment-methods';
import type { TicketExtraction, TicketLineItem } from '~~/shared/types/ticket';
import { paymentMethodOptions } from '~~/shared/constants/payment-methods';
import { ticketExtractionSchema } from '~~/shared/schemas/ticket';

const props = withDefaults(defineProps<{
  expense?: TicketExtraction | null;
  loading?: boolean;
  submitLabel?: string;
}>(), {
  expense: null,
  loading: false,
  submitLabel: 'Save Changes'
});

const emit = defineEmits<{
  submit: [expense: TicketExtraction];
  cancel: [];
}>();

const createEmptyLineItem = (): TicketLineItem => ({
  name: '',
  quantity: null,
  unitPrice: null,
  totalPrice: null
});

const createEmptyExpense = (): TicketExtraction => ({
  merchant: null,
  purchaseDate: null,
  currency: null,
  total: null,
  subtotal: null,
  tax: null,
  tip: null,
  invoiceNumber: null,
  paymentMethod: null,
  items: [],
  notes: []
});

const cloneExpense = (expense: TicketExtraction | null | undefined): TicketExtraction => {
  if (!expense) {
    return createEmptyExpense();
  }

  return {
    merchant: expense.merchant,
    purchaseDate: expense.purchaseDate,
    currency: expense.currency,
    total: expense.total,
    subtotal: expense.subtotal,
    tax: expense.tax,
    tip: expense.tip,
    invoiceNumber: expense.invoiceNumber,
    paymentMethod: expense.paymentMethod,
    items: expense.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    })),
    notes: [...expense.notes]
  };
};

const state = reactive<TicketExtraction>(createEmptyExpense());

watch(
  () => props.expense,
  (expense) => {
    Object.assign(state, cloneExpense(expense));
  },
  { immediate: true }
);

const addItem = () => {
  state.items.push(createEmptyLineItem());
};

const removeItem = (index: number) => {
  state.items.splice(index, 1);
};

const addNote = () => {
  state.notes.push('');
};

const removeNote = (index: number) => {
  state.notes.splice(index, 1);
};

const emitCancel = () => {
  emit('cancel');
};

const updateNullableString = (
  key: 'merchant' | 'purchaseDate' | 'currency' | 'invoiceNumber',
  value: string | undefined
) => {
  state[key] = value ?? null;
};

const updatePaymentMethod = (value: PaymentMethodOption | null | undefined) => {
  state.paymentMethod = value ?? null;
};

const handleSubmit = (event: { data: TicketExtraction }) => {
  emit('submit', event.data);
};
</script>

<template>
  <UForm
    :schema="ticketExtractionSchema"
    :state="state"
    class="space-y-6"
    @submit="handleSubmit"
  >
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField name="merchant" label="Merchant">
        <UInput
          :model-value="state.merchant ?? undefined"
          class="w-full"
          @update:model-value="updateNullableString('merchant', $event)"
        />
      </UFormField>

      <UFormField name="purchaseDate" label="Purchase Date">
        <UInput
          :model-value="state.purchaseDate ?? undefined"
          type="date"
          class="w-full"
          @update:model-value="updateNullableString('purchaseDate', $event)"
        />
      </UFormField>

      <UFormField name="currency" label="Currency">
        <UInput
          :model-value="state.currency ?? undefined"
          class="w-full"
          @update:model-value="updateNullableString('currency', $event)"
        />
      </UFormField>

      <UFormField name="paymentMethod" label="Payment Method">
        <USelect
          :items="[...paymentMethodOptions]"
          :model-value="state.paymentMethod ?? undefined"
          placeholder="Select a payment method"
          nullable
          class="w-full"
          @update:model-value="updatePaymentMethod($event)"
        />
      </UFormField>

      <UFormField name="invoiceNumber" label="Invoice Number">
        <UInput
          :model-value="state.invoiceNumber ?? undefined"
          class="w-full"
          @update:model-value="updateNullableString('invoiceNumber', $event)"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2 sm:col-span-2">
        <UFormField name="subtotal" label="Subtotal">
          <UInputNumber v-model="state.subtotal" orientation="vertical" class="w-full" />
        </UFormField>

        <UFormField name="tax" label="Tax">
          <UInputNumber v-model="state.tax" orientation="vertical" class="w-full" />
        </UFormField>

        <UFormField name="tip" label="Tip">
          <UInputNumber v-model="state.tip" orientation="vertical" class="w-full" />
        </UFormField>

        <UFormField name="total" label="Total">
          <UInputNumber v-model="state.total" orientation="vertical" class="w-full" />
        </UFormField>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">
            Line Items
          </h3>
          <p class="text-sm text-(--ui-text-muted)">
            Review each parsed item before saving.
          </p>
        </div>

        <UButton
          type="button"
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          label="Add Item"
          @click="addItem"
        />
      </div>

      <div
        v-if="state.items.length"
        class="space-y-3"
      >
        <div
          v-for="(item, index) in state.items"
          :key="`item-${index}`"
          class="rounded-lg border border-(--ui-border) p-4"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-(--ui-text-highlighted)">
              Item {{ index + 1 }}
            </p>

            <UButton
              type="button"
              size="xs"
              color="error"
              variant="ghost"
              icon="i-lucide-trash-2"
              @click="removeItem(index)"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <UFormField :name="`items.${index}.name`" label="Name">
              <UInput v-model="item.name" class="w-full" />
            </UFormField>

            <UFormField :name="`items.${index}.quantity`" label="Quantity">
              <UInputNumber v-model="item.quantity" orientation="vertical" class="w-full" />
            </UFormField>

            <UFormField :name="`items.${index}.unitPrice`" label="Unit Price">
              <UInputNumber v-model="item.unitPrice" orientation="vertical" class="w-full" />
            </UFormField>

            <UFormField :name="`items.${index}.totalPrice`" label="Total Price">
              <UInputNumber v-model="item.totalPrice" orientation="vertical" class="w-full" />
            </UFormField>
          </div>
        </div>
      </div>

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        title="No line items on this ticket yet."
      />
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-(--ui-text-highlighted)">
            Notes
          </h3>
          <p class="text-sm text-(--ui-text-muted)">
            Add any extra details extracted from the ticket.
          </p>
        </div>

        <UButton
          type="button"
          color="neutral"
          variant="soft"
          icon="i-lucide-plus"
          label="Add Note"
          @click="addNote"
        />
      </div>

      <div
        v-if="state.notes.length"
        class="space-y-3"
      >
        <div
          v-for="(note, index) in state.notes"
          :key="`note-${index}`"
          class="flex items-start gap-2"
        >
          <UFormField :name="`notes.${index}`" class="flex-1">
            <UInput v-model="state.notes[index]" class="w-full" />
          </UFormField>

          <UButton
            type="button"
            size="xs"
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            class="mt-6"
            @click="removeNote(index)"
          />
        </div>
      </div>

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        title="No notes attached to this ticket."
      />
    </div>

    <div class="flex justify-end gap-3">
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        label="Cancel"
        @click="emitCancel"
      />

      <UButton
        type="submit"
        color="primary"
        :label="submitLabel"
        :loading="loading"
      />
    </div>
  </UForm>
</template>
