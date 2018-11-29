precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
//uniform sampler2D steel;
//uniform sampler2D col3;
//uniform sampler2D col2;

void main(void){
    gl_FragColor = texture2D(uSampler, vTextureCoord);// * texture2D(steel, vTextureCoord) * texture2D(col3, vTextureCoord) * texture2D(col2, vTextureCoord)
}