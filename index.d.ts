/**
 * Shorthand assertion function, based on `http-assert-plus`.
 */
export function assert(condition: any, err: Error | string | unknown, opts?: Record<string, any> | undefined): asserts condition;

/**
 * Loop over an array in sequence - supporting async functions.
 * A functional cross between `Promise.map` & `Array.prototype.forEach`, which iterates in-sequence rather than in-parallel.
 */
export function promiseEachSeries<T>(items: T[], eachFn: (item: T, i: number, items: T[]) => (void | Promise<void>)): Promise<void>;

/**
 * Map an array in sequence - supporting async functions.
 * A functional cross between `Promise.map` & `Array.prototype.map`, which iterates in-sequence rather than in-parallel.
 */
export function promiseMapSeries<T, U>(items: T[], mapFn: (item: T, i: number, items: T[]) => (U | Promise<U>)): Promise<U[]>;

/**
 * Reduce an array in sequence - supporting async functions.
 * A functional cross between `Promise.map` & `Array.prototype.reduce`, which iterates in-sequence rather than in-parallel.
 */
export function promiseReduceSeries<T>(items: T[], reduceFn: (acc: T, item: T, i: number, items: T[]) => (T | Promise<T>)): Promise<T>;
export function promiseReduceSeries<T, U>(items: T[], reduceFn: (acc: U, item: T, i: number, items: T[]) => (U | Promise<U>), initialValue: U): Promise<U>;

/**
 * Loop through all promises with Promise.allSettled, throw an error if one or more rejected.
 */
export function promiseAllSettled<T>(input: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]>;
/**
 * Specific error class for when `promiseAllSettled` throws multiple errors.
 */
export class PromiseSettledManyErrors extends Error {
  constructor(message: string, inner: Error[]);
  get inner(): Error[];
}

/**
 * Create an MD5-hash of the input
 */
export function createHashMd5(input: string | Buffer): string;
/**
 * Create an SHA1-hash of the input
 */
export function createHashSha1(input: string | Buffer): string;
/**
 * Create an SHA256-hash of the input
 */
export function createHashSha256(input: string | Buffer): string;

/**
 * Attempt to execute a function, returning `null` if it throws.
 * Optionally retry a fixed number of times.
 */
export function attempt<T>(fn: () => T, retries?: number): T | null;
export function attempt<T>(fn: () => Promise<T>, retries?: number): Promise<T> | null;

/**
 * Wait for a fixed amount of milliseconds.
 */
export function wait(timeout: number): Promise<void>

/**
 * Encrypt a string/Buffer using `aes-256-ctr`.
 * Optionally transform the data before encrypting.
 */
export function aesEncrypt(key: string, plain: string): string;
export function aesEncrypt(key: string, plain: Buffer): Buffer;
export function aesEncrypt<T>(key: string, plain: T, transform: (input: T) => string): string;
export function aesEncrypt<T>(key: string, plain: T, transform: (input: T) => Buffer): Buffer;

/**
 * Decrypt a string/Buffer using `aes-256-ctr`.
 * Optionally transform the data after decrypting.
 */
export function aesDecrypt(key: string, encrypted: string): string;
export function aesDecrypt(key: string, encrypted: Buffer): Buffer;
export function aesDecrypt<T>(key: string, encrypted: string, transform: (input: string) => T): T;
export function aesDecrypt<T>(key: string, encrypted: Buffer, transform: (input: Buffer) => T): T;

/**
 * Build a URL to a specific CloudWatch Log Group.
 * Optionally set a filter/timeframe to help limit the number of logs loaded.
 */
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
