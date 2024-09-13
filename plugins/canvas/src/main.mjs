export class Canvas {

  #canvas;
  #options;
  #nativeSize;
  #drawOptions;
  #layerTree;

  #cursorCanvas;
  #cursorPosition = { x: 0, y: 0 };

  constructor(canvas, options) {
    this.#canvas = canvas;
    this.#options = options;
    this.#nativeSize = { width: canvas.width, height: canvas.height };
    this.#canvas.style.aspectRatio = `${this.#nativeSize.width} / ${this.#nativeSize.height}`;

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

  update() {
    this.#redrawCursor();
  }

  rescale(scaleFactor) {
    this.#canvas.width = this.#nativeSize.width * scaleFactor;
    this.#canvas.height = this.#nativeSize.height * scaleFactor;
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
    this.#cursorCanvas = cursorCanvas;

    const self = this;
    this.#canvas.addEventListener("mousemove", event => {
      this.#cursorPosition = { x: event.clientX, y: event.clientY };
      self.#redrawCursor(event);
    });
    this.#canvas.addEventListener("mouseleave", () => {
      cursorCanvas.style.visibility = "hidden";
    });
  }

  #redrawCursor() {
    const cursorCanvas = this.#cursorCanvas;
    const radius = this.#drawOptions.radius * this.#getScaleFactor();
    cursorCanvas.style.visibility = "visible";
    cursorCanvas.width = radius * 2 + 1;
    cursorCanvas.height = radius * 2 + 1;
    cursorCanvas.style.left = `${this.#cursorPosition.x - radius}px`;
    cursorCanvas.style.top = `${this.#cursorPosition.y  - radius}px`;

    const ctx = cursorCanvas.getContext("2d");
    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.stroke();
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
        operation.commit({
          editTracker: self.#options.editTracker,
          changeNotifier: self.redraw.bind(self)
        });
  
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
    const scaleFactor = 1/this.#getScaleFactor();

    return {
      x: coords.x * scaleFactor,
      y: coords.y * scaleFactor
    };
  }

  #getScaleFactor() {
    return this.#canvas.clientWidth / this.#canvas.width;
  }

}

export async function setup(plugin) {
  const canvasCSS = await plugin.resourceLoader().resource("resources/main.css", "css");
  document.head.appendChild(canvasCSS);

  plugin.registerService({
    createCanvas(options) {
      const canvas = document.createElement("canvas");
      canvas.setAttribute("class", "drawing-canvas");
      canvas.width = options.canvasSize.width;
      canvas.height = options.canvasSize.height;

      return new Canvas(canvas, options);
    }
  });
}