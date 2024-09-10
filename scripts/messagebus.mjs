export default class MessageBus {

  constructor() {
    this.handlers = {};
  }

  subscribe(intf, events, handler) {
    if (Array.isArray(events)) {
      for (const event of events) {
        this.#subscribe(intf, event, handler);
      }
    } else {
      this.#subscribe(intf, events, handler);
    }
  }

  publish(intf, event, data) {
    if (!this.handlers[intf] || !this.handlers[intf][event]) {
      return;
    }

    for (const handler of this.handlers[intf][event]) {
      handler(data, event);
    }
  }

  channel(intf) {
    return {
      publish: (event, data) => this.publish(intf, event, data),
      subscribe: (events, handler) => this.subscribe(intf, events, handler)
    };
  }

  #subscribe(intf, event, handler) {
    if (!this.handlers[intf]) {
      this.handlers[intf] = {};
    }

    if (!this.handlers[intf][event]) {
      this.handlers[intf][event] = [];
    }

    this.handlers[intf][event].push(handler);
  }

}