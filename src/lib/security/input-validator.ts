/**
 * Input Validator Utilities
 * Biztonsági input validáció és sanitizáció
 */

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  error?: string;
}

export class InputValidator {
  // XSS védelem - HTML sanitizáció
  public static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/&/g, '&amp;');
  }

  // SQL injection védelem
  public static sanitizeSql(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    
    return input
      .replace(/['"\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/;/g, '')
      .replace(/union/gi, '')
      .replace(/select/gi, '')
      .replace(/insert/gi, '')
      .replace(/update/gi, '')
      .replace(/delete/gi, '')
      .replace(/drop/gi, '')
      .replace(/create/gi, '')
      .replace(/alter/gi, '');
  }

  // Email validáció
  public static validateEmail(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
      return {
        isValid: false,
        error: 'Email is required'
      };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        error: 'Invalid email format'
      };
    }
    
    if (email.length > 254) {
      return {
        isValid: false,
        error: 'Email is too long'
      };
    }

    return {
      isValid: true,
      sanitizedValue: email.toLowerCase().trim()
    };
  }

  // Password validáció
  public static validatePassword(password: string): ValidationResult {
    if (!password || typeof password !== 'string') {
      return {
        isValid: false,
        error: 'Password is required'
      };
    }
    
    if (password.length < 8) {
      return {
        isValid: false,
        error: 'Password must be at least 8 characters long'
      };
    }
    
    if (password.length > 128) {
      return {
        isValid: false,
        error: 'Password is too long'
      };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter'
      };
    }
    
    if (!hasLowerCase) {
      return {
        isValid: false,
        error: 'Password must contain at least one lowercase letter'
      };
    }
    
    if (!hasNumbers) {
      return {
        isValid: false,
        error: 'Password must contain at least one number'
      };
    }
    
    if (!hasSpecialChar) {
      return {
        isValid: false,
        error: 'Password must contain at least one special character'
      };
    }
    
    return {
      isValid: true,
      sanitizedValue: password
    };
  }

  // Numeric validáció
  public static validateNumber(input: string, min?: number, max?: number): ValidationResult {
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        error: 'Number is required'
      };
    }
    
    const num = parseFloat(input);
    
    if (isNaN(num)) {
      return {
        isValid: false,
        error: 'Invalid number format'
      };
    }
    
    if (min !== undefined && num < min) {
      return {
        isValid: false,
        error: `Number must be at least ${min}`
      };
    }
    
    if (max !== undefined && num > max) {
      return {
        isValid: false,
        error: `Number must be at most ${max}`
      };
    }
    
    return {
      isValid: true,
      sanitizedValue: num.toString()
    };
  }

  // Text validáció
  public static validateText(input: string, maxLength?: number, minLength?: number): ValidationResult {
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        error: 'Text is required'
      };
    }
    
    const sanitized = this.sanitizeHtml(input);
    
    if (minLength && sanitized.length < minLength) {
      return {
        isValid: false,
        error: `Text must be at least ${minLength} characters long`
      };
    }
    
    if (maxLength && sanitized.length > maxLength) {
      return {
        isValid: false,
        error: `Text must be at most ${maxLength} characters long`
      };
    }
    
    return {
      isValid: true,
      sanitizedValue: sanitized
    };
  }
}