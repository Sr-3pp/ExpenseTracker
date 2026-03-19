import type { ExpenseRecord } from '~~/shared/types/expense';

export const useTicket = () => {
  const extractData = async (ticket: File) => {
    const formData = new FormData();
    formData.append('ticket', ticket);

    const response = await $fetch<ExpenseRecord>('/api/extract', {
      method: 'POST',
      body: formData
    });

    return response;
  };

  return {
    extractData
  };
};
