class Vector{
    constructor(x, y, z, w){
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.isTranspose = false;
    }

    transpose(){
        this.isTranspose = !this.isTranspose;
    }
}

export class Vec2 extends Vector{
    constructor(x, y){
        super(x, y);
    }
}

export class Vec3 extends Vector{
    constructor(x, y, z){
        super(x, y, z);
    }
}

export class Vec4 extends Vector{
    constructor(x, y, z, w){
        super(x, y, z, w);
    }
}