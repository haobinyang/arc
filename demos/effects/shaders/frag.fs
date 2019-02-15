precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uSampler2;

void main(void){
    vec3 color = (texture2D(uSampler, vTextureCoord)).rgb;
    gl_FragColor = vec4(color, 1.0);
}