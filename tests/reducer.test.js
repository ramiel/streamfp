const { Transform, Readable } = require('stream');
const reducer = require('reducer');

const createStream = () => new Readable({
  objectMode: true,
  read() { },
});

const streamAsPromise = stream => new Promise((resolve, reject) => {
  let lastData = null;
  stream.on('data', (chunk) => { lastData = chunk; });
  stream.on('error', e => reject(e));
  stream.on('end', () => resolve(lastData));
});

describe('Reducer', () => {
  test('a transform stream is returned', () => {
    const r = reducer(() => {});
    expect(r).toBeInstanceOf(Transform);
  });

  test('can compute a sum', async () => {
    const stream = createStream();
    stream.push(4);
    stream.push(5);
    stream.push(1);
    stream.push(null);
    const reducedStream = stream.pipe(reducer((acc, n) => n + (acc * 1)), 0);
    const result = await streamAsPromise(reducedStream);
    expect(result).toBe(10);
  });

  test('can build an array', async () => {
    const stream = createStream();
    stream.push(4);
    stream.push(5);
    stream.push(1);
    stream.push(null);
    const reducedStream = stream.pipe(reducer((acc, n) => [...acc, n * 1], []));
    const result = await streamAsPromise(reducedStream);
    expect(result).toEqual([4, 5, 1]);
  });

  test('can reduce an empty stream', async () => {
    const stream = createStream();
    stream.push(null);
    const reducedStream = stream.pipe(reducer((acc, n) => acc * n, null));
    const result = await streamAsPromise(reducedStream);
    expect(result).toEqual(null);
  });

  test('if the reduce function trhows, the stream emit an error', async () => {
    const stream = createStream();
    stream.push(4);
    stream.push(null);
    const reducedStream = stream.pipe(reducer(() => { throw new Error(); }));
    await expect(streamAsPromise(reducedStream)).rejects.toBeInstanceOf(Error);
  });

  test('if the reduce function is not provided, the reducer fails to be created ', () => {
    expect(() => reducer()).toThrow();
  });

  test('if the reduce function is not a function, the reducer fails to be created ', () => {
    expect(() => reducer({})).toThrow();
  });
});
