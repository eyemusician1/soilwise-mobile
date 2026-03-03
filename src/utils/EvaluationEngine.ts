// src/utils/EvaluationEngine.ts

export interface ParameterRating {
  rating: number;
  classification: string;
  subclass: string;
}

export interface EvaluationResult {
  lsi: number;
  lsc: string;
  fullClassification: string;
  limitingFactors: string;
  parameterRatings: Record<string, ParameterRating>;
}

export default class EvaluationEngine {
  
  // Maps UI form keys to JSON requirement paths [category, parameter]
  static PARAMETER_MAPPING: Record<string, [string, string]> = {
    temperature: ["climate_requirements", "mean_annual_temp_c"],
    rainfall: ["climate_requirements", "annual_precipitation_mm"],
    humidity: ["climate_requirements", "mean_relative_humidity_driest_month_pct"],
    slope: ["topography_requirements", "slope_pct"],
    drainage: ["wetness_requirements", "drainage"],
    flooding: ["wetness_requirements", "flooding"],
    texture: ["physical_soil_requirements", "texture"],
    soilDepth: ["physical_soil_requirements", "soil_depth_cm"],
    coarseFragments: ["physical_soil_requirements", "coarse_fragments_pct"],
    caco3: ["physical_soil_requirements", "caco3_pct"],
    gypsum: ["physical_soil_requirements", "gypsum_pct"],
    ph: ["soil_fertility_requirements", "ph_h2o"],
    organicCarbon: ["soil_fertility_requirements", "organic_carbon_pct"],
    baseSaturation: ["soil_fertility_requirements", "base_saturation_pct"],
    basicCations: ["soil_fertility_requirements", "sum_basic_cations_cmol_kg"],
    cec: ["soil_fertility_requirements", "apparent_cec_cmol_kg_clay"],
    ece: ["salinity_alkalinity_requirements", "ece_ds_m"],
    esp: ["salinity_alkalinity_requirements", "esp_pct"],
  };

  /**
   * The Square Root Method Formula
   * LSI = Rmin * sqrt(product of ALL ratings) * 100
   */
  static calculateLSI(ratings: number[]): number {
    if (!ratings || ratings.length === 0) return 0.0;

    const rmin = Math.min(...ratings);
    const product = ratings.reduce((acc, curr) => acc * curr, 1);
    const sqrtProduct = Math.sqrt(product);
    
    const lsi = rmin * sqrtProduct * 100;
    return Number(lsi.toFixed(2));
  }

  static classifyLSI(lsi: number): string {
    if (lsi >= 75) return "S1";
    if (lsi >= 50) return "S2";
    if (lsi >= 25) return "S3";
    return "N";
  }

  static getSubclassCode(category: string): string {
    const mapping: Record<string, string> = {
      climate_requirements: "c",
      topography_requirements: "t",
      wetness_requirements: "w",
      physical_soil_requirements: "s",
      soil_fertility_requirements: "f",
      salinity_alkalinity_requirements: "n"
    };
    return mapping[category] || "";
  }

  static getClassificationFromKey(key: string): string {
    if (key.startsWith("S1")) return "S1";
    if (key.startsWith("S2")) return "S2";
    if (key.startsWith("S3")) return "S3";
    if (key.startsWith("N")) return "N";
    return key;
  }

  static getSlopeRating(cropName: string, slopeValue: number, cropData: any): ParameterRating {
    const subclass = "t";
    const topoReqs = cropData?.topography_requirements?.slope_pct;
    
    if (!topoReqs) return { rating: 0.25, classification: "N", subclass };

    // Direct Structure (e.g. Oil Palm, Banana)
    const hasDirectStructure = Object.keys(topoReqs).some(k => k.startsWith('S') || k.startsWith('N'));
    let targetObj = hasDirectStructure ? topoReqs : topoReqs.level1;

    if (!targetObj) return { rating: 0.25, classification: "N", subclass };

    for (const [key, spec] of Object.entries<any>(targetObj)) {
      if (spec.range) {
        const minVal = spec.range[0] === null ? -Infinity : spec.range[0];
        const maxVal = spec.range[1] === null ? Infinity : spec.range[1];
        
        if (slopeValue >= minVal && slopeValue <= maxVal) {
          return {
            rating: spec.rating,
            classification: this.getClassificationFromKey(key),
            subclass
          };
        }
      }
    }
    return { rating: 0.25, classification: "N", subclass };
  }

  static getParameterRequirement(cropData: any, category: string, parameter: string, season: string | null) {
    if (cropData.seasonal && season) {
      const seasonData = cropData.seasons?.[season];
      if (seasonData && category === 'climate_requirements') {
        return seasonData[category]?.[parameter];
      }
    }
    return cropData[category]?.[parameter];
  }

