
function determinePointsOfTriangleWithinCircle(circleRadius) {
  const hypo = Math.sqrt(3) / 2 * circleRadius;
    const offset = (1 - circleRadius) / 2;
    return [
      .5, offset,
      .5 + Math.sin(Math.PI / 6) * hypo, offset + Math.cos(Math.PI / 6) * hypo,
      .5 - Math.sin(Math.PI / 6) * hypo, offset + Math.cos(Math.PI / 6) * hypo,
    ]
}

export function canvasDeterminePointsOfTriangleWithinCircle(circleRadius, canvasRadius) {
  const unscaledPoints = determinePointsOfTriangleWithinCircle(circleRadius);

  return unscaledPoints.map(point => point * canvasRadius);
}

export function gpuDeterminePointsOfTriangleWithinCircle(circleRadius) {
  const unscaledPoints = determinePointsOfTriangleWithinCircle(circleRadius);

  return unscaledPoints.map(point => -(point * 2 - 1));
}

export function isInTriangle(x, y, points) {
    const [x1, y1, x2, y2, x3, y3] = points;
    const triangleArea = 1 / 2 * (-y2 * x3 + y1 * (-x2 + x3) + x1 * (y2 - y3) + x2 * y3);
    const s = 1 / (2 * triangleArea) * (y1 * x3 - x1 * y3 + (y3 - y1) * x + (x1 - x3) * y);
    const t = 1 / (2 * triangleArea) * (x1 * y2 - y1 * x2 + (y1 - y2) * x + (x2 - x1) * y);

    return s >= 0 && t >= 0 && 1 - s - t >= 0;
}

export function rescaleValue(value, originalMin, originalMax, newMin, newMax) {
    value = Math.min(Math.max(value, originalMin), originalMax);
    return (value - originalMin) / (originalMax - originalMin) * (newMax - newMin) + newMin;
}

export function hsvToRgb(hue, saturation, value) {
  const c = value * saturation;
  const x = c * (1 - Math.abs((hue % (1 / 3)) * 6 - 1));
  const m = value - c;
  if (hue <= 1 / 6) {
    return { red: c + m, green: x + m, blue: m };
  } else if (hue <= 2 / 6) {
    return { red: x + m, green: c + m, blue: m };
  } else if (hue <= 3 / 6) {
    return { red: m, green: c + m, blue: x + m };
  } else if (hue <= 4 / 6) {
    return { red: m, green: x + m, blue: c + m };
  } else if (hue <= 5 / 6) {
    return { red: x + m, green: m, blue: c + m };
  } else {
    return { red: c + m, green: m, blue: x + m };
  }
}

export function rgbToHsv(red, green, blue) {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue;
  if (delta === 0) {
    hue = 0;
  } else if (max === red) {
    hue = (green - blue) / delta % 6;
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  hue /= 6;
  if (hue < 0) {
    hue += 1;
  }

  const saturation = max === 0 ? 0 : delta / max;
  const value = max;

  return { hue, saturation, value };
}