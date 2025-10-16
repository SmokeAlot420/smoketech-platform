/**
 * Configuration Path Validator
 *
 * Validates that critical paths exist at startup to prevent runtime errors.
 * Provides clear error messages for missing configuration.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface PathValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PathConfig {
  name: string;
  path: string;
  required: boolean;
  shouldExist?: boolean; // Whether path should already exist (vs. will be created)
}

/**
 * Validate critical paths for omega-platform
 */
export function validateOmegaPaths(): PathValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const paths: PathConfig[] = [
    {
      name: 'VIRAL_ENGINE_PATH',
      path: process.env.VIRAL_ENGINE_PATH || path.resolve(process.cwd(), '..', 'viral'),
      required: true,
      shouldExist: true
    },
    {
      name: 'OMEGA_PUBLIC_PATH',
      path: process.env.OMEGA_PUBLIC_PATH || './public',
      required: true,
      shouldExist: true
    },
    {
      name: 'GENERATED_OUTPUT_PATH',
      path: process.env.GENERATED_OUTPUT_PATH || './public/generated',
      required: false,
      shouldExist: false // Will be created if needed
    },
    {
      name: 'CHARACTER_LIBRARY_PATH',
      path: process.env.CHARACTER_LIBRARY_PATH || './public/character-library',
      required: false,
      shouldExist: false // Will be created if needed
    }
  ];

  for (const pathConfig of paths) {
    const resolvedPath = path.isAbsolute(pathConfig.path)
      ? pathConfig.path
      : path.resolve(process.cwd(), pathConfig.path);

    if (pathConfig.shouldExist) {
      // Path should already exist
      if (!fs.existsSync(resolvedPath)) {
        if (pathConfig.required) {
          errors.push(
            `${pathConfig.name}: Required path does not exist: ${resolvedPath}\n` +
            `  Set environment variable ${pathConfig.name} or ensure default path exists.`
          );
        } else {
          warnings.push(
            `${pathConfig.name}: Optional path does not exist: ${resolvedPath}\n` +
            `  This may cause issues if the path is used.`
          );
        }
      }
    } else {
      // Path will be created on demand - check parent directory exists
      const parentDir = path.dirname(resolvedPath);
      if (!fs.existsSync(parentDir)) {
        warnings.push(
          `${pathConfig.name}: Parent directory does not exist: ${parentDir}\n` +
          `  Directory will be created when needed.`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate critical paths for viral engine
 */
export function validateViralPaths(): PathValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const paths: PathConfig[] = [
    {
      name: 'OMEGA_PLATFORM_PATH',
      path: process.env.OMEGA_PLATFORM_PATH || path.resolve(process.cwd(), '..', 'omega-platform'),
      required: false,
      shouldExist: true
    },
    {
      name: 'OUTPUT_BASE_PATH',
      path: process.env.OUTPUT_BASE_PATH || './generated',
      required: false,
      shouldExist: false
    },
    {
      name: 'VEO3_OUTPUT_PATH',
      path: process.env.VEO3_OUTPUT_PATH || './generated/veo3',
      required: false,
      shouldExist: false
    },
    {
      name: 'SORA2_OUTPUT_PATH',
      path: process.env.SORA2_OUTPUT_PATH || './generated/sora2',
      required: false,
      shouldExist: false
    }
  ];

  for (const pathConfig of paths) {
    const resolvedPath = path.isAbsolute(pathConfig.path)
      ? pathConfig.path
      : path.resolve(process.cwd(), pathConfig.path);

    if (pathConfig.shouldExist) {
      if (!fs.existsSync(resolvedPath)) {
        if (pathConfig.required) {
          errors.push(
            `${pathConfig.name}: Required path does not exist: ${resolvedPath}\n` +
            `  Set environment variable ${pathConfig.name} or ensure default path exists.`
          );
        } else {
          warnings.push(
            `${pathConfig.name}: Optional path does not exist: ${resolvedPath}`
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Print validation results to console
 */
export function printValidationResults(results: PathValidationResult, prefix: string = ''): void {
  if (results.errors.length > 0) {
    console.error(`\n${prefix}❌ Path Validation Errors:`);
    results.errors.forEach(error => console.error(`  ${error}`));
  }

  if (results.warnings.length > 0) {
    console.warn(`\n${prefix}⚠️  Path Validation Warnings:`);
    results.warnings.forEach(warning => console.warn(`  ${warning}`));
  }

  if (results.valid && results.warnings.length === 0) {
    console.log(`${prefix}✅ All path validations passed`);
  }
}
