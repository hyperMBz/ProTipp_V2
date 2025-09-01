/**
 * Input Validator - Input validáció kezelő
 * Fejlett input sanitizáció és biztonsági védelem
 */

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'number' | 'integer' | 'boolean' | 'date' | 'custom';
  value?: any;
  message: string;
  customValidator?: (value: any) => boolean;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData: Record<string, any>;
}

export interface SecurityConfig {
  xss_protection: boolean;
  sql_injection_protection: boolean;
  csrf_protection: boolean;
  max_input_length: number;
  allowed_html_tags: string[];
  blocked_patterns: RegExp[];
  sanitization_level: 'low' | 'medium' | 'high' | 'strict';
}

export interface InputValidatorConfig {
  enabled: boolean;
  security: SecurityConfig;
  default_rules: ValidationRule[];
  custom_validators: Record<string, (value: any) => boolean>;
}

class InputValidator {
  private static instance: InputValidator;
  private config: InputValidatorConfig;
  private xssPatterns: RegExp[];
  private sqlInjectionPatterns: RegExp[];
  private csrfTokens: Set<string>;

  private constructor() {
    this.config = {
      enabled: true,
      security: {
        xss_protection: true,
        sql_injection_protection: true,
        csrf_protection: true,
        max_input_length: 10000,
        allowed_html_tags: ['b', 'i', 'u', 'em', 'strong'],
        blocked_patterns: [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /vbscript:/gi,
          /expression\s*\(/gi
        ],
        sanitization_level: 'high'
      },
      default_rules: [
        {
          type: 'maxLength',
          value: 1000,
          message: 'A mező túl hosszú'
        }
      ],
      custom_validators: {}
    };

    this.xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /vbscript:/gi,
      /expression\s*\(/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
      /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi
    ];

    this.sqlInjectionPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|declare|cast|convert|openquery|opendatasource)\b)/gi,
      /(\b(and|or)\b\s+\d+\s*=\s*\d+)/gi,
      /(\b(and|or)\b\s+['"]\w+['"]\s*=\s*['"]\w+['"])/gi,
      /(\b(and|or)\b\s+\d+\s*=\s*['"]\w+['"])/gi,
      /(\b(and|or)\b\s+['"]\w+['"]\s*=\s*\d+)/gi,
      /(--|\/\*|\*\/|xp_|sp_)/gi,
      /(\b(union|select|insert|update|delete|drop|create|alter)\b\s+all\b)/gi,
      /(\b(union|select|insert|update|delete|drop|create|alter)\b\s+distinct\b)/gi
    ];

    this.csrfTokens = new Set();
  }

  public static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }

  /**
   * Input validálása séma alapján
   */
  validate(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: {},
      sanitizedData: {}
    };

    try {
      // Ellenőrizd, hogy a validáció engedélyezett-e
      if (!this.config.enabled) {
        result.sanitizedData = data;
        return result;
      }

      // Input méret ellenőrzése
      if (this.isInputTooLarge(data)) {
        result.isValid = false;
        result.errors['_general'] = ['Az input túl nagy'];
        return result;
      }

      // XSS védelem
      if (this.config.security.xss_protection) {
        data = this.sanitizeXSS(data);
      }

      // SQL injection védelem
      if (this.config.security.sql_injection_protection) {
        data = this.sanitizeSQLInjection(data);
      }

      // Séma validálás
      for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];
        const fieldErrors: string[] = [];

        for (const rule of rules) {
          if (!this.validateRule(value, rule)) {
            fieldErrors.push(rule.message);
          }
        }

        if (fieldErrors.length > 0) {
          result.isValid = false;
          result.errors[field] = fieldErrors;
        }

        // Sanitized érték mentése
        result.sanitizedData[field] = this.sanitizeValue(value);
      }

      // Nem definiált mezők hozzáadása
      for (const [field, value] of Object.entries(data)) {
        if (!schema[field]) {
          result.sanitizedData[field] = this.sanitizeValue(value);
        }
      }

    } catch (error) {
      console.error('Input validation error:', error);
      result.isValid = false;
      result.errors['_general'] = ['Validációs hiba történt'];
    }

    return result;
  }

