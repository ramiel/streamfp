const { Transform } = require('stream');
const groupBy = require('groupBy');
const { createStream, streamAsPromise } = require('utils');

describe('groupBy', () => {
  test.skip('a transform stream is returned', () => {
    const r = groupBy();
    expect(r).toBeInstanceOf(Transform);
  });

  test('a series of object is grouped', async () => {
    const stream = createStream([
      { a: 1, b: 1 },
      { a: 1, c: 2 },
      { a: 1, d: 3 },
      { a: 1, e: 4 },
      null,
    ]);
    const res = await streamAsPromise(stream.pipe(groupBy('a')));
    expect(res).toEqual([{
      a: 1, b: 1, c: 2, d: 3, e: 4,
    }]);
  });

  test('newer object overwrite older', async () => {
    const stream = createStream([
      { a: 1, b: 1 },
      { a: 1, b: 2 },
      null,
    ]);
    const res = await streamAsPromise(stream.pipe(groupBy('a')));
    expect(res).toEqual([{
      a: 1, b: 2,
    }]);
  });

  test('object are distinct by specified property', async () => {
    const stream = createStream([
      { id: 1, user: 'John' },
      { id: 2, user: 'Sansa' },
      { id: 1, lastname: 'Snow' },
      null,
    ]);
    const res = await streamAsPromise(stream.pipe(groupBy('id')));
    expect(res).toEqual([
      { id: 1, user: 'John', lastname: 'Snow' },
      { id: 2, user: 'Sansa' },
    ]);
  });
});
