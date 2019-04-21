const reduce = require('./reduce');
const objectValues = require('./objectValues');
const pipeline = require('./pipeline');

/**
 * Group several chunks togheter based on a property.
 * Any duplicated property will be overwritten.
 * Works only in object-mode
 *
 * e.g.
 *
 * compose(
 *  groupBy('user)
 * )(stream)
 *
 * [{user: '123', name: 'Tyrion}, {user: '456', name: 'John}, {user: '123', lastname: 'Lannister}]
 * returns
 * [{user: '123', name: 'Tyrion,  lastname: 'Lannister}, {user: '456', name: 'John}]
 *
 */
module.exports = propName => pipeline(
  reduce((grouped, element) => ({
    ...grouped,
    [element[propName]]: {
      ...grouped[element[propName]],
      ...element,
    },
  }), {}),
  objectValues(),
);
