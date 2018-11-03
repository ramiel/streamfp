const { Transform } = require('stream');
const flat = require('flat');
const { streamAsPromise, createStream } = require('utils');


describe('Flat', () => {
  test('a transform stream is returned', () => {
    const r = flat();
    expect(r).toBeInstanceOf(Transform);
  });

  test('a chunk is flattened', async () => {
    const stream = createStream([[1, 2], [3], null])
      .pipe(flat());
    const result = await streamAsPromise(stream);
    expect(result).toEqual([1, 2, 3]);
  });

  test('non array a chunks are flattened anyway', async () => {
    const stream = createStream([[1, 2], 3, [4, 5], null])
      .pipe(flat());
    const result = await streamAsPromise(stream);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test('flattening is non-deeper', async () => {
    const stream = createStream([[1, [2, 3]], null])
      .pipe(flat());
    const result = await streamAsPromise(stream);
    expect(result).toEqual([1, [2, 3]]);
  });
});
