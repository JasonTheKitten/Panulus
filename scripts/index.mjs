
import { loadPlugin } from "./plugins.mjs";

const PLUGINS_TO_LOAD = [
  "workbench", "winman", "project", "edithistory", "layer", "brush", "brushdock", "colordock", "layerdock",
  "canvas", "canvaswindow"
];

document.addEventListener('DOMContentLoaded', () => {
  PLUGINS_TO_LOAD.reduce((acc, plugin) => acc.then(() => loadPlugin(plugin)), Promise.resolve());
});