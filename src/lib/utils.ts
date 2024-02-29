import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColorClassName(score: number) {
  if (score <= 1.275) {
    return 'bg-green-500';
  } else if (score <= 1.6) {
    return 'bg-yellow-500';
  }

  return 'bg-red-500';
}