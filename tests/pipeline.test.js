const { Duplex } = require('stream');
const pipeline = require('pipeline');
const map = require('map');
const compose = require('compose');
const { createStream, streamAsPromise } = require('utils');

const double = x => x * 2;
const triple = x => x * 3;
const minusOne = x => x - 1;

describe('pipeline', () => {
  test.skip('return a Duplex', () => {
    const piped = pipeline();
    expect(piped).toBeInstanceOf(Duplex);
  });

  test('compose of compose', async () => {
    const stream = createStream([1, 3, 4, null]);
    const rs = compose(
      pipeline(
        map(double),
        map(double),
      ),
      map(minusOne),
    )(stream);
    const result = await streamAsPromise(rs);
    expect(result).toEqual([3, 11, 15]);
  });

  test('pipe of pipe', async () => {
    const stream = createStream([1, 3, 4, null]);
    const inner = pipeline(
      map(double),
      map(double),
    );
    const rs = stream.pipe(inner).pipe(map(minusOne));
    const result = await streamAsPromise(rs);
    expect(result).toEqual([3, 11, 15]);
  });

  test('deeper compose of compose', async () => {
    const stream = createStream([1, 3, 4, null]);
    const rs = compose(
      pipeline(
        map(double),
        pipeline(
          map(double),
          map(triple),
        ),
      ),
      map(minusOne),
    )(stream);
    const result = await streamAsPromise(rs);
    expect(result).toEqual([11, 35, 47]);
  });

  test('expose any error in the chain (beginning)', async () => {
    const stream = createStream([1, 3, 4, null]);
    const error = new Error('An error on first transformer');
    const rs = compose(
      pipeline(
        map(() => { throw error; }),
        map(double),
      ),
      map(minusOne),
    )(stream);
    await expect(streamAsPromise(rs)).rejects.toBe(error);
  });

  test('expose any error in the chain (end)', async () => {
    const stream = createStream([1, 3, 4, null]);
    const error = new Error('An error on first transformer');
    const rs = compose(
      pipeline(
        map(double),
        map(() => { throw error; }),
      ),
      map(minusOne),
    )(stream);
    await expect(streamAsPromise(rs)).rejects.toBe(error);
  });
});
