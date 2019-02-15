import Tools from '../../../classes/tools.js';
import {LiteGL as Arc} from '../../../classes/lite_gl.js';
import {Model} from '../../../classes/model.js';

export default (async function(){
    let arc = new Arc(document.querySelector('#canvas'), {fps: false, fullScreen: false});

    let fbVert = arc.createShader(await Tools.readFile('./shaders/framebuffer.vs'), arc.VERTEX_SHADER);
    let fbFrag = arc.createShader(await Tools.readFile('./shaders/framebuffer.fs'), arc.FRAGMENT_SHADER);

    let vert = arc.createShader(await Tools.readFile('./shaders/vertex.vs'), arc.VERTEX_SHADER);
    let frag = arc.createShader(await Tools.readFile('./shaders/frag.fs'), arc.FRAGMENT_SHADER);

    let planeForRealRender = new Model({
        vertexBuffer: arc.createBuffer(new Float32Array([-1.0,1.0,0.0, 0.0,1.0,0.0, 0.0,0.0,0.0, -1.0,0.0,0.0])),
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

    let preVideoTexture = arc.createTexture(null, {
        format: arc.RGB,
        generateMipmaps: false,
        width: video.width,
        height: video.height
    }), iter = 0;

    const frameDiff = 2;

    arc.onLoop = function(){
        { // 正常渲染
            if(iter !== 0 && iter % frameDiff === 0) {
                arc.viewport(0, 0, arc.width, arc.height);
                arc.clearColor(glm.vec4(0, 0, 0, 1));
                arc.clear(arc.COLOR_BUFFER_BIT | arc.DEPTH_BUFFER_BIT);

                arc.useShader(vert, frag);

                arc.setAttribute(planeForRealRender.vertexBuffer, 'coordinates');
                arc.setAttribute(planeForRealRender.textureBuffer, 'textureCoord');

                arc.useTexture(videoTexture, 'currentFrame');
                arc.useTexture(preVideoTexture, 'preFrame');
                arc.render(planeForRealRender, arc.TRIANGLES);
            }
        }

        { // 将视频帧渲染到纹理
            if(iter % frameDiff === 0) {
                arc.renderTo(arc.RenderMode.TEXTURE, preVideoTexture);
                arc.viewport(0, 0, video.width, video.height);
                arc.clearColor(glm.vec4(0, 0, 0, 1));
                arc.clear(arc.COLOR_BUFFER_BIT | arc.DEPTH_BUFFER_BIT);

                arc.useShader(fbVert, fbFrag);

                arc.setAttribute(planeForFrameBuffer.vertexBuffer, 'coordinates');
                arc.setAttribute(planeForFrameBuffer.textureBuffer, 'textureCoord');

                arc.useTexture(videoTexture, 'uSampler');
                arc.render(planeForFrameBuffer, arc.TRIANGLES);

                arc.renderTo(arc.RenderMode.SCREEN);
            }
        }

        iter++;
    };

    document.querySelector('#start').addEventListener('click', function(){
        arc.start();
    });
}());