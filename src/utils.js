const fromValues = require('./fromValues');

const utils = {
  streamAsPromise: stream => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (data) => { chunks.push(data); });
    stream.on('end', () => resolve(chunks));
    stream.on('error', reject);
  }),

  createStream: fromValues,

  /**
   * Return true if the callable is a function
   * Duck-typing by underscore
   */
  isCallable: callable => !!(callable && callable.constructor && callable.call && callable.apply),
};

module.exports = utils;
