import {LiteGL} from '../classes/lite_gl.js';
import {Model} from '../classes/model.js';
import {Color} from '../classes/color.js';
import Tools from '../classes/tools.js';
import {PerspectiveCamera, OrthographicCamera} from '../classes/camera.js';
import {Vec2, Vec3, Vec4} from '../classes/vector.js';
import {Input, Event} from '../classes/event.js';
import {CanvasFont} from '../classes/font.js';
import {AmbientLight, DirectionalLight} from '../classes/light.js';
import CubeModel from '../models/cube.js';

export default (async function(){
    let canvas = document.querySelector('#canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
    camera.setPosition(glm.vec3(0, 0, 3));

    let img = await Tools.readImage('./textures/gg.jpg');
    // let col3 = await Tools.readImage('./models/c2lpk7avgum8-E-45-Aircraft/E-45-Aircraft/textures/E-45 _col_3.jpg');
    // let col2 = await Tools.readImage('./models/c2lpk7avgum8-E-45-Aircraft/E-45-Aircraft/textures/E-45_col_2.jpg');
    // let steel = await Tools.readImage('./models/c2lpk7avgum8-E-45-Aircraft/E-45-Aircraft/textures/E-45-steel detail_2_col.jpg');

    let texture1 = liteGl.createTexture(img, {
        format: liteGl.RGB,
        generateMipmaps: false
    });
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
    let rotateMatrix = glm.mat4();

    /** 模拟拖动事件 **/
    let isDown = false, oldScreenPos = glm.vec2(0, 0), startPos = glm.vec2(0, 0), totalAngle = 0, sumAngle = 0, THETA = 0, PHI = 0;

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
        startPos = glm.vec2(e.clientX, e.clientY);
        totalAngle = 0;
    });
    liteGl.attachEvent(Input.Mouse.Left.Move, function(e){
        if(isDown){
            let oldPos = getArcballVector(oldScreenPos),
                curPos = getArcballVector(glm.vec2(e.clientX, e.clientY));

            let cosTheta = Math.min(1, glm.dot(oldPos, curPos));
            let angle = Math.acos(cosTheta);
            let sinTheta = Math.sin(angle);
            let axis = glm.normalize(glm.cross(oldPos, curPos));//glm.normalize(glm.cross(oldPos, curPos));
            // axis = glm.vec3(-axis.x, -axis.y, -axis.z);

            // Rodrigues' rotation formula https://semath.info/src/rodrigues-rotation.html
            rotateMatrix = rotateMatrix['*'](glm.mat4(
                glm.vec4(
                    cosTheta + axis.x * axis.x * (1 - cosTheta),
                    axis.x * axis.y * (1 - cosTheta) - axis.z * sinTheta,
                    axis.x * axis.z * (1 - cosTheta) + axis.y * sinTheta,
                    0
                ),
                glm.vec4(
                    axis.x * axis.y * (1 - cosTheta) + axis.z * sinTheta,
                    cosTheta + axis.y * axis.y * (1 - cosTheta),
                    axis.y * axis.z * (1 - cosTheta) - axis.x * sinTheta,
                    0
                ),
                glm.vec4(
                    axis.x * axis.z * (1 - cosTheta) - axis.y * sinTheta,
                    axis.y * axis.z * (1 - cosTheta) + axis.x * sinTheta,
                    cosTheta + axis.z * axis.z * (1 - cosTheta),
                    0
                ),
                glm.vec4(0,0,0,1)
            ));

            // rotateMatrix = rotateMatrix['*'](glm.mat4(
            //     glm.vec4(
            //         1 + (1 - cosTheta) * (axis.x * axis.x - 1),
            //         axis.x * axis.y * (1 - cosTheta) - axis.z * sinTheta,
            //         axis.x * axis.z * (1 - cosTheta) + axis.y * sinTheta,
            //         0
            //     ),
            //     glm.vec4(
            //         axis.x * axis.y * (1 - cosTheta) + axis.z * sinTheta,
            //         1 + (axis.y * axis.y - 1) * (1 - cosTheta),
            //         axis.y * axis.z * (1 - cosTheta) - axis.x * sinTheta,
            //         0
            //     ),
            //     glm.vec4(
            //         axis.x * axis.z * (1 - cosTheta) - axis.y * sinTheta,
            //         axis.y * axis.z * (1 - cosTheta) + axis.x * sinTheta,
            //         1 + (axis.z * axis.z - 1) * (1 - cosTheta),
            //         0
            //     ),
            //     glm.vec4(0,0,0,1)
            // ));

            sumAngle += angle;

            let dX = (e.clientX - oldScreenPos.x) * 2 * Math.PI / liteGl.width,
                dY = (e.clientY - oldScreenPos.y) * 2 * Math.PI / liteGl.height;
            THETA += dX;
            PHI += dY;

            //rotateMatrix = glm.rotate(glm.mat4(), THETA, glm.vec3(0, 1, 0));
            //rotateMatrix = glm.mat4(...(rotateX(glm.$to_array(rotateMatrix), PHI)));

            rotateMatrix = glm.rotate(glm.mat4(), PHI, glm.vec3(1, 0, 0));
            rotateMatrix = glm.rotate(rotateMatrix, THETA, glm.vec3(0, 1, 0));

            // glm.rotate(glm.rotate(glm.mat4(), -0.02204626423571785, glm.vec3(1, 0, 0)), -0.03306939635357677, glm.vec3(0, 1, 0))

            // rotateMatrix = glm.rotate(rotateMatrix, angle, axis);

            // let newPosition = glm.vec3(
            //     glm.dot(rotationMatrix[0], camera.position),
            //     glm.dot(rotationMatrix[1], camera.position),
            //     glm.dot(rotationMatrix[2], camera.position)
            // );
            //
            // let newUp = glm.vec3(
            //     glm.dot(rotationMatrix[0], camera.up),
            //     glm.dot(rotationMatrix[1], camera.up),
            //     glm.dot(rotationMatrix[2], camera.up)
            // );

            // camera.setPosition(newPosition);
            // camera.setUp(newUp);

            oldScreenPos.x = e.clientX;
            oldScreenPos.y = e.clientY;

            let start = getArcballVector(startPos);
            totalAngle = Math.acos(Math.min(1, glm.dot(start, curPos)));
        }
    });
    liteGl.attachEvent(Input.Mouse.Left.Up, function(e){
        isDown = false;
    });
    /** 模拟拖动事件 end **/

    // 播放音乐
    let sleepAway = await Tools.loadAudio('./audio/Sleep_Away.mp3', {loop: true});
    liteGl.attachEvent(Input.Keyboard.Space.Down, function(){
        if(sleepAway.paused){
            sleepAway.play();
        }else{
            sleepAway.pause();
        }
    });

    let angleFont = liteGl.createFont(new CanvasFont('', {}, {left: 10, top: 40}));

    liteGl.onStart = function(){
        liteGl.enable(liteGl.DEPTH_TEST);
    };

    liteGl.onLoop = function(){
        liteGl.viewport(0, 0, liteGl.width, liteGl.height);
        liteGl.clearColor(glm.vec4(0, 0, 0, 1));
        liteGl.clear(liteGl.COLOR_BUFFER_BIT | liteGl.DEPTH_BUFFER_BIT);

        angleFont.setText('Angle: ' + (totalAngle * 180 / Math.PI).toFixed(2));
        angleFont.renderToScreen();

        liteGl.useShader(vertShader, fragShader);
        liteGl.useCamera(camera, 'camera');
        liteGl.setUniformMatrix(rotateMatrix, 'model');
        liteGl.setAttribute(gundamModel.vertexBuffer, 'coordinates');
        liteGl.setAttribute(gundamModel.textureBuffer, 'textureCoord');
        liteGl.useTexture(texture1, 'uSampler');
        // liteGl.useTexture(steelTex, 'steel');
        // liteGl.useTexture(col3Tex, 'col3');
        // liteGl.useTexture(col2Tex, 'col2');
        liteGl.render(gundamModel, liteGl.TRIANGLES);
    };

    OBJ.downloadMeshes({
        'gundam': './models/g.obj' // located in the models folder on the server
    }, function(meshes){
        gundamModel = new Model({
            vertexBuffer: liteGl.createBuffer(new Float32Array(meshes.gundam.vertices), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 3),
            indexBuffer: liteGl.createBuffer(new Uint16Array(meshes.gundam.indices), liteGl.ELEMENT_ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.UNSIGNED_SHORT, 1),
            // normalBuffer: liteGl.createBuffer(new Float32Array(meshes.gundam.vertexNormals), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 3),
            textureBuffer: liteGl.createBuffer(new Float32Array(meshes.gundam.textures), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 2)
        });
        gundamModel.toCenter();
        liteGl.start();
    });
}());