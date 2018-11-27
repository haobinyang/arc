import GlConfig from '../config/gl_config.js';
import {Color} from './color.js';
import Tools from './tools.js';
import {FPS} from './fps.js';
import {Shader} from './shader.js';
import {Buffer} from './buffer.js';
import {Texture2D, VideoTexture} from './texture.js';
import {Event} from './event.js';

export class LiteGL{
    constructor(canvasInstance, options){
        if(!canvasInstance){
            throw 'need canvas instance';
        }

        this.canvasInstance = canvasInstance;
        this.canvasInstance.setAttribute('tabindex', 1); // 监听键盘事件

        this.options = options || {};
        this.gl = canvasInstance.getContext('webgl', this.options);

        this.width = canvasInstance.width;
        this.height = canvasInstance.height;
        
        this.isEnd = false;
        this.shaderProgram = null;//this.gl.createProgram();

        // texture unit index
        this.textureIndex = 0;
        this.maxTextureUnits = this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS); // how many texture units can have

        // framebuffer instance
        this.frameBufferInstance = null;

        // render mode
        this.RenderMode = Object.freeze({"SCREEN": 1, "TEXTURE": 2, 'DEPTH': 3, 'STENCIL': 4});

        this.currentVertShader = null;
        this.currentFragShader = null;

        // show fps
        if(this.options.fps){
            this.FPS = new FPS(this);
        }

        // 事件容器
        this.event = new Event(this.canvasInstance);

