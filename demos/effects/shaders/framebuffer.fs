precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D vSampler;

uniform float step;
uniform int isVideo;

void main(void){
    vec3 color = vec3(0.0,0.0,0.0);

    if(isVideo == 1){
        color = (texture2D(vSampler, vTextureCoord)).rgb;
    }else{
        vec2 newTexCoord = vec2(vTextureCoord.x - step, vTextureCoord.y + step);
        color = (texture2D(vSampler, newTexCoord)).rgb;
    }

    gl_FragColor = vec4(color, 1.0);
}