const FORBIDDEN_TERMS = [
  'explicit',
  'nsfw',
  'offensive',
  'inappropriate',
  'hate',
  'violence',
  'gore'
];

const MAX_PROMPT_LENGTH = 200;

class PromptValidator {
  /**
   * Validate a custom prompt for style blending
   * @param {string} prompt - The custom prompt to validate
   * @returns {Object} Validation result with status and message
   */
  static validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      return {
        valid: false,
        error: 'Invalid prompt format'
      };
    }

    // Check length
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return {
        valid: false,
        error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`
      };
    }

    // Check for forbidden terms
    const hasForbiddenTerms = FORBIDDEN_TERMS.some(term => 
      prompt.toLowerCase().includes(term)
    );

    if (hasForbiddenTerms) {
      return {
        valid: false,
        error: 'Prompt contains inappropriate content'
      };
    }

    // Check for minimum content
    if (prompt.trim().length < 3) {
      return {
        valid: false,
        error: 'Prompt is too short'
      };
    }

    return { valid: true };
  }

  /**
   * Sanitize a prompt by removing potentially problematic characters
   * @param {string} prompt - The prompt to sanitize
   * @returns {string} Sanitized prompt
   */
  static sanitizePrompt(prompt) {
    return prompt
      .trim()
      .replace(/[<>{}]/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Combine base style with custom prompt
   * @param {string} baseStyle - The base style prompt
   * @param {string} customPrompt - The custom prompt to blend
   * @returns {string} Combined prompt
   */
  static combinePrompts(baseStyle, customPrompt) {
    const sanitizedCustom = this.sanitizePrompt(customPrompt);
    return `${baseStyle}, ${sanitizedCustom}`;
  }
}

module.exports = PromptValidator; 