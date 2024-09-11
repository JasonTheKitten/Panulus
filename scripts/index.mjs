
import { loadPlugin } from "./plugins.mjs";

document.addEventListener('DOMContentLoaded', () => {
  loadPlugin("workbench")
    .then(() => loadPlugin("winman"))
    .then(() => loadPlugin("canvas"));
});