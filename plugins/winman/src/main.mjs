export async function setup(plugin) {
  const winmanCSS = await plugin.resourceLoader().resource("resources/main.css", "css");
  document.head.appendChild(winmanCSS);

  const windowManagerRoot = await plugin.resourceLoader().resource("resources/layout.html", "html");
  const windowRoot = await plugin.resourceLoader().resource("resources/window.html", "html");

  const windowManagerWindowPane = windowManagerRoot.querySelector(".window-pane");

  function openWindow() {
    const window = windowRoot.cloneNode(true);
    windowManagerWindowPane.appendChild(window);
  }

  function attach() {
    return windowManagerRoot;
  }

  plugin.provide("base.core.workbench.display", { attach });
  openWindow();

}