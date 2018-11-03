const { Transform } = require('stream');
const objectValues = require('objectValues');
const { streamAsPromise, createStream } = require('utils');


describe('objectValues', () => {
  test('a transform stream is returned', () => {
    const r = objectValues();
    expect(r).toBeInstanceOf(Transform);
  });

  test('the values are returned', async () => {
    const stream = createStream([{ a: 1, b: 2 }, null])
      .pipe(objectValues());
    const result = await streamAsPromise(stream);
    expect(result).toEqual([1, 2]);
  });

  test('works for any js object following the behavior of Object.value', async () => {
    const stream = createStream([new Date(), null])
      .pipe(objectValues());
    const result = await streamAsPromise(stream);
    expect(result).toEqual([]);
  });

  test('if it fails, an error is returned', async () => {
    const stream = createStream([undefined, null])
      .pipe(objectValues());
    await expect(streamAsPromise(stream)).rejects.toBeInstanceOf(Error);
  });

  test('works if no value is provided', async () => {
    const stream = createStream([null])
      .pipe(objectValues());
    const result = await streamAsPromise(stream);
    expect(result).toEqual([]);
  });
});
