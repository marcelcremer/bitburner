import { getRandomServer } from 'utils/functions/get-random-server.function';
import { NS } from '../../types';

const MINING_SCRIPT = 'miner/simple.miner.js';
const HACK_EXP_GRINDER_SCRIPT = 'grinder/hack-exp.grinder.js';
const TARGET_SCRIPT = MINING_SCRIPT;

const log = (ns: NS, ...args) => ns.tprint(...args);

async function deploy(ns: NS, targetServer: string, victim: string): Promise<any> {
  if (targetServer != 'home') await ns.scp(`/${TARGET_SCRIPT}`, 'home', targetServer);
  log(ns, `Spawning modules at ${targetServer} with victim ${victim}...`);
  if (!ns.hasRootAccess(targetServer)) return;

  if (targetServer == 'home')
    return ns.exec(
      `/${TARGET_SCRIPT}`,
      'home',
      Math.floor((ns.getServerMaxRam(targetServer) - ns.getServerUsedRam(targetServer)) / ns.getScriptRam(`/${TARGET_SCRIPT}`, targetServer)),
      victim
    );
  let threads = Math.floor(ns.getServerMaxRam(targetServer) / ns.getScriptRam(`/${TARGET_SCRIPT}`, targetServer));
  ns.killall(targetServer);
  log(ns, `${threads} Threads possible...`);
  if (threads == 0) return deploy(ns, targetServer, getRandomServer(ns, true));
  try {
    if (ns.exec(TARGET_SCRIPT, targetServer, threads, victim) == 0) throw new Error(`Spawning of script ${TARGET_SCRIPT} on ${targetServer} failed!`);
    else log(ns, `Deployment of script ${TARGET_SCRIPT} on ${targetServer} successful!`);
  } catch (e) {
    log(ns, `Cannot spawn process: ${(<Error>e).message}`);
  }
}

export async function main(ns: NS) {
  await deploy(ns, <string>ns.args[0], <string>ns.args[1]);
}
