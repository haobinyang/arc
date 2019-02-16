precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void){
    float red = (texture2D(uSampler, vTextureCoord)).r;
    float green = (texture2D(uSampler, vec2(vTextureCoord.x - 0.02, vTextureCoord.y - 0.02))).g;
    float blue = (texture2D(uSampler, vec2(vTextureCoord.x - 0.04, vTextureCoord.y - 0.04))).b;
    gl_FragColor = vec4(red, green, blue, 1.0);
}