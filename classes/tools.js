export default {
    isFunction(obj){
        return Object.prototype.toString.call(obj) === '[object Function]';
    },
    isArray(obj){
        return Object.prototype.toString.call(obj) === '[object Array]';
    },
    isFloat32Array(obj){
        return Object.prototype.toString.call(obj) === '[object Float32Array]';
    },
    isNumber(obj){
        return Object.prototype.toString.call(obj) === '[object Number]';
    },
    isInteger(val){
        return this.isNumber(val) && val % 1 == 0;
    },
    isFloat(val){
        return this.isNumber(val) && val % 1 != 0;
    },
    isVertexShader(shader){
        return shader.type == WebGLRenderingContext.VERTEX_SHADER;
    },
    isFragmentShader(shader){
        return shader.type == WebGLRenderingContext.FRAGMENT_SHADER;
    },
    isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    },
    async readFile(path){
        return fetch(path).then(res => {return res.text();});
    },
    async readImage(path){
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = function(){
                resolve(this);
            };
            img.src = path;
        });
    },
    async getVideo(path, options){
        options = options || {};

        return new Promise((resolve, reject) => {
            const video = document.createElement('video');

            video.autoplay = options.autoplay ? options.autoplay : false;
            video.muted = options.muted ? options.muted : false;
            video.loop = options.loop ? options.loop : false;
            video.src = path;

            video.addEventListener("loadedmetadata", async () => {
                video.width = video.videoWidth;
                video.height = video.videoHeight;
                await this.sleep(100);
                resolve(video);
            }, false);
        });
    },
    async loadAudio(path, options){
        options = options || {};

        return new Promise((resolve, reject) => {
            const audio = new Audio(path);

            audio.loop = options.loop ? options.loop : false;

            audio.addEventListener("canplaythrough", async () => {
                resolve(audio);
            }, false);
        });
    },
    async sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    mesh(row, column, xRange = [-1, 1], zRange = [-1, 1]){
        // 范围x:[-1, 1],z:[-1,1]
        let vertices = [];
        let indices = [];
        let textures = [];
        let normals = [];

        let vertStepX = (xRange[1] - xRange[0]) / (column - 1);
        let vertStepZ = (zRange[1] - zRange[0]) / (row - 1);

        let texStepX = 1 / (column - 1);
        let texStepZ = 1 / (row - 1);

        for(let i = 0; i < row; i++){
            for(let j = 0; j < column; j++){
                vertices.push(j * vertStepX - 1); // x
                vertices.push(0); // y
                vertices.push(i * vertStepZ - 1); // z

                textures.push(j * texStepX);
                textures.push(i * texStepZ);

                normals.push(0, 1, 0);

                if(i < row - 1 && j < column - 1){
                    let startIndex = i * column + j;
                    indices.push(startIndex);
                    indices.push(startIndex + column);
                    indices.push(startIndex + column + 1);
                    indices.push(startIndex);
                    indices.push(startIndex + column + 1);
                    indices.push(startIndex + 1);
                }
            }
        }

        return {
            vertices: vertices,
            indices: indices,
            textures: textures,
            normals: normals
        };
    }
}