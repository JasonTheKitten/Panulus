export class Project {

  #options;

  constructor(options) {
    this.#options = options;
  }

  options() {
    return this.#options;
  }

}