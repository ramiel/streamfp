const { Transform, Readable } = require('stream');
const group = require('group');

const getStream = () => new Readable({
  objectMode: true,
  read() { },
});

describe('group', () => {
  test('a transform stream is returned', () => {
    const r = group();
    expect(r).toBeInstanceOf(Transform);
  });

  test('4 chunks are grouped by 2 if size is 2', (done) => {
    const r = group(2);
    const stream = getStream();
    stream.push({});
    stream.push({});
    stream.push({});
    stream.push({});
    stream.push(null);
    const result = stream.pipe(r);
    const chunks = [];
    result.on('data', c => chunks.push(c));
    result.on('end', () => {
      expect(chunks).toHaveLength(2);
      chunks.forEach(chunk => expect(chunk).toHaveLength(2));
      done();
    });
    result.on('error', done);
  });

  test('2 chunks are grouped by 1 if size is 1', (done) => {
    const r = group(1);
    const stream = getStream();
    stream.push({});
    stream.push({});
    stream.push(null);
    const result = stream.pipe(r);
    const chunks = [];
    result.on('data', c => chunks.push(c));
    result.on('end', () => {
      expect(chunks).toHaveLength(2);
      chunks.forEach(chunk => expect(chunk).toHaveLength(1));
      done();
    });
    result.on('error', done);
  });

  test('default size is 1', (done) => {
    const r = group();
    const stream = getStream();
    stream.push({});
    stream.push({});
    stream.push(null);
    const result = stream.pipe(r);
    const chunks = [];
    result.on('data', c => chunks.push(c));
    result.on('end', () => {
      expect(chunks).toHaveLength(2);
      chunks.forEach(chunk => expect(chunk).toHaveLength(1));
      done();
    });
    result.on('error', done);
  });

  test('20 chunks are grouped by 4 if size is 5', (done) => {
    const size = 5;
    const r = group(size);
    const stream = getStream();
    for (let i = 0; i < 20; i++) {
      stream.push({});
    }
    stream.push(null);
    const result = stream.pipe(r);
    const chunks = [];
    result.on('data', c => chunks.push(c));
    result.on('end', () => {
      expect(chunks).toHaveLength(4);
      chunks.forEach(chunk => expect(chunk).toHaveLength(size));
      done();
    });
    result.on('error', done);
  });

  test('23 chunks are grouped 4 times (size = 5) plus 1 last (size = 3) if size is 5', (done) => {
    const size = 5;
    const count = 23;
    const r = group(size);
    const stream = getStream();
    for (let i = 0; i < count; i++) {
      stream.push({});
    }
    stream.push(null);
    const result = stream.pipe(r);
    const chunks = [];
    result.on('data', c => chunks.push(c));
    result.on('end', () => {
      expect(chunks).toHaveLength(5);
      for (let i = 0, len = chunks.length - 2; i < len; i++) {
        expect(chunks[i]).toHaveLength(size);
      }
      expect(chunks[chunks.length - 1]).toHaveLength(count % size);
      done();
    });
    result.on('error', done);
  });
});
