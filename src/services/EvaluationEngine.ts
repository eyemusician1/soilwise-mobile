export class EvaluationEngine {
  private currentClayActivity: 'low' | 'high' | 'unknown' = 'unknown';

  /**
   * Translates the Python calculate_lsi logic.
   * FORMULA: LSI = Rmin * sqrt(product of ALL ratings) * 100
   */
  public calculateLSI(ratings: number[]): number {
    if (!ratings || ratings.length === 0) return 0.0;

    const rmin = Math.min(...ratings);
    const product = ratings.reduce((acc, curr) => acc * curr, 1);
    const sqrtProduct = Math.sqrt(product);
    
    // Calculate and round to 2 decimal places to match Python exactly
    const lsi = rmin * sqrtProduct * 100;
    return Math.round((lsi + Number.EPSILON) * 100) / 100;
  }

  public classifyLSI(lsi: number): string {
    if (lsi >= 75) return "S1";
    if (lsi >= 50) return "S2";
    if (lsi >= 25) return "S3";
    return "N";
  }

  /**
   * Extracts limiting factors from parameter ratings.
   */
  public identifyLimitingFactors(
    parameterRatings: Record<string, { rating: number; classification: string; subclass: string }>
  ): string {
    const ratings = Object.values(parameterRatings);
    if (ratings.length === 0) return "";

    const minRating = Math.min(...ratings.map(r => r.rating));
    const limitingSubclasses = new Set<string>();
    const threshold = 0.001;

    for (const data of ratings) {
      if (Math.abs(data.rating - minRating) < threshold && data.subclass) {
        limitingSubclasses.add(data.subclass);
      }
    }

    // Sort and join (e.g., "cf" for Climate and Fertility)
    return Array.from(limitingSubclasses).sort().join("");
  }

  /**
   * Parses the stringified JSON from WatermelonDB to evaluate a single parameter.
   */
  public getParameterRating(
    cropName: string,
    parameter: string,
    value: number,
    requirementsJson: string, // The raw JSON string from DB
    category: string,
    season?: string
  ): { rating: number; classification: string; subclass: string } {
    
    const cropData = JSON.parse(requirementsJson);
    const subclass = this.getSubclassCode(category);

    // --- EDGE CASE 1: CEC & Clay Activity ---
    if (parameter === 'apparent_cec_cmol_kg_clay' && value === 16.0) {
      const specialCrops = ["Oil Palm", "Robusta Coffee"];
      if (this.currentClayActivity === 'low') {
        return specialCrops.includes(cropName) 
          ? { rating: 0.95, classification: 'S1', subclass } 
          : { rating: 0.85, classification: 'S2', subclass };
      } else if (this.currentClayActivity === 'high') {
        return specialCrops.includes(cropName) 
          ? { rating: 0.85, classification: 'S2', subclass } 
          : { rating: 0.60, classification: 'S3', subclass };
      }
      return { rating: 0.85, classification: 'S2', subclass }; // Fallback
    }

    // Traverse the JSON based on whether it is seasonal or not
    let categoryData = cropData[category];
    if (cropData.seasonal && season) {
      categoryData = cropData.seasons?.[season]?.[category] || categoryData;
    }

    if (!categoryData || !categoryData[parameter]) {
      // Default to S1 if no specific rule exists
      return { rating: 1.0, classification: 'S1', subclass };
    }

    const reqs = categoryData[parameter];

    // Evaluate against JSON rules
    for (const [key, spec] of Object.entries<any>(reqs)) {
      if (spec.range) {
        const minVal = spec.range[0] ?? -Infinity;
        const maxVal = spec.range[1] ?? Infinity;
        if (value >= minVal && value <= maxVal) {
          return { 
            rating: spec.rating, 
            classification: this.extractClassification(key), 
            subclass 
          };
        }
      } else if (spec.values && spec.values.includes(String(value))) {
        return { 
          rating: spec.rating, 
          classification: this.extractClassification(key), 
          subclass 
        };
      }
    }

    return { rating: 1.0, classification: 'S1', subclass };
  }

  // Helpers
  private getSubclassCode(category: string): string {
    const map: Record<string, string> = {
      climate_requirements: 'c', topography_requirements: 't',
      wetness_requirements: 'w', physical_soil_requirements: 's',
      soil_fertility_requirements: 'f', salinity_alkalinity_requirements: 'n'
    };
    return map[category] || '';
  }

  private extractClassification(key: string): string {
    return key.split('_')[0]; // Converts "S1_0" to "S1"
  }
}