const { finished: originalFinished } = require('stream');
const { promisify } = require('util');
const fromValues = require('./fromValues');

const finished = promisify(originalFinished);

const utils = {
  /**
   * Return a promise from a stream
   * @params {Object} options
   * @params {Boolean} options.getData If true the promise will resolve with the data. Default true
   * @params {Boolean} options.drain   If true and if possible the stream will be drained calling
   *                                   "resume" on it. This let the stream complete even if no data
   *                                   is collected. Default true
   */
  streamAsPromise: async (
    stream,
    { getData = true, drain = true } = { getData: true, drain: true },
  ) => {
    const chunks = [];
    if (getData) {
      stream.on('data', (data) => { chunks.push(data); });
    }
    const promise = finished(stream);
    if (drain && stream.resume) {
      stream.resume();
    }
    await promise;
    return chunks;
  },

  createStream: fromValues,

  /**
   * Return true if the callable is a function
   * Duck-typing by underscore
   */
  isCallable: callable => !!(callable && callable.constructor && callable.call && callable.apply),
};

module.exports = utils;
