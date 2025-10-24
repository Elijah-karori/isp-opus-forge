import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const pathCorrections: { [key: string]: string } = {
  "/finance/payments": "/finance/payouts",
  // Add other path corrections here as needed
};

export function correctMenuPaths(menuItems: any[]): any[] {
  if (!Array.isArray(menuItems)) {
    return [];
  }
  return menuItems.map(item => {
    const correctedPath = pathCorrections[item.path];
    if (correctedPath) {
      return { ...item, path: correctedPath };
    }
    return item;
  });
}
