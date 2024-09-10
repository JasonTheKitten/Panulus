import WorkbenchService from "./service.mjs";

export async function setup(plugin) {
  const appRoot = document.getElementById("app");

  const service = new WorkbenchService(plugin);
  plugin.registerService(service);

  plugin.onEachProvider("base.core.workbench.display", {
    provide(_pid, value) {
      appRoot.childNodes.forEach(node => node.remove());
      appRoot.appendChild(value.attach());
    }
  });
}