import LayerBase from "./layerbase.mjs";

export default class Layer extends LayerBase {

  #canvas;
  #currentOperation;

  constructor(options, layerTree) {
    super(options, layerTree);
    this.#canvas = document.createElement("canvas");
    this.#canvas.width = options.width || 800;
    this.#canvas.height = options.height || 600;
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
      onOperationCommitted: this.commitOperation.bind(this),
      onOperationFinished: () => this.#currentOperation = null
    }, options);
    this.#currentOperation = currentOperation;

    return currentOperation;
  }

  commitOperation(newCanvas, commitOptions) {
    const oldCanvas = this.#canvas;
    const edit = {
      undo: () => {
        this.#canvas = oldCanvas;
        commitOptions.changeNotifier();
      },
      redo: () => {
        this.#canvas = newCanvas;
        commitOptions.changeNotifier();
      }
    };

    commitOptions.editTracker.pushEdit(edit);
  }

}