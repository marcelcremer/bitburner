import { NS } from '../../types';

function discoverTargets(ns, origin = 'home', targets: string[] = []): string[] {
  const newTargets = ns
    .scan(origin)
    .filter((host) => host != origin)
    .filter((host) => targets.indexOf(host) == -1);
  let fullTargets = targets.concat(newTargets);
  return fullTargets
    .concat(newTargets.map((host) => discoverTargets(ns, host, fullTargets)).reduce((prev, cur) => prev.concat(cur), []))
    .filter((entry, index, arr) => arr.findIndex((x) => x == entry) == index);
}

export async function main(ns: NS) {
  const maxServer = discoverTargets(ns)
    .map((host) => ({
      host,
      amount: ns.getServerMaxMoney(host),
    }))
    .filter((entry) => ns.getServerRequiredHackingLevel(entry.host) < ns.getHackingLevel())
    .reduce((prev, cur) => (prev.amount > cur.amount ? prev : cur), { host: '', amount: 0 });
  ns.tprint(`Server with max Amount: ${maxServer.host} (${maxServer.amount})`);
}
