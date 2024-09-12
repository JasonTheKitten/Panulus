import {
  canvasDeterminePointsOfTriangleWithinCircle, gpuDeterminePointsOfTriangleWithinCircle,
  isInTriangle, rescaleValue, hsvToRgb, rgbToHsv
} from "./colorwheelmath.mjs";

const INNER_RADIUS_FACTOR = .86;

let colorWheelHTML, hueCircleProgramResources, hsvTriangleProgramResources;
export async function setup(plugin) {
  [colorWheelHTML, hueCircleProgramResources, hsvTriangleProgramResources] = await Promise.all([
    plugin.resourceLoader().resource("resources/colorwheel.html", "html"),
    loadShaderProgramResources(plugin, "resources/shaders/huecircle.vs", "resources/shaders/huecircle.fs"),
    loadShaderProgramResources(plugin, "resources/shaders/hsvtriangle.vs", "resources/shaders/hsvtriangle.fs")
  ]);
}

async function loadShaderProgramResources(plugin, vertexShaderPath, fragmentShaderPath) {
  const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
    plugin.resourceLoader().resource(vertexShaderPath, "text"),
    plugin.resourceLoader().resource(fragmentShaderPath, "text")
  ]);

  return { vertexShaderSource, fragmentShaderSource };
}

// TODO: Move to a service
// TODO: Handle cleanup
function loadShaderProgram(gl, resources) {
  const { vertexShaderSource, fragmentShaderSource } = resources;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    throw new Error("Vertex shader compilation failed: " + gl.getShaderInfoLog(vertexShader));
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw new Error("Fragment shader compilation failed: " + gl.getShaderInfoLog(fragmentShader));
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  return program;
}

