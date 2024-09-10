import MessageBus from "./messagebus.mjs";
import ResourceLoader from "./resourceloader.mjs";

const PLUGIN_MESSAGE_BUS = new MessageBus();

const PLUGIN_ERROR = -1;
const PLUGIN_NOT_LOADED = 0;
const PLUGIN_LOADED = 1;

const loadedPlugins = {};

class PluginHandle {

  #pid;
  #resourceLoader;

  constructor(pid, source) {
    this.#pid = pid;
    this.#resourceLoader = new ResourceLoader(source);
  }

  pluginId() {
    return this.#pid;
  }

  messageBus() {
    return PLUGIN_MESSAGE_BUS;
  }

  registerService(service) {
    loadedPlugins[this.#pid].service = service;
  }

  service(pid) {
    return loadedPlugins[pid || this.#pid].service;
  }

  resourceLoader() {
    return this.#resourceLoader;
  }

}

export async function loadPlugin(source) {
  if (!source.includes('://')) {
    const href = document.location.href + (document.location.href.endsWith('/') ? '' : '/');
    source = href + "plugins/" + source;
  }
  source = source + (source.endsWith('/') ? '' : '/');

  const pluginStatus = getPluginStatus(source);
  if (pluginStatus === PLUGIN_LOADED) {
    return true;
  }

  if (pluginStatus == null) {
    await loadPluginMetadata(source);
  }

  const plugin = getPlugin(source);
  try {
    const pluginActions = await import(`${source}/${plugin.manifest.main}.mjs`);
    if (pluginActions.setup) {
      await pluginActions.setup(new PluginHandle(plugin.manifest.id, source));
    }
  } catch (e) {
    console.error(`Failed to load plugin ${plugin.manifest.id} from ${source}`);
    plugin.status = PLUGIN_ERROR;
    return Promise.reject(e);
  }

  return true;
}

async function loadPluginMetadata(source) {
  try {
    const manifest = await fetch(source + '/manifest.json').then(res => res.json());
    loadedPlugins[manifest.id] = {
      source,
      manifest,
      id: manifest.id,
      status: PLUGIN_NOT_LOADED,
      service: {}
    };
  } catch (e) {
    console.error(`Failed to load plugin metadata from ${source}`);
    loadedPlugins[source] = {
      source,
      status: PLUGIN_ERROR
    };
    return Promise.reject(e);
  }
}

function getPlugin(source) {
  for (const loadedPlugin of Object.values(loadedPlugins)) {
    if (loadedPlugin.source === source) {
      return loadedPlugin;
    }
  }

  return null;
}

function getPluginStatus(source) {
  const plugin = getPlugin(source);
  return plugin ? plugin.status : null;
}