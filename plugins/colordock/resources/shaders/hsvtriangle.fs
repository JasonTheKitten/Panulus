precision mediump float;

varying vec3 vHsvCoord;

vec4 colorForHsv(float hue, float saturation, float value) {
    float c = value * saturation;
    float x = c * (1. - abs(mod(hue, 1. / 3.) * 6. -1.));
    float m = value - c;
    if (hue <= 1. / 6.) {
      return vec4(c + m, x + m, m, 1.0);
    } else if (hue <= 2. / 6.) {
      return vec4(x + m, c + m, m, 1.0);
    } else if (hue <= 3. / 6.) {
      return vec4(m, c + m, x + m, 1.0);
    } else if (hue <= 4. / 6.) {
      return vec4(m, x + m, c + m, 1.0);
    } else if (hue <= 5. / 6.) {
      return vec4(x + m, m, c + m, 1.0);
    } else {
      return vec4(c + m, m, x + m, 1.0);
    }
}

void main() {
  float hue = vHsvCoord.x;
  // You don't know how hard this was to get right
  float saturation = (vHsvCoord.y + - .5) / vHsvCoord.z + .5;
  float value = vHsvCoord.z;

  gl_FragColor = colorForHsv(hue, saturation, value);
}