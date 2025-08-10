
'use server';

import { revalidatePath } from 'next/cache';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

export async function updateUserProfile(userId: string, formData: FormData) {
  const userRef = doc(db, 'users', userId);

  const profileData = {
    name: formData.get('name') as string,
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    bio: formData.get('bio') as string,
  };

  await updateDoc(userRef, profileData);
  revalidatePath('/dashboard/settings');
}
