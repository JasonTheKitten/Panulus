let layerDockHTML;
let layerTemplate;
let groupTemplate;

export async function setup(plugin) {
  const layerDockCSS = await plugin.resourceLoader().resource("resources/layerdock.css", "css");
  document.head.appendChild(layerDockCSS);

  layerDockHTML = await plugin.resourceLoader().resource("resources/layerdock.html", "html");
  layerTemplate = layerDockHTML.querySelector(".layer-template").content;
  groupTemplate = layerDockHTML.querySelector(".group-template").content;

  const workbenchService = plugin.service("base.core.workbench");
  workbenchService.windowService().openWindow({
    title: "Layer Dock",
    content: createWindowContent(plugin),
    size: { width: 300, height: 800 },
    position: { x: 0, y: 450 }
  });
}

function createWindowContent(plugin) {
  const layerDockLoaded = layerDockHTML.cloneNode(true);
  const layerDockRootPane = layerDockLoaded.querySelector(".layerdock");
  const layerList = layerDockRootPane.querySelector(".layers");

  const projectService = plugin.service("base.core.project");
  const currentProjectOptions = projectService.createCurrentProjectOptions(plugin);
  const watcher = currentProjectOptions.createWatcher();
  watcher.watch("layer.tree", layerTree => {
    if (!layerTree) return;
    setupLayerList(layerList, layerTree);
  });
  watcher.sync();

  const newLayerButton = layerDockRootPane.querySelector(".new-layer-button");
  newLayerButton.addEventListener("click", () => {
    const layerTree = currentProjectOptions.get("layer.tree");
    const rootGroup = layerTree.rootGroup();
    const newLayer = rootGroup.newLayer();
    layerTree.selectLayer(newLayer);
    setupLayerList(layerList, layerTree);
  });

  return layerDockRootPane;
}

function setupLayerList(layerList, layerTree) {

  const listScroll = layerList.scrollTop;

  while (layerList.firstChild) {
    layerList.removeChild(layerList.firstChild);
  }

  let layers = layerTree.rootGroup().layers();
  for (let i = layers.length - 1; i >= 0; i--) {
    addLayer(layerList, layerTree, layers[i], 0);
  }

  layerList.scrollTop = listScroll;
}

function addLayer(layerList, layerTree, layer, indent) {
  const layerElement = layer.layers ?
    groupTemplate.cloneNode(true) :
    layerTemplate.cloneNode(true);

  const layerDiv = layerElement.querySelector(".layer");
  layerElement.querySelector(".layer-name").textContent = layer.name();

  if (layerTree.selectedLayer() === layer) {
    layerDiv.classList.add("selected");
  }

  layerDiv.style["--indent"] = indent;
  layerDiv.addEventListener("click", () => {
    layerTree.selectLayer(layer);
    setupLayerList(layerList, layerTree);
  });

  const visibilityButton = layerDiv.querySelector(".layer-visibility");
  visibilityButton.checked = layer.visible();
  visibilityButton.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  visibilityButton.addEventListener("change", () => {
    layer.setVisibility(visibilityButton.checked);
  });

  layerList.appendChild(layerElement);

  if (layer.layers) {
    let layers = layer.layers();
    for (let i = layers.length - 1; i >= 0; i--) {
      addLayer(layerList, layerTree, layers[i], indent + 1);
    }
  }
}