const { Transform } = require('stream');
const forEach = require('forEach');
const filter = require('filter');
const { streamAsPromise, createStream } = require('utils');
const merge = require('../src/merge');

describe('merge', () => {
  test.skip('a transform stream is returned', () => {
    const r = merge([]);
    expect(r).toBeInstanceOf(Transform);
  });

  test('two streams are merged', async () => {
    const stream1 = createStream(['1', '2', '3', null]);
    const stream2 = createStream(['a', 'b', 'c', null]);
    const mergedStream = merge([stream1, stream2]);
    const result = await streamAsPromise(mergedStream);
    expect(result).toHaveLength(6);
    expect(result).toEqual(['1', '2', '3', 'a', 'b', 'c']);
  });

  test('merge can be merged', async () => {
    const stream1 = createStream(['1', '2', '3', null]);
    const stream2 = createStream(['a', 'b', 'c', null]);
    const stream3 = createStream([7, 8, 9, null]);
    const mergedStream = merge([
      stream3,
      merge([stream1, stream2]),
    ]);
    const result = await streamAsPromise(mergedStream);
    expect(result).toHaveLength(9);
    expect(result).toEqual([7, 8, 9, '1', '2', '3', 'a', 'b', 'c']);
  });

  test('if the argument is not an array, an error is thrown', () => {
    const stream = createStream(['1', '2', '3', null]);
    expect(() => merge(stream)).toThrow(Error);
  });

  test('ends when both streams ends', async () => {
    const stream1 = createStream(['1', '2', '3']);
    const stream2 = createStream(['a', 'b', 'c']);
    const mergedStream = merge([stream1, stream2]);
    const promise = streamAsPromise(mergedStream);
    stream1.push(null);
    stream2.push(null);
    await expect(promise).resolves.toBeDefined();
  });

  test('if the first stream emit an error, the merged stream emit an error', async () => {
    const stream1 = createStream(['a', 'b', 'c']).pipe(forEach(() => { throw new Error(); }));
    const stream2 = createStream(['1', '2', '3', null]);
    const mergedStream = merge([stream1, stream2]);
    const promise = streamAsPromise(mergedStream);
    await expect(promise).rejects.toBeInstanceOf(Error);
  });

  test('if the last stream emit an error, the merged stream emit an error', async () => {
    const stream1 = createStream(['1', '2', '3', null]);
    const stream2 = createStream(['a', 'b', 'c']).pipe(forEach(() => { throw new Error(); }));
    const mergedStream = merge([stream1, stream2]);
    const promise = streamAsPromise(mergedStream);
    await expect(promise).rejects.toBeInstanceOf(Error);
  });

  test('if the stream in the middle emit an error, the merged stream emit an error', async () => {
    const stream1 = createStream(['1', '2', '3', null]);
    const stream2 = createStream(['a', 'b', 'c']).pipe(forEach(() => { throw new Error(); }));
    const stream3 = createStream(['1', '2', '3', null]);
    const mergedStream = merge([stream1, stream2, stream3]);
    const promise = streamAsPromise(mergedStream);
    await expect(promise).rejects.toBeInstanceOf(Error);
  });

  test('if one stream is empty, the merged still ends', async () => {
    const stream1 = createStream(['1', '2', '3', null]);
    const stream2 = createStream([null]);
    const mergedStream = merge([stream1, stream2]);
    const result = await streamAsPromise(mergedStream);
    expect(result).toHaveLength(3);
    expect(result).toEqual(['1', '2', '3']);
  });

  test.skip('if one stream is already composed/piped, the merged still ends', async () => {
    const stream1 = createStream([1, 2, 3, null]);
    // const composed = compose(filter(c => c > 1))(stream1);
    // const composed2 = compose(filter(c => c > 4))(composed);
    stream1.pause();
    const composed = stream1.pipe(filter(c => c > 1));
    composed.pause();
    const composed2 = composed.pipe(filter(c => c > 4));
    const mergedStream = merge([composed, composed2]);
    stream1.resume();
    composed.resume();
    const result = await streamAsPromise(mergedStream);
    expect(result).toHaveLength(2);
    expect(result).toEqual([2, 3]);
  });

  test('if one stream has only an undefined value, the merged still ends', async () => {
    const stream1 = createStream(['1', '2', '3', null]);
    const stream2 = createStream([undefined, null]);
    const mergedStream = merge([stream1, stream2]);
    const result = await streamAsPromise(mergedStream);
    expect(result).toHaveLength(4);
    expect(result).toEqual(['1', '2', '3', undefined]);
  });
});
