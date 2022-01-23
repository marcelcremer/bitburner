import { NS } from '../../types';
import { discoverServers } from 'utils/functions/discover-servers.function';

export async function main(ns: NS) {
  ns.tprint(`Top 5 servers by max money:`);
  discoverServers(ns)
    .map((host) => ({
      host,
      amount: ns.getServerMaxMoney(host),
    }))
    .filter((entry) => ns.getServerRequiredHackingLevel(entry.host) < ns.getHackingLevel())
    .sort((prev, cur) => (prev.amount > cur.amount ? -1 : prev.amount == cur.amount ? 0 : 1))
    .filter((x, i) => i < 5)
    .forEach((entry, i) => ns.tprint(`${i + 1}: ${entry.host} (${entry.amount})`));
}
