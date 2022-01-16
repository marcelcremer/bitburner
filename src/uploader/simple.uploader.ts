import { reducePromises } from 'utils/functions/reduce-promises.function';
import { NS } from '../types';

const MINING_SCRIPT = 'miner/simple.miner.js';
const UPLOAD_SCRIPT = 'uploader/simple.uploader.js';

class Uploader {
  targets: string[] = [];
  ns: NS = <any>{};
  availableScripts = ['brutessh', 'ftpcrack'];
  currentHost = 'home';
  origin = 'home';

  constructor(initialValues: Partial<Uploader>) {
    if (initialValues) Object.assign(this, initialValues);
  }

  async run() {
    const nukedTargets = await this.nukeThemAll();
    await this.deployEverywhere(nukedTargets);
  }

  async nukeThemAll(): Promise<string[]> {
    let nukedTargets: string[] = [];
    let triedScripts: string[];
    for (let victim of this.targets) {
      triedScripts = [];
      if (this.ns.getServerRequiredHackingLevel(victim) > this.ns.getHackingLevel()) continue;
      while (this.availableScripts.filter((script) => triedScripts.indexOf(script) == -1).length > 0) {
        this.log(this.availableScripts, this.availableScripts.filter((script) => triedScripts.indexOf(script) == -1).length);
        try {
          await this.ns.nuke(victim);
          nukedTargets.push(victim);
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
    for (let victim of nukedTargets) {
      try {
        await this.deploy(victim);
      } catch (e) {
        this.log(e);
      }
    }
  }

  async deploy(targetServer: string): Promise<void> {
    this.log(`Spawning modules at ${targetServer}`);
    await this.uploadScriptsToTargetServer(targetServer);

    this.log(`Upload completed! Trying to replicate...`);
    // const freeRam = this.ns.getServerMaxRam(targetServer) - this.ns.getServerUsedRam(targetServer);
    // this.log(`Free RAM on ${targetServer} is ${freeRam}GB`);
    if (this.ns.getServerMaxRam(targetServer) > 5) this.replicateSelf(targetServer);
    else this.log(`Victim ${targetServer} has not enough RAM to replicate`);

    this.targets.forEach((victim) => {
      try {
        if (this.ns.exec(MINING_SCRIPT, targetServer, 1, victim) == 0) throw new Error(`Spawning of script ${MINING_SCRIPT} on ${targetServer} for victim ${victim} failed!`);
        else this.log(`Spawned script ${MINING_SCRIPT} on ${targetServer} for victim ${victim}!`);
      } catch (e) {
        this.log(`Cannot spawn process: ${(<Error>e).message}`);
      }
    });
  }

  private async uploadScriptsToTargetServer(targetServer: string) {
    await this.ns.scp(`/${MINING_SCRIPT}`, this.currentHost, targetServer);
    await this.ns.scp(`/${UPLOAD_SCRIPT}`, this.currentHost, targetServer);
  }

  private replicateSelf(targetServer: string) {
    this.log(`Killing all foreign processes...`);
    this.ns.killall(targetServer);
    if (this.ns.exec(UPLOAD_SCRIPT, targetServer, 1, targetServer, this.currentHost) == 0)
      this.log(`Spawning of script ${UPLOAD_SCRIPT} on ${targetServer} for targetServer ${targetServer} failed!`);
    else this.log(`Next uploader started successfully!`);
  }

  log(...data: any[]) {
    console.log(`[${this.origin}->${this.currentHost}]`, ...data);
    this.ns.tprint(`[${this.origin}->${this.currentHost}]`, ...data);
  }
}

export async function main(ns: NS) {
  const currentHost = ns.args[0] ? <string>ns.args[0] || 'home' : 'home';
  const origin = ns.args[1] ? <string>ns.args[1] || 'home' : 'home';
  const targets = ns.scan(currentHost).filter((host) => host != origin);
  const uploader = new Uploader({
    ns,
    targets,
    currentHost,
    origin,
  });
  uploader.log(`Spawning`, { origin, currentHost });

  await uploader.run();
}
