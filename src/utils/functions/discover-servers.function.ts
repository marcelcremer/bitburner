import { NS } from '../../types';
export const discoverServers = (ns: NS, origin = 'home', targets: string[] = []): string[] => {
  const newTargets = ns
    .scan(origin)
    .filter((host) => host != origin)
    .filter((host) => targets.indexOf(host) == -1);
  let fullTargets = targets.concat(newTargets);
  return fullTargets
    .concat(newTargets.map((host) => discoverServers(ns, host, fullTargets)).reduce((prev, cur) => prev.concat(cur), []))
    .filter((entry, index, arr) => arr.findIndex((x) => x == entry) == index);
};
