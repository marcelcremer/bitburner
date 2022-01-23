import { getRandomServer } from 'utils/functions/get-random-server.function';
import { NS } from '../types';

const orderIfPossible = (ns: NS, ram: number) => {
  const newServer = ns.purchaseServer('bot', ram);
  if (!newServer) {
    console.log('Server could not be bought!');
    return;
  }
  ns.tprint(`Bought Server with name ${newServer}`);
  const victim = getRandomServer(ns);
  spawnOnServer(ns, newServer, victim);
  ns.tprint(`${newServer} attacking ${victim}`);
};

const upgradeServer = (ns: NS, host, ram: number) => {
  ns.tprint(`Upgrading server ${host} to ${ram}GB RAM.`);
  ns.killall(host);
  if (!ns.deleteServer(host)) return;
  orderIfPossible(ns, ram);
};

const spawnOnServer = (ns: NS, target: string, victim: string) => {
  ns.killall(target);
  const spawned = ns.run('utils/spawner/miner.spawner.js', 1, target, victim);
  ns.tprint({ target, victim, spawned });
};

const getMaxRamAffordable = (ns: NS) => {
  let currentMax = 1;
  while (ns.getPlayer().money >= ns.getPurchasedServerCost(currentMax * 2)) currentMax = currentMax * 2;
  return currentMax;
};

const getPurchasedServers = (ns: NS) => {
  return ns.getPurchasedServers().map((entry) => ({
    host: entry,
    ram: ns.getServerMaxRam(entry),
  }));
};

export async function main(ns: NS) {
  let ram = +ns.args[0] ? +ns.args[0] : getMaxRamAffordable(ns);
  if (ram == 1) ram = 2;
  let purchasedServers = getPurchasedServers(ns);
  purchasedServers.forEach((entry) => spawnOnServer(ns, entry.host, getRandomServer(ns, true)));
  while (true) {
    const doesPlayerHaveEnoughMoney = ns.getPlayer().money >= ns.getPurchasedServerCost(ram);
    purchasedServers = getPurchasedServers(ns);
    ns.tprint(`Ordered ${ram}GB of Ram. Player ${doesPlayerHaveEnoughMoney ? 'has' : 'has not'} enough money to buy.`);
    let target: any = null;
    if (!doesPlayerHaveEnoughMoney) {
      await ns.sleep(10000);
      continue;
    } else if (ns.getPurchasedServerLimit() > purchasedServers.length) orderIfPossible(ns, ram);
    else if ((target = purchasedServers.find((entry) => entry.ram < ram)?.host)) upgradeServer(ns, target, ram);
    else ram = ram * 2;
    await ns.sleep(1000);
  }
}
