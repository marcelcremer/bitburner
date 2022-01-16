import { NS } from '../types';

const MONEY_THRESHOLD = 0.75;
const SECURITY_THRESHOLD = 5;

export async function main(ns: NS) {
  const miner = new SimpleMiner(ns);
  while (true) {
    try {
      await miner.process();
    } catch (e) {
      ns.tprint('Something went horribly wrong!', e);
      break;
    }
  }
}

class SimpleMiner {
  targetServer = '';

  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
    this.targetServer = <string>ns.args[0];
  }

  async process(): Promise<void> {
    const intel = this.getServerInformation();
    // this.ns.tprint({ intel });
    if (intel.security >= intel.minSecurity + SECURITY_THRESHOLD) await this.ns.weaken(this.targetServer);
    else if (intel.availableMoney < intel.maxMoney * MONEY_THRESHOLD) await this.ns.grow(this.targetServer);
    else await this.ns.hack(this.targetServer);
  }

  getServerInformation() {
    return {
      minSecurity: this.ns.getServerMinSecurityLevel(this.targetServer),
      security: this.ns.getServerSecurityLevel(this.targetServer),
      availableMoney: this.ns.getServerMoneyAvailable(this.targetServer),
      maxMoney: this.ns.getServerMaxMoney(this.targetServer),
    };
  }
}
