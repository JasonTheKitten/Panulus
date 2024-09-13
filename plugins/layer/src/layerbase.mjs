export default class LayerBase {

  #name;
  #layerTree;

  #visible = true;

  constructor(options, layerTree) {
    options = options || {};
    this.#name = options.name || "Unnamed Layer";
    this.#layerTree = layerTree;
  }

  name() {
    return this.#name;
  }

  rename(name) {
    this.#name = name;
    this.#layerTree.notifyChanged(this, "name");
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

  parentGroup() {
    let groupStack = [ this.#layerTree.rootGroup() ];
    while (groupStack.length > 0) {
      let group = groupStack.pop();
      if (group.layers().indexOfLayer(this) != -1) {
        return group;
      }
      for (const subLayer of group.layers()) {
        if (subLayer.layers) {
          groupStack.push(subLayer);
        }
      }
    }
  }

}