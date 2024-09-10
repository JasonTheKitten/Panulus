class Window {

  #data;
  #messageChannel;

  constructor(data, messageChannel) {
    this.#data = data;
    this.#messageChannel = messageChannel;
  }

  close() {
    this.#messageChannel.publish("close", this.#data);
  }

}

class WindowService {

  #messageChannel;

  #id = 0;

  constructor(plugin) {
    this.#messageChannel = plugin.messageBus().channel("base.core.workbench.window");
  }

  openWindow(options) {
    const windowData = {
      id: this.#id++,
      ...options
    };
    this.#messageChannel.publish("open", windowData);

    return new Window(windowData, this.#messageChannel);
  }

}

export default class WorkbenchService {
  
  #windowService;

  constructor(plugin) {
    this.#windowService = new WindowService(plugin);
  }

  windowService() {
    return this.#windowService;
  }
  
}