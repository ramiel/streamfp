const { Transform, Readable } = require('stream');
const map = require('map');
const { streamAsPromise, createStream } = require('utils');

const getStream = () => new Readable({
  objectMode: true,
  read() { },
});

describe('map', () => {
  test('a transform stream is returned', () => {
    const r = map();
    expect(r).toBeInstanceOf(Transform);
  });

  test('a chunk is transformed', (done) => {
    const stream = getStream();
    stream.push(10);
    stream.push(null);
    const result = stream.pipe(map(x => x * 2));
    const chunks = [];
    result.on('data', c => chunks.push(c));
    result.on('end', () => {
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(20);
      done();
    });
    result.on('error', done);
  });

  test('the default mapper does nothing', (done) => {
    const stream = getStream();
    stream.push(10);
    stream.push(null);
    const result = stream.pipe(map());
    const chunks = [];
    result.on('data', c => chunks.push(c));
    result.on('end', () => {
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(10);
      done();
    });
    result.on('error', done);
  });

  test('more chunks are transformed', (done) => {
    const stream = getStream();
    stream.push(10);
    stream.push(7);
    stream.push(null);
    const result = stream.pipe(map(x => x * 2));
    const chunks = [];
    result.on('data', c => chunks.push(c));
    result.on('end', () => {
      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toBe(20);
      expect(chunks[1]).toBe(14);
      done();
    });
    result.on('error', done);
  });

  test('if the map fails, the error is thrown', (done) => {
    const stream = getStream();
    stream.push(10);
    stream.push(null);
    const result = stream.pipe(map(() => { throw new Error('An error occurred'); }));
    result.on('error', (e) => {
      expect(e).toBeInstanceOf(Error);
      done();
    });
  });

  test('a map function can emit only sometimes', async () => {
    const stream = getStream();
    stream.push(10);
    stream.push(5);
    stream.push(null);
    const mappedStream = stream.pipe(map(n => (n > 6 ? n : undefined)));
    const result = await streamAsPromise(mappedStream);
    expect(result).toEqual([10]);
  });

  test('a map function can emit on flush', async () => {
    const stream = getStream();
    stream.push(null);
    const mappedStream = stream.pipe(map(n => (n === null ? 10 : null), { mapOnFlush: true }));
    const result = await streamAsPromise(mappedStream);
    expect(result).toEqual([10]);
  });

  test('a map function do not normally emit on flush emit on flush', async () => {
    const stream = getStream();
    stream.push(null);
    const mappedStream = stream.pipe(map(n => (n === null ? 10 : null), { mapOnFlush: false }));
    const result = await streamAsPromise(mappedStream);
    expect(result).toEqual([]);
  });

  test('if the stream is empty the streams end', async () => {
    const stream = getStream();
    stream.push(null);
    const mappedStream = stream.pipe(map(n => n));
    const promise = new Promise((resolve) => {
      mappedStream.on('end', resolve);
      mappedStream.resume();
    });
    await expect(promise).resolves.toBeUndefined();
    // expect(result).toEqual([]);
  });

  test('second parameter is the index', async () => {
    const stream = createStream([10, 7, null]);
    const result = stream.pipe(map((x, index) => index));
    const chunks = await streamAsPromise(result);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe(0);
    expect(chunks[1]).toBe(1);
  });

  test('two maps, uses two different indexes', async () => {
    const stream = createStream([10, 7, null]);
    const stream2 = createStream(['a', 'b', null]);
    const result = stream.pipe(map((x, index) => index));
    const result2 = stream2.pipe(map((x, index) => index));
    await streamAsPromise(result);
    const chunks = await streamAsPromise(result2);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe(0);
    expect(chunks[1]).toBe(1);
  });
});
