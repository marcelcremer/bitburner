import { discoverServers } from 'utils/functions/discover-servers.function';
import { NS } from '../../types';

export const getRandomServer = (ns: NS, ensureIsHackable = false) => {
  let tries = 0;
  const otherServers = discoverServers(ns).filter((server) => server != 'home' && !server.startsWith('bot') && server != 'darkweb');
  let target: string;
  do {
    if (tries == 100) return 'nope!';
    target = otherServers[Math.floor(Math.random() * otherServers.length)];
    tries++;
    if (!target) continue;
  } while (ensureIsHackable && ns.getServerRequiredHackingLevel(target) > ns.getHackingLevel());
  return target;
};
