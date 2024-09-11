
import { loadPlugin } from "./plugins.mjs";

const PLUGINS_TO_LOAD = [
  "workbench", "winman", "layer", "project", "brush", "brushdock", "canvas", "canvaswindow"
];

document.addEventListener('DOMContentLoaded', () => {
  PLUGINS_TO_LOAD.reduce((acc, plugin) => acc.then(() => loadPlugin(plugin)), Promise.resolve());
});