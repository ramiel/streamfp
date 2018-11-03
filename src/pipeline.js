const { PassThrough } = require('stream');
const Duplexer = require('duplexer2');
const compose = require('./compose');

const defaultOptions = { readableObjectMode: true, writableObjectMode: true };

const pipeline = (options = defaultOptions) => (...transformers) => {
  const pt = new PassThrough(options);
  const piped = compose(...transformers)(pt);
  const dupl = Duplexer(options, pt, piped);

  return dupl;
};

/**
 * Given a series of transformations, return a pipeline
 * The pipeline is a Duplex stream that applies all the transformations in row.
 * Works only in object mode for the moment.
 * `pipeline` is different from `compose` because it simply build a pipeline for transformations
 * that can be composed again. `compose` do not support subcomposing and apply transformations
 * directly
 */
module.exports.factory = pipeline;
module.exports = pipeline();
