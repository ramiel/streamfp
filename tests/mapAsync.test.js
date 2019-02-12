const { Transform } = require('stream');
const map = require('map');
const compose = require('compose');
const filter = require('filter');
const mapAsync = require('mapAsync');
const { createStream, streamAsPromise } = require('utils');

describe('mapAsync', () => {
  test('a transform stream is returned', () => {
    const r = mapAsync();
    expect(r).toBeInstanceOf(Transform);
  });

  test('a chunk is transformed', (done) => {
    const stream = createStream();
    stream.push(10);
    stream.push(null);
    const result = stream.pipe(mapAsync(async x => x * 2));
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
    const stream = createStream();
    stream.push(10);
    stream.push(null);
    const result = stream.pipe(mapAsync());
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
    const stream = createStream();
    stream.push(10);
    stream.push(7);
    stream.push(null);
    const result = stream.pipe(mapAsync(async x => x * 2));
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
    const stream = createStream();
    stream.push(10);
    stream.push(null);
    const result = stream.pipe(mapAsync(() => Promise.reject(Error('An error occurred'))));
    result.on('error', (e) => {
      expect(e).toBeInstanceOf(Error);
      done();
    });
  });

  test('if the map fails in a composition, the error is thrown', async () => {
    const error = new Error('A composition error occurred');
    const stream = createStream([10, null]);
    const result = compose(
      mapAsync(async () => { throw error; }),
      filter(() => true),
    )(stream);
    await expect(streamAsPromise(result)).rejects.toBe(error);
  });

  test('if the mapper does not return a promise, it works anyway', (done) => {
    const stream = createStream();
    stream.push(15);
    stream.push(null);
    const result = stream.pipe(mapAsync(x => x * 2));
    const chunks = [];
    result.on('data', c => chunks.push(c));
    result.on('end', () => {
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(30);
      done();
    });
    result.on('error', done);
  });

  test('if the mapper does not return a promise and fails, it works anyway', (done) => {
    const stream = createStream();
    stream.push(15);
    stream.push(null);
    const result = stream.pipe(mapAsync(() => { throw new Error('An error occured'); }));
    result.on('error', (e) => {
      expect(e).toBeInstanceOf(Error);
      done();
    });
  });

  test('the callback is called once if an error happens in following transformers', async () => {
    const stream = createStream([10, null]);
    const error = new Error('unrelated error');
    const result = stream
      .pipe(mapAsync(async n => n * 2))
      .pipe(map(() => {
        throw error;
      }));
    await expect(streamAsPromise(result)).rejects.toBe(error);
  });

  test('throw an error inside a composition (first)', async () => {
    const stream = createStream([10, null]);
    const error = new Error('unrelated error');
    const result = compose(
      mapAsync(async () => { throw error; }),
      map(c => c),
    )(stream);
    await expect(streamAsPromise(result)).rejects.toBe(error);
  });

  test('throw an error inside a composition (last)', async () => {
    const stream = createStream([10, null]);
    const error = new Error('unrelated error');
    const result = compose(
      map(c => c),
      mapAsync(async () => { throw error; }),
    )(stream);
    await expect(streamAsPromise(result)).rejects.toBe(error);
  });

  test('second parameter is the index', async () => {
    const stream = createStream([10, 7, null]);
    const result = stream.pipe(mapAsync(async (x, index) => index));
    const chunks = await streamAsPromise(result);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe(0);
    expect(chunks[1]).toBe(1);
  });

  test('two mapAsync use two different indexes', async () => {
    const stream = createStream([10, 7, null]);
    const stream2 = createStream(['a', 'b', null]);
    const result = stream.pipe(mapAsync(async (x, index) => index));
    const result2 = stream2.pipe(mapAsync(async (x, index) => index));
    await streamAsPromise(result);
    const chunks = await streamAsPromise(result2);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toBe(0);
    expect(chunks[1]).toBe(1);
  });
});
