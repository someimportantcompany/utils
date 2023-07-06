/**
 * Shorthand assertion function, based on `http-assert-plus.
 */
export function assert(condition: any, err: Error | unknown, opts?: Record<string, any>): asserts condition;

/**
 * Map an array in sequence - supporting async functions.
 * A functional cross between `Promise.map` & `Array.prototype.forEach`, which iterates in-sequence rather than in-parallel.
 */
export function promiseEachSeries<T>(items: T[], eachFn: (item: T, i: number, items: T[]) => Promise<void>): Promise<void>;

/**
 * Map an array in sequence - supporting async functions.
 * A functional cross between `Promise.map` & `Array.prototype.map`, which iterates in-sequence rather than in-parallel.
 */
export function promiseMapSeries<T, U>(items: T[], mapFn: (item: T, i: number, items: T[]) => Promise<U>): Promise<U[]>;

/**
 * Reduce an array in sequence - supporting async functions.
 * A functional cross between `Promise.map` & `Array.prototype.reduce`, which iterates in-sequence rather than in-parallel.
 */
export function promiseReduceSeries<T>(items: T[], reduceFn: (acc: T, item: T, i: number, items: T[]) => Promise<T>): Promise<T>;
export function promiseReduceSeries<T, U>(items: T[], reduceFn: (acc: U, item: T, i: number, items: T[]) => Promise<U>, initialValue: U): Promise<U>;

/**
 * Loop through all promises with Promise.allSettled, throw an error if one or more rejected.
 */
export function promiseAllSettled<T>(input: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]>;

export class PromiseSettledManyErrors extends Error {
  constructor(message: string, inner: Error[]);
  get inner(): Error[];
}

export function attempt<T>(fn: () => T, retries?: number): T | null;
export function attempt<T>(fn: () => Promise<T>, retries?: number): Promise<T> | null;

export function aesEncrypt(key: string, plain: string): string;
export function aesEncrypt(key: string, plain: Buffer): Buffer;
export function aesEncrypt<T = any>(key: string, plain: T, transform: (input: T) => string | Buffer): string;

export function aesDecrypt(key: string, encrypted: string): string;
export function aesDecrypt(key: string, encrypted: Buffer): Buffer;
export function aesDecrypt<T = string | Buffer, U = any>(key: string, encrypted: T, transform: (input: T) => U): U;

export function createAwsCloudwatchLogGroupUrl(params: {
  groupName: string,
  streamName?: string | undefined,
  baseUrl?: string | undefined,
  region?: string | undefined,
  filterPattern?: string | undefined,
} & ({
  between?: [Date, Date] | undefined,
  around?: never,
} | {
  between?: never,
  around?: number,
})): string;
