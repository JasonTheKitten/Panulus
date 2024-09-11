precision mediump float;

uniform vec4 color;
uniform vec2 targetPosition;
uniform float radius;

void main() {
    float dist = distance(gl_FragCoord.xy, targetPosition);
    if (dist < radius) {
        gl_FragColor = color;
    } else {
        discard;
    }
}