/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: getPasswordStrength(password)
  };
};

/**
 * Get password strength score
 */
const getPasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

/**
 * Validate required fields
 */
export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, minLength, fieldName) => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value, maxLength, fieldName) => {
  if (value && value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters long`;
  }
  return null;
};

/**
 * Validate URL format
 */
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate file type
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 */
export const validateFileSize = (file, maxSizeInMB) => {
  if (!file) return false;
  return file.size <= maxSizeInMB * 1024 * 1024;
};

/**
 * Comprehensive form validation
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    fieldRules.forEach(rule => {
      if (errors[field]) return; // Skip if field already has error
      
      let error = null;
      
      switch (rule.type) {
        case 'required':
          error = validateRequired(value, rule.message || field);
          break;
        case 'email':
          if (value && !isValidEmail(value)) {
            error = rule.message || 'Invalid email format';
          }
          break;
        case 'minLength':
          error = validateMinLength(value, rule.value, rule.message || field);
          break;
        case 'maxLength':
          error = validateMaxLength(value, rule.value, rule.message || field);
          break;
        case 'password':
          if (value) {
            const validation = validatePassword(value);
            if (!validation.isValid) {
              error = validation.errors[0];
            }
          }
          break;
        case 'custom':
          if (rule.validator && typeof rule.validator === 'function') {
            error = rule.validator(value, data);
          }
          break;
      }
      
      if (error) {
        errors[field] = error;
      }
    });
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
