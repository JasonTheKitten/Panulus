// TODO: Upon using a fallback, should it be stored in the project options?

const OPTIONS_CHANNEL = "base.core.project.options";
const SET_MESSAGE = "set";

// In order to aid automatic plugin cleanup, instead of plugins directly registering change callbacks,
// we instead use the message bus to notify callbacks. This way, when a plugin is disabled, stale callbacks
// aren't left behind.
export class ProjectOptions {
  
  #outputBus;
  #options = {};

  constructor(sourcePlugin) {
    this.#outputBus = sourcePlugin.messageBus().channel(OPTIONS_CHANNEL);
  }

  isAvailable() {
    return true;
  }

  set(name, value) {
    this.#options[name] = value;
    this.#outputBus.publish(SET_MESSAGE, { options: this, name, value });
  }

  get(name, fallback) {
    return this.#options[name] || fallback;
  }

  createWatcher(watchingPlugin) {
    const self = this;
    const watcher = {};
    const valueHandlers = {};
    watcher.watch = function(valueName, handler) {
      valueHandlers[valueName] = valueHandlers[valueName] || [];
      valueHandlers[valueName].push(handler);
    }
    watcher.sync = function() {
      for (const valueName in valueHandlers) {
        const value = self.get(valueName);
        for (const handler of valueHandlers[valueName]) {
          handler(value);
        }
      }
    }

    watchingPlugin.messageBus().subscribe(OPTIONS_CHANNEL, SET_MESSAGE, function(data) {
      if (data.options === self) {
        if (valueHandlers[data.name]) {
          for (const handler of valueHandlers[data.name]) {
            handler(data.value);
          }
        }
      }
    });

    return watcher;
  }

}

// CurrentProjectOptions provides an interface like ProjectOptions, but
// always reflects the currently active project. This is meant so that
// dockers can automatically adapt when the user selects a different project.
export class CurrentProjectOptions {

  #plugin;
  #currentProject;
  #currentWatcher;
  #valueHandlers = {};

  constructor(plugin) {
    this.#plugin = plugin;

    this.#bindCurrentProject();
  }

  isAvailable() {
    return this.#currentProject != null;
  }

  set(name, value) {
    if (this.#currentProject == null) {
      return;
    }

    this.#currentProject.options().set(name, value);
  }

  get(name, fallback) {
    if (this.#currentProject == null) {
      return fallback;
    }

    return this.#currentProject.options().get(name, fallback);
  }

  createWatcher() {
    const self = this;
    const watcher = {};
    const valueHandlers = this.#valueHandlers;
    watcher.watch = function(valueName, handler) {
      valueHandlers[valueName] = valueHandlers[valueName] || [];
      valueHandlers[valueName].push(handler);
      if (self.#currentWatcher) {
        self.#currentWatcher.watch(valueName, handler);
      }
    }
    watcher.sync = function() {
      if (!self.#currentWatcher) {
        return;
      }

      for (const valueName in valueHandlers) {
        const value = self.get(valueName);
        for (const handler of valueHandlers[valueName]) {
          handler(value);
        }
      }
    }

    for (const valueName in valueHandlers) {
      for (const handler of valueHandlers[valueName]) {
        if (self.#currentWatcher) {
          self.#currentWatcher.watch(valueName, handler);
        }
      }
    }

    return watcher;
  }

  #bindCurrentProject() {
    let self = this;
    let projectService = this.#plugin.service("base.core.project");
    this.#currentProject = projectService.currentProject();
    projectService.onCurrentProjectChange(this.#plugin, (project) => {
      self.#currentProject = project;
      if (project == null) {
        self.#currentWatcher = null;
        return;
      }
      
      self.#currentWatcher = project.options().createWatcher(self.#plugin);
      for (const valueName in self.#valueHandlers) {
        for (const handler of self.#valueHandlers[valueName]) {
          self.#currentWatcher.watch(valueName, handler);
        }
      }

      self.#currentWatcher.sync();
    });
  }

}