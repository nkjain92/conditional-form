import { headers } from 'next/headers';

export function getUserId(): string | null {
  const headersList = headers();
  return headersList.get('user-id');
}
