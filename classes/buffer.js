export class Buffer{
    constructor(data, target, usage, dataType, components){
        this.data = data;
        this.target = target;
        this.usage = usage;
        this.dataType = dataType;
        this.components = components;
        this.instance = null;
        this.glContext = null;
    }

    update(data, offset = 0){
        this.glContext.bindBuffer(this.target, this.instance);
        this.glContext.bufferSubData(this.target, offset, data);
        this.glContext.bindBuffer(this.target, null);
    }
}