const { Transform, Readable } = require('stream');
const forEach = require('forEach');
const { streamAsPromise } = require('utils');

const getStream = () => new Readable({
  objectMode: true,
  read() { },
});

describe('forEach', () => {
  test('a transform stream is returned', () => {
    const r = forEach();
    expect(r).toBeInstanceOf(Transform);
  });

  test('the original chunk is returned', async () => {
    const stream = getStream();
    stream.push(10);
    stream.push(null);
    const pipedStream = stream.pipe(forEach(x => x * 2));
    const result = await streamAsPromise(pipedStream);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(10);
  });

  test('if the fn fails, the error is thrown', async () => {
    const stream = getStream();
    stream.push(10);
    stream.push(null);
    const pipedStream = stream.pipe(forEach(() => { throw new Error('An error occurred'); }));
    await expect(streamAsPromise(pipedStream)).rejects.toBeInstanceOf(Error);
  });
});
