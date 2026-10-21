import type { Macros } from '@/db/types';
import { getLocale, getT } from '@/shared/i18n';
import { ApiError } from './client';

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product';
const CODE_PATTERN = /^\d{6,14}$/;

/**
 * Open Food Facts limits product lookups to 15/min *per IP*. Proxying through a
 * serverless function would funnel every user onto a handful of shared
 * datacenter IPs and trip that limit collectively, so this call goes straight
 * from the device: the quota then applies per user, which is far more than one
 * person scanning groceries will ever use.
 *
 * The data is public and keyless, so nothing is exposed by calling it directly.
 */
const HEADERS = {
  // Browsers forbid setting User-Agent; OFF reads X-User-Agent instead.
  'X-User-Agent': 'Yomiq/1.0 (github.com/yomiq-app) - PWA calorie tracker',
};

export type BarcodeProduct = { name: string; per100: Macros };

type OffResponse = {
  status?: number;
  product?: {
    product_name?: string;
    [localized: `product_name_${string}`]: string | undefined;
    brands?: string;
    nutriments?: Record<string, number | string | undefined>;
  };
};

export async function lookupBarcode(code: string): Promise<BarcodeProduct> {
  const t = getT();
  if (!CODE_PATTERN.test(code)) throw new ApiError(t.errors.barcodeInvalid, 400);
  if (!navigator.onLine) throw new ApiError(t.errors.barcodeOffline, 0);

  let response: Response;
  try {
    const fields = `product_name,product_name_${getLocale()},brands,nutriments`;
    response = await fetch(`${OFF_BASE}/${code}.json?fields=${fields}`, { headers: HEADERS });
  } catch {
    throw new ApiError(t.errors.barcodeUnreachable, 0);
  }

  if (response.status === 429 || response.status === 503) {
    throw new ApiError(t.errors.barcodeBusy, response.status);
  }
  if (!response.ok) {
    throw new ApiError(t.errors.barcodeError(response.status), response.status);
  }

  const data = (await response.json().catch(() => ({}))) as OffResponse;
  if (data.status !== 1 || !data.product) {
    throw new ApiError(t.errors.barcodeNotFound, 404);
  }

  const nutriments = data.product.nutriments ?? {};
  const kcal = num(nutriments['energy-kcal_100g']);
  if (kcal === null) {
    throw new ApiError(t.errors.barcodeNoNutrition, 422);
  }

  return {
    name: buildName(
      data.product.brands,
      data.product[`product_name_${getLocale()}`] || data.product.product_name,
    ) || t.errors.product(code),
    per100: {
      kcal: clamp(kcal, 0, 900),
      protein: clamp(num(nutriments['proteins_100g']) ?? 0, 0, 100),
      fat: clamp(num(nutriments['fat_100g']) ?? 0, 0, 100),
      carbs: clamp(num(nutriments['carbohydrates_100g']) ?? 0, 0, 100),
    },
  };
}

/** Skips the brand when the product name already carries it ("Nutella — Nutella"). */
function buildName(brands: string | undefined, productName: string | undefined): string {
  const brand = brands?.split(',')[0]?.trim();
  const name = productName?.trim();

  if (brand && name && !name.toLowerCase().includes(brand.toLowerCase())) {
    return `${brand} — ${name}`.slice(0, 60);
  }
  return (name || brand || '').slice(0, 60);
}

function num(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
