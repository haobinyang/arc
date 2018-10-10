attribute vec3 coordinates;

uniform mat4 camera;

uniform mat4 model;

void main(void){
    gl_Position = camera * model * vec4(coordinates, 1.0);
}