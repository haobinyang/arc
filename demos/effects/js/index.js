import Tools from '../../../classes/tools.js';
import {LiteGL as Arc} from '../../../classes/lite_gl.js';
import {Model} from '../../../classes/model.js';

export default (async function(){
    let arc = new Arc(document.querySelector('#canvas'), {fps: false, fullScreen: false});

    let fbVert = arc.createShader(await Tools.readFile('./shaders/framebuffer.vs'), arc.VERTEX_SHADER);
    let fbFrag = arc.createShader(await Tools.readFile('./shaders/framebuffer.fs'), arc.FRAGMENT_SHADER);

    let vert = arc.createShader(await Tools.readFile('./shaders/vertex.vs'), arc.VERTEX_SHADER);
    let frag = arc.createShader(await Tools.readFile('./shaders/frag.fs'), arc.FRAGMENT_SHADER);

    let v1 = new Model({
        vertexBuffer: arc.createBuffer(new Float32Array([-1.0,1.0,0.0, 0.0,1.0,0.0, 0.0,0.0,0.0, -1.0,0.0,0.0])),
        indexBuffer: arc.createBuffer(new Uint16Array([0,1,2, 0,2,3]), arc.ELEMENT_ARRAY_BUFFER, arc.STATIC_DRAW, arc.UNSIGNED_SHORT, 1),
        textureBuffer: arc.createBuffer(new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]), arc.ARRAY_BUFFER, arc.STATIC_DRAW, arc.FLOAT, 2)
    });

    let v2 = new Model({
        vertexBuffer: arc.createBuffer(new Float32Array([-1.0,1.0,0.0, 1.0,1.0,0.0, 1.0,-1.0,0.0, -1.0,-1.0,0.0])),
        indexBuffer: arc.createBuffer(new Uint16Array([0,1,2, 0,2,3]), arc.ELEMENT_ARRAY_BUFFER, arc.STATIC_DRAW, arc.UNSIGNED_SHORT, 1),
        textureBuffer: arc.createBuffer(new Float32Array([
            0.0, 1.0,
            1.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
        ]), arc.ARRAY_BUFFER, arc.STATIC_DRAW, arc.FLOAT, 2)
    });

    let video = await Tools.getVideo('../../textures/Firefox.mp4', {loop: true});
    let videoTexture = arc.createTexture(video, {
        format: arc.RGB,
        type: arc.UNSIGNED_BYTE,
        generateMipmaps: false
    });

    let iter = 0;

    arc.onLoop = function(){
        let preVideoTexture = arc.createTexture(null, {
            format: arc.RGB,
            type: arc.UNSIGNED_BYTE,
            generateMipmaps: false,
            width: video.width,
            height: video.height
        });

        { // 将视频帧渲染到纹理
            arc.renderTo(arc.RenderMode.TEXTURE, preVideoTexture);
            arc.viewport(0, 0, video.width, video.height);
            arc.clearColor(glm.vec4(0, 0, 0, 1));
            arc.clear(arc.COLOR_BUFFER_BIT | arc.DEPTH_BUFFER_BIT);

            arc.useShader(fbVert, fbFrag);

            arc.setAttribute(v2.vertexBuffer, 'coordinates');
            arc.setAttribute(v2.textureBuffer, 'textureCoord');

            arc.useTexture(videoTexture, 'uSampler');
            arc.render(v2, arc.TRIANGLES);
        }

        { // 正常渲染
            arc.renderTo(arc.RenderMode.SCREEN);

            arc.viewport(0, 0, arc.width, arc.height);
            arc.clearColor(glm.vec4(0, 0, 0, 1));
            arc.clear(arc.COLOR_BUFFER_BIT | arc.DEPTH_BUFFER_BIT);

            arc.useShader(vert, frag);

            arc.setAttribute(v1.vertexBuffer, 'coordinates');
            arc.setAttribute(v1.textureBuffer, 'textureCoord');

            arc.useTexture(preVideoTexture, 'uSampler');
            arc.render(v1, arc.TRIANGLES);
        }

        arc.deleteTexture(preVideoTexture); // 记得删除纹理，不然内存会爆炸
    };

    document.querySelector('#start').addEventListener('click', function(){
        arc.start();
    });
}());