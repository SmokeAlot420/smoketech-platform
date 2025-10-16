/**
 * Test script to verify npm link is working correctly
 * Run from viral or omega-platform directories
 */

try {
  const sharedConfig = require('@smoketech/shared-config');

  console.log('✅ @smoketech/shared-config successfully loaded!\n');

  // Test character presets
  console.log('=== Character Presets Test ===');
  const presets = sharedConfig.getCharacterPresets();
  console.log(`Found ${presets.length} character presets`);
  console.log(`First preset: ${presets[0].name} (${presets[0].id})`);

  // Test specific preset
  const businessExec = sharedConfig.getCharacterPreset('business-executive');
  console.log(`\nBusiness Executive preset loaded: ${businessExec ? '✅' : '❌'}`);

  // Test shot types
  console.log('\n=== Shot Types Test ===');
  const shotTypes = sharedConfig.getShotTypes();
  console.log(`Found ${shotTypes.length} shot types`);
  console.log(`First shot: ${shotTypes[0].name} (${shotTypes[0].aspectRatio})`);

  // Test categories
  console.log('\n=== Categories Test ===');
  const categories = sharedConfig.getCharacterCategories();
  console.log(`Categories: ${categories.join(', ')}`);

  // Test validation
  console.log('\n=== Validation Test ===');
  const isValid = sharedConfig.validateCharacterPreset(businessExec);
  console.log(`Preset validation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

  console.log('\n✅ All tests passed! npm link is working correctly.');

} catch (error) {
  console.error('❌ Error loading @smoketech/shared-config:');
  console.error(error.message);
  console.error('\nMake sure to run: npm link @smoketech/shared-config');
  process.exit(1);
}
