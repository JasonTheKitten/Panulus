precision mediump float;

uniform vec4 color;
uniform vec2 drawStart;
uniform vec2 drawEnd;
uniform float radius;

void main() {
    vec2 point = gl_FragCoord.xy;

    float distFromStart = distance(point, drawStart);
    float distFromEnd = distance(point, drawEnd);
    if (distFromStart < radius || distFromEnd < radius) {
        gl_FragColor = color;
    } else {
        vec2 lineChange = drawEnd - drawStart;
        vec2 pointChange = point - drawStart;

        float interpolation = dot(pointChange, lineChange) / dot(lineChange, lineChange);
        vec2 closestPoint = drawStart + lineChange * clamp(interpolation, 0.0, 1.0);
        float distFromLine = distance(point, closestPoint);

        if (interpolation >= 0. && interpolation <= 1. && distFromLine < radius) {
            gl_FragColor = color;
        } else {
            discard;
        }
    }
}