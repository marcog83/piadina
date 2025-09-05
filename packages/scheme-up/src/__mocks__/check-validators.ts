import type { TestV1, TestV2, TestV3 } from './test.types';

// Assert functions
export function assertTestV1(input: unknown): asserts input is TestV1 {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const obj = input as Record<string, unknown>;

  if (obj.version !== '1.0.0') {
    throw new Error('Expected version 1.0.0');
  }

  if (!obj.data || typeof obj.data !== 'object') {
    throw new Error('Data must be an object');
  }

  const data = obj.data as Record<string, unknown>;

  if (typeof data.name !== 'string') {
    throw new Error('Data.name must be a string');
  }

  if (typeof data.age !== 'number') {
    throw new Error('Data.age must be a number');
  }
}

export function assertTestV2(input: unknown): asserts input is TestV2 {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const obj = input as Record<string, unknown>;

  if (obj.version !== '2.0.0') {
    throw new Error('Expected version 2.0.0');
  }

  if (!obj.data || typeof obj.data !== 'object') {
    throw new Error('Data must be an object');
  }

  const data = obj.data as Record<string, unknown>;

  if (typeof data.fullName !== 'string') {
    throw new Error('Data.fullName must be a string');
  }

  if (typeof data.birthYear !== 'number') {
    throw new Error('Data.birthYear must be a number');
  }
}

export function assertTestV3(input: unknown): asserts input is TestV3 {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const obj = input as Record<string, unknown>;

  if (obj.version !== '3.0.0') {
    throw new Error('Expected version 3.0.0');
  }

  if (!obj.data || typeof obj.data !== 'object') {
    throw new Error('Data must be an object');
  }

  const data = obj.data as Record<string, unknown>;

  if (typeof data.name !== 'string') {
    throw new Error('Data.name must be a string');
  }

  if (typeof data.age !== 'number') {
    throw new Error('Data.age must be a number');
  }

  if (typeof data.isAdult !== 'boolean') {
    throw new Error('Data.isAdult must be a boolean');
  }
}
