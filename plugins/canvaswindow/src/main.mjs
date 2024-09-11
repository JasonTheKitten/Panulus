export async function setup(plugin) {
  const canvasWindowCSS = await plugin.resourceLoader().resource("resources/main.css", "css");
  document.head.appendChild(canvasWindowCSS);

  const canvas = plugin.service("base.core.canvas").createCanvas();

  const rootPane = document.createElement("div");
  rootPane.setAttribute("class", "root-pane");
  rootPane.appendChild(canvas.content());

  const layer = plugin.service("base.core.layer").createLayer({
    width: 800,
    height: 600
  });
  canvas.useLayerTree([layer]);

  // Just a small test
  let brush;
  plugin.onEachProvider("base.core.brush", { provide: (name, brushes) => {
    brush = brushes[0];
  }});

  const workbenchService = plugin.service("base.core.workbench");
  workbenchService.windowService().openWindow({
    title: "Canvas",
    content: rootPane
  });

  canvas.resize(rootPane.clientWidth, rootPane.clientHeight);
  canvas.redraw();

  rootPane.addEventListener("mousedown", event => {
    let operation = layer.startOperation(brush);
    operation.draw({ x: event.offsetX, y: event.offsetY });
    canvas.redraw();

    function moveEvent(event) {
      operation.draw({ x: event.offsetX, y: event.offsetY });
      canvas.redraw();
    }

    function upEvent(event) {
      operation.commit();
      canvas.redraw();

      rootPane.removeEventListener("mousemove", moveEvent);
      rootPane.removeEventListener("mouseup", upEvent);
    }
    
    rootPane.addEventListener("mousemove", moveEvent);
    rootPane.addEventListener("mouseup", upEvent);
  });
}