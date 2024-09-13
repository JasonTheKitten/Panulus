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

    const windowContent = window.querySelector(".content");
    window.querySelector(".title").textContent = windowData.title;
    windowContent.appendChild(windowData.content);

    if (windowData.size) {
      windowContent.style.width = `${windowData.size.width}px`;
      windowContent.style.height = `${windowData.size.height}px`;
    }
    if (windowData.position) {
      window.style.left = `${windowData.position.x}px`;
      window.style.top = `${windowData.position.y}px`;
    }
    
    windowManagerWindowPane.appendChild(window);

    addWindowFunctions(window);
  }

  function attach() {
    return windowManagerRoot;
  }

  plugin.provide("base.core.workbench.display", { attach });
  
  const messageChannel = plugin.messageBus().channel("base.core.workbench.window")
  messageChannel.subscribe("open", windowData => openWindow(windowData));
}

function addWindowFunctions(window) {
  window.bringToFront = () => {
    const parent = window.parentElement;
    const windows = parent.children;
    let originalWindowOrder = [];
    for (const win of windows) {
      originalWindowOrder.push(win);
    }

    // Reparenting the current window will break event handling, so
    // reparent all other windows instead.
    for (const win of originalWindowOrder) {
      if (win !== window) {
        parent.insertBefore(win, window);
      }
    }
  }
  window.makeActive = () => {
    const windows = window.parentElement.children;
    for (const win of windows) {
      win.classList.remove("active");
    }
    window.classList.add("active");

    window.bringToFront();
  };
  window.addEventListener("mousedown", () => window.makeActive(), true);
}