import type { ScValType, FunctionArgument } from '../types'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Validate a single argument based on its ScVal type
 */
export function validateArgument(arg: FunctionArgument): ValidationError | null {
  const { name, type, value } = arg

  // Empty check for required types
  if (!value || value.trim() === '') {
    if (type === 'Void') {
      return null // Void type doesn't need a value
    }
    return {
      field: name,
      message: `${name} is required`,
    }
  }

  switch (type) {
    case 'Address':
      return validateAddress(name, value)
    
    case 'i128':
    case 'u128':
    case 'i64':
    case 'u64':
    case 'i32':
    case 'u32':
      return validateNumber(name, value, type)
    
    case 'Bool':
      return validateBool(name, value)
    
    case 'String':
      return validateString(name, value)
    
    case 'Symbol':
      return validateSymbol(name, value)
    
    case 'Bytes':
      return validateBytes(name, value)
    
    case 'Vec':
      return validateVec(name, value)
    
    case 'Map':
      return validateMap(name, value)
    
    case 'Void':
      return null
    
    default:
      return null
  }
}

/**
 * Validate all arguments for a function
 */
export function validateArguments(args: FunctionArgument[]): ValidationResult {
  const errors: ValidationError[] = []

  for (const arg of args) {
    const error = validateArgument(arg)
    if (error) {
      errors.push(error)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function validateAddress(field: string, value: string): ValidationError | null {
  const trimmed = value.trim()
  
  // Stellar addresses start with G (account) or C (contract)
  if (!trimmed.startsWith('G') && !trimmed.startsWith('C')) {
    return {
      field,
      message: 'Address must start with G (account) or C (contract)',
    }
  }

  // Basic length check (Stellar addresses are 56 characters)
  if (trimmed.length !== 56) {
    return {
      field,
      message: 'Address must be exactly 56 characters long',
    }
  }

  // Check for valid base32 characters
  const base32Regex = /^[A-Z2-7]+$/
  if (!base32Regex.test(trimmed)) {
    return {
      field,
      message: 'Address contains invalid characters (must be uppercase A-Z and 2-7)',
    }
  }

  return null
}

function validateNumber(field: string, value: string, type: ScValType): ValidationError | null {
  const trimmed = value.trim()
  
  // Check if it's a valid number format
  const numberRegex = /^-?\d+$/
  if (!numberRegex.test(trimmed)) {
    return {
      field,
      message: 'Must be a valid integer (no decimals or non-numeric characters)',
    }
  }

  try {
    const num = BigInt(trimmed)
    
    // Define ranges for each type
    const ranges: Record<string, { min: bigint; max: bigint }> = {
      i128: { 
        min: -(2n ** 127n), 
        max: 2n ** 127n - 1n 
      },
      u128: { 
        min: 0n, 
        max: 2n ** 128n - 1n 
      },
      i64: { 
        min: -(2n ** 63n), 
        max: 2n ** 63n - 1n 
      },
      u64: { 
        min: 0n, 
        max: 2n ** 64n - 1n 
      },
      i32: { 
        min: -(2n ** 31n), 
        max: 2n ** 31n - 1n 
      },
      u32: { 
        min: 0n, 
        max: 2n ** 32n - 1n 
      },
    }

    const range = ranges[type]
    if (!range) {
      return null
    }

    if (num < range.min || num > range.max) {
      return {
        field,
        message: `Value out of range for ${type} (${range.min} to ${range.max})`,
      }
    }

    // Check for unsigned types
    if (type.startsWith('u') && num < 0n) {
      return {
        field,
        message: `${type} must be non-negative`,
      }
    }

    return null
  } catch (err) {
    return {
      field,
      message: 'Invalid number format',
    }
  }
}

function validateBool(field: string, value: string): ValidationError | null {
  const lower = value.toLowerCase().trim()
  if (lower !== 'true' && lower !== 'false') {
    return {
      field,
      message: 'Must be either "true" or "false"',
    }
  }
  return null
}

function validateString(field: string, value: string): ValidationError | null {
  // Strings are generally flexible, just check it's not empty
  if (value.trim().length === 0) {
    return {
      field,
      message: 'String cannot be empty',
    }
  }
  return null
}

function validateSymbol(field: string, value: string): ValidationError | null {
  const trimmed = value.trim()
  
  // Symbols should be lowercase with underscores
  const symbolRegex = /^[a-z_][a-z0-9_]*$/
  if (!symbolRegex.test(trimmed)) {
    return {
      field,
      message: 'Symbol must be lowercase letters, numbers, and underscores only (start with letter or underscore)',
    }
  }

  if (trimmed.length > 32) {
    return {
      field,
      message: 'Symbol must be 32 characters or less',
    }
  }

  return null
}

function validateBytes(field: string, value: string): ValidationError | null {
  const trimmed = value.trim()
  
  // Must start with 0x
  if (!trimmed.startsWith('0x')) {
    return {
      field,
      message: 'Bytes must start with "0x"',
    }
  }

  // Check hex characters
  const hexRegex = /^0x[0-9a-fA-F]*$/
  if (!hexRegex.test(trimmed)) {
    return {
      field,
      message: 'Bytes must contain only hexadecimal characters (0-9, a-f, A-F)',
    }
  }

  // Must have even number of hex digits
  const hexPart = trimmed.slice(2)
  if (hexPart.length % 2 !== 0) {
    return {
      field,
      message: 'Bytes must have an even number of hexadecimal digits',
    }
  }

  return null
}

function validateVec(field: string, value: string): ValidationError | null {
  const trimmed = value.trim()
  
  try {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) {
      return {
        field,
        message: 'Vec must be a valid JSON array (e.g., [1, 2, 3])',
      }
    }
    return null
  } catch (err) {
    return {
      field,
      message: 'Vec must be valid JSON array format',
    }
  }
}

function validateMap(field: string, value: string): ValidationError | null {
  const trimmed = value.trim()
  
  try {
    const parsed = JSON.parse(trimmed)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {
        field,
        message: 'Map must be a valid JSON object (e.g., {"key": "value"})',
      }
    }
    return null
  } catch (err) {
    return {
      field,
      message: 'Map must be valid JSON object format',
    }
  }
}
