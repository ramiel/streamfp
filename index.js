const { streamAsPromise } = require('./src/utils');
const compose = require('./src/compose');
const filter = require('./src/filter');
const forEach = require('./src/forEach');
const fromValues = require('./src/fromValues');
const group = require('./src/group');
const groupBy = require('./src/groupBy');
const inspect = require('./src/inspect');
const last = require('./src/last');
const map = require('./src/map');
const mapAsync = require('./src/mapAsync');
const merge = require('./src/merge');
const objectValues = require('./src/objectValues');
const pipeline = require('./src/pipeline');
const reduce = require('./src/reduce');

module.exports = {
  compose,
  fromValues,
  merge,
  pipeline,
  streamAsPromise,

  filter,
  forEach,
  group,
  groupBy,
  inspect,
  last,
  map,
  mapAsync,
  objectValues,
  reduce,
};
