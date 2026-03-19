<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import type { ExpenseRecord } from '~~/types/expense';

const emit = defineEmits<{
  edit: [expense: ExpenseRecord];
  delete: [expense: ExpenseRecord];
}>();

const { expenses, isLoadingExpenses, loadExpenses } = useTicket();

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

await loadExpenses();
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
          :loading="isLoadingExpenses"
          @click="loadExpenses"
        />
      </div>
    </template>

    <UTable
      :data="expenses"
      :columns="columns"
      :loading="isLoadingExpenses"
      empty="No expenses registered yet."
    >
      <template #total-cell="{ row }">
        {{ row.original.total ?? '-' }}
      </template>

      <template #createdAt-cell="{ row }">
        {{ new Date(row.original.createdAt).toLocaleString() }}
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
