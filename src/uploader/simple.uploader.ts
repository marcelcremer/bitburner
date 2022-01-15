import { reducePromises } from 'utils/functions/reduce-promises.function';
import { NS } from '../types';

const SERVERS = ['n00dles', 'foodnstuff', 'sigma-cosmetics', 'joesguns', 'hong-fang-tea'];
const MINING_SCRIPT = 'miner/simple.miner.js';

export async function main(ns: NS) {
  for (let victim of SERVERS) await deploy(ns, victim);
}

const deploy = async (ns: NS, targetServer: string): Promise<void> => {
  ns.tprint(`Spawning modules at ${targetServer}`);
  ns.nuke(targetServer);
  await ns.scp(`/${MINING_SCRIPT}`, 'home', targetServer);
  SERVERS.forEach((victim) => {
    try {
      if (ns.exec(MINING_SCRIPT, targetServer, 1, victim) == 0) throw new Error(`Spawning of script ${MINING_SCRIPT} on ${targetServer} for victim ${victim} failed!`);
    } catch (e) {
      ns.tprint(`Cannot spawn process: ${(<Error>e).message}`);
    }
  });
};
