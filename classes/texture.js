export class Texture2D{
    constructor(data, options){
        this.data = data;

        if(data instanceof HTMLImageElement){
            this.width = data.width;
            this.height = data.height;
        }else if(data instanceof HTMLVideoElement){
            this.width = data.videoWidth;
            this.height = data.videoHeight;
        }else{
            this.width = options.width ? options.width : 256;
            this.height = options.height ? options.height : 256;
        }

        this.generateMipmaps = options && options['generateMipmaps'] != undefined ? options['generateMipmaps'] : true;
        this.wrapS = options && options['wrapS'] ? options['wrapS'] : WebGLRenderingContext.CLAMP_TO_EDGE;
        this.wrapT = options && options['wrapT'] ? options['wrapT'] : WebGLRenderingContext.CLAMP_TO_EDGE;
        this.magFilter = options && options['magFilter'] ? options['magFilter'] : WebGLRenderingContext.LINEAR;
        this.minFilter = options && options['minFilter'] ? options['minFilter'] : WebGLRenderingContext.LINEAR;
        this.format = options && options['format'] ? options['format'] : WebGLRenderingContext.RGBA;
        this.type = options && options['type'] ? options['type'] : WebGLRenderingContext.UNSIGNED_BYTE;

        this.instance = null;
        this.glContext = null;
    }

    update(data){
        this.data = data;
        this.glContext.bindTexture(this.glContext.TEXTURE_2D, this.instance);
        this.glContext.texImage2D(this.glContext.TEXTURE_2D, 0, this.format, this.format, this.type, this.data);
        this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);
    }
}

export class VideoTexture extends Texture2D{
    constructor(video, options){
        super(video, options);

        this.played = false;
        this.playing = false;
        this.timeUpdate = false;

        video.addEventListener('playing', () => {
            this.playing = true;
        }, true);

        video.addEventListener('timeupdate', () => {
            this.timeUpdate = true;
        }, true);
    }

    play(){
        if(!this.played){
            this.data.play();
            this.played = true;
        }
    }

    update(){
        if(this.playing && this.timeUpdate){
            this.glContext.bindTexture(this.glContext.TEXTURE_2D, this.instance);
            this.glContext.texImage2D(this.glContext.TEXTURE_2D, 0, this.format, this.format, this.type, this.data);
            this.glContext.bindTexture(this.glContext.TEXTURE_2D, null);
        }
    }
}