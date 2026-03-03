import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import Crop from './models/Crop';
import Evaluation from './models/Evaluation';
import { schema } from './schema';

// Create the SQLite adapter
const adapter = new SQLiteAdapter({
  schema,
  jsi: true, // enables highly optimized C++ bindings
  onSetUpError: error => {
    console.error("Database failed to load:", error);
  }
});

// Initialize the database connection
export const database = new Database({
  adapter,
  modelClasses: [
    Crop,
    Evaluation, // Registered the evaluation model
  ],
});