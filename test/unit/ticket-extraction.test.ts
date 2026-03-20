import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  generateContentMock,
  getGenerativeModelMock
} = vi.hoisted(() => ({
  generateContentMock: vi.fn(),
  getGenerativeModelMock: vi.fn()
}));

vi.mock('@google/generative-ai', () => {
  class MockGoogleGenerativeAIResponseError extends Error {}

  class MockGoogleGenerativeAI {
    constructor(_apiKey: string) {}

    getGenerativeModel(...args: unknown[]) {
      getGenerativeModelMock(...args);

      return {
        generateContent: generateContentMock
      };
    }
  }

  return {
    GoogleGenerativeAI: MockGoogleGenerativeAI,
    GoogleGenerativeAIResponseError: MockGoogleGenerativeAIResponseError,
    SchemaType: {
      OBJECT: 'object',
      STRING: 'string',
      NUMBER: 'number',
      ARRAY: 'array'
    }
  };
});

import {
  extractTicketData,
  parseTicketUpload
} from '../../server/utils/ticket-extraction';

describe('ticket extraction utils', () => {
  const createErrorMock = vi.fn((input: { statusCode: number; statusMessage: string }) => {
    const error = new Error(input.statusMessage);

    Object.assign(error, input);

    return error;
  });

  beforeEach(() => {
    generateContentMock.mockReset();
    getGenerativeModelMock.mockReset();
    createErrorMock.mockClear();

    vi.stubGlobal('createError', createErrorMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses a valid uploaded image ticket', async () => {
    vi.stubGlobal('readMultipartFormData', vi.fn().mockResolvedValue([
      {
        name: 'ticket',
        type: 'image/png',
        data: Buffer.from('ticket-image')
      }
    ]));

    await expect(parseTicketUpload({} as never)).resolves.toEqual({
      type: 'image/png',
      data: Buffer.from('ticket-image')
    });
  });

  it('rejects missing or non-image uploads', async () => {
    vi.stubGlobal('readMultipartFormData', vi.fn().mockResolvedValue(undefined));

    await expect(parseTicketUpload({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'No valid ticket image was provided.'
    });

    vi.stubGlobal('readMultipartFormData', vi.fn().mockResolvedValue([
      {
        name: 'ticket',
        type: 'application/pdf',
        data: Buffer.from('ticket-pdf')
      }
    ]));

    await expect(parseTicketUpload({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'The uploaded file must be an image.'
    });
  });

  it('sends Gemini the expected schema config and validates the response payload', async () => {
    generateContentMock.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          merchant: 'Store',
          purchaseDate: '2026-03-19',
          currency: 'MXN',
          total: 120,
          subtotal: 100,
          tax: 20,
          tip: null,
          invoiceNumber: 'INV-1',
          paymentMethod: 'Tarjeta de credito',
          items: [],
          notes: ['ocr uncertain']
        })
      }
    });

    const response = await extractTicketData({
      mimeType: 'image/png',
      data: Buffer.from('ticket-image')
    }, {
      geminiApiKey: 'test-key',
      geminiModel: 'gemini-2.5-flash',
      public: {
        siteName: 'ExpenseTracker'
      }
    } as never);

    expect(response).toEqual({
      merchant: 'Store',
      purchaseDate: '2026-03-19',
      currency: 'MXN',
      total: 120,
      subtotal: 100,
      tax: 20,
      tip: null,
      invoiceNumber: 'INV-1',
      paymentMethod: 'credit card',
      items: [],
      notes: ['ocr uncertain']
    });

    expect(getGenerativeModelMock).toHaveBeenCalledTimes(1);
    expect(generateContentMock).toHaveBeenCalledTimes(1);

    const [modelConfig, requestConfig] = getGenerativeModelMock.mock.calls[0]!;
    expect(modelConfig).toMatchObject({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
    expect(requestConfig).toEqual({
      apiVersion: 'v1beta',
      apiClient: 'ExpenseTracker'
    });

    const promptParts = generateContentMock.mock.calls[0]![0];
    expect(promptParts[0].text).toContain('paymentMethod must be exactly one of');
    expect(promptParts[2].inlineData).toEqual({
      mimeType: 'image/png',
      data: Buffer.from('ticket-image').toString('base64')
    });
  });

  it('rejects missing api keys, empty Gemini responses, and Gemini SDK errors', async () => {
    await expect(extractTicketData({
      mimeType: 'image/png',
      data: Buffer.from('ticket-image')
    }, {
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash',
      public: {
        siteName: 'ExpenseTracker'
      }
    } as never)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Missing GEMINI_API_KEY server configuration.'
    });

    generateContentMock.mockResolvedValueOnce({
      response: {
        text: () => ''
      }
    });

    await expect(extractTicketData({
      mimeType: 'image/png',
      data: Buffer.from('ticket-image')
    }, {
      geminiApiKey: 'test-key',
      geminiModel: 'gemini-2.5-flash',
      public: {
        siteName: 'ExpenseTracker'
      }
    } as never)).rejects.toMatchObject({
      statusCode: 502,
      statusMessage: 'Gemini returned an empty response.'
    });

    const { GoogleGenerativeAIResponseError } = await import('@google/generative-ai');
    generateContentMock.mockRejectedValueOnce(new GoogleGenerativeAIResponseError('Gemini exploded'));

    await expect(extractTicketData({
      mimeType: 'image/png',
      data: Buffer.from('ticket-image')
    }, {
      geminiApiKey: 'test-key',
      geminiModel: 'gemini-2.5-flash',
      public: {
        siteName: 'ExpenseTracker'
      }
    } as never)).rejects.toMatchObject({
      statusCode: 502,
      statusMessage: 'Gemini exploded'
    });
  });
});