export function createColorWheelView(plugin, projectOptions) {
  const colorWheelRoot = colorWheelHTML.cloneNode(true);

  const colorWheelCanvas = colorWheelRoot.querySelector(".colorwheel-canvas");
  const colorWheelUICanvas = colorWheelRoot.querySelector(".colorwheel-ui-canvas");

  let selectedHue = 0;

  function redrawColorWheel(gl) {
    const program = loadShaderProgram(gl, hueCircleProgramResources);
    gl.useProgram(program);
    
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const shapeAttributeLocation = gl.getAttribLocation(program, "shape");
    const shapeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1, -1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1 ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(shapeAttributeLocation);
    gl.vertexAttribPointer(shapeAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "resolution");
    gl.uniform2f(resolutionLocation, colorWheelCanvas.width, colorWheelCanvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function redrawColorTriangle(gl) {
    const hue = selectedHue / Math.PI / 2;

    const program = loadShaderProgram(gl, hsvTriangleProgramResources);
    gl.useProgram(program);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const scaledPoints = gpuDeterminePointsOfTriangleWithinCircle(INNER_RADIUS_FACTOR);
    
    const shapeAttributeLocation = gl.getAttribLocation(program, "shape");
    const shapeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(scaledPoints), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(shapeAttributeLocation);
    gl.vertexAttribPointer(shapeAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const hsvCoordAttributeLocation = gl.getAttribLocation(program, "hsvCoord");
    const hsvCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, hsvCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ hue, .5, 0, hue, 0, 1, hue, 1, 1  ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(hsvCoordAttributeLocation);
    gl.vertexAttribPointer(hsvCoordAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function redrawColorWheelUIElements(canvas) {
    const ctx = canvas.getContext("2d");

    const canvasRadius = canvas.width / 2;
    const innerRadius = canvasRadius * INNER_RADIUS_FACTOR;
    const angle = selectedHue + Math.PI;
    const xFactor = Math.cos(angle);
    const yFactor = Math.sin(angle);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      canvasRadius + xFactor * innerRadius,
      canvasRadius + yFactor * innerRadius
    );
    ctx.lineTo(
      canvasRadius + xFactor * canvasRadius,
      canvasRadius + yFactor * canvasRadius
    );
    ctx.stroke();
  }

  function redrawColorTriangleUIElements(canvas) {
    const ctx = canvas.getContext("2d");

    const trianglePoints = canvasDeterminePointsOfTriangleWithinCircle(INNER_RADIUS_FACTOR, canvas.width);
    const rgbColor = projectOptions.get("brush.color", { red: 0, green: 0, blue: 0 });
    const hsvColor = rgbToHsv(rgbColor.red / 255, rgbColor.green / 255, rgbColor.blue / 255);
    const [x1, y1, x2, y2, x3, y3] = trianglePoints;

    const miniSaturation = (hsvColor.saturation - .5) * hsvColor.value + .5;
    const maxSaturationClient = Math.max(x1, x2, x3);
    const minSaturationClient = Math.min(x1, x2, x3);
    const saturationX = rescaleValue(miniSaturation, 0, 1, minSaturationClient, maxSaturationClient);

    const maxValueClient = Math.max(y1, y2, y3);
    const minValueClient = Math.min(y1, y2, y3);
    const valueY = rescaleValue(hsvColor.value, 0, 1, minValueClient, maxValueClient);

    ctx.strokeStyle = `rgb(${255 - rgbColor.red}, ${255 - rgbColor.green}, ${255 - rgbColor.blue})`;
    ctx.fillStyle = `rgb(${rgbColor.red}, ${rgbColor.green}, ${rgbColor.blue})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(saturationX, valueY, 5, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
  }

  function performRedraw() {
    const width = colorWheelCanvas.clientWidth;
    const height = colorWheelCanvas.clientHeight;
    colorWheelCanvas.width = width * window.devicePixelRatio;
    colorWheelCanvas.height = height * window.devicePixelRatio;
    colorWheelUICanvas.width = width * window.devicePixelRatio;
    colorWheelUICanvas.height = height * window.devicePixelRatio;

    const context = colorWheelCanvas.getContext("webgl2", { antialias: true });
    if (context == null) {
      throw new Error("WebGL 2 is not supported");
    }

    context.viewport(0, 0, width, height);
    context.clearColor(0, 0, 0, 0);
    context.clear(context.COLOR_BUFFER_BIT);

    redrawColorTriangle(context);
    redrawColorWheel(context);
    redrawColorWheelUIElements(colorWheelUICanvas);
    redrawColorTriangleUIElements(colorWheelUICanvas);
  }
  new ResizeObserver(performRedraw).observe(colorWheelCanvas);
  setTimeout(performRedraw, 0);

  let enableHueSelection = false;
  let enableSaturationValueSelection = false;
  function handleMouseDownEvent(e) {
    const width = colorWheelCanvas.clientWidth;
    const height = colorWheelCanvas.clientHeight;

    const mouseRadius = Math.sqrt(
      Math.pow(e.offsetX - width / 2, 2) +
      Math.pow(e.offsetY - height / 2, 2)
    );

    if (mouseRadius > width / 2 * INNER_RADIUS_FACTOR && mouseRadius < width / 2) {
      enableHueSelection = true;
    }

    const trianglePoints = canvasDeterminePointsOfTriangleWithinCircle(INNER_RADIUS_FACTOR, width);
    enableSaturationValueSelection = isInTriangle(e.offsetX, e.offsetY, trianglePoints);

    handleMouseMoveEvent(e);
  }
  function handleMouseMoveEvent(e) {
    e.preventDefault();

    const width = colorWheelCanvas.clientWidth;
    const height = colorWheelCanvas.clientHeight;
    
    if (enableHueSelection) {
      const angle = Math.atan2(e.offsetY - height / 2, e.offsetX - width / 2);
      selectedHue = angle + Math.PI;

      const oldRGBColor = projectOptions.get("brush.color", { red: 0, green: 0, blue: 0 });
      const oldHsvColor = rgbToHsv(oldRGBColor.red / 255, oldRGBColor.green / 255, oldRGBColor.blue / 255);
      const newRGBColor = hsvToRgb(selectedHue / Math.PI / 2, oldHsvColor.saturation, oldHsvColor.value);
      const newColor = {
        red: newRGBColor.red * 255,
        green: newRGBColor.green * 255,
        blue: newRGBColor.blue * 255
      };

      projectOptions.set("brush.color", newColor);
    } else if (enableSaturationValueSelection) {
      const trianglePoints = canvasDeterminePointsOfTriangleWithinCircle(INNER_RADIUS_FACTOR, width);
      const [x1, y1, x2, y2, x3, y3] = trianglePoints;
      
      const value = rescaleValue(e.offsetY, Math.min(y1, y2, y3), Math.max(y1, y2, y3), 0, 1);
      const unfixedSaturation = rescaleValue(e.offsetX, Math.min(x1, x2, x3), Math.max(x1, x2, x3), 0, 1);
      const unclampedSaturation = (unfixedSaturation - .5) / value + .5;
      const saturation = Math.min(Math.max(unclampedSaturation, 0), 1);

      const unscaledColor = hsvToRgb(selectedHue / Math.PI / 2, saturation, value);
      const color = {
        red: unscaledColor.red * 255,
        green: unscaledColor.green * 255,
        blue: unscaledColor.blue * 255
      };

      projectOptions.set("brush.color", color);
    }

    performRedraw();
  }
  function handleDocumentMouseMoveEvent(e) {
    const rect = colorWheelCanvas.getBoundingClientRect();
    handleMouseMoveEvent({
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      preventDefault: e.preventDefault.bind(e)
    });
  }
  function handleMouseUpEvent(e) {
    enableHueSelection = false;
    enableSaturationValueSelection = false;
  }

  colorWheelUICanvas.addEventListener("mousedown", handleMouseDownEvent);
  colorWheelUICanvas.addEventListener("mousemove", handleMouseMoveEvent);
  colorWheelUICanvas.addEventListener("mouseup", handleMouseUpEvent);
  document.addEventListener("mousemove", handleDocumentMouseMoveEvent);

  let watcher = projectOptions.createWatcher();
  watcher.watch("brush.color", function(color) {
    if (color == null) {
      return;
    }

    const hsvColor = rgbToHsv(color.red / 255, color.green / 255, color.blue / 255);
    selectedHue = hsvColor.hue * Math.PI * 2;

    performRedraw();
  });

  return colorWheelRoot;
}