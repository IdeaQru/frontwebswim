// time-utils.ts
export function parsePrelimit(prelimit: string): string {
  if (!prelimit) {
    return 'No time recorded';
  }

  const parts = prelimit.split(':');
  if (parts.length !== 3) {
    return 'Invalid time format';
  }

  const [menit, detik, milidetik] = parts;
  return `${menit.padStart(2, '0')}:${detik.padStart(2, '0')}:${milidetik.padStart(2, '0')}`;
}
