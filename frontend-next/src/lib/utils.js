import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function combining clsx and tailwind-merge
 * for conditional and conflict-free Tailwind class composition.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
