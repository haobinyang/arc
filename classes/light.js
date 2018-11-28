class Light{
    constructor(color, intensity){
        this.color = color;
        this.intensity = intensity;
    }
}

export class AmbientLight extends Light{
    constructor(color, intensity){
        super(color, intensity);
    }
}

export class DirectionalLight extends Light{
    constructor(color, intensity){
        super(color, intensity);
        this.position = glm.vec3(0, 1, 0);
        this.enableShadow = false;
    }

    setPosition(vec3){
        this.position = vec3;
    }

    setShadow(val){
        this.enableShadow = val;
    }
}