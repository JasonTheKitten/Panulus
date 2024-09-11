export async function setup(plugin) {
  const canvasWindowCSS = await plugin.resourceLoader().resource("resources/main.css", "css");
  document.head.appendChild(canvasWindowCSS);

  const canvasSize = { width: 800, height: 600 };
  const canvas = plugin.service("base.core.canvas").createCanvas(canvasSize);

  const rootPane = document.createElement("div");
  rootPane.setAttribute("class", "root-pane");
  rootPane.appendChild(canvas.content());

  const layerService = plugin.service("base.core.layer");
  const layer = layerService.createLayer(canvasSize);
  const layerTree = layerService.createLayerTree();
  layerTree.addLayer(layer);
  canvas.useLayerTree(layerTree);

  let brush;
  plugin.onEachProvider("base.core.brush", { provide: (name, brushes) => {
    brush = brushes[0];
  }});

  const drawOptions = {
    brush: brush,
    color: { r: 0, g: 0, b: 0, a: 255 },
    radius: 10
  };
  canvas.useDrawOptions(drawOptions);

  const workbenchService = plugin.service("base.core.workbench");
  workbenchService.windowService().openWindow({
    title: "Canvas",
    content: rootPane
  });

  canvas.resize(rootPane.clientWidth, rootPane.clientHeight);
  canvas.redraw();
}