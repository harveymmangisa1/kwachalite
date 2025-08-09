
'use server';

/**
 * @fileOverview A flow that suggests a transaction category based on a receipt image.
 *
 * - suggestTransactionCategory - A function that handles the suggestion of a transaction category.
 * - SuggestTransactionCategoryInput - The input type for the suggestTransactionCategory function.
 * - SuggestTransactionCategoryOutput - The return type for the suggestTransactionCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTransactionCategoryInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userCategories: z
    .array(z.string())
    .describe('The user-defined expense categories for transactions.'),
});
export type SuggestTransactionCategoryInput = z.infer<typeof SuggestTransactionCategoryInputSchema>;

const SuggestTransactionCategoryOutputSchema = z.object({
  suggestedCategory: z
    .string()
    .optional()
    .describe('The suggested category for the transaction.'),
});
export type SuggestTransactionCategoryOutput = z.infer<typeof SuggestTransactionCategoryOutputSchema>;

export async function suggestTransactionCategory(
  input: SuggestTransactionCategoryInput
): Promise<SuggestTransactionCategoryOutput> {
  return suggestTransactionCategoryFlow(input);
}

const suggestCategoryTool = ai.defineTool({
  name: 'suggestCategory',
  description: 'Suggests a transaction category based on the receipt and user categories.',
  inputSchema: z.object({
    receiptText: z.string().describe('The text extracted from the receipt.'),
    userCategories: z
      .array(z.string())
      .describe('The user-defined expense categories for transactions.'),
  }),
  outputSchema: z.string(),
  async resolve(input) {
    // Basic keyword matching for category suggestion
    const {
      receiptText,
      userCategories,
    } = input;
    const receiptTextLower = receiptText.toLowerCase();

    for (const category of userCategories) {
      if (receiptTextLower.includes(category.toLowerCase())) {
        return category;
      }
    }

    // Return a default category if no match is found.
    return 'Uncategorized';
  },
});

const prompt = ai.definePrompt({
  name: 'suggestTransactionCategoryPrompt',
  input: {schema: SuggestTransactionCategoryInputSchema},
  output: {schema: SuggestTransactionCategoryOutputSchema},
  tools: [suggestCategoryTool],
  prompt: `You are an AI assistant helping users categorize their expenses based on receipt images.

  The user has provided a receipt image, and a list of their expense categories: {{{userCategories}}}.

  Extract the text from the receipt image: {{media url=receiptDataUri}}.

  Use the suggestCategory tool to suggest a category for this transaction if it is possible to infer a category from the receipt image.

  If you cannot confidently determine a category from the receipt, leave the suggestedCategory field blank. Do not make up categories.`, // Changed from suggestCategory tool output to just a blank output.
});

const suggestTransactionCategoryFlow = ai.defineFlow(
  {
    name: 'suggestTransactionCategoryFlow',
    inputSchema: SuggestTransactionCategoryInputSchema,
    outputSchema: SuggestTransactionCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
