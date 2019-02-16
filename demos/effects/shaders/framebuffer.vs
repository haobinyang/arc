attribute vec3 coordinates;
attribute vec2 textureCoord;

varying vec2 vTextureCoord;

uniform mat4 scale;

void main(void){
   gl_Position = scale * vec4(coordinates, 1.0);
   vTextureCoord = textureCoord;
}