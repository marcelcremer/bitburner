import { discoverServers } from 'utils/functions/discover-servers.function';
import { getRandomServer } from 'utils/functions/get-random-server.function';
import { reducePromises } from 'utils/functions/reduce-promises.function';
import { NS } from '../types';

const MINING_SCRIPT = 'miner/simple.miner.js';
const HACK_EXP_GRINDER_SCRIPT = 'grinder/hack-exp.grinder.js';
const TARGET_SCRIPT = MINING_SCRIPT;
const UPLOAD_SCRIPT = 'uploader/simple.uploader.js';

class Uploader {
  targets: string[] = [];
  ns: NS = <any>{};
  availableScripts = ['brutessh', 'ftpcrack', 'relaysmtp', 'httpworm', 'sqlinject'];
  currentHost = 'home';
  origin = 'home';
  nextLevel = 0;

  constructor(initialValues: Partial<Uploader>) {
    if (initialValues) Object.assign(this, initialValues);
    this.targets = discoverServers(this.ns);
  }

  async run() {
    while (true) {
      if (this.nextLevel > this.ns.getHackingLevel()) await this.ns.sleep(1000);
      else {
        const nukedTargets = await this.nukeThemAll();
        await this.deployEverywhere(nukedTargets.filter((entry) => entry != 'home').concat('home'));
      }
    }
  }

  async nukeThemAll(): Promise<string[]> {
    let nukedTargets: string[] = [];
    let triedScripts: string[];

    this.nextLevel = Math.min(...this.targets.map((entry) => this.ns.getServerRequiredHackingLevel(entry)).filter((level) => level > this.ns.getHackingLevel()));

    this.log(`Next lowest hacking level: ${this.nextLevel}`);

    for (let victim of this.targets) {
      triedScripts = [];
      if (this.ns.getServerRequiredHackingLevel(victim) > this.ns.getHackingLevel()) continue;
      while (this.availableScripts.filter((script) => triedScripts.indexOf(script) == -1).length >= 0) {
        try {
          await this.ns.nuke(victim);
          nukedTargets.push(victim);
          break;
        } catch (e) {
          this.log(e);
          const nextScript = this.availableScripts.find((script) => triedScripts.indexOf(script) == -1);
          if (!nextScript) break;
          triedScripts.push(nextScript);

          if (!this.ns.fileExists(`${nextScript}.exe`, 'home')) continue;
          this.ns[nextScript](victim);
          continue;
        }
      }
    }

    return nukedTargets;
  }

  async deployEverywhere(nukedTargets: string[]) {
    console.log('order', nukedTargets);
    for (let victim of nukedTargets) {
      try {
        if (victim == 'home' || victim.startsWith('bot')) continue;
        await this.deploy(victim);
      } catch (e) {
        this.log(e);
      }
    }
  }

  async deploy(targetServer: string): Promise<void> {
    let threads = Math.floor(this.ns.getServerMaxRam(targetServer) / this.ns.getScriptRam(`/${TARGET_SCRIPT}`, targetServer));
    if (threads == 0) return;
    await this.ns.scp(`/${TARGET_SCRIPT}`, this.currentHost, targetServer);
    this.ns.killall(targetServer);
    try {
      if (this.ns.exec(TARGET_SCRIPT, targetServer, threads, targetServer) == 0) throw new Error();
    } catch (e) {
      this.log(`Spawning of script ${TARGET_SCRIPT} on ${targetServer} failed! Error: ${(<Error>e).message}`);
    }
  }

  log(...data: any[]) {
    console.log(`[${this.origin}]`, ...data);
    this.ns.tprint(`[${this.origin}]`, ...data);
  }
}

export async function main(ns: NS) {
  const currentHost = ns.args[0] ? <string>ns.args[0] || 'home' : 'home';
  const origin = ns.args[1] ? <string>ns.args[1] || 'home' : 'home';
  const uploader = new Uploader({
    ns,
    currentHost,
    origin,
  });
  await uploader.run();
}
