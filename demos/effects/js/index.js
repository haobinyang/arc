import Tools from '../../../classes/tools.js';
import {LiteGL as Arc} from '../../../classes/lite_gl.js';
import {Model} from '../../../classes/model.js';

export default (async function(){
    let arc = new Arc(document.querySelector('#canvas'), {fps: false, fullScreen: false});

    let fbVert = arc.createShader(await Tools.readFile('./shaders/framebuffer.vs'), arc.VERTEX_SHADER);
    let fbFrag = arc.createShader(await Tools.readFile('./shaders/framebuffer.fs'), arc.FRAGMENT_SHADER);

    let screenVert = arc.createShader(await Tools.readFile('./shaders/screen.vs'), arc.VERTEX_SHADER);
    let screenFrag = arc.createShader(await Tools.readFile('./shaders/screen.fs'), arc.FRAGMENT_SHADER);

    let planeForRealRender = new Model({
        vertexBuffer: arc.createBuffer(new Float32Array([-0.5,0.5,0.0, 0.5,0.5,0.0, 0.5,-0.5,0.0, -0.5,-0.5,0.0])),
        indexBuffer: arc.createBuffer(new Uint16Array([0,1,2, 0,2,3]), arc.ELEMENT_ARRAY_BUFFER, arc.STATIC_DRAW, arc.UNSIGNED_SHORT, 1),
        textureBuffer: arc.createBuffer(new Float32Array([0.0,0.0, 1.0,0.0, 1.0,1.0, 0.0,1.0]), arc.ARRAY_BUFFER, arc.STATIC_DRAW, arc.FLOAT, 2)
    });

    let planeForFrameBuffer = new Model({
        vertexBuffer: arc.createBuffer(new Float32Array([-1.0,1.0,0.0, 1.0,1.0,0.0, 1.0,-1.0,0.0, -1.0,-1.0,0.0])),
        indexBuffer: arc.createBuffer(new Uint16Array([0,1,2, 0,2,3]), arc.ELEMENT_ARRAY_BUFFER, arc.STATIC_DRAW, arc.UNSIGNED_SHORT, 1),
        textureBuffer: arc.createBuffer(new Float32Array([0.0,1.0, 1.0,1.0, 1.0,0.0, 0.0,0.0]), arc.ARRAY_BUFFER, arc.STATIC_DRAW, arc.FLOAT, 2)
    });

    let video = await Tools.getVideo('../../textures/Firefox.mp4', {loop: true, muted: true});
    let videoTexture = arc.createTexture(video, {
        format: arc.RGB,
        generateMipmaps: false
    });

    let repeatBg = await Tools.readImage('./images/repeat_bg.jpg');
    let repeatBgTexture = arc.createTexture(repeatBg, {
        format: arc.RGB,
        generateMipmaps: false,
        wrapS: arc.REPEAT,
        wrapT: arc.REPEAT
    });

    let fbTexture = arc.createTexture(null, {
        format: arc.RGB,
        generateMipmaps: false,
        width: repeatBg.width,
        height: repeatBg.height,
        wrapS: arc.REPEAT,
        wrapT: arc.REPEAT
    });

    let step = 0;

    arc.onLoop = function(){
        { // 渲染到纹理，合并背景和视频
            arc.renderTo(arc.RenderMode.TEXTURE, fbTexture);
            arc.viewport(0, 0, repeatBg.width, repeatBg.height);
            arc.clearColor(glm.vec4(0, 0, 0, 1));
            arc.clear(arc.COLOR_BUFFER_BIT | arc.DEPTH_BUFFER_BIT);

            arc.useShader(fbVert, fbFrag);

            arc.setAttribute(planeForFrameBuffer.vertexBuffer, 'coordinates');
            arc.setAttribute(planeForFrameBuffer.textureBuffer, 'textureCoord');

            // 渲染背景
            arc.setUniformi([0], 'isVideo');
            arc.setUniformf([step], 'step');
            arc.setUniformMatrix(glm.mat4(), 'scale');

            arc.useTexture(repeatBgTexture, 'vSampler');
            arc.render(planeForFrameBuffer, arc.TRIANGLES);

            // 渲染视频
            // todo 添加白色边框
            arc.setUniformi([1], 'isVideo');
            arc.setUniformMatrix(glm.scale(glm.mat4(), glm.vec3(0.8,0.8,1)), 'scale');

            arc.useTexture(videoTexture, 'vSampler');
            arc.render(planeForFrameBuffer, arc.TRIANGLES);

            step += 0.005;
        }

        { // 渲染到屏幕, 再做一次特效处理
            arc.renderTo(arc.RenderMode.SCREEN);
            arc.viewport(0, 0, arc.width, arc.height);
            arc.clearColor(glm.vec4(0, 0, 0, 1));
            arc.clear(arc.COLOR_BUFFER_BIT | arc.DEPTH_BUFFER_BIT);

            arc.useShader(screenVert, screenFrag);

            arc.setAttribute(planeForRealRender.vertexBuffer, 'coordinates');
            arc.setAttribute(planeForRealRender.textureBuffer, 'textureCoord');

            arc.useTexture(fbTexture, 'uSampler');
            arc.render(planeForRealRender, arc.TRIANGLES);
        }
    };

    document.querySelector('#start').addEventListener('click', function click(){
        arc.start();
        document.querySelector('#start').removeEventListener('click', click);
    });
}());