import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'crops',
      columns: [
        { name: 'crop_id', type: 'string', isIndexed: true },
        { name: 'crop_name', type: 'string' },
        { name: 'display_name', type: 'string' },
        { name: 'is_seasonal', type: 'boolean' },
        // We will store the complex JSON requirements as a stringified blob locally
        { name: 'requirements_json', type: 'string' }, 
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'soil_data_inputs',
      columns: [
        { name: 'location', type: 'string', isOptional: true },
        { name: 'ph', type: 'number', isOptional: true },
        { name: 'temperature', type: 'number', isOptional: true },
        { name: 'precipitation', type: 'number', isOptional: true },
        { name: 'texture', type: 'string', isOptional: true },
        { name: 'drainage', type: 'string', isOptional: true },
        { name: 'slope_percent', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'evaluation_results',
      columns: [
        { name: 'input_id', type: 'string', isIndexed: true },
        { name: 'crop_id', type: 'string', isIndexed: true },
        { name: 'season', type: 'string', isOptional: true },
        { name: 'lsi', type: 'number' },
        { name: 'lsc', type: 'string' },
        { name: 'full_classification', type: 'string' },
        { name: 'limiting_factors', type: 'string', isOptional: true },
        { name: 'synced_to_server', type: 'boolean' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});