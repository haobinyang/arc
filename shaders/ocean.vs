attribute vec3 coordinates;
attribute vec3 normals;
attribute vec2 textureCoord;

uniform mat4 camera;

varying vec3 vNormals;
varying vec3 FragPos;
varying vec2 vTextureCoord;

void main(void){
    gl_Position = camera * vec4(coordinates, 1.0);
    vNormals = normals;
    FragPos = coordinates;
    vTextureCoord = textureCoord;
}