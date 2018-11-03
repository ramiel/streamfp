const { Readable } = require('stream');

/**
 * Return a readable stream optionally populated with values
 */
module.exports = (data) => {
  const stream = new Readable({
    objectMode: true,
    read() { },
  });
  if (data && Array.isArray(data)) {
    data.forEach(stream.push.bind(stream));
  }
  return stream;
};
