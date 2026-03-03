import { initialCrops } from '../data/crop-requirements';
import { database } from './index';
import Crop from './models/Crop';

export async function seedDatabase() {
  const cropsCollection = database.get<Crop>('crops');

  // 1. Check if the database is already seeded
  const existingCropsCount = await cropsCollection.query().fetchCount();
  
  if (existingCropsCount > 0) {
    console.log(`Database already seeded with ${existingCropsCount} crops. Skipping seed.`);
    return;
  }

  console.log('Database is empty. Seeding initial crop data...');

  // 2. Wrap all insertions in a single database Write action
  await database.write(async () => {
    const cropsToCreate = initialCrops.map((cropData: any) => {
      return cropsCollection.prepareCreate((crop) => {
        const safeName = cropData.crop_name.toLowerCase().replace(/\s+/g, '_');
        crop._raw.id = `crop_${safeName}`; 
        
        crop.cropId = `crop_${safeName}`;
        crop.cropName = cropData.crop_name;
        crop.displayName = cropData.crop_name;
        crop.isSeasonal = cropData.seasonal || false;
        
        // Store the entire complex JSON structure as a string
        crop.requirementsJson = JSON.stringify(cropData); 
      });
    });

    // Execute the batch insert
    await database.batch(...cropsToCreate);
  });

  console.log('Successfully seeded 13 crops into WatermelonDB! 🍉');
}