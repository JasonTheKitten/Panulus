precision mediump float;

uniform vec2 resolution;

vec4 colorForHue(float hue) {
    float x = 1. - abs(mod(hue, 1. / 3.) * 6. -1.);
    if (hue <= 1. / 6.) {
      return vec4(1.0, x, 0.0, 1.0);
    } else if (hue <= 2. / 6.) {
      return vec4(x, 1.0, 0.0, 1.0);
    } else if (hue <= 3. / 6.) {
      return vec4(0.0, 1.0, x, 1.0);
    } else if (hue <= 4. / 6.) {
      return vec4(0.0, x, 1.0, 1.0);
    } else if (hue <= 5. / 6.) {
      return vec4(x, 0.0, 1.0, 1.0);
    } else {
      return vec4(1.0, 0.0, x, 1.0);
    }
}

void main() {
    float pi = 3.1415926535897932384626433832795;
    float angle = atan((gl_FragCoord.y - resolution.y / 2.0) * -1., gl_FragCoord.x - resolution.x / 2.0);
    float hue = (angle + pi) / (2. * pi);
    
    float radius = distance(gl_FragCoord.xy, resolution.xy / 2.0) / (resolution.y / 2.0);
    if (radius > 1.0 || radius < 0.86) {
        discard;
    }

    gl_FragColor = colorForHue(hue);
}