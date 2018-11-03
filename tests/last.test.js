const { Transform } = require('stream');
const last = require('last');
const { streamAsPromise, createStream } = require('utils');


describe('last', () => {
  test('a transform stream is returned', () => {
    const r = last();
    expect(r).toBeInstanceOf(Transform);
  });

  test('the last value is returned', async () => {
    const stream = createStream([1, 2, 3, null])
      .pipe(last());
    const result = await streamAsPromise(stream);
    expect(result).toEqual([3]);
  });

  test('works if no value is provided', async () => {
    const stream = createStream([null])
      .pipe(last());
    const result = await streamAsPromise(stream);
    expect(result).toEqual([]);
  });
});
