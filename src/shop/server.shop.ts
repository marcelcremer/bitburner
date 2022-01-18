import { NS } from '../types';
export async function main(ns: NS) {
  ns.tprint({ money: ns.getPlayer().money, cost: ns.getPurchasedServerCost(64) });
  ns.tprint(ns.purchaseServer('bot', 64));
}
