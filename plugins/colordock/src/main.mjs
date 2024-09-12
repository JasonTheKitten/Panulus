import { setup as paletteSetup, createPaletteView } from "./colorpalette.mjs";
import { setup as colorWheelSetup, createColorWheelView } from "./colorwheel.mjs";

export async function setup(plugin) {
  const colorDockCSS = await plugin.resourceLoader().resource("resources/colordock.css", "css");
  document.head.appendChild(colorDockCSS);

  const colorDockHTML = await plugin.resourceLoader().resource("resources/colordock.html", "html");
  const colorDockRootPane = colorDockHTML.cloneNode(true);
  const colorDockContent = colorDockRootPane.querySelector(".content");

  const projectService = plugin.service("base.core.project");
  const currentProjectOptions = projectService.createCurrentProjectOptions(plugin);

  await Promise.all([paletteSetup(plugin), colorWheelSetup(plugin)]);

  const colorWheelView = createColorWheelView(plugin, currentProjectOptions);
  colorDockContent.appendChild(colorWheelView);

  const paletteView = createPaletteView(plugin, currentProjectOptions);
  colorDockContent.appendChild(paletteView);

  const watcher = currentProjectOptions.createWatcher();
  watcher.watch("brush.color", color => {
    if (color == null) {
      currentProjectOptions.set("brush.color", { red: 0, green: 0, blue: 0 });
    }
  });
  watcher.sync();

  const workbenchService = plugin.service("base.core.workbench");
  workbenchService.windowService().openWindow({
    title: "Color Dock",
    content: colorDockRootPane,
    size: { width: 300, height: 400 },
    position: { x: 0, y: 0 }
  });
}