const { Duplex } = require('stream');
const pipeline = require('pipeline');
const mapper = require('mapper');
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
        mapper(double),
        mapper(double),
      ),
      mapper(minusOne),
    )(stream);
    const result = await streamAsPromise(rs);
    expect(result).toEqual([3, 11, 15]);
  });

  test('pipe of pipe', async () => {
    const stream = createStream([1, 3, 4, null]);
    const inner = pipeline(
      mapper(double),
      mapper(double),
    );
    const rs = stream.pipe(inner).pipe(mapper(minusOne));
    const result = await streamAsPromise(rs);
    expect(result).toEqual([3, 11, 15]);
  });

  test('deeper compose of compose', async () => {
    const stream = createStream([1, 3, 4, null]);
    const rs = compose(
      pipeline(
        mapper(double),
        pipeline(
          mapper(double),
          mapper(triple),
        ),
      ),
      mapper(minusOne),
    )(stream);
    const result = await streamAsPromise(rs);
    expect(result).toEqual([11, 35, 47]);
  });

  test('expose any error in the chain (beginning)', async () => {
    const stream = createStream([1, 3, 4, null]);
    const error = new Error('An error on first transformer');
    const rs = compose(
      pipeline(
        mapper(() => { throw error; }),
        mapper(double),
      ),
      mapper(minusOne),
    )(stream);
    await expect(streamAsPromise(rs)).rejects.toBe(error);
  });

  test('expose any error in the chain (end)', async () => {
    const stream = createStream([1, 3, 4, null]);
    const error = new Error('An error on first transformer');
    const rs = compose(
      pipeline(
        mapper(double),
        mapper(() => { throw error; }),
      ),
      mapper(minusOne),
    )(stream);
    await expect(streamAsPromise(rs)).rejects.toBe(error);
  });
});
