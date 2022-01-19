import { NS } from '../../types';

const MINING_SCRIPT = 'miner/simple.miner.js';
const HACK_EXP_GRINDER_SCRIPT = 'grinder/hack-exp.grinder.js';
const TARGET_SCRIPT = MINING_SCRIPT;

const log = (ns: NS, ...args) => ns.tprint(...args);

async function deploy(ns: NS, targetServer: string, victim: string): Promise<void> {
  if (targetServer != 'home') await ns.scp(`/${TARGET_SCRIPT}`, 'home', targetServer);
  log(ns, `Spawning modules at ${targetServer}...`);
  let threads = Math.floor(ns.getServerMaxRam(targetServer) / ns.getScriptRam(`/${TARGET_SCRIPT}`, targetServer));
  if (targetServer == 'home') ns.spawn(`/${TARGET_SCRIPT}`, threads, targetServer);
  ns.killall(targetServer);
  log(ns, `${threads} Threads possible...`);
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
