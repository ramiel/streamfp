const compose = require('compose');
const map = require('map');
const { createStream, streamAsPromise } = require('utils');


const double = x => x * 2;
const minusOne = x => x - 1;

describe('compose', () => {
  test('can compose one transformer', async () => {
    const stream = createStream([2, 3, 4, null]);
    const composed = compose(map(double))(stream);
    const result = await streamAsPromise(composed);
    expect(result).toEqual([4, 6, 8]);
  });

  test('can compose multiple transformers', async () => {
    const stream = createStream([2, 3, 4, null]);
    const composed = compose(
      map(double),
      map(minusOne),
    )(stream);
    const result = await streamAsPromise(composed);
    expect(result).toEqual([3, 5, 7]);
  });

  test('can compose multiple times', async () => {
    const stream = createStream([2, 3, 4, null]);
    const composed = compose(
      map(double),
      map(minusOne),
    )(stream);

    const composed2 = compose(map(double))(composed);
    const result = await streamAsPromise(composed2);
    expect(result).toEqual([6, 10, 14]);
  });


  describe('error forwarding', () => {
    test('forward the error of the first transformers', async () => {
      const error = new Error('A generic error');
      const stream = createStream([2, 3, 4, null]);
      const composed = compose(
        map(() => { throw error; }),
        map(double),
      )(stream);
      await expect(streamAsPromise(composed)).rejects.toBe(error);
    });

    test('forward the error of the last transformers', async () => {
      const error = new Error('A generic error');
      const stream = createStream([2, 3, 4, null]);
      const composed = compose(
        map(double),
        map(() => { throw error; }),
      )(stream);
      await expect(streamAsPromise(composed)).rejects.toBe(error);
    });

    test('forward the error of the middle transformers', async () => {
      const error = new Error('A generic error');
      const stream = createStream([2, 3, 4, null]);
      const composed = compose(
        map(double),
        map(() => { throw error; }),
        map(double),
      )(stream);
      await expect(streamAsPromise(composed)).rejects.toBe(error);
    });

    test('forward the error of the original stream', async () => {
      const error = new Error('A generic error');
      const stream = createStream([2, 3, 4, null]);
      const composed = compose(
        map(double),
        map(double),
      )(stream);
      stream.emit('error', error);
      await expect(streamAsPromise(composed)).rejects.toBe(error);
    });

    test('forward the error on multiple composition', async () => {
      const error = new Error('A generic error');
      const stream = createStream([2, 3, 4, null]);
      const composed = compose(
        map(double),
        map(double),
      )(stream);

      const composed2 = compose(map(double))(composed);
      stream.emit('error', error);
      await expect(streamAsPromise(composed2)).rejects.toBe(error);
    });
  });
});
