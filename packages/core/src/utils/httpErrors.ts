/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HttpError extends Error {
  status?: number;
}

function getStatusFromObject(
  error: object,
  includeNumericCode: boolean,
): number | undefined {
  if ('status' in error && typeof error.status === 'number') {
    return error.status;
  }

  // Some wrapped errors expose status/code on the nested `cause` object.
  if (includeNumericCode && 'code' in error && typeof error.code === 'number') {
    return error.code;
  }

  // Check for error.response.status (common in axios errors)
  if (
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object' &&
    (error as { response?: unknown }).response !== null
  ) {
    const response =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      (error as { response: { status?: unknown } }).response;
    if ('status' in response && typeof response.status === 'number') {
      return response.status;
    }
  }

  return undefined;
}

/**
 * Extracts the HTTP status code from an error object.
 * @param error The error object.
 * @returns The HTTP status code, or undefined if not found.
 */
export function getErrorStatus(error: unknown): number | undefined {
  let current: unknown = error;
  const maxDepth = 5;

  for (let depth = 0; depth < maxDepth; depth++) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }

    const status = getStatusFromObject(current, depth > 0);
    if (status !== undefined) {
      return status;
    }

    if (!('cause' in current)) {
      return undefined;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return undefined;
}

export class ModelNotFoundError extends Error {
  code: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = 'ModelNotFoundError';
    this.code = code ? code : 404;
  }
}
