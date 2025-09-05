import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Add Jest compatibility layer for legacy code
globalThis.jest = vi;
const RealDate = Date.now;

beforeAll(() => {
  global.Date.now = jest.fn(() => new Date('2019-04-07T10:20:30Z').getTime());
});

afterAll(() => {
  global.Date.now = RealDate;
});

// At the top of your test file or in a setup file
beforeAll(() => {
  if (!global.crypto) {
    global.crypto = {} as Crypto;
  }

  if (!global.crypto.randomUUID) {
    global.crypto.randomUUID = jest.fn();
  }
});
