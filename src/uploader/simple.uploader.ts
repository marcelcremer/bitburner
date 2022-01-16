import { reducePromises } from 'utils/functions/reduce-promises.function';
import { NS } from '../types';

const MINING_SCRIPT = 'miner/simple.miner.js';

class Uploader {
  targets: string[] = [];
  ns: NS = <any>{};
  availableScripts = ['brutessh', 'ftpcrack'];
  currentHost = 'home';

  constructor(initialValues: Partial<Uploader>) {
    if (initialValues) Object.assign(this, initialValues);
  }

  async run() {
    await this.nukeThemAll();
    await this.deployEverywhere();
  }

  async nukeThemAll() {
    let triedScripts: string[];
    for (let victim of this.targets) {
      triedScripts = [];
      while (this.availableScripts.filter((script) => triedScripts.indexOf(script) == -1).length > 0) {
        this.log(this.availableScripts, this.availableScripts.filter((script) => triedScripts.indexOf(script) == -1).length);
        try {
          await this.ns.nuke(victim);
          break;
        } catch (e) {
          this.log(e);
          const nextScript = this.availableScripts.find((script) => triedScripts.indexOf(script) == -1) || '';
          triedScripts.push(nextScript);
          this.log(`As NUKE was unsuccessful, trying to open a port with ${nextScript}...`);
          if (!this.ns.fileExists(`${nextScript}.exe`, this.currentHost)) continue;
          this.ns[nextScript](victim);
          continue;
        }
      }
    }
  }

  async deployEverywhere() {
    for (let victim of this.targets) {
      try {
        await this.deploy(victim);
      } catch (e) {
        this.log(e);
      }
    }
  }

  async deploy(targetServer: string): Promise<void> {
    this.log(`Spawning modules at ${targetServer}`);
    this.ns.nuke(targetServer);
    await this.ns.scp(`/${MINING_SCRIPT}`, 'home', targetServer);
    this.targets.forEach((victim) => {
      try {
        if (this.ns.exec(MINING_SCRIPT, targetServer, 1, victim) == 0) throw new Error(`Spawning of script ${MINING_SCRIPT} on ${targetServer} for victim ${victim} failed!`);
      } catch (e) {
        this.log(`Cannot spawn process: ${(<Error>e).message}`);
      }
    });
  }

  log(...data: any[]) {
    console.log(...data);
    this.ns.tprint(...data);
  }
}

export async function main(ns: NS) {
  const targets = ns.scan();
  const uploader = new Uploader({
    ns,
    targets,
  });
  await uploader.run();
}
