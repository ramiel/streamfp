const reducer = require('./reducer');

/**
 * Returns a transformation that emits only the latest chunk
 */
const last = () => reducer((acc, chunk) => chunk, null);

module.exports = last;
