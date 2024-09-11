const MAX_BRUSH_SIZE = 200;

export async function setup(plugin) {
  const projectService = plugin.service("base.core.project");
  const currentProjectOptions = projectService.createCurrentProjectOptions(plugin);

  function clampedAdjust(option, delta, min, max) {
    const value = currentProjectOptions.get(option, 10);
    const newValue = Math.min(Math.max(value + delta, min), max);
    currentProjectOptions.set(option, newValue);
  }

  plugin.provide("base.core.workbench.keycombo", [
    {
      defaultKeyCombo: ["["],
      id: "base.core.brushdock.shrinksize",
      callback: "repeat",
      repeat: () => clampedAdjust("brush.radius", -1, 1, MAX_BRUSH_SIZE)
    },
    {
      defaultKeyCombo: ["]"],
      id: "base.core.brushdock.growsize",
      callback: "repeat",
      repeat: () => clampedAdjust("brush.radius", 1, 1, MAX_BRUSH_SIZE)
    }
  ])
}