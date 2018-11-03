const fromValues = require('./fromValues');

const utils = {
  streamAsPromise: stream => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (data) => { chunks.push(data); });
    stream.on('end', () => resolve(chunks));
    stream.on('error', reject);
  }),

  createStream: fromValues,
};

module.exports = utils;
