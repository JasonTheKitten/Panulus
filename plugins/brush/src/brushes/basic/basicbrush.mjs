let vertexShaderSource, fragmentShaderSource;

export class BasicBrush {

  #layerHandle;
  #options;
  #sourceCanvas;
  #targetCanvas;
  #targetGl;

  #drawStartLocation;
  #drawEndLocation;

  #previousDrawPosition;

  #resources = [];

  constructor(layerHandle, options) {
    this.#layerHandle = layerHandle;
    this.#options = options;

    this.#targetCanvas = this.#createCanvas(layerHandle.canvas);
    this.#sourceCanvas = this.#options.allowSelfBlending ?
      this.#targetCanvas :
      this.#createCanvas(layerHandle.canvas);

    this.#targetGl = this.#targetCanvas.getContext("webgl2");
    if (!this.#targetGl) {
      throw new Error("WebGL not supported");
    }

    this.#setup();
  }

  commit() {
    this.#layerHandle.onOperationCommitted(this.preview());
    this.#done();
  }

  cancel() {
    this.#done();
  }

  preview() {
    let filterHandle = {
      sourceCanvas: this.#sourceCanvas,
      inputCanvas: this.#targetCanvas,
      targetCanvas: this.#layerHandle.canvas,
      createCanvas: this.#createCanvas.bind(this),
    }

    let filters = this.#options.filters;
    for (let i = 0; i < filters.length; i++) {
      const filterResult = filters[i].apply(filterHandle);
      filterHandle.sourceCanvas = this.#sourceCanvas;
      filterHandle.inputCanvas = filterResult.transformedInputCanvas;
      filterHandle.targetCanvas = filterResult.outputCanvas;
    }

    return filterHandle.targetCanvas;
  }

  draw(position) {
    if (this.#previousDrawPosition == null) {
      this.#previousDrawPosition = position;
    }

    const gl = this.#targetGl;
    gl.uniform2fv(this.#drawStartLocation, [
      position.x,
      this.#targetCanvas.height - position.y
    ]);
    gl.uniform2fv(this.#drawEndLocation, [
      this.#previousDrawPosition.x,
      this.#targetCanvas.height - this.#previousDrawPosition.y
    ]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.#previousDrawPosition = position;
  }

  breakStroke() {
    this.#previousDrawPosition = null;
  }

  #setup() {
    const gl = this.#targetGl;
    const program = this.#createGLProgram();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const colorLocation = gl.getUniformLocation(program, "color");
    const color = this.#options.color || { red: 0, green: 0, blue: 0 };
    gl.uniform4fv(colorLocation, [color.red / 255, color.green / 255, color.blue / 255, 1 ]); // TODO: Use color from options
    
    this.#drawStartLocation = gl.getUniformLocation(program, "drawStart");
    this.#drawEndLocation = gl.getUniformLocation(program, "drawEnd");

    const radiusLocation = gl.getUniformLocation(program, "radius");
    gl.uniform1f(radiusLocation, this.#options.radius); // TODO: Use radius from options

    const shapeAttributeLocation = gl.getAttribLocation(program, "shape");
    const shapeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1, -1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1 ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(shapeAttributeLocation);
    gl.vertexAttribPointer(shapeAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  #createGLProgram() {
    const gl = this.#targetGl;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      throw new Error("Failed to compile vertex shader");
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      throw new Error("Failed to compile fragment shader");
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    this.#resources.push({ shader: vertexShader }, { shader: fragmentShader }, { program: program });

    return program;
  }

  #done() {
    this.#layerHandle.onOperationFinished();
    for (const { shader, program } of this.#resources) {
      if (shader) this.#targetGl.deleteShader(shader);
      if (program) this.#targetGl.deleteProgram(program);
    }
  }

  #createCanvas(referenceCanvas) {
    const canvas = document.createElement("canvas");
    canvas.width = referenceCanvas.width;
    canvas.height = referenceCanvas.height;

    return canvas;
  }

}

export function loadBasicBrush(plugin) {
  let promise1 = plugin.resourceLoader()
    .resource("resources/brushes/basic/shader.vs", "text")
    .then(r => vertexShaderSource = r);
  let promise2 = plugin.resourceLoader()
    .resource("resources/brushes/basic/shader.fs", "text")
    .then(r => fragmentShaderSource = r);
  return Promise.all([promise1, promise2]);
}