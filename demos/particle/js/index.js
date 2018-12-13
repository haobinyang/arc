import Tools from '../../../classes/tools.js';
import {LiteGL as Arc} from '../../../classes/lite_gl.js';
import {Model} from '../../../classes/model.js';

export default (async function(){
    let arc = new Arc(document.querySelector('#canvas'), {fps: true, fullScreen: true});

    let vert = arc.createShader(await Tools.readFile('./shaders/vertex.vs'), arc.VERTEX_SHADER);
    let frag = arc.createShader(await Tools.readFile('./shaders/frag.fs'), arc.FRAGMENT_SHADER);

    let points = new Model({
        vertexBuffer: arc.createBuffer(new Float32Array([-0.5,0.5,0.0, 0.0,0.5,0.0, -0.25,0.25,0.0]))
    });

    arc.onLoop = function(){
        arc.viewport(0, 0, arc.width, arc.height);
        arc.clearColor(glm.vec4(0, 0, 0, 1));
        arc.clear(arc.COLOR_BUFFER_BIT | arc.DEPTH_BUFFER_BIT);

        arc.useShader(vert, frag);
        arc.setAttribute(points.vertexBuffer, 'coordinates');
        arc.render(points, arc.POINTS);
        arc.render(points, arc.LINE_STRIP);
    };

    arc.start();
}());