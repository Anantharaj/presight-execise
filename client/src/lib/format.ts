const numberFormatter = new Intl.NumberFormat();

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function initials(...parts: string[]): string {
  return parts
    .map((part) => part.trim().charAt(0))
    .join('')
    .toUpperCase();
}
