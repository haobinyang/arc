attribute vec3 coordinates;
attribute vec2 textureCoord;

varying vec2 vTextureCoord;

uniform mat4 camera;

uniform mat4 model;

void main(void){
    gl_Position = camera * model * vec4(coordinates, 1.0);
    vTextureCoord = textureCoord;
}