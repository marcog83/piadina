import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';

// Clean up after each test
afterEach(() => {
  cleanup();
});

const RealDate = Date.now;

beforeAll(() => {
  global.Date.now = vi.fn(() => new Date('2019-04-07T10:20:30Z').getTime());
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
    global.crypto.randomUUID = vi.fn();
  }
});
