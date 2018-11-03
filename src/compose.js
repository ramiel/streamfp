const compose = (...writables) => (readable) => {
  const onError = (e) => {
    writables.forEach((w) => {
      /* istanbul ignore else  */
      if (w.destroy) {
        w.destroy(e);
      }
    });
  };
  return writables.reduce(
    (transformed, fn) => transformed.on('error', onError).pipe(fn),
    readable,
  );
};

module.exports = compose;
