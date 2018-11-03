const { Transform, Readable } = require('stream');
const mapper = require('mapper');
const { streamAsPromise } = require('utils');

const getStream = () => new Readable({
  objectMode: true,
  read() { },
});

describe('Mapper', () => {
  test('a transform stream is returned', () => {
    const r = mapper();
    expect(r).toBeInstanceOf(Transform);
  });

  test('a chunk is transformed', (done) => {
    const stream = getStream();
    stream.push(10);
    stream.push(null);
    const result = stream.pipe(mapper(x => x * 2));
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
    const result = stream.pipe(mapper());
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
    const result = stream.pipe(mapper(x => x * 2));
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
    const result = stream.pipe(mapper(() => { throw new Error('An error occurred'); }));
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
    const mappedStream = stream.pipe(mapper(n => (n > 6 ? n : undefined)));
    const result = await streamAsPromise(mappedStream);
    expect(result).toEqual([10]);
  });

  test('a map function can emit on flush', async () => {
    const stream = getStream();
    stream.push(null);
    const mappedStream = stream.pipe(mapper(n => (n === null ? 10 : null), { mapOnFlush: true }));
    const result = await streamAsPromise(mappedStream);
    expect(result).toEqual([10]);
  });

  test('a map function do not normally emit on flush emit on flush', async () => {
    const stream = getStream();
    stream.push(null);
    const mappedStream = stream.pipe(mapper(n => (n === null ? 10 : null), { mapOnFlush: false }));
    const result = await streamAsPromise(mappedStream);
    expect(result).toEqual([]);
  });

  test('if the stream is empty the streams end', async () => {
    const stream = getStream();
    stream.push(null);
    const mappedStream = stream.pipe(mapper(n => n));
    const promise = new Promise((resolve) => {
      mappedStream.on('end', resolve);
      mappedStream.resume();
    });
    await expect(promise).resolves.toBeUndefined();
    // expect(result).toEqual([]);
  });
});
