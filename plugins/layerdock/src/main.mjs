import { createDragState, connectLayerDrag } from "./layerdrag.mjs";

let layerDockHTML;
let layerTemplate;
let groupTemplate;

// TODO: Multi-select
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
    layerTree.selectLayer(newLayer, rootGroup);
    setupLayerList(layerList, layerTree);
  });

  const deleteLayerButton = layerDockRootPane.querySelector(".delete-layer-button");

  deleteLayerButton.addEventListener("click", () => {
    const layerTree = currentProjectOptions.get("layer.tree");
    deleteCurrentLayer(layerList, layerTree);
  });

  return layerDockRootPane;
}

function setupLayerList(layerList, layerTree) {
  const listScroll = layerList.scrollTop;

  while (layerList.firstChild) {
    layerList.removeChild(layerList.firstChild);
  }

  let layers = layerTree.rootGroup().layers();
  const options = {
    layerList,
    dragState: createDragState({ redraw: () => setupLayerList(layerList, layerTree) }),
  };
  for (let i = layers.length - 1; i >= 0; i--) {
    addLayer(options, layerTree.rootGroup(), layers[i], 0);
  }

  layerList.scrollTop = listScroll;
}

function addLayer(options, layerGroup, layer, indent) {
  const layerList = options.layerList;
  const layerTree = layerGroup.owningLayerTree();

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
    layerTree.selectLayer(layer, layerGroup);
    setupLayerList(options.layerList, layerTree);
  });

  connectLayerDrag(layer, layerGroup, layerDiv, options.dragState);

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
      addLayer(options, layer, layers[i], indent + 1);
    }
  }
}

function deleteCurrentLayer(layerList, layerTree) {
  const selectedLayer = layerTree.selectedLayer();
  let parentGroup = layerTree.selectedLayerParent();
  if (selectedLayer == null) return;
  if (selectedLayer && parentGroup) {
    const nextLayer =
      parentGroup.layerAfter(selectedLayer) ||
      parentGroup.layerBefore(selectedLayer) ||
      (parentGroup == layerTree.rootGroup() ? null : parentGroup);
    
      if (nextLayer == parentGroup) {
      parentGroup = parentGroup.parentGroup();
    }
    parentGroup.removeLayer(selectedLayer);
    layerTree.selectLayer(nextLayer, parentGroup);
    setupLayerList(layerList, layerTree);
  }
}