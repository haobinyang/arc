export class Buffer{
    constructor(data, options){
        options = options || {};
        this.data = data;
        this.target = options.target || WebGLRenderingContext.ARRAY_BUFFER;
        this.usage = options.usage || WebGLRenderingContext.STATIC_DRAW;
        this.dataType = options.dataType || WebGLRenderingContext.FLOAT;
        this.components = options.components || 3;
        this.instance = null;
        this.glContext = null;
    }

    update(data, offset = 0){
        this.glContext.bindBuffer(this.target, this.instance);
        this.glContext.bufferSubData(this.target, offset, data);
        this.glContext.bindBuffer(this.target, null);
    }
}