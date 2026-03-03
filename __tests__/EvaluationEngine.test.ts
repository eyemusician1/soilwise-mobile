import { EvaluationEngine } from '../src/services/EvaluationEngine';

describe('EvaluationEngine - Math Verification', () => {
  let engine: EvaluationEngine;

  beforeEach(() => {
    engine = new EvaluationEngine();
  });

  it('calculates LSI correctly using the Square Root Method', () => {
    // Let's use a sample array of ratings similar to your Python logs
    const ratings = [0.95, 0.60, 0.85, 0.95, 1.0, 1.0, 0.25];
    
    // MATHEMATICAL BREAKDOWN:
    // 1. Rmin = 0.25
    // 2. Product = 0.95 * 0.60 * 0.85 * 0.95 * 1.0 * 1.0 * 0.25 = 0.11506875
    // 3. Sqrt(Product) = 0.33921785
    // 4. LSI = 0.25 * 0.33921785 * 100 = 8.4804...
    // 5. Rounded to 2 decimal places = 8.48

    const lsi = engine.calculateLSI(ratings);
    
    // We expect the TypeScript function to return exactly 8.48
    expect(lsi).toBe(8.48);
  });

  it('classifies the LSI score correctly', () => {
    expect(engine.classifyLSI(85)).toBe('S1');
    expect(engine.classifyLSI(60)).toBe('S2');
    expect(engine.classifyLSI(30)).toBe('S3');
    expect(engine.classifyLSI(15)).toBe('N');
  });

  it('parses JSON and extracts the correct pH rating', () => {
    // A dummy stringified JSON mimicking your crop requirements
    const dummyCropJson = JSON.stringify({
      crop_name: "Test Cabbage",
      seasonal: false,
      soil_fertility_requirements: {
        ph_h2o: {
          S1_0: { range: [5.5, 6.5], rating: 1.0 },
          S2_0: { range: [5.0, 5.4], rating: 0.85 },
          S3_0: { range: [4.5, 4.9], rating: 0.60 },
          N_0: { range: [0, 4.4], rating: 0.25 }
        }
      }
    });

    // Test with pH 6.0 (Should fall into S1_0 range: 5.5 to 6.5)
    const result = engine.getParameterRating(
      "Test Cabbage",
      "ph_h2o",
      6.0,
      dummyCropJson,
      "soil_fertility_requirements"
    );

    expect(result.rating).toBe(1.0);
    expect(result.classification).toBe('S1');
    expect(result.subclass).toBe('f'); // 'f' stands for soil fertility
  });
});