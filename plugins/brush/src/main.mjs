import { BasicBrush, loadBasicBrush } from './brushes/basic/basicbrush.mjs';

export async function setup(plugin) {
  await loadBasicBrush(plugin);

  plugin.provide("base.core.brush", [BasicBrush]);
}