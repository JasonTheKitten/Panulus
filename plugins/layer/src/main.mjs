import LayerTree from './layertree.mjs';

export async function setup(plugin) {
  plugin.registerService({
    createLayerTree() {
      return new LayerTree();
    }
  });
}