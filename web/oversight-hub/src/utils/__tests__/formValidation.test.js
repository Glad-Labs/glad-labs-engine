/**
 * formValidation.test.js
 *
 * Unit tests for form validation utilities
 * Tests all 14 validators with edge cases, valid inputs, and error conditions
 *
 * @jest-environment jsdom
 */

import {
  isValidEmail,
  isStrongPassword,
  minLength,
  maxLength,
  alphanumericOnly,
  urlValidation,
  phoneValidation,
  isValidURL,
  creditCardValidation,
  isValidDate,
  validateUSZipCode,
  passwordStrength,
  slugify,
  validateTaskTitle,
} from '../formValidation';

describe('formValidation Utilities - 14 Validators', () => {
  // ============================================================================
  // 1. Email Validation Tests
  // ============================================================================
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('name_123@test-domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@example')).toBe(false);
      expect(isValidEmail('user name@example.com')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  // ============================================================================
  // 2. Password Strength Tests
  // ============================================================================
  describe('isStrongPassword', () => {
    it('should validate strong passwords', () => {
      expect(isStrongPassword('StrongPass123!@')).toBe(true);
      expect(isStrongPassword('P@ssw0rd!secure')).toBe(true);
      expect(isStrongPassword('MyPassword2024#')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('Pass123')).toBe(false); // No special char
    });

    it('should validate minimum length requirement', () => {
      expect(isStrongPassword('Pass12!')).toBe(false); // 7 chars
      expect(isStrongPassword('Pass123!')).toBe(true); // 8 chars
    });
  });

  // ============================================================================
  // 3. Length Validators
  // ============================================================================
  describe('minLength', () => {
    it('should validate minimum length requirement', () => {
      const validator = minLength(5);
      expect(validator('hello')).toBe(true);
      expect(validator('hello world')).toBe(true);
      expect(validator('hi')).toBe(false);
    });

    it('should handle edge cases', () => {
      const validator = minLength(1);
      expect(validator('a')).toBe(true);
      expect(validator('')).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('should validate maximum length requirement', () => {
      const validator = maxLength(10);
      expect(validator('hello')).toBe(true);
      expect(validator('hello worl')).toBe(true);
      expect(validator('hello world')).toBe(false);
    });

    it('should handle edge cases', () => {
      const validator = maxLength(0);
      expect(validator('')).toBe(true);
      expect(validator('a')).toBe(false);
    });
  });

  // ============================================================================
  // 4. Alphanumeric Validation
  // ============================================================================
  describe('alphanumericOnly', () => {
    it('should accept alphanumeric strings only', () => {
      expect(alphanumericOnly('abc123')).toBe(true);
      expect(alphanumericOnly('ABC')).toBe(true);
      expect(alphanumericOnly('123')).toBe(true);
    });

    it('should reject special characters and spaces', () => {
      expect(alphanumericOnly('abc-123')).toBe(false);
      expect(alphanumericOnly('abc 123')).toBe(false);
      expect(alphanumericOnly('abc_123')).toBe(false);
      expect(alphanumericOnly('abc@123')).toBe(false);
    });
  });

  // ============================================================================
  // 5. URL Validation
  // ============================================================================
  describe('urlValidation', () => {
    it('should validate correct URLs', () => {
      expect(urlValidation('https://example.com')).toBe(true);
      expect(urlValidation('http://www.example.co.uk')).toBe(true);
      expect(urlValidation('https://example.com/path/to/page')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(urlValidation('not a url')).toBe(false);
      expect(urlValidation('example')).toBe(false);
      expect(urlValidation('www.example.com')).toBe(false); // Missing protocol
    });
  });

  // ============================================================================
  // 6. URL Validation (Alternative)
  // ============================================================================
  describe('isValidURL', () => {
    it('should validate correct URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://test.org')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('example')).toBe(false);
    });
  });

  // ============================================================================
  // 7. Phone Number Validation
  // ============================================================================
  describe('phoneValidation', () => {
    it('should validate US phone numbers', () => {
      expect(phoneValidation('555-123-4567')).toBe(true);
      expect(phoneValidation('(555) 123-4567')).toBe(true);
      expect(phoneValidation('5551234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(phoneValidation('123')).toBe(false);
      expect(phoneValidation('abc-def-ghij')).toBe(false);
      expect(phoneValidation('555-12-4567')).toBe(false);
    });
  });

  // ============================================================================
  // 8. Credit Card Validation
  // ============================================================================
  describe('creditCardValidation', () => {
    it('should validate valid credit card numbers (Luhn algorithm)', () => {
      // Valid test credit card (Visa)
      expect(creditCardValidation('4532015112830366')).toBe(true);
      // Valid test credit card (MasterCard)
      expect(creditCardValidation('5500005555555559')).toBe(true);
    });

    it('should reject invalid credit card numbers', () => {
      expect(creditCardValidation('1234567890123456')).toBe(false);
      expect(creditCardValidation('123')).toBe(false);
      expect(creditCardValidation('abcd efgh ijkl mnop')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(creditCardValidation('')).toBe(false);
      expect(creditCardValidation('4532015112830367')).toBe(false); // One digit off
    });
  });

  // ============================================================================
  // 9. Date Validation
  // ============================================================================
  describe('isValidDate', () => {
    it('should validate correct dates', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
      expect(isValidDate('2000-02-29')).toBe(true); // Leap year
    });

    it('should reject invalid dates', () => {
      expect(isValidDate('2024-13-01')).toBe(false); // Month > 12
      expect(isValidDate('2024-02-30')).toBe(false); // Invalid day
      expect(isValidDate('2023-02-29')).toBe(false); // Non-leap year
      expect(isValidDate('not-a-date')).toBe(false);
    });

    it('should handle format validation', () => {
      expect(isValidDate('01-15-2024')).toBe(false); // Wrong format
      expect(isValidDate('2024/01/15')).toBe(false); // Wrong separator
    });
  });

  // ============================================================================
  // 10. US Zip Code Validation
  // ============================================================================
  describe('validateUSZipCode', () => {
    it('should validate correct US zip codes', () => {
      expect(validateUSZipCode('12345')).toBe(true);
      expect(validateUSZipCode('12345-6789')).toBe(true);
      expect(validateUSZipCode('90210')).toBe(true);
    });

    it('should reject invalid zip codes', () => {
      expect(validateUSZipCode('1234')).toBe(false);
      expect(validateUSZipCode('123456')).toBe(false);
      expect(validateUSZipCode('abcde')).toBe(false);
      expect(validateUSZipCode('12345-67')).toBe(false);
    });
  });

  // ============================================================================
  // 11. Password Strength Analyzer
  // ============================================================================
  describe('passwordStrength', () => {
    it('should analyze password strength', () => {
      const weak = passwordStrength('abc');
      expect(weak).toHaveProperty('score');
      expect(weak.score).toBeLessThan(3);

      const strong = passwordStrength('StrongPass123!@#');
      expect(strong.score).toBeGreaterThanOrEqual(3);
    });

    it('should provide feedback for weak passwords', () => {
      const result = passwordStrength('weak');
      expect(result).toHaveProperty('feedback');
      expect(Array.isArray(result.feedback)).toBe(true);
    });
  });

  // ============================================================================
  // 12. Slugify
  // ============================================================================
  describe('slugify', () => {
    it('should convert text to URL-friendly slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('The Future of AI')).toBe('the-future-of-ai');
      expect(slugify('Test  Multiple   Spaces')).toBe('test-multiple-spaces');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello! @World#')).toBe('hello-world');
      expect(slugify('café')).toMatch(/caf/); // Handles unicode
    });

    it('should handle edge cases', () => {
      expect(slugify('   ')).toBe('');
      expect(slugify('123')).toBe('123');
      expect(slugify('-test-')).toBe('test');
    });
  });

  // ============================================================================
  // 13. Task Title Validation
  // ============================================================================
  describe('validateTaskTitle', () => {
    it('should validate task titles', () => {
      expect(validateTaskTitle('Generate Blog Post')).toBe(true);
      expect(validateTaskTitle('Create Content')).toBe(true);
      expect(validateTaskTitle('Analyze Market Trends')).toBe(true);
    });

    it('should reject invalid task titles', () => {
      expect(validateTaskTitle('a')).toBe(false); // Too short
      expect(validateTaskTitle('')).toBe(false);
      expect(validateTaskTitle('a'.repeat(256))).toBe(false); // Too long
    });

    it('should handle special characters in titles', () => {
      expect(validateTaskTitle('Task: Generate Blog Post')).toBe(true);
      expect(validateTaskTitle('Task (Important) - Do This')).toBe(true);
    });
  });
});

// ============================================================================
// Integration Test: Combined Validators
// ============================================================================
describe('formValidation - Integration Tests', () => {
  it('should validate a complete registration form', () => {
    const formData = {
      email: 'user@example.com',
      password: 'StrongPass123!',
      phoneNumber: '555-123-4567',
      website: 'https://example.com',
    };

    expect(isValidEmail(formData.email)).toBe(true);
    expect(isStrongPassword(formData.password)).toBe(true);
    expect(phoneValidation(formData.phoneNumber)).toBe(true);
    expect(isValidURL(formData.website)).toBe(true);
  });

  it('should reject a registration form with invalid data', () => {
    const formData = {
      email: 'invalid-email',
      password: 'weak',
      phoneNumber: '123',
      website: 'not-a-url',
    };

    expect(isValidEmail(formData.email)).toBe(false);
    expect(isStrongPassword(formData.password)).toBe(false);
    expect(phoneValidation(formData.phoneNumber)).toBe(false);
    expect(isValidURL(formData.website)).toBe(false);
  });

  it('should handle a task creation form', () => {
    const taskData = {
      title: 'Generate Blog Post on AI Trends',
      description:
        'Create a comprehensive article about recent AI developments',
      dueDate: '2024-12-31',
    };

    expect(validateTaskTitle(taskData.title)).toBe(true);
    expect(minLength(10)(taskData.description)).toBe(true);
    expect(isValidDate(taskData.dueDate)).toBe(true);
  });
});

// ============================================================================
// Edge Case Tests
// ============================================================================
describe('formValidation - Edge Cases', () => {
  it('should handle null and undefined values', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isStrongPassword(null)).toBe(false);
    expect(isStrongPassword(undefined)).toBe(false);
  });

  it('should handle whitespace', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(false); // With spaces
    expect(slugify('  test  ')).toBe('test'); // Trimmed
  });

  it('should handle unicode and special characters', () => {
    expect(alphanumericOnly('café')).toBe(false);
    expect(alphanumericOnly('test™')).toBe(false);
    expect(slugify('Café & Restaurant')).toBe('cafe-restaurant');
  });

  it('should handle large inputs', () => {
    const largeText = 'a'.repeat(10000);
    expect(maxLength(5000)(largeText)).toBe(false);
    expect(maxLength(10000)(largeText)).toBe(true);
  });
});

// ============================================================================
// Performance Tests
// ============================================================================
describe('formValidation - Performance', () => {
  it('should validate quickly', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      isValidEmail('user@example.com');
    }
    const end = performance.now();
    expect(end - start).toBeLessThan(100); // 100ms for 1000 validations
  });

  it('should handle complex validators efficiently', () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      passwordStrength('StrongPass123!@#');
    }
    const end = performance.now();
    expect(end - start).toBeLessThan(50); // 50ms for 100 strength checks
  });
});
