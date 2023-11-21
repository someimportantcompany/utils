const crypto = require('crypto');

function assert(value, err, opts = undefined) {
  if (!value) {
    if (typeof err === 'string') {
      err = new Error(err);
      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(err, assert);
      }
    }
    Object.assign(err, opts || {});
    throw err;
  }
}

function promiseEachSeries(array, eachFn) {
  assert(Array.isArray(array), new TypeError('Expected first argument to be an array'));
  assert(typeof eachFn === 'function', new TypeError('Expected second argument to be a function'));
  return array.reduce((p, v, i) => p.then(() => eachFn(v, i)), Promise.resolve());
}

function promiseMapSeries(array, mapFn) {
  assert(Array.isArray(array), new TypeError('Expected first argument to be an array'));
  assert(typeof mapFn === 'function', new TypeError('Expected second argument to be a function'));
  return array.reduce((p, v, i) => p.then(async r => {
    r[i] = await mapFn(v, i, array); // eslint-disable-line no-param-reassign
    return r;
  }), Promise.resolve([]));
}

function promiseReduceSeries(array, reduceFn, start = undefined) {
  assert(Array.isArray(array), new TypeError('Expected first argument to be an array'));
  assert(typeof reduceFn === 'function', new TypeError('Expected second argument to be a function'));

  if (arguments.length === 3) {
    return array.reduce((p, v, i) => p.then(r => reduceFn(r, v, i)), Promise.resolve(start));
  } else {
    return array.slice(1).reduce((p, v, i) => p.then(r => reduceFn(r, v, i)), Promise.resolve(array[0]));
  }
}

class PromiseSettledManyErrors extends Error {
  constructor(message, inner) {
    super(message);
    this.inner = inner;
  }
}

async function promiseAllSettled(array) {
  assert(Array.isArray(array), new TypeError('Expected first argument to be an array'));

  const { values, errors } = (await Promise.allSettled(array)).reduce((list, result) => {
    if (result.status === 'fulfilled') {
      list.values.push(result.value);
    } else if (result.status === 'rejected') {
      list.errors.push(result.reason instanceof Error ? result.reason : (new Error(result.reason.toString())));
    }
    return list;
  }, {
    values: [],
    errors: [],
  });

  assert(errors.length !== 1, errors.length === 1 ? errors[0] : null);
  assert(errors.length === 0, new PromiseSettledManyErrors('One or more errors occurred', errors));

  return values;
}

function createHashMd5(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}
function createHashSha1(input) {
  return crypto.createHash('sha1').update(input).digest('hex');
}
function createHashSha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function tryCatch(tryFn, catchFn = () => null) {
  assert(typeof tryFn === 'function', new TypeError('Expected first argument to be a function'));
  assert(typeof catchFn === 'function', new TypeError('Expected second argument to be a function'));

  try {
    const r = tryFn();
    // If the function return a Promise-like result
    if (r && typeof r.then === 'function' && typeof r.catch === 'function') {
      // Then wrap the promise to protect against errors
      return r.catch(catchFn);
    } else {
      // Otherwise, return the raw value returned from the function
      return r;
    }
  } catch (err) {
    return catchFn(err);
  }
}

function attempt(fn, retries = 1) {
  assert(typeof fn === 'function', new TypeError('Expected first argument to be a function'));
  assert(typeof retries === 'number', new TypeError('Expected second argument to be a number'));

  try {
    const r = fn();
    // If the function return a Promise-like result
    if (r && typeof r.then === 'function' && typeof r.catch === 'function') {
      // Then wrap the promise to protect against errors
      return r.catch(() => {
        if (retries > 0) {
          return attempt(fn, retries - 1);
        } else {
          return null;
        }
      });
    } else {
      // Otherwise, return the raw value returned from the function
      return r;
    }
  } catch (err) {
    if (retries > 0) {
      return attempt(fn, retries - 1);
    } else {
      return null;
    }
  }
}

function wait(timeout) {
  return new Promise(resolve => setTimeout(() => resolve(), timeout));
}

