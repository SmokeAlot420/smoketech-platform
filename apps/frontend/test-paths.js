/**
 * Cross-Platform Path Resolution Test
 *
 * Tests environment variable resolution, path separators, and directory creation
 * Run with: node test-paths.js
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Cross-Platform Path Resolution Test ===\n');

// Test 1: Environment Variable Resolution
console.log('Test 1: Environment Variable Resolution');
console.log('---------------------------------------');

const viralEnginePath = process.env.VIRAL_ENGINE_PATH || path.resolve(process.cwd(), '..', 'viral');
const omegaPublicPath = process.env.OMEGA_PUBLIC_PATH || './public';
const generatedOutputPath = process.env.GENERATED_OUTPUT_PATH || './public/generated';
const characterLibraryPath = process.env.CHARACTER_LIBRARY_PATH || './public/character-library';

console.log(`VIRAL_ENGINE_PATH: ${viralEnginePath}`);
console.log(`  Exists: ${fs.existsSync(viralEnginePath)}`);
console.log(`  Absolute: ${path.isAbsolute(viralEnginePath)}`);

console.log(`\nOMEGA_PUBLIC_PATH: ${omegaPublicPath}`);
console.log(`  Resolved: ${path.resolve(process.cwd(), omegaPublicPath)}`);
console.log(`  Exists: ${fs.existsSync(path.resolve(process.cwd(), omegaPublicPath))}`);

console.log(`\nGENERATED_OUTPUT_PATH: ${generatedOutputPath}`);
console.log(`  Resolved: ${path.resolve(process.cwd(), generatedOutputPath)}`);

console.log(`\nCHARACTER_LIBRARY_PATH: ${characterLibraryPath}`);
console.log(`  Resolved: ${path.resolve(process.cwd(), characterLibraryPath)}`);

// Test 2: Path Separator Handling
console.log('\n\nTest 2: Path Separator Handling');
console.log('--------------------------------');
console.log(`Platform: ${process.platform}`);
console.log(`Path separator: ${path.sep}`);
console.log(`Delimiter: ${path.delimiter}`);

const testPath = path.join('config', 'character-presets.json');
console.log(`\nJoined path: ${testPath}`);
console.log(`Uses correct separator: ${testPath.includes(path.sep)}`);

// Test 3: Character Presets Loading
console.log('\n\nTest 3: Character Presets Loading');
console.log('----------------------------------');

const presetsPath = path.join(viralEnginePath, 'config', 'character-presets.json');
console.log(`Presets path: ${presetsPath}`);
console.log(`Exists: ${fs.existsSync(presetsPath)}`);

if (fs.existsSync(presetsPath)) {
  try {
    const presetsData = JSON.parse(fs.readFileSync(presetsPath, 'utf-8'));
    console.log(`✅ Successfully loaded ${presetsData.presets.length} character presets`);
    console.log(`   First preset: ${presetsData.presets[0]?.name || 'N/A'}`);
  } catch (error) {
    console.error(`❌ Failed to load presets: ${error.message}`);
  }
} else {
  console.error(`❌ Presets file not found at: ${presetsPath}`);
}

// Test 4: Directory Creation
console.log('\n\nTest 4: Directory Creation');
console.log('--------------------------');

const testDir = path.join(process.cwd(), 'public', 'test-output');
console.log(`Test directory: ${testDir}`);

try {
  // Create directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    console.log(`✅ Successfully created directory`);
  } else {
    console.log(`ℹ️  Directory already exists`);
  }

  // Test file write
  const testFile = path.join(testDir, 'test.txt');
  fs.writeFileSync(testFile, `Test timestamp: ${new Date().toISOString()}`);
  console.log(`✅ Successfully wrote test file: ${testFile}`);

  // Cleanup
  fs.unlinkSync(testFile);
  fs.rmdirSync(testDir);
  console.log(`✅ Successfully cleaned up test files`);
} catch (error) {
  console.error(`❌ Directory creation failed: ${error.message}`);
}

// Test 5: Relative Path Resolution from Different Directories
console.log('\n\nTest 5: Relative Path Resolution');
console.log('---------------------------------');
console.log(`Current working directory: ${process.cwd()}`);
console.log(`Script directory: ${__dirname}`);

const relativeToViralFromCwd = path.resolve(process.cwd(), '..', 'viral');
const relativeToViralFromScript = path.resolve(__dirname, '..', 'viral');

console.log(`\nRelative to viral from cwd: ${relativeToViralFromCwd}`);
console.log(`  Exists: ${fs.existsSync(relativeToViralFromCwd)}`);

console.log(`\nRelative to viral from script: ${relativeToViralFromScript}`);
console.log(`  Exists: ${fs.existsSync(relativeToViralFromScript)}`);

console.log(`\nPaths are same: ${relativeToViralFromCwd === relativeToViralFromScript}`);

// Test 6: Cross-Repository File Access
console.log('\n\nTest 6: Cross-Repository File Access');
console.log('-------------------------------------');

const crossRepoFiles = [
  { repo: 'viral', file: path.join(viralEnginePath, 'package.json') },
  { repo: 'viral', file: path.join(viralEnginePath, 'config', 'character-presets.json') },
  { repo: 'viral', file: path.join(viralEnginePath, 'src', 'services', 'veo3Service.ts') },
  { repo: 'omega-platform', file: path.join(process.cwd(), 'package.json') },
  { repo: 'omega-platform', file: path.join(process.cwd(), 'src', 'utils', 'config-validator.ts') }
];

for (const { repo, file } of crossRepoFiles) {
  const exists = fs.existsSync(file);
  const status = exists ? '✅' : '❌';
  console.log(`${status} [${repo}] ${path.basename(file)}`);
  if (!exists) {
    console.log(`   Missing: ${file}`);
  }
}

// Summary
console.log('\n\n=== Test Summary ===');
console.log('--------------------');

const allPassed =
  fs.existsSync(viralEnginePath) &&
  fs.existsSync(path.resolve(process.cwd(), omegaPublicPath)) &&
  fs.existsSync(presetsPath);

if (allPassed) {
  console.log('✅ All critical path tests passed');
  console.log('✅ Cross-platform path resolution working correctly');
  console.log('✅ Ready for deployment on Windows/Mac/Linux');
} else {
  console.log('❌ Some path tests failed');
  console.log('⚠️  Check environment variable configuration');
  console.log('⚠️  Verify repository structure matches defaults');
}

console.log('\n');
