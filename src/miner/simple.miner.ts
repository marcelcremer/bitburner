import { NS } from '../types';

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
  target_server = '';

  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
    this.target_server = <string>ns.args[0];
  }

  async process(): Promise<void> {
    const intel = this.getServerInformation();
    if (intel.security > 1.1) await this.weakenSecurity();
    else await this.ns.hack(this.target_server);
    this.ns.print(intel.security > 1.5 ? 'weakened' : 'hacked');
  }

  getServerInformation(): { security: number } {
    return {
      security: this.ns.getServerSecurityLevel(this.target_server),
    };
  }

  async weakenSecurity(): Promise<number> {
    return this.ns.weaken(this.target_server);
  }
}
