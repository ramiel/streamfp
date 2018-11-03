const MultiStream = require('multistream');

module.exports = (streams, objectMode = true) => (objectMode
  ? MultiStream.obj(streams)
  : MultiStream(streams));


// This is an old implementation but has some limits on merge of merges

// const { PassThrough } = require('stream');

// /**
//  * Merge two streams in one
//  * @param {[Readable]]} streams An array of readable streams
//  * @param {Object} options Any options accepted by the duplex stream constructor. By default it works in
//  *                    object mode for both in and out stream
//  *
//  */
// module.exports = (streams, options = {}) => {
//   if (!Array.isArray(streams)) {
//     throw new Error('Merge expect an array of streams');
//   }
//   let count = streams.length;
//   const passThrough = new PassThrough({
//     readableObjectMode: true,
//     writableObjectMode: true,
//     ...options,
//   });

//   return streams.reduce((merged, stream) => {
//     stream.pipe(merged, { end: false });
//     stream.once('end', () => {
//       count -= 1;
//       if (count <= 0) {
//         merged.emit('end');
//       }
//     });
//     stream.once('error', e => merged.emit('error', e));
//     return merged;
//   }, passThrough);
// };
