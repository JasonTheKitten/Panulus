class Canvas {

  #canvas;
  #layerTree;

  constructor(canvas) {
    this.#canvas = canvas;
  }

  useLayerTree(layerTree) {
    this.#layerTree = layerTree;
  }

  redraw() {
    const ctx = this.#canvas.getContext("2d");
    ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    for (const layer of this.#layerTree) {
      layer.drawToCanvas(this.#canvas);
    }
  }

  resize(width, height) {
    this.#canvas.width = width;
    this.#canvas.height = height;
  }

  content() {
    return this.#canvas;
  }

}

export async function setup(plugin) {
  const canvasCSS = await plugin.resourceLoader().resource("resources/main.css", "css");
  document.head.appendChild(canvasCSS);

  plugin.registerService({
    createCanvas() {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("class", "canvas");

      return new Canvas(canvas);
    }
  });
}