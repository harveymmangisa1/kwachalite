
'use server';

import {
  suggestTransactionCategory as suggest,
  type SuggestTransactionCategoryInput,
  type SuggestTransactionCategoryOutput,
} from '@/ai/flows/suggest-transaction-category';

export async function suggestTransactionCategory(
  input: SuggestTransactionCategoryInput
): Promise<SuggestTransactionCategoryOutput> {
  // In a real application, you might add authentication checks,
  // rate limiting, or additional logging here.
  return suggest(input);
}
