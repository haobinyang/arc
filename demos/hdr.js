import {LiteGL} from '../classes/lite_gl.js';
import {Model} from '../classes/model.js';
import {Color} from '../classes/color.js';
import Tools from '../classes/tools.js';
import {PerspectiveCamera, OrthographicCamera} from '../classes/camera.js';
import {Vec2, Vec3, Vec4} from '../classes/vector.js';
import {Input, Event} from '../classes/event.js';
import {AmbientLight, DirectionalLight} from '../classes/light.js';

export default (async function(){
    let canvas = document.querySelector('#canvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style['width'] = window.innerWidth + 'px';
    canvas.style['height'] = window.innerHeight + 'px';

    let liteGl = new LiteGL(canvas, {fps: true});

    // 扩展
    let depthTexExt = liteGl.getExtension('WEBGL_depth_texture');
    let fragDepthExt = liteGl.getExtension("EXT_frag_depth");
    let bufferFloat = liteGl.getExtension('EXT_color_buffer_float');
    let textureFloat = liteGl.getExtension('OES_texture_float');

    let vertexShaderCode = await Tools.readFile('./shaders/gundam.vs');
    let fragmentShaderCode = await Tools.readFile('./shaders/gundam.fs');

    let vertShader = liteGl.createShader(vertexShaderCode, liteGl.VERTEX_SHADER);
    let fragShader = liteGl.createShader(fragmentShaderCode, liteGl.FRAGMENT_SHADER);

    let camera = new PerspectiveCamera(40, liteGl.width / liteGl.height, 1, 100);
    let cameraPos = glm.vec3(10, 10, 10);
    camera.setPosition(cameraPos);

    // let img = await Tools.readImage('./models/c2lpk7avgum8-E-45-Aircraft/E-45-Aircraft/textures/E-45 _col.jpg');
    // let col3 = await Tools.readImage('./models/c2lpk7avgum8-E-45-Aircraft/E-45-Aircraft/textures/E-45 _col_3.jpg');
    // let col2 = await Tools.readImage('./models/c2lpk7avgum8-E-45-Aircraft/E-45-Aircraft/textures/E-45_col_2.jpg');
    // let steel = await Tools.readImage('./models/c2lpk7avgum8-E-45-Aircraft/E-45-Aircraft/textures/E-45-steel detail_2_col.jpg');
    //
    // let texture1 = liteGl.createTexture(img, {
    //     format: liteGl.RGB,
    //     generateMipmaps: false
    // });
    // let col3Tex = liteGl.createTexture(col3, {
    //     format: liteGl.RGB,
    //     generateMipmaps: false
    // });
    // let col2Tex = liteGl.createTexture(col2, {
    //     format: liteGl.RGB,
    //     generateMipmaps: false
    // });
    // let steelTex = liteGl.createTexture(steel, {
    //     format: liteGl.RGB,
    //     generateMipmaps: false
    // });

    let gundamModel = null;
    let rotateMatrix = glm.rotate(glm.mat4(), -Math.PI, glm.vec3(0, 1, 0));

    /** 模拟拖动事件 **/
    let isDown = false, oldScreenPos = glm.vec2(0, 0);

    function getArcballVector(pos){
        let P = glm.vec3(1.0 * pos.x / liteGl.width * 2 - 1.0, 1.0 * pos.y / liteGl.height * 2 - 1.0, 0);
        P.y = -P.y; // y轴对称映射

        let OP_squared = P.x * P.x + P.y * P.y;
        if(OP_squared <= 1){
            P.z = Math.sqrt(1 - OP_squared); // Pythagoras
        }else{
            P = glm.normalize(P); // nearest point
        }
        return P;
    }
    liteGl.attachEvent(Input.Mouse.Left.Down, function(e){
        isDown = true;
        oldScreenPos = glm.vec2(e.clientX, e.clientY);
    });
    liteGl.attachEvent(Input.Mouse.Left.Move, function(e){
        if(isDown){
            let oldPos = getArcballVector(oldScreenPos),
                curPos = getArcballVector(glm.vec2(e.clientX, e.clientY));

            let angle = Math.acos(Math.min(1, glm.dot(oldPos, curPos)));
            console.log(angle);

            oldScreenPos.x = e.clientX;
            oldScreenPos.y = e.clientY;
        }
    });
    liteGl.attachEvent(Input.Mouse.Left.Up, function(e){
        isDown = false;
    });
    /** 模拟拖动事件 end **/

    liteGl.onStart = function(){
        liteGl.enable(liteGl.DEPTH_TEST);
        liteGl.useShader(vertShader, fragShader);
    };

    liteGl.onLoop = function(){
        // liteGl.viewport(0, 0, liteGl.width, liteGl.height);
        // liteGl.clearColor(new Color(0, 0, 0, 1));
        // liteGl.clear(liteGl.COLOR_BUFFER_BIT | liteGl.DEPTH_BUFFER_BIT);
        //
        // liteGl.useCamera(camera, 'camera');
        // liteGl.setUniformMatrix(rotateMatrix, 'model');
        // liteGl.setAttribute(gundamModel.vertexBuffer, 'coordinates');
        // liteGl.setAttribute(gundamModel.textureBuffer, 'textureCoord');
        // liteGl.useTexture(texture1, 'uSampler');
        // liteGl.useTexture(steelTex, 'steel');
        // liteGl.useTexture(col3Tex, 'col3');
        // liteGl.useTexture(col2Tex, 'col2');
        // liteGl.render(gundamModel, liteGl.TRIANGLES);
    };

    OBJ.downloadMeshes({
        'gundam': './models/aircraft.obj' // located in the models folder on the server
    }, function(meshes){
        gundamModel = new Model({
            vertexBuffer: liteGl.createBuffer(new Float32Array(meshes.gundam.vertices), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 3),
            indexBuffer: liteGl.createBuffer(new Uint16Array(meshes.gundam.indices), liteGl.ELEMENT_ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.UNSIGNED_SHORT, 1),
            // normalBuffer: liteGl.createBuffer(new Float32Array(meshes.gundam.vertexNormals), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 3),
            textureBuffer: liteGl.createBuffer(new Float32Array(meshes.gundam.textures), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 2)
        });
        liteGl.start();
    });
}());