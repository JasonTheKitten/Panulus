export default class LayerTree {

  #currentLayer;
  // TODO: I might make the root a group once those exist
  #layers;

  constructor() {
    this.#layers = [];
  }

  addLayer(layer) {
    this.#layers.push(layer);
    this.#currentLayer = layer;
  }

  selectedLayer() {
    return this.#currentLayer;
  }

  drawToCanvas(canvas) {
    for (const layer of this.#layers) {
      layer.drawToCanvas(canvas);
    }
  }

}