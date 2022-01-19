import { reducePromises } from 'utils/functions/reduce-promises.function';
import { NS } from '../types';

const MINING_SCRIPT = 'miner/simple.miner.js';
const HACK_EXP_GRINDER_SCRIPT = 'grinder/hack-exp.grinder.js';
const TARGET_SCRIPT = MINING_SCRIPT;
const UPLOAD_SCRIPT = 'uploader/simple.uploader.js';

class Uploader {
  targets: string[] = [];
  ns: NS = <any>{};
  availableScripts = ['brutessh', 'ftpcrack'];
  currentHost = 'home';
  origin = 'home';

  constructor(initialValues: Partial<Uploader>) {
    if (initialValues) Object.assign(this, initialValues);
    this.targets = this.discoverTargets();
  }

  async run() {
    const nukedTargets = await this.nukeThemAll();
    await this.deployEverywhere(nukedTargets.filter((entry) => entry != 'home').concat('home'));
  }

  async nukeThemAll(): Promise<string[]> {
    let nukedTargets: string[] = [];
    let triedScripts: string[];

    this.log(
      `Next lowest hacking level: ${Math.min(...this.targets.map((entry) => this.ns.getServerRequiredHackingLevel(entry)).filter((level) => level > this.ns.getHackingLevel()))}`
    );

    for (let victim of this.targets) {
      triedScripts = [];
      if (this.ns.getServerRequiredHackingLevel(victim) > this.ns.getHackingLevel()) continue;
      this.log(`
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢
Trying to NUKE target ${victim}...
☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢☢
`);
      while (this.availableScripts.filter((script) => triedScripts.indexOf(script) == -1).length > 0) {
        try {
          await this.ns.nuke(victim);
          nukedTargets.push(victim);
          this.log(`Success!`);
          break;
        } catch (e) {
          this.log(e);
          const nextScript = this.availableScripts.find((script) => triedScripts.indexOf(script) == -1) || '';
          triedScripts.push(nextScript);
          this.log(`As NUKE was unsuccessful, trying to open a port with ${nextScript}...`);
          if (!this.ns.fileExists(`${nextScript}.exe`, 'home')) continue;
          this.ns[nextScript](victim);
          this.log(`${nextScript} executed!`);
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
        await this.deploy(victim);
      } catch (e) {
        this.log(e);
      }
    }
  }

  async deploy(targetServer: string): Promise<void> {
    this.log(`Spawning modules at ${targetServer}...`);
    let threads = Math.floor(this.ns.getServerMaxRam(targetServer) / this.ns.getScriptRam(`/${TARGET_SCRIPT}`, targetServer));
    if (targetServer == 'home') {
      this.log('Terminating and spawning miner...');
      this.ns.spawn(`/${TARGET_SCRIPT}`, threads, 'home');
    }
    await this.ns.scp(`/${TARGET_SCRIPT}`, this.currentHost, targetServer);
    this.ns.killall(targetServer);
    this.log(`${threads} Threads possible...`);
    try {
      let victim = targetServer;
      if (targetServer == 'home' || targetServer.startsWith('bot')) {
        const otherServers = this.targets.filter((server) => server != 'home' && !server.startsWith('bot'));
        victim = otherServers[Math.random() * otherServers.length];
      }
      if (this.ns.exec(TARGET_SCRIPT, targetServer, threads, victim) == 0) throw new Error(`Spawning of script ${TARGET_SCRIPT} on ${targetServer} failed!`);
      else this.log(`Deployment of script ${TARGET_SCRIPT} on ${targetServer} successful!`);
    } catch (e) {
      this.log(`Cannot spawn process: ${(<Error>e).message}`);
    }
  }

  log(...data: any[]) {
    console.log(`[${this.origin}->${this.currentHost}]`, ...data);
    this.ns.tprint(`[${this.origin}->${this.currentHost}]`, ...data);
  }

  private discoverTargets(origin = 'home', targets: string[] = []): string[] {
    const newTargets = this.ns
      .scan(origin)
      .filter((host) => host != origin)
      .filter((host) => targets.indexOf(host) == -1);
    let fullTargets = targets.concat(newTargets);
    return fullTargets
      .concat(newTargets.map((host) => this.discoverTargets(host, fullTargets)).reduce((prev, cur) => prev.concat(cur), []))
      .filter((entry, index, arr) => arr.findIndex((x) => x == entry) == index);
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
