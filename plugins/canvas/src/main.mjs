export class Canvas {

  #canvas;
  #drawOptions;
  #layerTree;

  constructor(canvas) {
    this.#canvas = canvas;
    this.#setupEventListeners();
  }

  useDrawOptions(drawOptions) {
    this.#drawOptions = drawOptions;
  }

  useLayerTree(layerTree) {
    this.#layerTree = layerTree;
  }

  redraw() {
    const ctx = this.#canvas.getContext("2d");
    ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

    this.#layerTree.drawToCanvas(this.#canvas);
  }

  resize(width, height) {
    this.#canvas.width = width;
    this.#canvas.height = height;
  }

  content() {
    return this.#canvas;
  }

  #setupEventListeners() {
    this.#setupCursorListener();
    this.#setupDrawListener();
  }

  #setupCursorListener() {
    const cursorCanvas = document.createElement("canvas");
    cursorCanvas.setAttribute("class", "cursor-canvas");
    document.body.appendChild(cursorCanvas);

    const self = this;
    this.#canvas.addEventListener("mousemove", event => {
      const radius = self.#drawOptions.radius;
      cursorCanvas.style.visibility = "visible";
      cursorCanvas.width = radius * 2;
      cursorCanvas.height = radius * 2;
      cursorCanvas.style.left = `${event.clientX - radius}px`;
      cursorCanvas.style.top = `${event.clientY  - radius}px`;

      const ctx = cursorCanvas.getContext("2d");
      ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      ctx.beginPath();
      ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
      ctx.stroke();
    });
    this.#canvas.addEventListener("mouseleave", () => {
      cursorCanvas.style.visibility = "hidden";
    });
  }

  #setupDrawListener() {
    const self = this;
    this.#canvas.addEventListener("mousedown", event => {
      const layer = self.#layerTree.selectedLayer();
      if (!layer) return;

      let operation = layer.startOperation(self.#drawOptions.brush, self.#drawOptions);
      operation.draw(self.#rescaleMouseCoords({ x: event.offsetX, y: event.offsetY }));
      self.redraw();
  
      function moveEvent(event) {
        if (!event.buttons) {
          return upEvent(event);
        }
        operation.draw(self.#rescaleMouseCoords({ x: event.offsetX, y: event.offsetY }));
        self.redraw();
      }

      function leaveEvent(event) {
        moveEvent(event);

        if (operation.breakStroke) {
          operation.breakStroke();
        }
      }
  
      function upEvent(_event) {
        operation.commit();
        self.redraw();
  
        self.#canvas.removeEventListener("mousemove", moveEvent);
        self.#canvas.removeEventListener("mouseup", upEvent);
        self.#canvas.removeEventListener("mouseleave", leaveEvent);
      }
      
      self.#canvas.addEventListener("mousemove", moveEvent);
      self.#canvas.addEventListener("mouseup", upEvent);
      self.#canvas.addEventListener("mouseleave", leaveEvent);
    });
  }

  #rescaleMouseCoords(coords) {
    const rescaleFactor = {
      x: this.#canvas.width / this.#canvas.clientWidth,
      y: this.#canvas.height / this.#canvas.clientHeight
    };

    return {
      x: coords.x * rescaleFactor.x,
      y: coords.y * rescaleFactor.y
    };
  }

}

export async function setup(plugin) {
  const canvasCSS = await plugin.resourceLoader().resource("resources/main.css", "css");
  document.head.appendChild(canvasCSS);

  plugin.registerService({
    createCanvas() {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("class", "drawing-canvas");

      return new Canvas(canvas);
    }
  });
}