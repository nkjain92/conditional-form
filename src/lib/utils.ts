import { headers } from 'next/headers';

export async function getUserId(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('user-id');
}

// Helper function to validate form ID format
export function isValidFormId(id: string): boolean {
  return typeof id === 'string' && id.length > 0;
}

// Helper function to validate theme data
export function isValidThemeData(data: any): boolean {
  return (
    typeof data.name === 'string' &&
    data.name.length > 0 &&
    typeof data.maxVotes === 'number' &&
    data.maxVotes > 0
  );
}

// Helper function to sanitize theme name
export function sanitizeThemeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-');
}
