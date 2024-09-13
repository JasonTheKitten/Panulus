export default class LayerGroup {

  #name;
  #layerTree;
  #layers;

  #visible = true;

  constructor(options, layerTree) {
    this.#name = options.name || "Unnamed Layer Group";
    this.#layerTree = layerTree;
    this.#layers = [];
  }

  name() {
    return this.#name;
  }

  rename(name) {
    this.#name = name;
    this.#layerTree.notifyChanged(this, "name");
  }

  layers() {
    return this.#layers;
  }

  visible() {
    return this.#visible;
  }

  toggleVisibility() {
    setVisibility(!this.#visible);
  }

  setVisibility(visible) {
    this.#visible = visible;
    this.#layerTree.notifyChanged(this, "visibility");
  }

  owningLayerTree() {
    return this.#layerTree;
  }

  newLayer(options) {
    const layer = this.#layerTree.createLayer(options);
    this.#layers.push(layer);
    this.#layerTree.notifyChanged(layer, "added");
    return layer;
  }

  removeLayer(layer) {
    const index = this.#layers.indexOf(layer);
    if (index !== -1) {
      this.#layerTree.notifyChanged(layer, "removed");
      this.#layers.splice(index, 1);
    }
  }

  drawToCanvas(canvas) {
    for (const layer of this.#layers) {
      if (!layer.visible()) continue;
      layer.drawToCanvas(canvas);
    }
  }

}