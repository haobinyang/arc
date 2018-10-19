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
        this.perspective = mat4.create();
        this.modelView = mat4.create();
        this.camMatrix = mat4.create();

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
        mat4.perspective(this.perspective, this.fov * Math.PI / 180, this.aspect, this.near, this.far);
        mat4.lookAt(this.modelView, [this.position.x, this.position.y, this.position.z], [this.center.x, this.center.y, this.center.z], [this.up.x, this.up.y, this.up.z]);
        mat4.multiply(this.camMatrix, this.perspective, this.modelView);
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
        this.camMatrix = mat4.create();

        this.update();
    }

    update(){
        mat4.ortho(this.camMatrix, this.left, this.right, this.bottom, this.top, this.near, this.far);
    }
}