<script setup lang="ts">
import type { TicketExtraction } from '~~/types/ticket';

const ticketPicture = ref<File | null>(null);
const extractedTicket = ref<TicketExtraction | null>(null);
const errorMessage = ref('');
const isLoading = ref(false);
const { extractData, saveExpense } = useTicket();

const submitTicket = async () => {
  if (!ticketPicture.value) {
    return;
  }

  errorMessage.value = '';
  extractedTicket.value = null;
  isLoading.value = true;

  try {
    extractedTicket.value = await extractData(ticketPicture.value);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to extract ticket data.';
  } finally {
    isLoading.value = false;
  }
};

const emit = defineEmits<{
  saved: [];
}>();

const handleSave = async (expense: TicketExtraction) => {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    await saveExpense(expense);
    extractedTicket.value = null;
    ticketPicture.value = null;
    emit('saved');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save ticket data.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6 p-6">
    <UFileUpload
      v-model="ticketPicture"
      label="Upload your ticket picture"
      placeholder="Click or drag and drop your ticket picture here"
      accept="image/*"
    />

    <UButton 
        v-if="!extractedTicket"
        class="mx-auto"
        label="Extract JSON"
        :loading="isLoading"
        :disabled="!ticketPicture || isLoading"
        @click="submitTicket"
    />

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      :title="errorMessage"
    />

    <template v-if="extractedTicket">
      <ExpenseForm
        :expense="extractedTicket"
        :loading="isLoading"
        submit-label="Save"
        @submit="handleSave"
        @cancel="extractedTicket = null"
      />
    </template>
  </div>
</template>
