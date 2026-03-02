@echo off
echo ===================================================
echo   Scaffolding SoilWise Mobile Project Structure...
echo ===================================================

:: Create 'app' directory for Expo Router
if not exist "app" mkdir app

:: Create 'src' directory tree
if not exist "src\components" mkdir src\components
if not exist "src\database\models" mkdir src\database\models
if not exist "src\services" mkdir src\services
if not exist "src\utils" mkdir src\utils

echo Directories created successfully.

:: Create placeholder files for Expo Router
echo import { Stack } from 'expo-router'; > app\_layout.tsx
echo export default function Layout() { return ^<Stack /^>; } >> app\_layout.tsx

echo import { View, Text } from 'react-native'; > app\index.tsx
echo export default function Home() { return ^<View^>^<Text^>SoilWise Home^</Text^>^</View^>; } >> app\index.tsx

:: Create placeholder files for WatermelonDB
echo // WatermelonDB Schema > src\database\schema.ts
echo import { appSchema, tableSchema } from '@nozbe/watermelondb'; >> src\database\schema.ts

:: Create placeholder files for Services (Sync, API, Logic)
echo // WatermelonDB Sync Service > src\services\syncService.ts
echo // Axios API Instance > src\services\api.ts
echo // TypeScript port of Python rule evaluation > src\services\evaluationLogic.ts

:: Create placeholder files for Utils
echo // Formatting utilities > src\utils\formatters.ts
echo // App-wide constants > src\utils\constants.ts

echo ===================================================
echo   Scaffolding Complete!
echo ===================================================
pause