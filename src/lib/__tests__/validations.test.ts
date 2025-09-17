import {
  transactionSchema,
  createTransactionSchema,
  categorySchema,
  billSchema,
  validateData,
  customValidations,
} from '../validations';

describe('Validation Schemas', () => {
  describe('transactionSchema', () => {
    it('should validate a valid transaction', () => {
      const validTransaction = {
        id: 'test-id',
        date: '2024-01-01',
        description: 'Test transaction',
        amount: 100,
        type: 'expense' as const,
        category: 'groceries',
        workspace: 'personal' as const,
      };

      const result = transactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it('should reject invalid transaction with negative amount', () => {
      const invalidTransaction = {
        id: 'test-id',
        date: '2024-01-01',
        description: 'Test transaction',
        amount: -100,
        type: 'expense' as const,
        category: 'groceries',
        workspace: 'personal' as const,
      };

      const result = transactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });

    it('should reject transaction with invalid type', () => {
      const invalidTransaction = {
        id: 'test-id',
        date: '2024-01-01',
        description: 'Test transaction',
        amount: 100,
        type: 'invalid-type',
        category: 'groceries',
        workspace: 'personal' as const,
      };

      const result = transactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });

    it('should reject transaction with empty description', () => {
      const invalidTransaction = {
        id: 'test-id',
        date: '2024-01-01',
        description: '',
        amount: 100,
        type: 'expense' as const,
        category: 'groceries',
        workspace: 'personal' as const,
      };

      const result = transactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });
  });

  describe('createTransactionSchema', () => {
    it('should validate transaction data without ID', () => {
      const validTransactionData = {
        date: '2024-01-01',
        description: 'Test transaction',
        amount: 100,
        type: 'expense' as const,
        category: 'groceries',
        workspace: 'personal' as const,
      };

      const result = createTransactionSchema.safeParse(validTransactionData);
      expect(result.success).toBe(true);
    });
  });

  describe('categorySchema', () => {
    it('should validate a valid category', () => {
      const validCategory = {
        id: 'test-category',
        name: 'Test Category',
        color: '#000000',
        type: 'expense' as const,
        workspace: 'personal' as const,
        budget: 1000,
        budgetFrequency: 'monthly' as const,
      };

      const result = categorySchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });

    it('should validate category without optional fields', () => {
      const validCategory = {
        id: 'test-category',
        name: 'Test Category',
        color: '#000000',
        type: 'expense' as const,
        workspace: 'personal' as const,
      };

      const result = categorySchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });
  });

  describe('billSchema', () => {
    it('should validate a valid bill', () => {
      const validBill = {
        id: 'test-bill',
        name: 'Test Bill',
        amount: 100,
        dueDate: '2024-01-01',
        status: 'unpaid' as const,
        isRecurring: false,
        workspace: 'personal' as const,
      };

      const result = billSchema.safeParse(validBill);
      expect(result.success).toBe(true);
    });

    it('should validate recurring bill with frequency', () => {
      const validBill = {
        id: 'test-bill',
        name: 'Test Bill',
        amount: 100,
        dueDate: '2024-01-01',
        status: 'unpaid' as const,
        isRecurring: true,
        recurringFrequency: 'monthly' as const,
        workspace: 'personal' as const,
      };

      const result = billSchema.safeParse(validBill);
      expect(result.success).toBe(true);
    });
  });
});

describe('validateData utility', () => {
  it('should return success for valid data', () => {
    const validTransaction = {
      date: '2024-01-01',
      description: 'Test transaction',
      amount: 100,
      type: 'expense' as const,
      category: 'groceries',
      workspace: 'personal' as const,
    };

    const result = validateData(createTransactionSchema, validTransaction);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validTransaction);
    }
  });

  it('should return errors for invalid data', () => {
    const invalidTransaction = {
      date: '',
      description: '',
      amount: -100,
      type: 'invalid-type',
      category: '',
      workspace: 'invalid-workspace',
    };

    const result = validateData(createTransactionSchema, invalidTransaction);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toHaveLength(6); // All fields should have errors
      expect(result.errors.some(error => error.includes('amount'))).toBe(true);
      expect(result.errors.some(error => error.includes('description'))).toBe(true);
    }
  });
});

describe('customValidations', () => {
  describe('validateQuoteDates', () => {
    it('should return true for valid date range', () => {
      const result = customValidations.validateQuoteDates('2024-01-01', '2024-01-02');
      expect(result).toBe(true);
    });

    it('should return false for invalid date range', () => {
      const result = customValidations.validateQuoteDates('2024-01-02', '2024-01-01');
      expect(result).toBe(false);
    });
  });

  describe('validateGoalAmount', () => {
    it('should return true when current amount is less than target', () => {
      const result = customValidations.validateGoalAmount(50, 100);
      expect(result).toBe(true);
    });

    it('should return true when current amount equals target', () => {
      const result = customValidations.validateGoalAmount(100, 100);
      expect(result).toBe(true);
    });

    it('should return false when current amount exceeds target', () => {
      const result = customValidations.validateGoalAmount(150, 100);
      expect(result).toBe(false);
    });
  });

  describe('validateBillDueDate', () => {
    it('should return true for future date on new bill', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = customValidations.validateBillDueDate(
        tomorrow.toISOString().split('T')[0],
        true
      );
      expect(result).toBe(true);
    });

    it('should return true for any date on existing bill', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = customValidations.validateBillDueDate(
        yesterday.toISOString().split('T')[0],
        false
      );
      expect(result).toBe(true);
    });
  });

  describe('validateLoanAmount', () => {
    it('should return true when remaining amount is less than principal', () => {
      const result = customValidations.validateLoanAmount(50000, 100000);
      expect(result).toBe(true);
    });

    it('should return true when remaining amount equals principal', () => {
      const result = customValidations.validateLoanAmount(100000, 100000);
      expect(result).toBe(true);
    });

    it('should return false when remaining amount exceeds principal', () => {
      const result = customValidations.validateLoanAmount(150000, 100000);
      expect(result).toBe(false);
    });
  });
});