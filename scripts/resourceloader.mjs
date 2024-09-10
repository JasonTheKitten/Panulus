export default class ResourceLoader {

  #baseURL;
  #resources;
  #loaders;

  constructor(baseURL) {
    this.#baseURL = baseURL;
    this.#resources = {};
    this.#loaders = {};

    this.#addDefaultLoaders();
  }

  async resource(path, type) {
    if (this.#resources[path]) {
      return this.#resources[path];
    }

    const loader = this.#loaders[type];
    if (!loader) {
      throw new Error(`No loader for type ${type}`);
    }

    const resourceURL = this.#baseURL + "/" + path;
    const resourceSource = await fetch(resourceURL);
    const resource = await loader(resourceSource);
    this.#resources[path] = resource;

    return resource;
  }

  #addLoader(name, loader) {
    this.#loaders[name] = loader;
  }

  #addDefaultLoaders() {
    this.#addLoader("json", async (source) => source.json());
    this.#addLoader("text", async (source) => source.text());
    this.#addLoader("html", async (source) => {
      return document.createRange().createContextualFragment(await source.text());
    });
    this.#addLoader("css", async (source) => {
      const style = new HTMLStyleElement();
      style.textContent = await source.text();

      return style;
    });
  }
    
}