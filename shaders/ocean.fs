precision mediump float;

varying vec3 vNormals;
varying vec3 FragPos;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

// uniform vec3 waterColor;
uniform vec4 lightColor;
uniform vec3 lightPos;
uniform vec4 ambient;
uniform vec3 viewPos;

void main(void){
    vec3 norm = normalize(vNormals);
    vec3 lightDir = normalize(lightPos - FragPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec4 diffuse = diff * lightColor;

    //half facing = saturate(dot(eyeVect, normal));
    //half3 waterColor = lerp(shallowWaterColor, deepWaterColor, facing);

    // specular
    float specularStrength = 0.5;
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 256.0);
    vec4 specular = specularStrength * spec * lightColor;

    vec3 color = ((ambient + diffuse) * texture2D(uSampler, vTextureCoord)).rgb;// (ambient + diffuse + specular) *
    gl_FragColor = vec4(color, 1.0);
}