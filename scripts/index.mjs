
import { loadPlugin } from "./plugins.mjs";

document.addEventListener('DOMContentLoaded', () => {
  loadPlugin("workbench")
  loadPlugin("winman")
});