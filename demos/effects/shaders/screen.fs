precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void){
    float red = (texture2D(uSampler, vTextureCoord)).r;
    float green = (texture2D(uSampler, vec2(vTextureCoord.x - 0.015, vTextureCoord.y - 0.015))).g;
    float blue = (texture2D(uSampler, vec2(vTextureCoord.x - 0.03, vTextureCoord.y - 0.03))).b;
    gl_FragColor = vec4(red, green, blue, 1.0);
    // gl_FragColor = vec4((texture2D(uSampler, vTextureCoord)).rgb, 1.0);
}