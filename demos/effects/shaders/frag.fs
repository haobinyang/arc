precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D currentFrame;
uniform sampler2D preFrame;

uniform float rangeStart;
uniform float rangeEnd;

void main(void){
    vec3 color = (texture2D(currentFrame, vTextureCoord)).rgb;

    if(vTextureCoord.x > rangeStart && vTextureCoord.x < rangeEnd){
        color = (texture2D(preFrame, vTextureCoord)).rgb;
    }

    gl_FragColor = vec4(color, 1.0);
}