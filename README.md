# ExpenseTracker

Nuxt app for uploading a receipt image and extracting structured ticket data as JSON through Gemini.

## Setup

Install dependencies:

```bash
pnpm install
```

Create a `.env` file in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=ExpenseTracker
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_SITE_NAME=ExpenseTracker
```

`GEMINI_MODEL` must support both image input and structured JSON output. The default in this project is `gemini-2.5-flash`.

## Development

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

Upload a receipt image in the UI and press `Extract JSON`. The frontend sends the image to `/api/extract`, and the server route forwards it to Gemini as `inlineData` plus a strict JSON schema, then stores the validated result in MongoDB under the `expenses` collection.

## Notes

- The Gemini call is done server-side so the API key is never exposed to the browser.
- Parsed tickets are persisted in MongoDB in a single `expenses` collection.
- The extraction schema currently returns merchant, purchase date, totals, payment method, invoice number, line items, and OCR notes.
- If the selected model does not support structured outputs or image input, the request will fail and the server will surface that error.

## Production

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```
