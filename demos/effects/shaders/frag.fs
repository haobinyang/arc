precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D currentFrame;
uniform sampler2D preFrame;

void main(void){
    vec3 color = (texture2D(preFrame, vTextureCoord)).rgb;

    if(vTextureCoord.x > 0.5){
        color = (texture2D(currentFrame, vTextureCoord)).rgb * 0.2;
    }

    gl_FragColor = vec4(color, 1.0);
}