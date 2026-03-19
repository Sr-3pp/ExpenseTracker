<script setup lang="ts">
import type { ExpenseRecord } from '~~/shared/types/expense';

const ticketPicture = ref<File | null>(null);
const extractedTicket = ref<ExpenseRecord | null>(null);
const errorMessage = ref('');
const isLoading = ref(false);
const { extractData } = useTicket();

const formattedJson = computed(() =>
  extractedTicket.value ? JSON.stringify(extractedTicket.value, null, 2) : ''
);

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
</script>

<template>
  <div class="mx-auto flex max-w-3xl flex-col gap-6 p-6">
    <UFileUpload
      v-model="ticketPicture"
      label="Upload your ticket picture"
      placeholder="Click or drag and drop your ticket picture here"
      accept="image/*"
    />

    <div class="flex gap-3">
      <UButton
        label="Extract JSON"
        :loading="isLoading"
        :disabled="!ticketPicture || isLoading"
        @click="submitTicket"
      />
    </div>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      :title="errorMessage"
    />

    <UTextarea
      v-if="extractedTicket"
      :model-value="formattedJson"
      :rows="18"
      autoresize
      readonly
    />
  </div>
</template>
