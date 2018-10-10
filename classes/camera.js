import {Vec3} from './vector.js';

export class PerspectiveCamera{
    constructor(fov, aspect, near, far){
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = new Vec3(0.0, 0.0, 0.0);
        this.center = new Vec3(0.0, 0.0, 0.0);
        this.up = new Vec3(0, 1, 0);
    }

    setUp(vec3){
        this.up = vec3;
    }

    setPosition(vec3){
        this.position = vec3;
    }

    setCenter(vec3){
        this.center = vec3;
    }
}

export class OrthographicCamera{
    constructor(){

    }
}