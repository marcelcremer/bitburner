import { NS } from '../../types';

export async function main(ns: NS) {
  ns.connect(ns.args[0] as string);
}