function aesEncrypt(key, plain, transform = undefined) {
  assert(typeof key === 'string', new TypeError('Expected key to be a string'));
  assert(transform === undefined || typeof transform === 'function',
    new TypeError('Expected transform to be a function'));

  if (typeof transform === 'function') {
    plain = transform(plain);
  }

  assert(typeof plain === 'string' || Buffer.isBuffer(plain),
    new TypeError('Expected input to be a string/Buffer'));
  assert(typeof plain !== 'string' || plain.length,
    new TypeError('Expected input to be a non-empty string'));
  assert(!Buffer.isBuffer(plain) || Buffer.byteLength(plain),
    new TypeError('Expected input to be a non-empty buffer'));

  const buffer = typeof plain === 'string' ? Buffer.from(plain, 'utf8') : plain;

  const iv = crypto.randomBytes(16);
  const sha256 = crypto.createHash('sha256').update(key);
  const cipher = crypto.createCipheriv('aes-256-ctr', sha256.digest(), iv);

  const ciphertext = cipher.update(buffer);
  const encrypted = Buffer.concat([iv, ciphertext, cipher.final()]);

  if (typeof plain === 'string') {
    return encrypted.toString('hex');
  } else {
    return encrypted;
  }
}

function aesDecrypt(key, encrypted, transform = undefined) {
  assert(typeof key === 'string', new TypeError('Expected key to be a string'));
  assert(typeof encrypted === 'string' || Buffer.isBuffer(encrypted),
    new TypeError('Expected input to be a string/Buffer'));
  assert(typeof encrypted !== 'string' || encrypted.length,
    new TypeError('Expected input to be a non-empty string'));
  assert(!Buffer.isBuffer(encrypted) || Buffer.byteLength(encrypted),
    new TypeError('Expected input to be a non-empty buffer'));
  assert(transform === undefined || typeof transform === 'function',
    new TypeError('Expected transform to be a function'));

  let buffer = encrypted;
  if (typeof encrypted === 'string') {
    assert(buffer.length >= 17, new TypeError('Provided input must decrypt to a non-empty string'));
    buffer = Buffer.from(buffer, 'hex');
  } else {
    assert(Buffer.byteLength(buffer) >= 17, new TypeError('Provided input must decrypt to a non-empty buffer'));
  }

  const iv = buffer.slice(0, 16);
  const sha256 = crypto.createHash('sha256').update(key);
  const decipher = crypto.createDecipheriv('aes-256-ctr', sha256.digest(), iv);
  const ciphertext = buffer.slice(16);

  let plain = typeof encrypted === 'string'
    ? `${decipher.update(ciphertext)}${decipher.final()}`
    : Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  if (typeof transform === 'function') {
    plain = transform(plain);
  }

  return plain;
}

function createAwsCloudwatchLogGroupUrl(params) {
  assert(params && typeof params.groupName === 'string', new TypeError('Expected groupName to be a string'));

  assert(!params.region || typeof params.region === 'string',
    new TypeError('Expected region to be a string'));
  assert(!params.baseUrl || typeof params.baseUrl === 'string',
    new TypeError('Expected baseUrl to be a string'));
  assert(!params.streamName || typeof params.streamName === 'string',
    new TypeError('Expected streamName to be a string'));

  const region = params.region || process.env.AWS_REGION || 'us-east-1';
  const baseUrl = params.baseUrl || `https://console.aws.amazon.com/cloudwatch/home?region=${region}`;

  let hashString = `logsV2:log-groups/log-group/${encodeURIComponent(params.groupName)}/log-events`;
  if (params.streamName && typeof params.streamName === 'string') {
    hashString += `/${encodeURIComponent(params.streamName)}`;
  }

  const hashQuery = [];

  if (Array.isArray(params.between) && params.between.length === 2) {
    const [before, after] = params.between;
    assert(before instanceof Date && after instanceof Date, new TypeError('Expected before & after to be Dates'));
    hashQuery.push(`start=${before.getTime().toString()}`);
    hashQuery.push(`end=${after.getTime().toString()}`);
  } else if (typeof params.around === 'number') {
    const now = Date.now();
    hashQuery.push(`start=${(now - params.around).toString()}`);
    hashQuery.push(`end=${(now + params.around).toString()}`);
  }

  if (typeof params.filterPattern === 'string') {
    hashQuery.push(`filterPattern=${encodeURIComponent(params.filterPattern)}`);
  }

  if (hashQuery.length) {
    hashString += `?${hashQuery.join('&')}`;
  }

  return `${baseUrl}#${hashString}`;
}

module.exports = {
  assert,
  promiseEachSeries,
  promiseMapSeries,
  promiseReduceSeries,
  promiseAllSettled,
  PromiseSettledManyErrors,
  createHashMd5,
  createHashSha1,
  createHashSha256,
  attempt,
  tryCatch,
  wait,
  aesEncrypt,
  aesDecrypt,
  createAwsCloudwatchLogGroupUrl,
};
