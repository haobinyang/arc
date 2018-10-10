attribute vec3 coordinates;
attribute vec3 color;
attribute vec2 textureCoord;
attribute vec3 normals;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vNormals;
varying vec3 FragPos;
varying vec4 FragPosLightSpace;

uniform mat4 camera;
uniform mat4 lightSpaceMatrix;

uniform mat4 model;

void main(void){
    gl_Position = camera * model * vec4(coordinates, 1.0);
    vColor = vec4(color, 1.0);
    FragPos = coordinates;
    FragPosLightSpace = lightSpaceMatrix * model * vec4(coordinates, 1.0);
    vTextureCoord = textureCoord;
    vNormals = normals; //mat3(transpose(inverse(model))) * normals;  
}