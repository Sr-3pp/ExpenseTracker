import {
  GoogleGenerativeAI,
  GoogleGenerativeAIResponseError,
  SchemaType,
  type ResponseSchema
} from '@google/generative-ai';
import { paymentMethodOptions } from '~~/shared/constants/payment-methods';
import type { TicketExtraction } from '~~/types/ticket';

import { ticketExtractionSchema } from '~~/server/utils/expense-schema';

const ticketSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    merchant: {
      type: SchemaType.STRING,
      description: 'Store or vendor name exactly as read from the receipt when possible.',
      nullable: true
    },
    purchaseDate: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'Purchase date in YYYY-MM-DD format when it can be inferred confidently.'
    },
    currency: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'ISO 4217 currency code such as USD or MXN.'
    },
    total: {
      type: SchemaType.NUMBER,
      nullable: true,
      description: 'Final total charged on the ticket.'
    },
    subtotal: {
      type: SchemaType.NUMBER,
      nullable: true,
      description: 'Subtotal amount before taxes and tips when visible.'
    },
    tax: {
      type: SchemaType.NUMBER,
      nullable: true,
      description: 'Tax amount when visible.'
    },
    tip: {
      type: SchemaType.NUMBER,
      nullable: true,
      description: 'Tip amount when visible.'
    },
    invoiceNumber: {
      type: SchemaType.STRING,
      nullable: true,
      description: 'Receipt, ticket, or invoice number if present.'
    },
    paymentMethod: {
      type: SchemaType.STRING,
      nullable: true,
      description: `Payment method. Use one of: ${paymentMethodOptions.join(', ')}. If unclear, use other.`
    },
    items: {
      type: SchemaType.ARRAY,
      description: 'Line items found on the ticket.',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: {
            type: SchemaType.STRING,
            description: 'The item description.'
          },
          quantity: {
            type: SchemaType.NUMBER,
            nullable: true,
            description: 'Quantity when visible.'
          },
          unitPrice: {
            type: SchemaType.NUMBER,
            nullable: true,
            description: 'Unit price when visible.'
          },
          totalPrice: {
            type: SchemaType.NUMBER,
            nullable: true,
            description: 'Total line price when visible.'
          }
        },
        required: ['name', 'quantity', 'unitPrice', 'totalPrice']
      }
    },
    notes: {
      type: SchemaType.ARRAY,
      description: 'Short notes about uncertain fields or OCR ambiguity.',
      items: {
        type: SchemaType.STRING
      }
    }
  },
  required: [
    'merchant',
    'purchaseDate',
    'currency',
    'total',
    'subtotal',
    'tax',
    'tip',
    'invoiceNumber',
    'paymentMethod',
    'items',
    'notes'
  ]
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing GEMINI_API_KEY server configuration.'
    });
  }

  const formData = await readMultipartFormData(event);
  const ticketFile = formData?.find((item) => item.name === 'ticket');

  if (!ticketFile?.data || !ticketFile.type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No valid ticket image was provided.'
    });
  }

  if (!ticketFile.type.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'The uploaded file must be an image.'
    });
  }

  const base64Image = ticketFile.data.toString('base64');
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: config.geminiModel,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: ticketSchema
      }
    }, {
      apiVersion: 'v1beta',
      apiClient: config.public.siteName
    });

    const result = await model.generateContent([
      {
        text: `Extract structured expense data from this receipt image.

Rules:
- Return only the schema fields.
- Use null for missing string or numeric fields.
- Use [] for missing arrays.
- Do not guess values that are not visible.
- Put OCR uncertainty or ambiguities into notes.
- Normalize purchaseDate to YYYY-MM-DD only when confident.
- paymentMethod must be exactly one of: ${paymentMethodOptions.join(', ')}.
- If the payment method is present but does not clearly match one option, use other.`
      },
      {
        text: 'Read this receipt or ticket image and extract the structured expense data.'
      },
      {
        inlineData: {
          mimeType: ticketFile.type,
          data: base64Image
        }
      }
    ]);

    const content = result.response.text();

    if (!content) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Gemini returned an empty response.'
      });
    }

    const parsed = JSON.parse(content) as TicketExtraction;
    const validatedExpense = ticketExtractionSchema.parse(parsed);

    return validatedExpense;
  } catch (error) {
    if (error instanceof GoogleGenerativeAIResponseError) {
      throw createError({
        statusCode: 502,
        statusMessage: error.message
      });
    }

    if (error instanceof Error && 'statusCode' in error) {
      throw error;
    }

    throw createError({
      statusCode: 502,
      statusMessage: error instanceof Error ? error.message : 'Gemini SDK request failed.'
    });
  }
});
