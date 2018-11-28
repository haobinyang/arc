import {Vec3} from './vector.js';

export class PerspectiveCamera{
    constructor(fov, aspect, near, far){
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = glm.vec3(0.0, 0.0, 0.0);
        this.center = glm.vec3(0.0, 0.0, 0.0);
        this.up = glm.vec3(0, 1, 0);
        this.perspective = glm.mat4();
        this.modelView = glm.mat4();
        this.camMatrix = glm.mat4();

        this.update();
    }

    setUp(vec3){
        this.up = vec3;
        this.update();
    }

    setPosition(vec3){
        this.position = vec3;
        this.update();
    }

    setCenter(vec3){
        this.center = vec3;
        this.update();
    }

    update(){
        this.perspective = glm.perspective(glm.radians(this.fov), this.aspect, this.near, this.far);
        this.modelView = glm.lookAt(this.position, this.center, this.up);
        this.camMatrix = this.perspective['*'](this.modelView);
    }
}

export class OrthographicCamera{
    constructor(left, right, bottom, top, near, far){
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
        this.camMatrix = glm.mat4();

        this.update();
    }

    update(){
        this.camMatrix = glm.ortho(this.left, this.right, this.bottom, this.top, this.near, this.far);
    }
}