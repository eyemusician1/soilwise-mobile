import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { database } from '../src/database/index';
import { seedDatabase } from '../src/database/seed';

export default function Layout() {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  return (
    <DatabaseProvider database={database}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </DatabaseProvider>
  );
}