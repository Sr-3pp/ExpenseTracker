<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { PropType } from 'vue';

import type { ExpenseRecord } from '~~/shared/types/expense';

defineProps({
  expenses: {
    type: Array as PropType<ExpenseRecord[]>,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  refresh: [];
  edit: [expense: ExpenseRecord];
  delete: [expense: ExpenseRecord];
}>();

const columns: TableColumn<ExpenseRecord>[] = [
  {
    accessorKey: 'merchant',
    header: 'Merchant'
  },
  {
    accessorKey: 'purchaseDate',
    header: 'Date'
  },
  {
    accessorKey: 'currency',
    header: 'Currency'
  },
  {
    accessorKey: 'total',
    header: 'Total'
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Payment'
  },
  {
    accessorKey: 'createdAt',
    header: 'Created'
  },
  {
    id: 'actions',
    header: 'Actions'
  }
];

const openEdit = (expense: ExpenseRecord) => {
  emit('edit', expense);
};

const openDelete = (expense: ExpenseRecord) => {
  emit('delete', expense);
};

const createdAtFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'UTC'
});

const formatCreatedAt = (value: string) => {
  return createdAtFormatter.format(new Date(value));
};
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-lg font-semibold text-(--ui-text-highlighted)">
            Registered Expenses
          </h1>
          <p class="text-sm text-(--ui-text-muted)">
            Parsed tickets stored in MongoDB.
          </p>
        </div>

        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          :loading="loading"
          @click="emit('refresh')"
        />
      </div>
    </template>

    <UTable
      :data="expenses"
      :columns="columns"
      :loading="loading"
      empty="No expenses registered yet."
    >
      <template #total-cell="{ row }">
        {{ row.original.total ?? '-' }}
      </template>

      <template #createdAt-cell="{ row }">
        {{ formatCreatedAt(row.original.createdAt) }}
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-2">
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            label="Edit"
            @click="openEdit(row.original)"
          />

          <UButton
            size="xs"
            color="error"
            variant="soft"
            label="Delete"
            @click="openDelete(row.original)"
          />
        </div>
      </template>
    </UTable>
  </UCard>
</template>
