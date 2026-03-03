import { database } from '../database';
import Crop from '../database/models/Crop';
import Evaluation from '../database/models/Evaluation';
import { EvaluationEngine } from './EvaluationEngine';

// Matches the exact mapping from your Python rules_engine.py
const parameterMapping: Record<string, [string, string]> = {
  temperature: ["climate_requirements", "mean_annual_temp_c"],
  rainfall: ["climate_requirements", "annual_precipitation_mm"],
  humidity: ["climate_requirements", "mean_relative_humidity_driest_month_pct"],
  slope: ["topography_requirements", "slope_pct"],
  drainage: ["wetness_requirements", "drainage"],
  flooding: ["wetness_requirements", "flooding"],
  texture: ["physical_soil_requirements", "texture"],
  soil_depth: ["physical_soil_requirements", "soil_depth_cm"],
  coarse_fragments: ["physical_soil_requirements", "coarse_fragments_pct"],
  caco3: ["physical_soil_requirements", "caco3_pct"],
  gypsum: ["physical_soil_requirements", "gypsum_pct"],
  ph: ["soil_fertility_requirements", "ph_h2o"],
  organic_carbon: ["soil_fertility_requirements", "organic_carbon_pct"],
  base_saturation: ["soil_fertility_requirements", "base_saturation_pct"],
  sum_basic_cations: ["soil_fertility_requirements", "sum_basic_cations_cmol_kg"],
  cec: ["soil_fertility_requirements", "apparent_cec_cmol_kg_clay"],
  ec: ["salinity_alkalinity_requirements", "ece_ds_m"],
  esp: ["salinity_alkalinity_requirements", "esp_pct"],
};

export async function evaluateAllCropsAndSave(
  soilData: Record<string, any>, 
  season?: string
): Promise<void> {
  const engine = new EvaluationEngine();
  
  // 1. Fetch all crops directly from the local SQLite database (no internet required)
  const cropsCollection = database.get<Crop>('crops');
  const allCrops = await cropsCollection.query().fetch();

  const evaluationsToSave: any[] = [];

  // 2. Loop through every crop to calculate suitability
  for (const crop of allCrops) {
    const parameterRatings: Record<string, { rating: number; classification: string; subclass: string }> = {};
    const ratingsList: number[] = [];

    // Evaluate each inputted soil parameter against this crop's rules
    for (const [soilKey, value] of Object.entries(soilData)) {
      if (parameterMapping[soilKey] && value !== undefined && value !== null) {
        const [category, parameter] = parameterMapping[soilKey];
        
        try {
          const result = engine.getParameterRating(
            crop.cropName,
            parameter,
            value,
            crop.requirementsJson, // The stringified JSON we seeded earlier!
            category,
            season
          );

          parameterRatings[soilKey] = result;
          ratingsList.push(result.rating);
        } catch (error) {
          console.error(`Error evaluating ${soilKey} for ${crop.cropName}:`, error);
        }
      }
    }

    // 3. Math calculations mirroring the Python backend
    const lsi = ratingsList.length > 0 ? engine.calculateLSI(ratingsList) : 0.0;
    const lsc = engine.classifyLSI(lsi);
    const limitingFactors = engine.identifyLimitingFactors(parameterRatings);
    const fullClassification = limitingFactors ? `${lsc}${limitingFactors}` : lsc;

    // 4. Prepare the database insert action
    const evaluationsCollection = database.get<Evaluation>('evaluation_results');
    
    // We use prepareCreate instead of create so we can batch them all at once for performance
    evaluationsToSave.push(
      evaluationsCollection.prepareCreate((evalRecord) => {
        // Generate a random ID to act as the offline session input ID
        evalRecord.inputId = `input_${Date.now()}_${Math.floor(Math.random() * 1000)}`; 
        evalRecord.cropId = crop.cropId;
        evalRecord.season = season || null;
        evalRecord.lsi = lsi;
        evalRecord.lsc = lsc;
        evalRecord.fullClassification = fullClassification;
        evalRecord.limitingFactors = limitingFactors;
        evalRecord.syncedToServer = false; // Background sync will pick this up later!
      })
    );
  }

  // 5. Save all 13 evaluations to the SQLite database in one fast transaction
  if (evaluationsToSave.length > 0) {
    await database.write(async () => {
      await database.batch(...evaluationsToSave);
    });
    console.log('✅ Successfully evaluated and saved results for all crops!');
  }
}