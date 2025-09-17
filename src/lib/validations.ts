import { z } from 'zod';

// Common validation patterns
const positiveNumber = z.coerce.number().positive('Must be a positive number');
const nonEmptyString = z.string().min(1, 'This field is required');
const email = z.string().email('Invalid email address');
const phoneNumber = z.string().min(10, 'Phone number must be at least 10 digits');

// Workspace validation
export const workspaceSchema = z.enum(['personal', 'business']);

// Transaction validation schemas
export const transactionTypeSchema = z.enum(['income', 'expense']);

export const transactionSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  date: z.string().min(1, 'Date is required'),
  description: nonEmptyString.max(200, 'Description must not exceed 200 characters'),
  amount: positiveNumber,
  type: transactionTypeSchema,
  category: nonEmptyString,
  workspace: workspaceSchema,
});

export const createTransactionSchema = transactionSchema.omit({ id: true });

// Category validation schemas
export const categoryTypeSchema = z.enum(['income', 'expense']);
export const budgetFrequencySchema = z.enum(['weekly', 'monthly']);

export const categorySchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: nonEmptyString.max(50, 'Category name must not exceed 50 characters'),
  color: z.string().min(1, 'Color is required'),
  type: categoryTypeSchema,
  workspace: workspaceSchema,
  budget: z.coerce.number().positive().optional(),
  budgetFrequency: budgetFrequencySchema.optional(),
});

export const createCategorySchema = categorySchema.omit({ id: true });

// Bill validation schemas
export const billStatusSchema = z.enum(['paid', 'unpaid']);
export const recurringFrequencySchema = z.enum(['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']);

export const billSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: nonEmptyString.max(100, 'Bill name must not exceed 100 characters'),
  amount: positiveNumber,
  dueDate: z.string().min(1, 'Due date is required'),
  status: billStatusSchema,
  isRecurring: z.boolean(),
  recurringFrequency: recurringFrequencySchema.optional(),
  workspace: workspaceSchema,
});

export const createBillSchema = billSchema.omit({ id: true });

// Savings Goal validation schemas
export const goalTypeSchema = z.enum(['individual', 'group']);

export const goalItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: nonEmptyString.max(100, 'Item name must not exceed 100 characters'),
  price: positiveNumber,
  purchased: z.boolean(),
});

export const savingsGoalSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: nonEmptyString.max(100, 'Goal name must not exceed 100 characters'),
  targetAmount: positiveNumber,
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative'),
  deadline: z.string().min(1, 'Deadline is required'),
  type: goalTypeSchema,
  members: z.array(z.string()).optional(),
  workspace: workspaceSchema,
  items: z.array(goalItemSchema).optional(),
});

export const createSavingsGoalSchema = savingsGoalSchema.omit({ id: true });

// Client validation schemas
export const clientSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: nonEmptyString.max(100, 'Client name must not exceed 100 characters'),
  email: email,
  phone: phoneNumber.optional(),
  address: z.string().max(200, 'Address must not exceed 200 characters').optional(),
});

export const createClientSchema = clientSchema.omit({ id: true });

// Product validation schemas
export const productSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: nonEmptyString.max(100, 'Product name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  price: positiveNumber,
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
});

export const createProductSchema = productSchema.omit({ id: true });

// Quote validation schemas
export const quoteStatusSchema = z.enum(['draft', 'sent', 'accepted', 'rejected']);

export const quoteItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  price: positiveNumber,
});

export const quoteSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  quoteNumber: nonEmptyString,
  clientId: z.string().min(1, 'Client ID is required'),
  date: z.string().min(1, 'Date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
  status: quoteStatusSchema,
});

export const createQuoteSchema = quoteSchema.omit({ id: true });

// Loan validation schemas
export const loanStatusSchema = z.enum(['active', 'paid']);

export const loanSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  lender: nonEmptyString.max(100, 'Lender name must not exceed 100 characters'),
  principal: positiveNumber,
  remainingAmount: z.coerce.number().min(0, 'Remaining amount cannot be negative'),
  interestRate: z.coerce.number().min(0).max(100, 'Interest rate must be between 0 and 100'),
  term: z.coerce.number().positive('Term must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  status: loanStatusSchema,
  workspace: workspaceSchema,
});

export const createLoanSchema = loanSchema.omit({ id: true });

// Form validation helpers
export type TransactionFormData = z.infer<typeof createTransactionSchema>;
export type CategoryFormData = z.infer<typeof createCategorySchema>;
export type BillFormData = z.infer<typeof createBillSchema>;
export type SavingsGoalFormData = z.infer<typeof createSavingsGoalSchema>;
export type ClientFormData = z.infer<typeof createClientSchema>;
export type ProductFormData = z.infer<typeof createProductSchema>;
export type QuoteFormData = z.infer<typeof createQuoteSchema>;
export type LoanFormData = z.infer<typeof createLoanSchema>;

// Validation utilities
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(error => {
    const path = error.path.join('.');
    return path ? `${path}: ${error.message}` : error.message;
  });
  
  return { success: false, errors };
}

// Custom validation rules
export const customValidations = {
  // Validate that expiry date is after quote date
  validateQuoteDates: (date: string, expiryDate: string) => {
    const quoteDate = new Date(date);
    const expiry = new Date(expiryDate);
    return expiry > quoteDate;
  },
  
  // Validate that current amount doesn't exceed target amount
  validateGoalAmount: (currentAmount: number, targetAmount: number) => {
    return currentAmount <= targetAmount;
  },
  
  // Validate that due date is in the future for new bills
  validateBillDueDate: (dueDate: string, isNew: boolean = true) => {
    if (!isNew) return true;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due >= today;
  },
  
  // Validate that remaining amount doesn't exceed principal
  validateLoanAmount: (remainingAmount: number, principal: number) => {
    return remainingAmount <= principal;
  },
};