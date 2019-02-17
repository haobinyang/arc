precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D vSampler;

uniform float step;
uniform int isVideo;

void main(void){
    vec3 color = vec3(0.0,0.0,0.0);
    vec2 newTexCoord = vTextureCoord;

    if(isVideo == 1){
        newTexCoord = vec2(vTextureCoord.x * 1.05 - 0.025, vTextureCoord.y * 1.05 - 0.025);

        if(newTexCoord.x < 0.0 || newTexCoord.x > 1.0 || newTexCoord.y < 0.0 || newTexCoord.y > 1.0){ // white boder
            color = vec3(1.0,1.0,1.0);
        }else{
            color = (texture2D(vSampler, newTexCoord)).rgb;
        }
    }else{
        newTexCoord = vec2(vTextureCoord.x - step, vTextureCoord.y + step);
        color = (texture2D(vSampler, newTexCoord)).rgb;
    }

    gl_FragColor = vec4(color, 1.0);
}