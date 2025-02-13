import { headers } from 'next/headers';
import { ThemeData, ValidationResult } from './types';

export async function getUserId(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('user-id');
}

// Helper function to validate theme data
export function validateThemeData(data: unknown): ValidationResult {
  if (
    typeof data !== 'object' ||
    data === null ||
    typeof (data as ThemeData).name !== 'string' ||
    !(data as ThemeData).name.length ||
    typeof (data as ThemeData).maxVotes !== 'number' ||
    (data as ThemeData).maxVotes <= 0
  ) {
    return {
      isValid: false,
      error:
        'Invalid theme data. Name must be a non-empty string and maxVotes must be a positive number.',
    };
  }
  return { isValid: true };
}

// Helper function to sanitize theme name
export function sanitizeThemeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-');
}

// Helper function to generate unique ID
export function generateId(prefix: string, name: string): string {
  return `${prefix}-${sanitizeThemeName(name)}-${Date.now()}`;
}
