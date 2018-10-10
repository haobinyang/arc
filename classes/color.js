export class Color{
    constructor(r = 255, g = 255, b = 255, a = 1.0){
        // r,g,b 0-255, a 0-1
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static ToGlColor(color){
        return new Color(color.r / 255, color.g / 255, color.b / 255, color.a);
    }
}