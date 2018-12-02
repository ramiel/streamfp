const { Transform } = require('stream');
const reduce = require('reduce');
const { createStream } = require('utils');

const streamAsPromise = stream => new Promise((resolve, reject) => {
  let lastData = null;
  stream.on('data', (chunk) => { lastData = chunk; });
  stream.on('error', e => reject(e));
  stream.on('end', () => resolve(lastData));
});

describe('reducer', () => {
  test('a transform stream is returned', () => {
    const r = reduce(() => {});
    expect(r).toBeInstanceOf(Transform);
  });

  test('can compute a sum', async () => {
    const stream = createStream([4, 5, 1, null]);
    const reducedStream = stream.pipe(reduce((acc, n) => n + (acc * 1), 0));
    const result = await streamAsPromise(reducedStream);
    expect(result).toBe(10);
  });

  test('can compute a sum without an initial value', async () => {
    const stream = createStream([4, 5, 1, null]);
    const reducedStream = stream.pipe(reduce((acc, n) => n + (acc * 1)));
    const result = await streamAsPromise(reducedStream);
    expect(result).toBe(10);
  });

  test('can reduce one element only and without initial value. The result is the value itself', async () => {
    const stream = createStream([4, null]);
    const reducedStream = stream.pipe(reduce((acc, n) => n + (acc * 1)));
    const result = await streamAsPromise(reducedStream);
    expect(result).toBe(4);
  });

  test('can build an array', async () => {
    const stream = createStream([4, 5, 1, null]);
    const reducedStream = stream.pipe(reduce((acc, n) => [...acc, n * 1], []));
    const result = await streamAsPromise(reducedStream);
    expect(result).toEqual([4, 5, 1]);
  });

  test('can reduce an empty stream', async () => {
    const stream = createStream([null]);
    const reducedStream = stream.pipe(reduce((acc, n) => acc * n, null));
    const result = await streamAsPromise(reducedStream);
    expect(result).toEqual(null);
  });

  test('if the reduce function throws, the stream emit an error', async () => {
    const stream = createStream([4, null]);
    const reducedStream = stream.pipe(reduce(() => { throw new Error(); }, null));
    await expect(streamAsPromise(reducedStream)).rejects.toBeInstanceOf(Error);
  });

  test('if the reduce function throws, and the stream has one element only, it is never called and nothing throws', async () => {
    const stream = createStream([4, null]);
    const reduceFn = jest.fn(() => { throw new Error(); });
    const reducedStream = stream.pipe(reduce(reduceFn));
    expect(reduceFn).toHaveBeenCalledTimes(0);
    await expect(streamAsPromise(reducedStream)).resolves.toBe(4);
  });

  test('if the reduce function is not provided, the reducer fails to be created ', () => {
    expect(() => reduce()).toThrow();
  });

  test('if the reduce function is not a function, the reducer fails to be created ', () => {
    expect(() => reduce({})).toThrow();
  });
});