        return new Proxy(this, {
            get(obj, prop){
                let result = prop in obj ? obj[prop] : prop in obj['gl'] ? obj['gl'][prop] : undefined;

                if(result && Tools.isFunction(result)){
                    return function(...args){
                        return result.apply(prop in obj ? obj : obj['gl'], args);
                    }
                }

                return result;
            }
        });
    }

    start(){
        this.textureIndex = 0;
        this.FPS && this.FPS.start();
        this.onStart && this.onStart(Date.now());
        window.requestAnimationFrame(this.loop.bind(this));
    }

    loop(){
        if(!this.isEnd){
            this.onLoop && this.onLoop(Date.now());
            this.FPS && this.FPS.update();
            window.requestAnimationFrame(this.loop.bind(this));
        }
    }

    end(){
        this.isEnd = true;
        this.onEnd && this.onEnd(Date.now());
    }

    clearColor(color){
        color = Color.ToGlColor(color);
        this.gl.clearColor(color.r, color.g, color.b, color.a);
    }

    render(model, mode, count = undefined, offset = 0){
        let drawFunction = 'drawArrays';
        let indexBuffer = null;

        model.buffers.forEach((buffer) => {
            if(buffer.instance){
                this.gl.bindBuffer(buffer.target, buffer.instance);

                if(buffer.target === this.gl.ELEMENT_ARRAY_BUFFER){ // 包含索引数组
                    drawFunction = 'drawElements';
                    indexBuffer = buffer;
                }
            }
        });

        let params = [];
        if(drawFunction === 'drawElements'){
            if(!indexBuffer){
                throw 'need indices data';
            }
            params = [mode, count ? count : indexBuffer.data.length, indexBuffer.dataType, offset];
        }else{
            params = [mode, offset, count ? count : model.buffers[0].data.length / model.buffers[0].components];
        }

        this.gl[drawFunction].apply(this.gl, params);
    }

    renderTo(renderMode, texture){
        if(this.frameBufferInstance){
            this.gl.deleteFramebuffer(this.frameBufferInstance);
            this.frameBufferInstance = null;
        }

        if(renderMode === this.RenderMode.TEXTURE || renderMode === this.RenderMode.DEPTH || renderMode === this.RenderMode.STENCIL){
            this.frameBufferInstance = this.gl.createFramebuffer();
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBufferInstance);
            const attachmentPoint = renderMode === this.RenderMode.TEXTURE ? this.gl.COLOR_ATTACHMENT0 : renderMode === this.RenderMode.DEPTH ? this.gl.DEPTH_ATTACHMENT : this.gl.STENCIL_ATTACHMENT;
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, texture.instance, 0);
        }else{
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }
    }

    setAttribute(buffer, variableName){
        this.gl.bindBuffer(buffer.target, buffer.instance);
        let location = this.gl.getAttribLocation(this.shaderProgram, variableName);
        this.gl.vertexAttribPointer(location, buffer.components, buffer.dataType, false, 0, 0);
        this.gl.enableVertexAttribArray(location);
        this.gl.bindBuffer(buffer.target, null);
    }

    _setUniform(data, variableName, suffix){
        let location = this.gl.getUniformLocation(this.shaderProgram, variableName);

        if(Tools.isNumber(data)){
            data = [data];
        }

        if((Tools.isFloat32Array(data) || Tools.isArray(data)) && data.length <= 4){
            if(Tools.isArray(data)){
                data.forEach((number)=>{
                    if(!Tools.isNumber(number)){
                        throw 'values must be number';
                    }
                });
            }
        }else{
            throw 'parameter 1 must be a number or a array with numbers and length must be less than 5';
        }

        this.gl['uniform' + data.length + suffix].apply(this.gl, [location, ...data]);
    }

    setUniformf(data, variableName){
        this._setUniform(data, variableName, 'f');
    }

    setUniformi(data, variableName){
        this._setUniform(data, variableName, 'i');
    }

    setUniformMatrix(data, variableName){
        if(Tools.isArray(data) || Tools.isFloat32Array(data)){
            let len = data.length;

            if([4, 9, 16].indexOf(len) < 0){
                throw 'parameter 1 must be a correct matrix';
            }

            let components = Math.sqrt(len);
            let location = this.gl.getUniformLocation(this.shaderProgram, variableName);
            this.gl['uniformMatrix' + components + 'fv'].apply(this.gl, [location, false, data]);
        }else{
            throw 'parameter 1 must be a array with numbers';
        }
    }

    createBuffer(data, target, usage, dataType, components){
        let buffer = new Buffer(data, target, usage, dataType, components);
        buffer.glContext = this.gl;
        buffer.instance = this.gl.createBuffer();
        this.gl.bindBuffer(buffer.target, buffer.instance);
        this.gl.bufferData(buffer.target, buffer.data, buffer.usage);
        this.gl.bindBuffer(buffer.target, null);
        return buffer;
    }

    createShader(code, type){
        let shader = new Shader(code, type);
        shader.instance = this.gl.createShader(shader.type);
        this.gl.shaderSource(shader.instance, shader.code);
        this.gl.compileShader(shader.instance);
        return shader;
    }

    createTexture(data, options){
        let texture = data instanceof HTMLVideoElement ? new VideoTexture(data, options) : new Texture2D(data, options);

        texture.glContext = this.gl;
        texture.instance = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture.instance);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        if(texture.data instanceof HTMLImageElement || texture.data instanceof HTMLVideoElement || texture.data instanceof HTMLCanvasElement){
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, texture.format, texture.format, texture.type, texture.data);
        }else{
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, texture.format, texture.width, texture.height, 0, texture.format, texture.type, texture.data);
        }

        if(Tools.isPowerOf2(texture.width) && Tools.isPowerOf2(texture.height) && texture.generateMipmaps){
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        }

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, texture.wrapS);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, texture.wrapT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, texture.minFilter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, texture.magFilter);

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        return texture;
    }

    createFont(font){
        font.liteGlContext = this;
        font.init();
        return font;
    }

    deleteTexture(texture){
        this.gl.deleteTexture(texture.instance);
    }

    useTexture(texture, variableName){
        if(texture instanceof VideoTexture){
            texture.play();
            texture.update();
        }

        this.gl.activeTexture(this.gl['TEXTURE' + this.textureIndex]);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture.instance);
        this.setUniformi([this.textureIndex], variableName);
        this.textureIndex++;
        this.textureIndex %= this.maxTextureUnits; // 最多只有16个texture unit
    }

    useShader(vertShader, fragShader){
        if(this.shaderProgram){
            this.gl.deleteProgram(this.shaderProgram);
        }

        this.currentVertShader = vertShader;
        this.currentFragShader = fragShader;
        this.shaderProgram = this.gl.createProgram();

        this.gl.attachShader(this.shaderProgram, vertShader.instance);
        this.gl.attachShader(this.shaderProgram, fragShader.instance);

        this.gl.linkProgram(this.shaderProgram);

        if(!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)){
            let info = this.gl.getProgramInfoLog(this.shaderProgram);
            throw 'Could not compile WebGL program: ' + info;
        }

        this.gl.useProgram(this.shaderProgram);
    }

    useCamera(cam, variableName){
        this.setUniformMatrix(cam.camMatrix, variableName);
    }

    useLight(light, variableName){
        let color = Color.ToGlColor(light.color);
        let intensity = light.intensity;
        this.setUniformf([color.r * intensity, color.g * intensity, color.b * intensity, color.a], variableName);
    }

    // 绑定UI事件
    attachEvent(input, callback){
        this.event.attach(input, callback);
    }

    // 删除事件
    detachEvent(input, callback){
        this.event.detach(input, callback);
    }
}