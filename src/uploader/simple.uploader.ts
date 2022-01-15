import { reducePromises } from 'utils/functions/reduce-promises.function';
import { NS } from '../types';

const SERVERS = ['n00dles', 'foodnstuff', 'sigma-cosmetics', 'joesguns', 'hong-fang-tea'];
const MINING_SCRIPT = 'simple.miner.js';

export async function main(ns: NS) {
  await reducePromises(...SERVERS.map((victim) => deploy(ns, victim)));
}

const deploy = async (ns: NS, targetServer: string): Promise<void> => {
  ns.nuke(targetServer);
  await ns.scp(MINING_SCRIPT, 'home', targetServer);
  SERVERS.forEach((victim) => {
    try {
      ns.exec(MINING_SCRIPT, targetServer, 1, victim);
    } catch (e) {
      ns.print(`Cannot spawn more processes for ${victim}`, e);
    }
  });
};
