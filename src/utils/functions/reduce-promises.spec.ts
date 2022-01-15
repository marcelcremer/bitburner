import { reducePromises } from 'utils/functions/reduce-promises.function';

const createPromiseWithTimeout = (timeout: number, cb: Function) => {
  return new Promise((resolve) => setTimeout(() => resolve(cb()), timeout));
};

describe('Promise reducer', () => {
  it('should call the promises sequentially', async () => {
    let arr: number[] = [];
    await reducePromises(
      createPromiseWithTimeout(30, () => arr.push(1)),
      createPromiseWithTimeout(1, () => arr.push(2)),
      createPromiseWithTimeout(15, () => arr.push(3))
    );

    expect(arr).toEqual([3, 2, 1]);
  });
});
