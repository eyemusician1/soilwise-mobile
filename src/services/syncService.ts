import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../database';
import api from './api';

export async function syncWithBackend() {
  await synchronize({
    database,
    // PULL: Fetch updated crops or new rules from Python backend
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const response = await api.get('/sync/pull', {
        params: { last_pulled_at: lastPulledAt, schema_version: schemaVersion }
      });
      
      // Sourcery Tip applied: Just return the data directly
      return response.data; 
    },
    
    // PUSH: Send offline soil evaluations up to the Python DB
    pushChanges: async ({ changes, lastPulledAt }) => {
      // FIX: Use 'as any' so TypeScript stops panicking about our custom table name
      const evals = (changes as any).evaluation_results;
      
      // If the user made no offline evaluations, skip pushing
      if (!evals || (evals.created.length === 0 && evals.updated.length === 0)) {
        return;
      }

      await api.post('/sync/push', {
        changes,
        last_pulled_at: lastPulledAt,
      });
    },
    
    sendCreatedAsUpdated: false,
  });
}