precision mediump float;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vNormals;
varying vec3 FragPos;
varying vec4 FragPosLightSpace;

uniform sampler2D uSampler;
uniform sampler2D depthTex;

uniform vec4 lightColor;
uniform vec3 lightPos;
uniform vec4 ambient;

uniform float depthTexSize;

float ShadowCalculation(vec4 fragPosLightSpace, vec3 lightDir, vec3 normal)
{
    // perform perspective divide
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // transform to [0,1] range
    projCoords = projCoords * 0.5 + 0.5;
    // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture2D(depthTex, projCoords.xy).r;
    // get depth of current fragment from light's perspective
    float currentDepth = projCoords.z;
    // check whether current frag pos is in shadow
    float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
    // float shadow = currentDepth - bias > closestDepth  ? 1.0 : 0.0;

    // PCF
    float shadow = 0.0;
    vec2 texelSize = 1.0 / vec2(depthTexSize, depthTexSize);
    for(int x = -1; x <= 1; ++x)
    {
        for(int y = -1; y <= 1; ++y)
        {
            float pcfDepth = texture2D(depthTex, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - bias > pcfDepth  ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;

    // keep the shadow at 0.0 when outside the far_plane region of the light's frustum.
    if(projCoords.z > 1.0)
        shadow = 0.0;

    return shadow;
}

void main(void){
    vec3 norm = normalize(vNormals);
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec4 diffuse = diff * lightColor;

    float shadow = 0.0;//ShadowCalculation(FragPosLightSpace, lightDir, norm);

    vec3 color = ((ambient + (1.0 - shadow) * diffuse) * texture2D(uSampler, vTextureCoord)).rgb;

    //vec3 color = ((ambient + (1.0 - shadow) * diffuse) * vec4(0.5, 0.5, 0.5, 1.0)).rgb;

    // Exposure tone mapping
    //vec3 mapped = vec3(1.0) - exp(-color * 3.0);
    // Gamma correction
    //color = pow(mapped, vec3(1.0 / 2.2));


    gl_FragColor = texture2D(uSampler, vTextureCoord);// vec4(color, 1.0);
}