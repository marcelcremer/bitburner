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
  ns.tprint(`Top 5 servers by max money:`);
  discoverTargets(ns)
    .map((host) => ({
      host,
      amount: ns.getServerMaxMoney(host),
    }))
    .filter((entry) => ns.getServerRequiredHackingLevel(entry.host) < ns.getHackingLevel())
    .sort((prev, cur) => (prev.amount > cur.amount ? -1 : prev.amount == cur.amount ? 0 : 1))
    .filter((x, i) => i < 5)
    .forEach((entry, i) => ns.tprint(`${i + 1}: ${entry.host} (${entry.amount})`));
}
