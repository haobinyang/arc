import Tools from '../../../classes/tools.js';
import {LiteGL as Arc} from '../../../classes/lite_gl.js';
import {Model} from '../../../classes/model.js';

export default (async function(){
    let arc = new Arc(document.querySelector('#canvas'), {fps: false, fullScreen: false});

    let vert = arc.createShader(await Tools.readFile('./shaders/vertex.vs'), arc.VERTEX_SHADER);
    let frag = arc.createShader(await Tools.readFile('./shaders/frag.fs'), arc.FRAGMENT_SHADER);

    let points = new Model({
        vertexBuffer: arc.createBuffer(new Float32Array([-0.5,0.5,0.0, 0.5,0.5,0.0, 0.5,-0.5,0.0, -0.5,-0.5,0.0])),
        indexBuffer: arc.createBuffer(new Uint16Array([0,1,2, 0,2,3]), arc.ELEMENT_ARRAY_BUFFER, arc.STATIC_DRAW, arc.UNSIGNED_SHORT, 1),
        textureBuffer: arc.createBuffer(new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]), arc.ARRAY_BUFFER, arc.STATIC_DRAW, arc.FLOAT, 2)
    });

    let video = await Tools.getVideo('../../textures/Firefox.mp4', {loop: true});
    let videoTexture = arc.createTexture(video, {
        format: arc.RGB,
        type: arc.UNSIGNED_BYTE,
        generateMipmaps: false
    });

    arc.onLoop = function(){
        arc.viewport(0, 0, arc.width, arc.height);
        arc.clearColor(glm.vec4(0, 0, 0, 1));
        arc.clear(arc.COLOR_BUFFER_BIT | arc.DEPTH_BUFFER_BIT);

        arc.useShader(vert, frag);

        arc.setAttribute(points.vertexBuffer, 'coordinates');
        arc.setAttribute(points.textureBuffer, 'textureCoord');

        arc.useTexture(videoTexture, 'uSampler');
        arc.render(points, arc.TRIANGLES);
    };

    document.querySelector('#start').addEventListener('click', function(){
        arc.start();
    });
}());