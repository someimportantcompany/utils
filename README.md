# @someimportantcompany/utils

[![NPM](https://badge.fury.io/js/@someimportantcompany%2Futils.svg)](https://npm.im/@someimportantcompany/utils)
[![Test](https://github.com/someimportantcompany/utils/actions/workflows/test.yml/badge.svg?branch=master&event=push)](https://github.com/someimportantcompany/utils/actions/workflows/test.yml)
[![Typescript](https://img.shields.io/badge/TS-TypeScript-%230074c1.svg)](https://www.typescriptlang.org)
<!-- [![Coverage](https://coveralls.io/repos/github/someimportantcompany/utils/badge.svg)](https://coveralls.io/github/someimportantcompany/utils) -->

A collection of handy utility functions for you & your projects.

## Install

```sh
$ npm install --save @someimportantcompany/utils
# or
$ yarn add @someimportantcompany/utils
```

## Functions

To import each function, `import`/`require` as needed:

```js
import { assert } from '@someimportantcompany/utils';
// or
const { assert } = require('@someimportantcompany/utils');
```

### `assert`

Shorthand assertion function, based on [`http-assert-plus`](https://github.com/someimportantcompany/http-assert-plus) but with none of the additional logic or HTTP status code support.


```ts
export function assert(
  condition: any,
  err: Error | string | unknown,
  opts?: Record<string, any> | undefined,
): asserts condition;
```
```js
import { assert } from '@someimportantcompany/utils';

assert(value, new Error('An error occurred'));
assert(value, 'An error occurred');

try {
  const a = 1;
  assert(a === 2, 'Something bad happened');
} catch (err) {
  assert(false, err, { something: 'bad' });
}
```

### `promiseEachSeries`

Loop over an array in sequence - supporting `async` functions. A functional cross between `Promise.map` & `Array.prototype.forEach`, which iterates in-sequence rather than in-parallel.

```ts
export function promiseEachSeries<T>(
  items: T[],
  eachFn: (item: T, i: number, items: T[]) => (void | Promise<void>),
): Promise<void>;
```
```js
import { promiseEachSeries } from '@someimportantcompany/utils';

const urls = [
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/README.md',
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/LICENSE.md',
];

const results = [];

await promiseEachSeries(urls, async url => {
  const res = await fetch(url);
  results.push(await res.text());
});
```

### `promiseMapSeries`

Map an array in sequence - supporting `async` functions. A functional cross between `Promise.map` & `Array.prototype.map`, which iterates in-sequence rather than in-parallel.

```ts
export function promiseMapSeries<T, U>(
  items: T[],
  mapFn: (item: T, i: number, items: T[]) => (U | Promise<U>),
): Promise<U[]>;
```
```js
import { promiseMapSeries } from '@someimportantcompany/utils';

const urls = [
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/README.md',
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/LICENSE.md',
];

const results = await promiseMapSeries(urls, async url => {
  const res = await fetch(url);
  return await res.text();
});
```

### `promiseReduceSeries`

Map an array in sequence - supporting `async` functions. A functional cross between `Promise.map` & `Array.prototype.reduce`, which iterates in-sequence rather than in-parallel.

```ts
export function promiseReduceSeries<T>(
  items: T[],
  reduceFn: (acc: T, item: T, i: number, items: T[]) => (T | Promise<T>),
): Promise<T>;
export function promiseReduceSeries<T, U>(
  items: T[],
  reduceFn: (acc: U, item: T, i: number, items: T[]) => (U | Promise<U>),
  initialValue: U,
): Promise<U>;
```
```js
import { promiseReduceSeries } from '@someimportantcompany/utils';

const urls = [
  '',
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/README.md',
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/LICENSE.md',
];

const results = await promiseReduceSeries(urls, async (list, url) => {
  const res = await fetch(url);
  return list + (await res.text());
});
```
```js
import { promiseReduceSeries } from '@someimportantcompany/utils';

const urls = [
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/README.md',
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/LICENSE.md',
];

const results = await promiseReduceSeries(urls, async (list, url) => {
  const res = await fetch(url);
  return list.concat([ await res.text() ]);
}, []);
```

- You can optionally pass an `initialValue` for your reducing function.

### `promiseAllSettled`

Loop through all promises with `Promise.allSettled`, throw an error if one or more rejected.

```ts
export function promiseAllSettled<T>(
  input: Iterable<T | PromiseLike<T>>,
): Promise<Awaited<T>[]>;
```
```js
import { assert, promiseAllSettled } from '@someimportantcompany/utils';

const urls = [
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/README.md',
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/LICENSE.md',
];

const results = await promiseAllSettled(urls.map(async (url, i) => {
  const res = await fetch(url);
  assert(i === 0, new Error('An error occurred with promiseAllSettled'));
  return await res.text();
}));

// First URL will throw an error, but the other one will fetch successfully
// But then the assert error will be thrown cleanly.
```
```js
import { assert, promiseAllSettled, PromiseSettledManyErrors } from '@someimportantcompany/utils';

const urls = [
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/README.md',
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/LICENSE.md',
  'https://raw.githubusercontent.com/someimportantcompany/utils/main/package.json',
];

const results = await promiseAllSettled(urls.map(async url => {
  const res = await fetch(url);
  assert(url.endsWith('.json'), new Error('An error occurred with promiseAllSettled'));
  return await res.text();
}));

// The first two URLs will throw an error, but the final one will fetch successfully
// But then the PromiseSettledManyErrors error will be thrown cleanly
// With both errors under `err.inner`
```

### `createHashMd5`

Hash a string or Buffer with MD5.

```ts
export function createHashMd5(input: string | Buffer): string
```
```js
import { createHashMd5 } from '@someimportantcompany/utils';

const value = createHashMd5('hello world');
// value === '6f5902ac237024bdd0c176cb93063dc4'
const value = createHashMd5(Buffer.from('hello world', 'utf8'));
// value === '6f5902ac237024bdd0c176cb93063dc4'
```

### `createHashSha1`

Hash a string or Buffer with Sha1.

```ts
export function createHashSha1(input: string | Buffer): string
```
```js
import { createHashSha1 } from '@someimportantcompany/utils';

const value = createHashSha1('hello world');
// value === '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed'
const value = createHashSha1(Buffer.from('hello world', 'utf8'));
// value === '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed'
```

### `createHashSha256`

Hash a string or Buffer with Sha256.

```ts
export function createHashSha256(input: string | Buffer): string
```
```js
import { createHashSha256 } from '@someimportantcompany/utils';

const value = createHashSha256('hello world');
// value === 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
const value = createHashSha256(Buffer.from('hello world', 'utf8'));
// value === 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
```

### `attempt`

Attempt to execute a function, returning `null` if it throws. Optionally retry a fixed number of times.

```ts
export function attempt<T>(
  fn: () => T,
  retries?: number,
): T | null;
export function attempt<T>(
  fn: () => Promise<T>,
  retries?: number,
): Promise<T> | null;
```
```js
import { assert, attempt } from '@someimportantcompany/utils';

const value = attempt(() => 1 + 1);
// value === 2

const value = attempt(() => {
  assert(Math.random() > 0.5, new Error('Errors half the time (ish)'));
  return 5;
}, 3);
// value === 5 || value === null
// Depending on if the `assert` call throws the error 3 times in a row
```

- If you pass an `async` function or a function that returns a Promise, you'll need to `await attempt(...)`. Otherwise, you can freely drop the extra `await`.

### `aesEncrypt`/`aesDecrypt`

Encrypt/decrypt a string/Buffer using `aes-256-ctr`. Optionally transform the data before encrypting/decrypting.

```ts
export function aesEncrypt(
  key: string,
  plain: string,
): string;
export function aesEncrypt(
  key: string,
  plain: Buffer,
): Buffer;
export function aesEncrypt<T>(
  key: string,
  plain: T,
  transform: (input: T) => string,
): string;
export function aesEncrypt<T>(
  key: string,
  plain: T,
  transform: (input: T) => Buffer,
): Buffer;

export function aesDecrypt(
  key: string,
  encrypted: string,
): string;
export function aesDecrypt(
  key: string,
  encrypted: Buffer,
): Buffer;
export function aesDecrypt<T>(
  key: string,
  encrypted: string,
  transform: (input: string) => T,
): T;
export function aesDecrypt<T>(
  key: string,
  encrypted: Buffer,
  transform: (input: Buffer) => T,
): T;
```
```js
import { aesEncrypt, aesDecrypt } from '@someimportantcompany/utils';

const key = 'FORTY_TWO';
const plain = 'It\'s an important and popular fact that things are not always what they seem.';
const encrypted = aesEncrypt(key, plain);
const decrypted = aesDecrypt(key, encrypted);
// decrypted === plain

import fs from 'fs'
const key = 'FORTY_TWO';
const plain = fs.readFileSync('./image.jpg');
const encrypted = aesEncrypt(key, plain);
const decrypted = aesDecrypt(key, encrypted);
// decrypted.toString('base64') === plain.toString('base64')

const key = 'FORTY_TWO';
const plain = {
  data: [
    'Space is big. Really big.',
    'You won\'t believe how vastly, hugely, mind-bogglingly big it is.',
  ],
  links: {
    wikiquote: 'https://en.wikiquote.org/wiki/The_Hitchhiker%27s_Guide_to_the_Galaxy_(film)',
  },
};
const encrypted = aesEncrypt(key, plain, JSON.stringify);
const decrypted = aesDecrypt(key, encrypted, JSON.parse);
// decrypted === plain
```

### `createAwsCloudwatchLogGroupUrl`

Build a URL to a specific CloudWatch Log Group. Optionally set a filter/timeframe to help limit the number of logs loaded.

```ts
export function createAwsCloudwatchLogGroupUrl(params: {
  // Required, specify the `groupName`
  groupName: string,

  // Set the stream name to filter logs by a specific Log Stream, if known
  streamName?: string | undefined,
  // Set the AWS region, falls back to process.env.AWS_REGION or "us-east-1"
  region?: string | undefined,
  // Set a filter query (matching CloudWatch syntax) to filter logs on page load
  filterPattern?: string | undefined,

  // Pass two dates to automatically filter between two dates on page load
  between?: [Date, Date] | undefined,
  // Or pass a number of milliseconds to lazily build a window around "now"
  around?: number,
  // But note: `between`/`around` are mutually exclusive

  // Optionally overwrite the base CloudWatch Logs URL
  baseUrl?: string | undefined,
}): string;
```
```js
const url = createAwsCloudwatchLogGroupUrl({
  groupName: '/ecs/my-service',
});
// https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups
// /log-group/$252Fecs$252Fmy-service/log-events

const url = createAwsCloudwatchLogGroupUrl({
  groupName: '/ecs/my-service',
  streamName: 'SOME-IDENTIFIER',
  around: 500,
});
// 'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups
// /log-group/$252Fecs$252Fmy-service/log-events/SOME-IDENTIFIER
// $3Fstart$253D1688739366071$2526end$253D1688739367071

const url = createAwsCloudwatchLogGroupUrl({
  groupName: '/ecs/my-service',
  streamName: 'SOME-IDENTIFIER',
  filterPattern: '"REQUEST-ID"',
});
// https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups
// /log-group/$252Fecs$252Fmy-service/log-events/SOME-IDENTIFIER
// $3FfilterPattern$253D$252522REQUEST-ID$252522
```

- Useful for error monitoring tools like [Sentry](https://sentry.io) or [Slack](https://api.slack.com/messaging/sending) alerts, especially where the environment doesn't natively support this out-of-the-box (e.g. [AWS ECS](https://aws.amazon.com/ecs/)).
- You can pass a `filterPattern` if you attach a "request ID" to your logs.
- If you're looking for a decent logger, check out [`bunyan`](https://npm.im/bunyan).

----

- Questions or feedback? [Open an issue](https://github.com/someimportantcompany/utils)!
