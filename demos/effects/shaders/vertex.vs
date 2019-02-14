attribute vec3 coordinates;
attribute vec2 textureCoord;

varying vec2 vTextureCoord;

void main(void){
   gl_Position = vec4(coordinates, 1.0);
   vTextureCoord = textureCoord;
}