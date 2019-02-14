export class Buffer {
    constructor(data, options){
        this.data = data;
        this.target = options.target;
        this.usage = options.usage;
        this.dataType = options.dataType;
        this.components = options.components;
        this.instance = null;
        this.glContext = null;
    }

    update(data, offset = 0){
        this.glContext.bindBuffer(this.target, this.instance);
        this.glContext.bufferSubData(this.target, offset, data);
        this.glContext.bindBuffer(this.target, null);
    }
}