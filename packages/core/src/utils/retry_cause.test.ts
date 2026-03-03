/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { isRetryableError } from './retry.js';

describe('isRetryableError cause parsing', () => {
  it('should identify 429 in cause as retryable', () => {
    const cause = { code: 429 };
    const error = new Error('Too Many Requests') as Error & { cause?: unknown };
    error.cause = cause;

    expect(isRetryableError(error)).toBe(true);
  });

  it('should identify nested response status in cause as retryable', () => {
    const error = new Error('Server Error') as Error & { cause?: unknown };
    error.cause = { response: { status: 503 } };

    expect(isRetryableError(error)).toBe(true);
  });
});
