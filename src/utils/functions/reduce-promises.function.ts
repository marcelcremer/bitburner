export const reducePromises = async (...promises: Promise<any>[]) => {
  return promises.reduce(async (prev, cur, i) => {
    await prev;
    console.log({ prev, cur, i });
    return cur;
  }, Promise.resolve());
};
