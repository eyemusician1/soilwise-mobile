// src/services/evaluationLogic.ts

/**
 * Calculates LSI using the Square Root Method:
 * LSI = Rmin * sqrt(product of ALL ratings) * 100
 */
export function calculateLSI(ratings: number[]): number {
  if (!ratings || ratings.length === 0) {
    console.error("No ratings provided to calculateLSI");
    return 0.0;
  }

  // Step 1: Find Rmin
  const rmin = Math.min(...ratings);

  // Step 2: Calculate product of ALL ratings
  const product = ratings.reduce((acc, curr) => acc * curr, 1);

  // Step 3: Square root
  const sqrtProduct = Math.sqrt(product);

  // Step 4: Calculate LSI
  const lsi = rmin * sqrtProduct * 100;

  // Round to 2 decimal places exactly like the Python backend
  return Math.round(lsi * 100) / 100;
}

/**
 * Classify LSI into suitability class.
 */
export function classifyLSI(lsi: number): string {
  if (lsi >= 75) return "S1";
  if (lsi >= 50) return "S2";
  if (lsi >= 25) return "S3";
  return "N";
}

/**
 * Extracts limiting factors from parameter ratings.
 * Expected input format: { "ph": { rating: 0.85, classification: "S2", subclass: "f" }, ... }
 */
export function identifyLimitingFactors(
  parameterRatings: Record<string, { rating: number; classification: string; subclass: string }>
): string {
  const ratings = Object.values(parameterRatings);
  if (ratings.length === 0) return "";

  const minRating = Math.min(...ratings.map(r => r.rating));
  const limitingSubclasses = new Set<string>();
  const threshold = 0.001;

  for (const [paramName, data] of Object.entries(parameterRatings)) {
    if (Math.abs(data.rating - minRating) < threshold && data.subclass) {
      limitingSubclasses.add(data.subclass);
    }
  }

  // Sort and join (e.g., "cf" for Climate and Fertility)
  return Array.from(limitingSubclasses).sort().join("");
}