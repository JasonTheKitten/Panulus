export default class Layer {

  #name
  #layerTree
  #canvas;
  #currentOperation;

  #visible = true;

  constructor(options, layerTree) {
    options = options || {};
    this.#name = options.name || "Unnamed Layer";
    this.#layerTree = layerTree;
    this.#canvas = document.createElement("canvas");
    this.#canvas.width = options.width || 800;
    this.#canvas.height = options.height || 600;
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

  drawToCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    if (this.#currentOperation) {
      ctx.drawImage(this.#currentOperation.preview(), 0, 0);
    } else {
      ctx.drawImage(this.#canvas, 0, 0);
    }
  }

  startOperation(operation, options) {
    const currentOperation = new operation({
      canvas: this.#canvas,
      onOperationCommitted: canvas => this.#canvas = canvas,
      onOperationFinished: () => this.#currentOperation = null
    }, options);
    this.#currentOperation = currentOperation;

    return currentOperation;
  }

}