/**
 * Global test setup
 * This file runs before all tests
 */

// Polyfills for Expo Winter runtime
if (typeof globalThis !== 'undefined') {
  // @ts-expect-error - Expo Winter runtime property
  globalThis.__ExpoImportMetaRegistry = {};

  if (!globalThis.structuredClone) {
    globalThis.structuredClone = (val: unknown) => JSON.parse(JSON.stringify(val));
  }
}

// Mock expo-sqlite for tests
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Set timeout for async tests
jest.setTimeout(10000);
