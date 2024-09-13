import LayerGroup from "./layergroup.mjs";
import Layer from "./layer.mjs";

export default class LayerTree {

  #currentLayer;
  #currentParentGroup;
  #rootGroup;

  #nextLayerId = 0;
  #listeners = [];

  constructor() {
    this.#rootGroup = new LayerGroup({ name: "Root Group" }, this);
  }

  onChanged(listener) {
    this.#listeners.push(listener);
  }

  createLayer(options, group) {
    options = Object.assign({}, options);
    options.name = options.name || `Layer ${this.#nextLayerId++}`;
    let layer = new Layer(options, this);

    if (!this.#currentLayer) {
      this.#currentLayer = layer;
      this.#currentParentGroup = group || this.#rootGroup;
    }

    return layer;
  }

  selectedLayer() {
    return this.#currentLayer;
  }

  selectedLayerParent() {
    return this.#currentParentGroup;
  }

  selectLayer(layer, parent) {
    this.notifyChanged(this.#currentLayer, "deselected");
    this.#currentLayer = layer;
    this.#currentParentGroup = parent;
  }

  rootGroup() {
    return this.#rootGroup;
  }

  drawToCanvas(canvas) {
    this.#rootGroup.drawToCanvas(canvas);
  }

  notifyChanged(layer, changeType) {
    for (const listener of this.#listeners) {
      listener(layer, changeType);
    }
  }

}