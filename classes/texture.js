export class Texture2D{
    constructor(img, options){
        this.data = img;
        this.width = img ? img.width : options.width ? options.width : 256;
        this.height = img ? img.height : options.height ? options.height : 256;

        this.generateMipmaps = options && options['generateMipmaps'] != undefined ? options['generateMipmaps'] : true;
        this.wrapS = options && options['wrapS'] ? options['wrapS'] : WebGLRenderingContext.CLAMP_TO_EDGE;
        this.wrapT = options && options['wrapT'] ? options['wrapT'] : WebGLRenderingContext.CLAMP_TO_EDGE;
        this.magFilter = options && options['magFilter'] ? options['magFilter'] : WebGLRenderingContext.LINEAR;
        this.minFilter = options && options['minFilter'] ? options['minFilter'] : WebGLRenderingContext.LINEAR;
        this.format = options && options['format'] ? options['format'] : WebGLRenderingContext.RGBA;
        this.type = options && options['type'] ? options['type'] : WebGLRenderingContext.UNSIGNED_BYTE;

        this.instance = null;
    }
}