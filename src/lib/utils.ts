import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely get an item from localStorage
 * @param key The key to get from localStorage
 * @param defaultValue The default value to return if localStorage is not available or the key doesn't exist
 */
export function safeLocalStorageGet(key: string, defaultValue = ""): string {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage
 * @param key The key to set in localStorage
 * @param value The value to set
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error);
    return false;
  }
}
