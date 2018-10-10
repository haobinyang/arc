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
}