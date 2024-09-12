attribute vec4 shape;
attribute vec3 hsvCoord;

varying vec3 vHsvCoord;

void main() {
    gl_Position = shape;
    vHsvCoord = hsvCoord;
}