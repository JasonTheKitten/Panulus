export async function setup(plugin) {
  const canvasCSS = await plugin.resourceLoader().resource("resources/main.css", "css");
  document.head.appendChild(canvasCSS);

  const canvas = document.createElement("canvas");
  canvas.setAttribute("class", "canvas");

  const workbenchService = plugin.service("base.core.workbench");
  workbenchService.windowService().openWindow({
    title: "Canvas",
    content: canvas
  });
}