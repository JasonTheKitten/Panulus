import Layer from './layer.mjs';
import LayerTree from './layertree.mjs';

export async function setup(plugin) {
  plugin.registerService({
    createLayer(options) {
      return new Layer(options);
    },
    createLayerTree() {
      return new LayerTree();
    }
  });
}