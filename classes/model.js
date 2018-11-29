export class Model{
    constructor(buffers){
        this.buffers = [];
        Object.keys(buffers || {}).forEach((key) => {
            if(buffers[key]){
                this.buffers.push(buffers[key]);
                this[key] = buffers[key];
            }
        });
    }

    toCenter(){ // 将模型中心和世界坐标原点对齐
        let buffer = this.vertexBuffer;

        if(!buffer || !buffer.data){
            throw 'no vertices data';
        }

        let min = [], max = [], center = [];

        buffer.data.forEach((item, index) => {
            index = index % buffer.components;
            min[index] = Math.min(min[index] || Number.MAX_VALUE, item);
            max[index] = Math.max(max[index] || Number.MIN_VALUE, item);
        });

        min.forEach((item, index) => {
            index = index % buffer.components;
            center[index] = (min[index] + max[index]) * 0.5;
        });

        buffer.data = buffer.data.map((item, index) => {
            index = index % buffer.components;
            item -= center[index];
            return item;
        });

        buffer.update(buffer.data);
    }
}