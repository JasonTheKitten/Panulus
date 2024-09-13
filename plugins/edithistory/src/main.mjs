import EditTracker from "./edittracker.mjs";

export async function setup(plugin) {
  const projectService = plugin.service("base.core.project");
  const currentProjectOptions = projectService.createCurrentProjectOptions(plugin);

  const currentProjectEditTracker = new EditTracker(currentProjectOptions);

  plugin.registerService({
    EditTracker,
    currentProjectEditHistory: () => currentProjectEditTracker
  });

  plugin.provide("base.core.workbench.keycombo", [
    {
      defaultKeyCombo: ["Control", "z"],
      callback: () => currentProjectEditTracker.undo()
    },
    {
      defaultKeyCombo: [["Control", "y"], ["Control", "Shift", "Z"]],
      callback: () => currentProjectEditTracker.redo()
    }
  ]);
}