import LayerBase from "./layerbase.mjs";

export default class LayerGroup extends LayerBase {

  #layers;

  constructor(options, layerTree) {
    super(options, layerTree);
    this.#layers = [];
  }

  layers() {
    return this.#layers;
  }

  newLayer(options) {
    const layer = this.owningLayerTree().createLayer(options);
    this.#layers.push(layer);
    this.owningLayerTree().notifyChanged(layer, "added");
    
    return layer;
  }

  removeLayer(layer) {
    const index = this.#layers.indexOf(layer);
    if (index !== -1) {
      this.#layers.splice(index, 1);
      this.owningLayerTree().notifyChanged(layer, "removed");
    }
  }

  drawToCanvas(canvas) {
    for (const layer of this.#layers) {
      if (!layer.visible()) continue;
      layer.drawToCanvas(canvas);
    }
  }

}