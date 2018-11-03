const { Transform } = require('stream');
const { streamAsPromise, createStream } = require('utils');
const filter = require('filter');


describe('filter', () => {
  test('a transform stream is returned', () => {
    const r = filter(() => true);
    expect(r).toBeInstanceOf(Transform);
  });

  test('filter some values', async () => {
    const stream = createStream();
    stream.push(4);
    stream.push(5);
    stream.push(1);
    stream.push(null);
    const filteredStream = stream.pipe(filter(x => x % 2 === 0));
    const result = await streamAsPromise(filteredStream);
    expect(result).toEqual([4]);
  });

  test('emit an error if the filter function emits an error', async () => {
    const stream = createStream();
    stream.push(4);
    stream.push(5);
    stream.push(1);
    stream.push(null);
    const filteredStream = stream.pipe(filter(() => { throw new Error(); }));
    await expect(streamAsPromise(filteredStream)).rejects.toBeInstanceOf(Error);
  });

  test('by default filters nothing', async () => {
    const stream = createStream();
    stream.push(4);
    stream.push(5);
    stream.push(1);
    stream.push(null);
    const filteredStream = stream.pipe(filter());
    const result = await streamAsPromise(filteredStream);
    expect(result).toEqual([4, 5, 1]);
  });
});
