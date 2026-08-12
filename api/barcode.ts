import { checkAccess, fail, json } from './_shared.js';

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS = 'product_name,brands,nutriments';
const CODE_PATTERN = /^\d{6,14}$/;

type OffResponse = {
  status: number;
  product?: {
    product_name?: string;
    brands?: string;
    nutriments?: Record<string, number>;
  };
};

export async function GET(request: Request): Promise<Response> {
  const blocked = checkAccess(request);
  if (blocked) return blocked;

  const code = new URL(request.url).searchParams.get('code')?.trim() ?? '';
  if (!CODE_PATTERN.test(code)) return fail('Invalid barcode.', 400);

  let upstream: Response;
  try {
    upstream = await fetch(`${OFF_BASE}/${code}.json?fields=${FIELDS}`, {
      // Open Food Facts asks integrators to identify themselves in the User-Agent.
      headers: { 'User-Agent': 'Yomiq/1.0 (+https://github.com/) - calorie tracker PWA' },
    });
  } catch {
    return fail('Could not reach the barcode database.', 502);
  }

  if (!upstream.ok) return fail('Barcode database is unavailable.', 502);

  const data = (await upstream.json()) as OffResponse;
  if (data.status !== 1 || !data.product) {
    return fail('Product not found for this barcode.', 404);
  }

  const n = data.product.nutriments ?? {};
  const kcal = n['energy-kcal_100g'];
  if (typeof kcal !== 'number') {
    return fail('No nutrition data for this product.', 404);
  }

  const brand = data.product.brands?.split(',')[0]?.trim();
  const productName = data.product.product_name?.trim();
  const name = (
    brand && productName && !productName.toLowerCase().includes(brand.toLowerCase())
      ? `${brand} — ${productName}`
      : (productName ?? brand ?? '')
  ).slice(0, 60);

  return json({
    name: name || `Product ${code}`,
    per100: {
      kcal,
      protein: n['proteins_100g'] ?? 0,
      fat: n['fat_100g'] ?? 0,
      carbs: n['carbohydrates_100g'] ?? 0,
    },
  });
}
