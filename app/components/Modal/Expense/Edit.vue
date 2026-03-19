<script setup lang="ts">
import type { ExpenseRecord } from '~~/shared/types/expense';
import type { TicketExtraction } from '~~/shared/types/ticket';

const props = defineProps<{
  expense: ExpenseRecord | null;
}>();

const emit = defineEmits<{
  saved: [];
}>();

const { isOpen, toggle } = useModal('editExpense');
const { patchExpense } = useTicket();

const isSavingExpense = ref(false);
const editError = ref('');

watch(
  () => props.expense,
  () => {
    editError.value = '';
  },
  { immediate: true }
);

const closeModal = () => {
  toggle();
};

const saveEditedExpense = async (payload: TicketExtraction) => {
  if (!props.expense) {
    return;
  }

  editError.value = '';
  isSavingExpense.value = true;

  try {
    await patchExpense(props.expense.id, payload);
    emit('saved');
    closeModal();
  } catch (error) {
    editError.value = error instanceof Error ? error.message : 'Failed to update expense.';
  } finally {
    isSavingExpense.value = false;
  }
};
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Edit Expense"
    description="Update the parsed expense payload and save it back to MongoDB."
  >
    <template #body>
      <div class="space-y-4">
        <UAlert
          v-if="editError"
          color="error"
          variant="soft"
          :title="editError"
        />

        <ExpenseForm
          :expense="expense"
          :loading="isSavingExpense"
          submit-label="Save Changes"
          @cancel="closeModal"
          @submit="saveEditedExpense"
        />
      </div>
    </template>
  </UModal>
</template>
