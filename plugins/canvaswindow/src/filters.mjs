export class MergeFilter {
  apply(handle) {
    let outputCanvas = handle.createCanvas(handle.targetCanvas);
    let outputCtx = outputCanvas.getContext("2d");

    outputCtx.drawImage(handle.targetCanvas, 0, 0);
    outputCtx.drawImage(handle.inputCanvas, 0, 0);

    return {
      transformedInputCanvas: handle.inputCanvas,
      outputCanvas: outputCanvas
    };
  }
}

export class EraserFilter {
  apply(handle) {
    let outputCanvas = handle.createCanvas(handle.targetCanvas);
    let outputCtx = outputCanvas.getContext("2d");

    outputCtx.drawImage(handle.targetCanvas, 0, 0);
    outputCtx.globalCompositeOperation = "destination-out";
    outputCtx.drawImage(handle.inputCanvas, 0, 0);

    return {
      transformedInputCanvas: handle.inputCanvas,
      outputCanvas: outputCanvas
    };
  }
}