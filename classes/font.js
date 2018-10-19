import {PerspectiveCamera, OrthographicCamera} from './camera.js';
import {Model} from './model.js';

export class Font{
    constructor(text){
        this.text = text || '';
        this.liteGlContext = null;
    }

    setText(text){
        this.text = text;
    }
}

export class CanvasFont extends Font{
    constructor(text, options){
        super(text);

        this.options = options || {};
        this.canvas = document.createElement('canvas');
    }

    update(){

    }

    renderToScreen(options){
        if(!this.liteGlContext){
            throw 'need LiteGL instance';
        }

        options = options || {};

        const opt = {
            autoResize: options.autoResize != undefined ? options.autoResize : true, // if true, other options will not be used
            left: options.left || 0,
            top: options.top || 0,
            width: options.width || 0,
            height: options.height || 0
        };

        this.canvas.width = 512;
        this.canvas.height = 512;
        this.canvas.style['width'] = 512 + 'px';
        this.canvas.style['height'] = 512 + 'px';

        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.fillText(this.text, 10, 50);

        // const currentVertShader = this.liteGlContext.currentVertShader;
        // const currentFragShader = this.liteGlContext.currentFragShader;

        // shader text
        const fontVs = 'attribute vec3 coordinates;\
            attribute vec2 textureCoord;\
            varying vec2 vTextureCoord;\
            uniform mat4 camera;\
            void main(void){\
                gl_Position = camera * vec4(coordinates, 1.0);\
                vTextureCoord = textureCoord;\
            }';
        const fontFs = 'precision mediump float;\
            varying vec2 vTextureCoord;\
            uniform sampler2D uSampler;\
            void main(void){\
                gl_FragColor = texture2D(uSampler, vTextureCoord);\
            }';


        let vertShader = this.liteGlContext.createShader(fontVs, WebGLRenderingContext.VERTEX_SHADER);
        let fragShader = this.liteGlContext.createShader(fontFs, WebGLRenderingContext.FRAGMENT_SHADER);

        this.liteGlContext.useShader(vertShader, fragShader);

        let orthoCamera = new OrthographicCamera(0, this.liteGlContext.width, this.liteGlContext.height, 0, 0, 1000);
        this.liteGlContext.useCamera(orthoCamera, 'camera');

        // let img = new Image();
        // img.onload = () => {
            let fontTexture = this.liteGlContext.createTexture(this.canvas, {
                width: 512,
                height: 512,
                format: WebGLRenderingContext.RGB,
                type: WebGLRenderingContext.UNSIGNED_BYTE,
                generateMipmaps: false
            });

            let fontQuad = new Model({
                vertexBuffer: this.liteGlContext.createBuffer(new Float32Array([
                    0, 0, -1,
                    512, 0, -1,
                    512, 512, -1,
                    0, 512, -1
                ]), WebGLRenderingContext.ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW, WebGLRenderingContext.FLOAT, 3),
                indexBuffer: this.liteGlContext.createBuffer(new Uint16Array([
                    0, 1, 2, 0, 2, 3
                ]), WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW, WebGLRenderingContext.UNSIGNED_SHORT, 1),
                textureBuffer: this.liteGlContext.createBuffer(new Float32Array([
                    0, 0, 1, 0, 1, 1, 0, 1
                ]), WebGLRenderingContext.ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW, WebGLRenderingContext.FLOAT, 2)
            });

            this.liteGlContext.setAttribute(fontQuad.vertexBuffer, 'coordinates');
            this.liteGlContext.setAttribute(fontQuad.textureBuffer, 'textureCoord');

            this.liteGlContext.useTexture(fontTexture, 'uSampler');

            this.liteGlContext.render(fontQuad, WebGLRenderingContext.TRIANGLES);

            // switch to current shader
            // this.liteGlContext.useShader(currentVertShader, currentFragShader);
        // };
        // img.src = this.canvas.toDataURL('image/png');

        // document.body.appendChild(img);
    }

    renderToTexture(texture){

    }
}

export class GeometryFont extends Font{
    constructor(text){
        super(text);
    }
}