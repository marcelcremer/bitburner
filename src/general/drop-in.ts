import { NS } from "../types";

const servers = [
  "n00dles",
  "foodnstuff",
  "sigma-cosmetics",
  "joesguns",
  "hong-fang-tea",
];

export async function main(ns: NS) {
  await servers.reduce(
    async (_prev, victim) => await deploy(ns, victim),
    Promise.resolve()
  );
}

const deploy = async (ns: NS, targetServer: string) => {
  // ns.connect(targetServer);
  ns.nuke(targetServer);
  await ns.scp("n00dles.js", "home", targetServer);
  servers.forEach((victim) => {
    try {
      ns.exec(`n00dles.js`, targetServer, 1, victim);
    } catch (e) {
      ns.print(`Cannot spawn more processes for ${victim}`, e);
    }
  });
};
