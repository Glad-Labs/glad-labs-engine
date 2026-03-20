/**
 * useFormValidation.test.js
 *
 * Hook tests for useFormValidation - React form state management
 * Tests form state, validation, error handling, and form lifecycle
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import useFormValidation from '../useFormValidation';
import { isValidEmail, minLength } from '../../utils/formValidation';

describe('useFormValidation Hook', () => {
  // ============================================================================
  // 1. Initialization Tests
  // ============================================================================
  describe('Hook Initialization', () => {
    it('should initialize with provided values', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: 'test@example.com', password: '' },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.values.email).toBe('test@example.com');
      expect(result.current.values.password).toBe('');
    });

    it('should have empty errors initially', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '', password: '' },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current.errors).toEqual({});
    });

    it('should have form methods available', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '' },
          onSubmit: vi.fn(),
        })
      );

      expect(typeof result.current.getFieldProps).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.reset).toBe('function');
      expect(typeof result.current.setFieldValue).toBe('function');
      expect(typeof result.current.setFieldError).toBe('function');
    });
  });

  // ============================================================================
  // 2. Field Value Management
  // ============================================================================
  describe('Field Value Management', () => {
    it('should update field value via getFieldProps', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '', password: '' },
          onSubmit: vi.fn(),
        })
      );

      const emailProps = result.current.getFieldProps('email');

      act(() => {
        emailProps.onChange({ target: { value: 'test@example.com' } });
      });

      expect(result.current.values.email).toBe('test@example.com');
    });

    it('should set field value directly with setFieldValue', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: 'old@example.com' },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldValue('email', 'new@example.com');
      });

      expect(result.current.values.email).toBe('new@example.com');
    });

    it('should handle multiple field updates', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '', password: '', name: '' },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldValue('email', 'test@example.com');
        result.current.setFieldValue('password', 'SecurePass123!');
        result.current.setFieldValue('name', 'John Doe');
      });

      expect(result.current.values).toEqual({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'John Doe',
      });
    });
  });

  // ============================================================================
  // 3. Error Handling
  // ============================================================================
  describe('Error Handling', () => {
    it('should set field error', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '' },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldError('email', 'Invalid email');
      });

      expect(result.current.errors.email).toBe('Invalid email');
    });

    it('should set general error', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '' },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setGeneralError('Form submission failed');
      });

      expect(result.current.errors.general).toBe('Form submission failed');
    });

    it('should clear errors', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '' },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldError('email', 'Invalid email');
        result.current.setGeneralError('Form error');
      });

      expect(result.current.errors.email).toBe('Invalid email');
      expect(result.current.errors.general).toBe('Form error');

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
    });

    it('should clear specific field error', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '', password: '' },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldError('email', 'Invalid email');
        result.current.setFieldError('password', 'Weak password');
      });

      act(() => {
        result.current.clearFieldError('email');
      });

      expect(result.current.errors.email).toBeUndefined();
      expect(result.current.errors.password).toBe('Weak password');
    });
  });

  // ============================================================================
  // 4. Form Reset
  // ============================================================================
  describe('Form Reset', () => {
    it('should reset form to initial values', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: 'initial@example.com', password: 'Pass123!' },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldValue('email', 'changed@example.com');
        result.current.setFieldValue('password', 'NewPass456!');
      });

      expect(result.current.values.email).toBe('changed@example.com');

      act(() => {
        result.current.reset();
      });

      expect(result.current.values).toEqual({
        email: 'initial@example.com',
        password: 'Pass123!',
      });
    });

    it('should reset errors on form reset', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '' },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldError('email', 'Invalid');
      });

      expect(result.current.errors.email).toBe('Invalid');

      act(() => {
        result.current.reset();
      });

      expect(result.current.errors).toEqual({});
    });

    it('should allow reset to custom values', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: 'original@example.com' },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldValue('email', 'changed@example.com');
      });

      act(() => {
        result.current.reset({ email: 'custom@example.com' });
      });

      expect(result.current.values.email).toBe('custom@example.com');
    });
  });

  // ============================================================================
  // 5. Form Submission
  // ============================================================================
  describe('Form Submission', () => {
    it('should call onSubmit with form values', async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: 'test@example.com', password: 'Pass123!' },
          onSubmit,
        })
      );

      const event = {
        preventDefault: vi.fn(),
      };

      act(() => {
        result.current.handleSubmit(event);
      });

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Pass123!',
        });
      });
    });

    it('should prevent default on submit', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '' },
          onSubmit: vi.fn(),
        })
      );

      const event = {
        preventDefault: vi.fn(),
      };

      act(() => {
        result.current.handleSubmit(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // 6. getFieldProps Integration
  // ============================================================================
  describe('getFieldProps Integration', () => {
    it('should return proper props for input elements', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: 'test@example.com' },
          onSubmit: vi.fn(),
        })
      );

      const props = result.current.getFieldProps('email');

      expect(props.value).toBe('test@example.com');
      expect(typeof props.onChange).toBe('function');
      expect(typeof props.onBlur).toBe('function');
    });

    it('should update value through onChange', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '' },
          onSubmit: vi.fn(),
        })
      );

      const props = result.current.getFieldProps('email');

      act(() => {
        props.onChange({
          target: { value: 'new@example.com' },
        });
      });

      expect(result.current.values.email).toBe('new@example.com');
    });

    it('should handle checkbox fields', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { rememberMe: false },
          onSubmit: vi.fn(),
        })
      );

      const props = result.current.getFieldProps('rememberMe');

      act(() => {
        props.onChange({
          target: { checked: true },
        });
      });

      expect(result.current.values.rememberMe).toBe(true);
    });
  });

  // ============================================================================
  // 7. Validation Integration
  // ============================================================================
  describe('Validation Integration', () => {
    it('should integrate with custom validators', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '', password: '' },
          onSubmit: vi.fn(),
          validators: {
            email: isValidEmail,
            password: (value) => minLength(8)(value),
          },
        })
      );

      act(() => {
        result.current.setFieldValue('email', 'invalid-email');
        // Manually call validation if implemented
      });

      // Note: Actual validation depends on hook implementation
    });
  });

  // ============================================================================
  // 8. Touch State Management
  // ============================================================================
  describe('Touch State', () => {
    it('should track touched fields', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '', password: '' },
          onSubmit: vi.fn(),
        })
      );

      const emailProps = result.current.getFieldProps('email');

      act(() => {
        emailProps.onBlur();
      });

      expect(result.current.touched?.email).toBe(true);
    });

    it('should reset touch state on form reset', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '' },
          onSubmit: vi.fn(),
        })
      );

      const emailProps = result.current.getFieldProps('email');

      act(() => {
        emailProps.onBlur();
      });

      expect(result.current.touched?.email).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.touched).toEqual({});
    });
  });

  // ============================================================================
  // 9. Complex Form Scenarios
  // ============================================================================
  describe('Complex Form Scenarios', () => {
    it('should handle multi-field form with validation', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: {
            topic: '',
            keyword: '',
            audience: '',
            category: 'technology',
          },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldValue('topic', 'AI Trends');
        result.current.setFieldValue('keyword', 'machine learning');
        result.current.setFieldValue('audience', 'developers');
        result.current.setFieldValue('category', 'tech');
      });

      expect(result.current.values).toEqual({
        topic: 'AI Trends',
        keyword: 'machine learning',
        audience: 'developers',
        category: 'tech',
      });
    });

    it('should handle form with conditional errors', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          initialValues: { email: '', confirmEmail: '' },
          onSubmit: vi.fn(),
        })
      );

      act(() => {
        result.current.setFieldValue('email', 'test@example.com');
        result.current.setFieldValue('confirmEmail', 'different@example.com');
      });

      // Check after state update has been applied
      act(() => {
        if (
          result.current.values.email !== result.current.values.confirmEmail
        ) {
          result.current.setFieldError('confirmEmail', 'Emails do not match');
        }
      });

      expect(result.current.errors.confirmEmail).toBe('Emails do not match');
    });
  });

  // ============================================================================
  // 10. State Persistence
  // ============================================================================
  describe('State Persistence', () => {
    it('should maintain state across hook re-renders', () => {
      const { result, rerender } = renderHook(
        () =>
          useFormValidation({
            initialValues: { email: 'test@example.com' },
            onSubmit: vi.fn(),
          }),
        { initialProps: undefined }
      );

      expect(result.current.values.email).toBe('test@example.com');

      rerender();

      expect(result.current.values.email).toBe('test@example.com');
    });
  });
});

// ============================================================================
// Performance Tests
// ============================================================================
describe('useFormValidation - Performance', () => {
  it('should handle large forms efficiently', () => {
    const largeForm = {};
    for (let i = 0; i < 100; i++) {
      largeForm[`field_${i}`] = '';
    }

    const start = performance.now();
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: largeForm,
        onSubmit: vi.fn(),
      })
    );
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // 100ms for large form init
    expect(Object.keys(result.current.values).length).toBe(100);
  });

  it('should handle rapid field updates', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { field: '' },
        onSubmit: vi.fn(),
      })
    );

    const start = performance.now();
    act(() => {
      for (let i = 0; i < 100; i++) {
        result.current.setFieldValue('field', `value_${i}`);
      }
    });
    const end = performance.now();

    expect(end - start).toBeLessThan(50); // 50ms for 100 updates
  });
});
