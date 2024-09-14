import { Project } from "./project.mjs";
import { ProjectOptions, CurrentProjectOptions } from "./options.mjs";

const PROJECT_CHANNEL = "base.core.project";

export function createService(plugin) {
  let currentProject;

  const service = {};

  service.currentProject = () => currentProject;
  service.setCurrentProject = (project) => {
    if (currentProject === project) {
      return;
    }
    
    currentProject = project;
    plugin.messageBus().channel(PROJECT_CHANNEL).publish("currentProjectChange", project);
  };
  service.onCurrentProjectChange = (targetPlugin, callback) => {
    const optionsBusChannel = targetPlugin.messageBus().channel(PROJECT_CHANNEL);
    optionsBusChannel.subscribe("currentProjectChange", callback);
  };

  service.createProject = (options) => new Project(options);
  service.createProjectOptions = (sourcePlugin) => new ProjectOptions(sourcePlugin);
  service.createCurrentProjectOptions = (sourcePlugin) => new CurrentProjectOptions(sourcePlugin);
  
  return service;
}