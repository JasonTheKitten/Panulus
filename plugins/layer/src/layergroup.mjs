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

  layerBefore(layer) {
    const index = this.#layers.indexOf(layer);
    if (index === -1) return null;
    return this.#layers[index - 1];
  }

  indexOfLayer(layer) {
    return this.#layers.indexOf(layer);
  }

  layerAfter(layer) {
    const index = this.#layers.indexOf(layer);
    if (index === -1) return null;
    return this.#layers[index + 1];
  }

  newLayer(options) {
    const layer = this.owningLayerTree().createLayer(options, this);
    const selectedLayer = this.owningLayerTree().selectedLayer();
    this.insertLayerBefore(layer, selectedLayer);
    
    return layer;
  }

  insertLayerBefore(layer, beforeLayer) {
    const index = this.#layers.indexOf(beforeLayer);
    if (index === -1) {
      this.#layers.push(layer);
      this.owningLayerTree().notifyChanged(layer, "added", { index: this.#layers.length - 1 });
    } else {
      this.#layers.splice(index + 1, 0, layer);
      this.owningLayerTree().notifyChanged(layer, "added", { index: index + 1 });
    }
  }

  insertLayerAfter(layer, afterLayer) {
    const index = this.#layers.indexOf(afterLayer);
    if (index === -1) {
      this.#layers.unshift(layer);
      this.owningLayerTree().notifyChanged(layer, "added", { index: 0 });
    } else {
      this.#layers.splice(index, 0, layer);
      this.owningLayerTree().notifyChanged(layer, "added", { index });
    }
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