  static getParameterRating(
    cropName: string,
    category: string,
    parameter: string,
    value: number | string,
    cropData: any,
    season: string | null,
    clayActivity: string
  ): ParameterRating {
    
    const subclass = this.getSubclassCode(category);
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Special Case 1: Slope
    if (parameter === "slope_pct") {
      return this.getSlopeRating(cropName, isNaN(numValue) ? 0 : numValue, cropData);
    }

    // Special Case 2: CEC = 16 boundary condition
    if (parameter === "apparent_cec_cmol_kg_clay" && numValue === 16.0) {
      const specialCrops = ["Oil Palm", "Robusta Coffee"];
      const isSpecial = specialCrops.includes(cropName);

      if (clayActivity.includes("Low")) {
        return isSpecial 
          ? { rating: 0.95, classification: "S1", subclass } 
          : { rating: 0.85, classification: "S2", subclass };
      } else if (clayActivity.includes("High")) {
        return isSpecial 
          ? { rating: 0.85, classification: "S2", subclass } 
          : { rating: 0.60, classification: "S3", subclass };
      } else {
        return { rating: 0.85, classification: "S2", subclass }; // Default unknown
      }
    }

    // Standard Parameter Evaluation
    const requirements = this.getParameterRequirement(cropData, category, parameter, season);
    
    if (!requirements) {
      return { rating: 1.0, classification: "S1", subclass }; // Default to S1 if no requirement listed
    }

    for (const [key, spec] of Object.entries<any>(requirements)) {
      // Numerical Range check
      if (spec.range && !isNaN(numValue)) {
        const minVal = spec.range[0] === null ? -Infinity : spec.range[0];
        const maxVal = spec.range[1] === null ? Infinity : spec.range[1];
        if (numValue >= minVal && numValue <= maxVal) {
          return { rating: spec.rating, classification: this.getClassificationFromKey(key), subclass };
        }
      }
      // String Exact Value Check (e.g. Textures, Drainage)
      else if (spec.values && typeof value === 'string') {
        // Strip out descriptions from UI dropdowns (e.g., "C - Clay" -> "C")
        const cleanValue = value.split(' - ')[0].trim();
        if (spec.values.includes(cleanValue)) {
          return { rating: spec.rating, classification: this.getClassificationFromKey(key), subclass };
        }
      }
    }

    // Fallback if no match found
    return { rating: 1.0, classification: "S1", subclass };
  }

  static identifyLimitingFactors(parameterRatings: Record<string, ParameterRating>): string {
    const ratingsArray = Object.values(parameterRatings);
    if (ratingsArray.length === 0) return "";

    const minRating = Math.min(...ratingsArray.map(r => r.rating));
    
    // If lowest rating is S1 (0.95 or 1.0), there are no limiting factors
    if (minRating >= 0.95) return "";

    const subclasses = new Set<string>();
    const threshold = 0.001;

    for (const { rating, subclass } of ratingsArray) {
      if (Math.abs(rating - minRating) < threshold && subclass) {
        subclasses.add(subclass);
      }
    }

    // Sort alphabetically and combine (e.g. "t", "f" -> "ft")
    return Array.from(subclasses).sort().join('');
  }

  /**
   * Main Evaluation Entry Point
   */
  static evaluate(cropName: string, soilData: Record<string, any>, cropData: any, season: string | null): EvaluationResult {
    const parameterRatings: Record<string, ParameterRating> = {};
    const ratingsList: number[] = [];

    const clayActivity = soilData.clayActivity || "unknown";

    // Loop through our form data and map it to JSON requirements
    for (const [formKey, value] of Object.entries(soilData)) {
      
      // Skip empty inputs or unmapped fields
      if (!this.PARAMETER_MAPPING[formKey] || value === "" || value === undefined) continue;

      const [category, parameter] = this.PARAMETER_MAPPING[formKey];
      
      const result = this.getParameterRating(cropName, category, parameter, value, cropData, season, clayActivity);
      
      parameterRatings[formKey] = result;
      ratingsList.push(result.rating);
    }

    const lsi = this.calculateLSI(ratingsList);
    const lsc = this.classifyLSI(lsi);
    const limitingFactors = this.identifyLimitingFactors(parameterRatings);
    const fullClassification = limitingFactors ? `${lsc}${limitingFactors}` : lsc;

    return {
      lsi,
      lsc,
      fullClassification,
      limitingFactors,
      parameterRatings
    };
  }
}