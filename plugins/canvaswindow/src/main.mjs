import { EraserFilter, MergeFilter } from "./filters.mjs";

export async function setup(plugin) {
  const canvasWindowCSS = await plugin.resourceLoader().resource("resources/main.css", "css");
  document.head.appendChild(canvasWindowCSS);

  const projectService = plugin.service("base.core.project");
  const projectOptions = projectService.createProjectOptions(plugin);
  const project = projectService.createProject(projectOptions);
  projectService.setCurrentProject(project);

  const editHistoryService = plugin.service("base.core.edithistory");
  const editTracker = new editHistoryService.EditTracker(projectOptions);

  const canvasSize = { width: 800, height: 600 };
  const options = {
    canvasSize,
    editTracker
  }
  const canvas = plugin.service("base.core.canvas").createCanvas(options);

  const rootPane = document.createElement("div");
  rootPane.setAttribute("class", "root-pane");
  rootPane.appendChild(canvas.content());

  const layerService = plugin.service("base.core.layer");
  const layerTree = layerService.createLayerTree();
  layerTree.rootGroup().newLayer(canvasSize);
  canvas.useLayerTree(layerTree);
  layerTree.onChanged(() => canvas.redraw());
  projectOptions.set("layer.tree", layerTree);

  let brush;
  plugin.onEachProvider("base.core.brush", { provide: (name, brushes) => {
    brush = brushes[0];
  }});

  const drawOptions = {
    brush: brush,
    color: { r: 0, g: 0, b: 0, a: 255 },
    radius: 10,
    filters: [ new MergeFilter() ]
  };
  canvas.useDrawOptions(drawOptions);

  let settingsWatcher = projectOptions.createWatcher(plugin);
  settingsWatcher.watch("brush.type", brush => drawOptions.brush = brush);
  settingsWatcher.watch("brush.color", color => {
    drawOptions.color = color;
    projectOptions.set("brush.eraser", false);
  });
  settingsWatcher.watch("brush.radius", radius => {
    drawOptions.radius = radius;
    canvas.update();
  });

  settingsWatcher.watch("brush.eraser", () => updateFilters(projectOptions, drawOptions));

  const workbenchService = plugin.service("base.core.workbench");
  workbenchService.windowService().openWindow({
    title: "Canvas",
    content: rootPane
  });

  canvas.redraw();
}

function updateFilters(projectOptions, drawOptions) {
  const isEraserActive = projectOptions.get("brush.eraser", false);
  if (isEraserActive) {
    drawOptions.filters = [ new EraserFilter() ];
  } else {
    drawOptions.filters = [ new MergeFilter() ];
  }
}