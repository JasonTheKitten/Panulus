
import { loadPlugin } from "./plugins.mjs";

document.addEventListener('DOMContentLoaded', () => {
  loadPlugin("workbench")
    .then(() => loadPlugin("winman"))
    .then(() => loadPlugin("layer"))
    .then(() => loadPlugin("brush"))
    .then(() => loadPlugin("canvas"))
    .then(() => loadPlugin("canvaswindow"));
});