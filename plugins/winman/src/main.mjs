import { setupDragSystem } from "./drag.mjs";
import { setupMaximizeOption } from "./maximize.mjs";
import { setupResizeSystem } from "./resize.mjs";

export async function setup(plugin) {
  const winmanCSS = await plugin.resourceLoader().resource("resources/main.css", "css");
  document.head.appendChild(winmanCSS);

  const windowManagerRoot = await plugin.resourceLoader().resource("resources/layout.html", "html");
  const windowRoot = await plugin.resourceLoader().resource("resources/window.html", "html");

  const windowManagerWindowPane = windowManagerRoot.querySelector(".window-pane");

  function setupWindowHooks(window) {
    setupDragSystem(window);
    setupResizeSystem(window);
    setupMaximizeOption(window);

    // TODO: Notify close
    const closeButton = window.querySelector(".close");
    closeButton.addEventListener("click", () => window.remove());
  }

  function openWindow(windowData) {
    const window = windowRoot.cloneNode(true).querySelector(".window");

    setupWindowHooks(window);

    window.querySelector(".title").textContent = windowData.title;
    window.querySelector(".content").appendChild(windowData.content);
    
    windowManagerWindowPane.appendChild(window);
  }

  function attach() {
    return windowManagerRoot;
  }

  plugin.provide("base.core.workbench.display", { attach });
  
  const messageChannel = plugin.messageBus().channel("base.core.workbench.window")
  messageChannel.subscribe("open", windowData => openWindow(windowData));
}