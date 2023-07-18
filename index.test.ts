import assert from 'assert';
import crypto from 'crypto';

import * as utils from './';

describe('@someimportantcompany/utils', () => {

  describe('#assert', () => {
    function wrap(fn: () => void): Error | unknown {
      try {
        return fn();
      } catch (err) {
        return err;
      }
    }

    it('should become a no-op if the argument is true', () => {
      const err = wrap(() => utils.assert(true, new Error('An error occurred')));
      assert.ok(err === undefined);
    });

    it('should become a no-op if the argument is false', () => {
      const err = wrap(() => utils.assert(false, new Error('An error occurred')));
      assert.ok(err instanceof Error);
      assert.strictEqual(err.message, 'An error occurred');
    });

    it('should become a no-op if the argument is false with optionals', () => {
      const err = wrap(() => utils.assert(false, new Error('An error occurred'), { foo: 'bar' }));
      assert.ok(err instanceof Error);
      assert.strictEqual(err.message, 'An error occurred');
      assert.strictEqual((err as any).foo, 'bar');
    });
  });

  describe('#promiseEachSeries', () => {
    it('should iterate through an array', async () => {
      const results: number[] = [];
      const items = [ 1, 2, 3, 4, 5 ];

      await utils.promiseEachSeries(items, async value => {
        results.push(value * value);
      });

      assert.deepStrictEqual(results, [ 1, 4, 9, 16, 25 ]);
    });
  });

  describe('#promiseMapSeries', () => {
    it('should iterate through an array', async () => {
      const items = [ 1, 2, 3, 4, 5 ];
      const results = await utils.promiseMapSeries(items, async value => (value * value).toString());
      assert.deepStrictEqual(results, [ '1', '4', '9', '16', '25' ]);
    });
  });

  describe('#promiseReduceSeries', () => {
    it('should iterate through an array', async () => {
      const items = [ 1, 2, 3, 4, 5 ];
      const result = await utils.promiseReduceSeries(items, async (acc, value) => acc + value);
      assert.deepStrictEqual(result, 15);
    });

    it('should iterate through an array with a start value', async () => {
      const items = [ 1, 2, 3, 4, 5 ];
      const result = await utils.promiseReduceSeries(items, async (acc, value) => acc + value, 5);
      assert.deepStrictEqual(result, 20);
    });
  });

  describe('#promiseAllSettled', () => {
    it('should iterate through an array, returning all the values', async () => {
      const items = [ 1, 2, 3, 4, 5 ];
      const results = await utils.promiseAllSettled(items.map(async value => (value * value).toString()));
      assert.deepStrictEqual(results, [ '1', '4', '9', '16', '25' ]);
    });

    it('should iterate through an array, returning the single error', async () => {
      try {
        await utils.promiseAllSettled([ 1, 2, 3, 4, 5 ].map(async (value, i) => {
          utils.assert(i !== 0, 'Oh no');
          return (value * value).toString();
        }));
        assert.fail('Should have errored');
      } catch (err) {
        assert.ok(err instanceof Error);
        assert.strictEqual(err.message, 'Oh no');
      }
    });

    it('should iterate through an array, returning a many-error', async () => {
      try {
        await utils.promiseAllSettled([ 1, 2, 3, 4, 5 ].map(async (value, i) => {
          utils.assert((i % 2) === 1, 'Oh no');
          return (value * value).toString();
        }));
        assert.fail('Should have errored');
      } catch (err) {
        assert.ok(err instanceof utils.PromiseSettledManyErrors);
        assert.strictEqual(err.message, 'One or more errors occurred');
        assert.ok(err.inner.length === 3, 'Expected three errors to be present');
        assert.ok(err.inner[0] instanceof Error);
        assert.strictEqual(err.inner[0].message, 'Oh no');
        assert.ok(err.inner[1] instanceof Error);
        assert.strictEqual(err.inner[1].message, 'Oh no');
        assert.ok(err.inner[2] instanceof Error);
        assert.strictEqual(err.inner[2].message, 'Oh no');
      }
    });
  });

  describe('#createHashMd5', () => {
    it('should hash a string', async () => {
      const result = utils.createHashMd5('The Grid. A digital frontier.');
      assert.strictEqual(result, 'f1692f68b3c08a7d37be7eed8f7aff42');
    });
    it('should hash a buffer', async () => {
      const result = utils.createHashMd5(Buffer.from('It\'s amazing how productive doing nothing can be.', 'utf8'));
      assert.strictEqual(result, '5437e4c967b6353a44450a5889a4e061');
    });
  });
  describe('#createHashSha1', () => {
    it('should hash a string', async () => {
      const result = utils.createHashSha1('Flynn is teaching me about the art of the selfless.');
      assert.strictEqual(result, '355b4fe513bca423a4b3471cd0f8eff90b8529b0');
    });
    it('should hash a buffer', async () => {
      const result = utils.createHashSha1(Buffer.from('The only way to win the game is not to play.', 'utf8'));
      assert.strictEqual(result, 'a8515a30e8869d28ca309f31cb8f83d69d7023a1');
    });
  });
  describe('#createHashSha256', () => {
    it('should hash a string', async () => {
      const result = utils.createHashSha256('Your old man\'s about to knock on the sky and listen to the sound.');
      assert.strictEqual(result, '19e3df8b7f725efcc413cabb0de25d9311e751b603016754313678cf400a50a8');
    });
    it('should hash a buffer', async () => {
      const result = utils.createHashSha256(Buffer.from('End of line, man', 'utf8'));
      assert.strictEqual(result, 'd6ad67774024d5c6d0ec089b0e24d1ed010fb58ee3c5e6be0ff1a3ee804b083d');
    });
  });

  describe('#attempt', () => {
    it('should return a function value', async () => {
      const result = utils.attempt(() => true);
      assert.strictEqual(result, true);
    });

    it('should return null if the function throws', async () => {
      const result = utils.attempt(() => assert.fail('Oh no!'));
      assert.strictEqual(result, null);
    });

    it('should return null if the function throws twice', async () => {
      const result = utils.attempt(() => assert.fail('Oh no!'), 2);
      assert.strictEqual(result, null);
    });

    it('should return a function promise', async () => {
      const result = await utils.attempt(() => Promise.resolve(true));
      assert.strictEqual(result, true);
    });

    it('should return null if the function promise throws', async () => {
      const result = await utils.attempt(() => Promise.reject(new Error('Oh no')));
      assert.strictEqual(result, null);
    });

    it('should return null if the function promise throws twice', async () => {
      const result = await utils.attempt(() => Promise.reject(new Error('Oh no')), 2);
      assert.strictEqual(result, null);
    });
  });

  describe('#aesEncrypt/#aesDecrypt', () => {
    const key = crypto.randomBytes(8).toString('hex');

    it('should encrypt & decrypt a string value', async () => {
      const value = crypto.randomUUID().toString();

      const encrypted = utils.aesEncrypt(key, value);
      assert.ok(typeof encrypted === 'string');

      const decrypted = utils.aesDecrypt(key, encrypted);
      assert.ok(typeof decrypted === 'string');

      assert.strictEqual(decrypted, value, 'Expected value/decrypted to match');
    });

    it('should encrypt & decrypt a Buffer value', async () => {
      const value = Buffer.from(crypto.randomUUID().toString(), 'utf8');

      const encrypted = utils.aesEncrypt(key, value);
      assert.ok(Buffer.isBuffer(encrypted));

      const decrypted = utils.aesDecrypt(key, encrypted);
      assert.ok(Buffer.isBuffer(decrypted));

      assert.strictEqual(decrypted.toString('hex'), value.toString('hex'), 'Expected value/decrypted to match');
    });

    it('should encrypt & decrypt an array value', async () => {
      const value = [crypto.randomUUID().toString(), crypto.randomUUID().toString()];

      const encrypted = utils.aesEncrypt(key, value, JSON.stringify);
      assert.ok(typeof encrypted === 'string');

      const decrypted = utils.aesDecrypt(key, encrypted, JSON.parse);
      assert.deepStrictEqual(decrypted, value, 'Expected value/decrypted to match');
    });

    it('should encrypt & decrypt an object value', async () => {
      const value = { a: crypto.randomUUID().toString(), b: crypto.randomUUID().toString() };

      const encrypted = utils.aesEncrypt(key, value, JSON.stringify);
      assert.ok(typeof encrypted === 'string');

      const decrypted = utils.aesDecrypt(key, encrypted, JSON.parse);
      assert.deepStrictEqual(decrypted, value, 'Expected value/decrypted to match');
    });
  });

  describe('#createAwsCloudwatchLogGroupUrl', () => {
    it('should return a CloudWatch Logs URL', () => {
      const result = utils.createAwsCloudwatchLogGroupUrl({
        groupName: '/aws/lambda/some-example-function',
      });
      assert.strictEqual(result, (a => a.join(''))([
        'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1',
        '#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fsome-example-function/log-events',
      ]));
    });

    it('should return a CloudWatch Logs URL with a custom region', () => {
      const result = utils.createAwsCloudwatchLogGroupUrl({
        groupName: '/aws/lambda/some-example-function',
        region: 'eu-west-2',
      });
      assert.strictEqual(result, (a => a.join(''))([
        'https://eu-west-2.console.aws.amazon.com/cloudwatch/home?region=eu-west-2',
        '#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fsome-example-function/log-events',
      ]));
    });

    it('should return a CloudWatch Logs URL with all the maximum properties', () => {
      const streamId = crypto.randomBytes(8).toString('hex');
      const requestId = crypto.randomUUID().toString();
      const result = utils.createAwsCloudwatchLogGroupUrl({
        groupName: '/aws/lambda/some-example-function',
        streamName: `[$LATEST]${streamId}`,
        baseUrl: 'https://cloudwatch.aws.amazon.com/logs',
        filterPattern: `"${requestId}"`,
      });
      assert.strictEqual(result, (a => a.join(''))([
        'https://cloudwatch.aws.amazon.com/logs',
        '#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fsome-example-function/log-events',
        `/$255B$2524LATEST$255D${streamId}$3FfilterPattern$253D$252522${requestId}$252522`,
      ]));
    });

    it('should return a CloudWatch Logs URL between two dates', () => {
      const result = utils.createAwsCloudwatchLogGroupUrl({
        groupName: '/aws/lambda/some-example-function',
        between: [new Date('2023-06-23'), new Date('2023-06-30')]
      });
      assert.strictEqual(result, (a => a.join(''))([
        'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1',
        '#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fsome-example-function/log-events',
        '$3Fstart$253D1687478400000$2526end$253D1688083200000',
      ]));
    });

    it('should return a CloudWatch Logs URL around now', () => {
      const result = utils.createAwsCloudwatchLogGroupUrl({
        groupName: '/aws/lambda/some-example-function',
        around: 1000,
      });

      const now = Date.now();
      assert.strictEqual(result, (a => a.join(''))([
        'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1',
        '#logsV2:log-groups/log-group/$252Faws$252Flambda$252Fsome-example-function/log-events',
        `$3Fstart$253D${now - 1000}$2526end$253D${now + 1000}`,
      ]));
    });
  });

});
