export class Particle{
    constructor(position, options){
        options = options || {};

        this.originalLife = this.life = options.life || 0;
        this.angle = options.angle || 0; // in degrees
        this.speed = options.speed || 0; // in pixels per second
        this.originalSize = this.size = options.size || 1;
        this.color = options.color || glm.vec4(1, 1, 1, 1);
        this.alpha = 1;
        const angleInRadians = glm.radians(this.angle);
        this.velocity = glm.vec2(this.speed * Math.cos(angleInRadians), -this.speed * Math.sin(angleInRadians));
        this.position = position;
    }

    update(dt){ // dt is the change in time (in seconds) since the last time we updated
        this.life -= dt;

        if(this.life > 0){
            let ageRatio = this.life / this.originalLife;
            this.size = this.originalSize * ageRatio;
            this.alpha = ageRatio;
            this.position.x += this.velocity.x * dt;
            this.position.y += this.velocity.y * dt;
        }
    };
}

export class Emitter{
    constructor(count, options){
        this.count = count;
        this.options = options || {};
        this.particlePool = Array.apply(null, Array(this.count)).map(item => new Particle(glm.vec2(), options));
    }
}