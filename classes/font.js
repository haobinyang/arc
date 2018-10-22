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
    constructor(text, fontOptions, layoutOptions){
        super(text);

        fontOptions = fontOptions || {};
        layoutOptions = layoutOptions || {};

        this.fontOptions = Object.assign({
            'font-style': 'normal',
            'font-variant': 'normal',
            'font-weight': 'normal',
            'font-size': '10px',
            'font-family': 'sans-serif',
            'color': '#fff',
            'transparent': true
        }, fontOptions);

        this.layoutOptions = Object.assign({
            'width': 0,
            'height': 0,
            'left': 0,
            'top': 0
        }, layoutOptions);

        this.autoResize = !(this.layoutOptions.width && this.layoutOptions.height);

        this.canvas = document.createElement('canvas');
    }

    init(){
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

        this.vertShader = this.liteGlContext.createShader(fontVs, WebGLRenderingContext.VERTEX_SHADER);
        this.fragShader = this.liteGlContext.createShader(fontFs, WebGLRenderingContext.FRAGMENT_SHADER);

        this.orthoCamera = new OrthographicCamera(0, this.liteGlContext.width, this.liteGlContext.height, 0, 0, 1000);

        this._updateCanvasSize();

        this.fontTexture = this.liteGlContext.createTexture(this.canvas, {
            format: this.fontOptions.transparent ? WebGLRenderingContext.RGB : WebGLRenderingContext.RGBA,
            type: WebGLRenderingContext.UNSIGNED_BYTE,
            generateMipmaps: false
        });

        this.fontQuad = new Model({
            vertexBuffer: this.liteGlContext.createBuffer(new Float32Array([
                0, 0, -1,
                1, 0, -1,
                1, 1, -1,
                0, 1, -1
            ]), WebGLRenderingContext.ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW, WebGLRenderingContext.FLOAT, 3),
            indexBuffer: this.liteGlContext.createBuffer(new Uint16Array([
                0, 1, 2, 0, 2, 3
            ]), WebGLRenderingContext.ELEMENT_ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW, WebGLRenderingContext.UNSIGNED_SHORT, 1),
            textureBuffer: this.liteGlContext.createBuffer(new Float32Array([
                0, 0, 1, 0, 1, 1, 0, 1
            ]), WebGLRenderingContext.ARRAY_BUFFER, WebGLRenderingContext.STATIC_DRAW, WebGLRenderingContext.FLOAT, 2)
        });

        this.setText(this.text);
    }

    setText(text){
        this.text = text;

        this._updateCanvasSize();

        let ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = this.fontOptions.color;
        ctx.font = this._optionsToString(this.fontOptions);
        ctx.fillText(this.text, 0, this.layoutOptions.height * 0.9);

        this.fontTexture.update(this.canvas);
        this.fontQuad.vertexBuffer.update(new Float32Array([
            this.layoutOptions.left, this.layoutOptions.top, -1,
            this.layoutOptions.width + this.layoutOptions.left, this.layoutOptions.top, -1,
            this.layoutOptions.width + this.layoutOptions.left, this.layoutOptions.height + this.layoutOptions.top, -1,
            this.layoutOptions.left, this.layoutOptions.height + this.layoutOptions.top, -1
        ]), 0);
    }

    _updateCanvasSize(){
        const textSize = this._getTextSize(this.text, this.fontOptions);
        this.layoutOptions.width = this.autoResize ? textSize.width : this.layoutOptions.width;
        this.layoutOptions.height = this.autoResize ? textSize.height : this.layoutOptions.height;

        this.canvas.width = this.layoutOptions.width;
        this.canvas.height = this.layoutOptions.height;
    }

    _getTextSize(text, options){
        let div = document.createElement('div');
        div.style['display'] = 'inline-block';
        div.style['font-style'] = options['font-style'];
        div.style['font-variant'] = options['font-variant'];
        div.style['font-weight'] = options['font-weight'];
        div.style['font-size'] = options['font-size'];
        div.style['line-height'] = options['font-size'];
        div.style['font-family'] = options['font-family'];
        div.style['border'] = 0;
        div.innerText = text;
        document.body.appendChild(div);
        const size = {width: div.clientWidth, height: div.clientHeight};
        div.parentNode.removeChild(div);
        return size;
    }

    // convert canvas font object to string
    _optionsToString(options){
        options = options || {};
        return (Object.keys(options).map((key) => {
            return key.indexOf('font-') === 0 ? options[key] : '';
        }).join(' ')).trim();
    }

    renderToScreen(){
        this.liteGlContext.useShader(this.vertShader, this.fragShader);
        this.liteGlContext.useCamera(this.orthoCamera, 'camera');

        this.liteGlContext.setAttribute(this.fontQuad.vertexBuffer, 'coordinates');
        this.liteGlContext.setAttribute(this.fontQuad.textureBuffer, 'textureCoord');

        this.liteGlContext.useTexture(this.fontTexture, 'uSampler');

        this.liteGlContext.render(this.fontQuad, WebGLRenderingContext.TRIANGLES);
    }

    renderAsTexture(){
        return this.fontTexture;
    }
}

export class GeometryFont extends Font{
    constructor(text){
        super(text);
    }
}