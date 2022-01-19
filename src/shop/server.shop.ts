import { NS } from '../types';
export async function main(ns: NS) {
  ns.tprint({ money: ns.getPlayer().money, cost: ns.getPurchasedServerCost(+ns.args[0]) });
  if (ns.args[1]) ns.tprint(ns.purchaseServer('bot', +ns.args[0]));
}
