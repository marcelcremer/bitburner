import { NS } from '../types';

export async function main(ns: NS) {
  while (true) {
    try {
      await ns.weaken(`${ns.args[0]}`);
    } catch (e) {
      ns.tprint('Something went horribly wrong!', e);
      break;
    }
  }
}
