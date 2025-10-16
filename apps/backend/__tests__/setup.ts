/**
 * Global test setup and teardown
 */

import dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config({ path: '.env.test' });

// Set test environment defaults
process.env.NODE_ENV = 'test';
process.env.WEB_PORT = '3008'; // Different port for testing

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep error and warn for debugging
  error: jest.fn(),
  warn: jest.fn(),
  // Suppress info and log in tests
  info: jest.fn(),
  log: jest.fn(),
  debug: jest.fn(),
};

// Global test timeout
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Add cleanup logic here if needed
  await new Promise(resolve => setTimeout(resolve, 500));
});
