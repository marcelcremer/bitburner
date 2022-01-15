export const reducePromises = (...promises: Promise<any>[]) => {
  return promises.reduce((prev, cur) => {
    return prev.then(() => cur);
  }, Promise.resolve());
};
