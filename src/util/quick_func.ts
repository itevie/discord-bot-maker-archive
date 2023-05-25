const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');

export function randomID(length: number): string {
  let result = '';

  for (let i = 0; i !== length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}
