/* eslint-disable no-console */
const { Transform } = require('stream');
const inspect = require('inspect');
const { createStream, streamAsPromise } = require('utils');

global.console = { log: jest.fn() };

describe('inspect', () => {
  beforeEach(() => {
    console.log.mockClear();
  });

  test('a transform stream is returned', () => {
    const r = inspect();
    expect(r).toBeInstanceOf(Transform);
  });

  test('console is used as default log method', async () => {
    const stream = createStream([
      1,
      2,
      null,
    ]);
    await streamAsPromise(stream.pipe(inspect()));
    expect(console.log).toHaveBeenCalledTimes(2);
  });

  test('a custom log method can be passed', async () => {
    const myLogFunc = jest.fn();
    const stream = createStream([
      1,
      2,
      null,
    ]);
    await streamAsPromise(stream.pipe(inspect(myLogFunc)));
    expect(myLogFunc).toHaveBeenCalledTimes(2);
  });

  test('a custom title can be appended', async () => {
    const stream = createStream([
      1,
      2,
      null,
    ]);
    await streamAsPromise(stream.pipe(inspect('here')));
    expect(console.log).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenLastCalledWith(2, 'here');
  });

  test('the original chunks are not modified', async () => {
    const stream = createStream([
      1,
      2,
      null,
    ]);
    const res = await streamAsPromise(stream.pipe(inspect()));
    expect(res).toEqual([1, 2]);
  });
});

/* eslint-enable no-console */