  /**
   * Egyszerű érték validálása
   */
  validateValue(value: any, rules: ValidationRule[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of rules) {
      if (!this.validateRule(value, rule)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Input sanitizálása
   */
  sanitizeInput(input: any, level: 'low' | 'medium' | 'high' | 'strict' = 'high'): any {
    if (input === null || input === undefined) {
      return input;
    }

    if (typeof input === 'string') {
      return this.sanitizeString(input, level);
    }

    if (typeof input === 'object') {
      if (Array.isArray(input)) {
        return input.map(item => this.sanitizeInput(item, level));
      } else {
        const sanitized: Record<string, any> = {};
        for (const [key, value] of Object.entries(input)) {
          sanitized[key] = this.sanitizeInput(value, level);
        }
        return sanitized;
      }
    }

    return input;
  }

  /**
   * XSS védelem
   */
  sanitizeXSS(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeStringXSS(data);
    }

    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeXSS(item));
      } else {
        const sanitized: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = this.sanitizeXSS(value);
        }
        return sanitized;
      }
    }

    return data;
  }

  /**
   * SQL injection védelem
   */
  sanitizeSQLInjection(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeStringSQLInjection(data);
    }

    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeSQLInjection(item));
      } else {
        const sanitized: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = this.sanitizeSQLInjection(value);
        }
        return sanitized;
      }
    }

    return data;
  }

  /**
   * CSRF token generálása
   */
  generateCSRFToken(): string {
    const token = crypto.randomUUID();
    this.csrfTokens.add(token);
    return token;
  }

  /**
   * CSRF token validálása
   */
  validateCSRFToken(token: string): boolean {
    if (!this.config.security.csrf_protection) {
      return true;
    }

    const isValid = this.csrfTokens.has(token);
    if (isValid) {
      this.csrfTokens.delete(token); // One-time use
    }
    return isValid;
  }

  /**
   * Konfiguráció frissítése
   */
  updateConfig(newConfig: Partial<InputValidatorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Jelenlegi konfiguráció lekérése
   */
  getConfig(): InputValidatorConfig {
    return { ...this.config };
  }

  /**
   * Egyéni validátor hozzáadása
   */
  addCustomValidator(name: string, validator: (value: any) => boolean): void {
    this.config.custom_validators[name] = validator;
  }

  /**
   * Validátor szabály ellenőrzése
   */
  private validateRule(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== '';

      case 'minLength':
        return typeof value === 'string' && value.length >= (rule.value || 0);

      case 'maxLength':
        return typeof value === 'string' && value.length <= (rule.value || Infinity);

      case 'pattern':
        return typeof value === 'string' && new RegExp(rule.value).test(value);

      case 'email':
        return typeof value === 'string' && this.isValidEmail(value);

      case 'url':
        return typeof value === 'string' && this.isValidURL(value);

      case 'number':
        return !isNaN(Number(value)) && isFinite(Number(value));

      case 'integer':
        return Number.isInteger(Number(value));

      case 'boolean':
        return typeof value === 'boolean' || value === 'true' || value === 'false';

      case 'date':
        return !isNaN(Date.parse(value));

      case 'custom':
        return rule.customValidator ? rule.customValidator(value) : true;

      default:
        return true;
    }
  }

  /**
   * Email validálás
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * URL validálás
   */
  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Input méret ellenőrzése
   */
  private isInputTooLarge(data: any): boolean {
    const dataString = JSON.stringify(data);
    return dataString.length > this.config.security.max_input_length;
  }

  /**
   * String sanitizálás
   */
  private sanitizeString(input: string, level: 'low' | 'medium' | 'high' | 'strict'): string {
    let sanitized = input;

    switch (level) {
      case 'low':
        // Alapvető HTML entitások
        sanitized = sanitized
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
        break;

      case 'medium':
        // HTML entitások + alapvető script blokkolás
        sanitized = sanitized
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
        break;

      case 'high':
        // Teljes HTML sanitizálás, csak engedélyezett tagek
        sanitized = this.sanitizeHTML(sanitized);
        break;

      case 'strict':
        // Minden HTML és script eltávolítása
        sanitized = sanitized
          .replace(/<[^>]*>/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
        break;
    }

    return sanitized;
  }

  /**
   * HTML sanitizálás
   */
  private sanitizeHTML(input: string): string {
    // Blokkolt minták eltávolítása
    let sanitized = input;
    
    for (const pattern of this.config.security.blocked_patterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // XSS minták eltávolítása
    for (const pattern of this.xssPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // HTML entitások
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    // Engedélyezett tagek visszaállítása
    for (const tag of this.config.security.allowed_html_tags) {
      const openTag = new RegExp(`&lt;${tag}\\b[^&]*&gt;`, 'gi');
      const closeTag = new RegExp(`&lt;/${tag}&gt;`, 'gi');
      
      sanitized = sanitized.replace(openTag, (match) => {
        return match.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      });
      
      sanitized = sanitized.replace(closeTag, (match) => {
        return match.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      });
    }

    return sanitized;
  }

  /**
   * XSS string sanitizálás
   */
  private sanitizeStringXSS(input: string): string {
    let sanitized = input;

    // XSS minták eltávolítása
    for (const pattern of this.xssPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // HTML entitások
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return sanitized;
  }

  /**
   * SQL injection string sanitizálás
   */
  private sanitizeStringSQLInjection(input: string): string {
    let sanitized = input;

    // SQL injection minták eltávolítása
    for (const pattern of this.sqlInjectionPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Speciális karakterek escape-elése
    sanitized = sanitized
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_');

    return sanitized;
  }

  /**
   * Érték sanitizálása
   */
  private sanitizeValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return this.sanitizeString(value, this.config.security.sanitization_level);
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map(item => this.sanitizeValue(item));
      } else {
        const sanitized: Record<string, any> = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = this.sanitizeValue(val);
        }
        return sanitized;
      }
    }

    return value;
  }

  /**
   * Input validátor leállítása
   */
  destroy(): void {
    this.csrfTokens.clear();
  }
}

export const inputValidator = InputValidator.getInstance();
export default inputValidator;
