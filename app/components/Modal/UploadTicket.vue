<script setup lang="ts">
const { isOpen, toggle } = useModal('uploadTicket');
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Upload Ticket"
    description="upload the ticket picture to get the details"
    name="uploadTicket"
  >
    <template #body>
      <TicketWizard @saved="toggle()" />
    </template>
  </UModal>
</template>
