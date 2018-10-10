import {LiteGL} from '../classes/lite_gl.js';
import {Model} from '../classes/model.js';
import {Shader} from '../classes/shader.js';
import {Color} from '../classes/color.js';
import {FPS} from '../classes/fps.js';
import {Buffer} from '../classes/buffer.js';
import {Mat4} from '../classes/matrix.js';
import Tools from '../classes/tools.js';
import CubeModel from '../models/cube.js';
import PlaneModel from '../models/plane.js';
import {PerspectiveCamera, OrthographicCamera} from '../classes/camera.js';
import {Vec2, Vec3, Vec4} from '../classes/vector.js';
import {Texture2D} from '../classes/texture.js';
import {AmbientLight, DirectionalLight} from '../classes/light.js';
import {ObjLoader} from '../classes/obj_loader.js';

export default (async function(){
    let canvas = document.querySelector('#canvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style['width'] = window.innerWidth + 'px';
    canvas.style['height'] = window.innerHeight + 'px';

    let liteGl = new LiteGL(canvas);

    let cube = CubeModel(liteGl);
    let plane = PlaneModel(liteGl);

    // 扩展
    let depthTexExt = liteGl.getExtension('WEBGL_depth_texture');
    let fragDepthExt = liteGl.getExtension("EXT_frag_depth");
    let bufferFloat = liteGl.getExtension('EXT_color_buffer_float');
    let textureFloat = liteGl.getExtension('OES_texture_float');

    let vertexShaderCode = await Tools.readFile('./shaders/vertex.vs');
    let fragmentShaderCode = await Tools.readFile('./shaders/frag.fs');
    let vertexShaderCode2 = await Tools.readFile('./shaders/vertex_depth.vs');
    let fragmentShaderCode2 = await Tools.readFile('./shaders/frag_depth.fs');

    let vertShader = liteGl.createShader(new Shader(vertexShaderCode, liteGl.VERTEX_SHADER));
    let fragShader = liteGl.createShader(new Shader(fragmentShaderCode, liteGl.FRAGMENT_SHADER));
    let vertDepthShader = liteGl.createShader(new Shader(vertexShaderCode2, liteGl.VERTEX_SHADER));
    let fragDepthShader = liteGl.createShader(new Shader(fragmentShaderCode2, liteGl.FRAGMENT_SHADER));

    let camera = new PerspectiveCamera(40, liteGl.width / liteGl.height, 1, 100);
    let cameraPos = new Vec3(2, 0, 6);
    camera.setPosition(cameraPos);

    let img = await Tools.readImage('./textures/gg.jpg');
    let texture1 = liteGl.createTexture(new Texture2D(img, {
        format: liteGl.RGB,
        type: liteGl.UNSIGNED_BYTE,
        //magFilter: '',
        // minFilter: liteGl.LINEAR_MIPMAP_LINEAR,
        wrapS: liteGl.CLAMP_TO_EDGE,
        wrapT: liteGl.CLAMP_TO_EDGE,
        generateMipmaps: false
    }));

    let img2 = await Tools.readImage('./textures/container.png');
    let texture2 = liteGl.createTexture(new Texture2D(img2, {
        format: liteGl.RGBA,
        type: liteGl.UNSIGNED_BYTE,
        generateMipmaps: false
    }));

    let ambientLight = new AmbientLight(new Color(255, 255, 255), 0.5);
    let directionalLight = new DirectionalLight(new Color(255, 255, 255), 1.5);
    let lightPos = new Vec3(0, 10, -3);
    directionalLight.setPosition(lightPos);

    let monkeyModel = null;

    let fps = new FPS();
    let fpsEl = document.querySelector('#fps');

    let rotateNum = 180;

    liteGl.onStart = function(){
        liteGl.enable(liteGl.DEPTH_TEST);
        //liteGl.frontFace(liteGl.CCW);

        //liteGl.enable(liteGl.CULL_FACE);
        fps.start();
    };

    liteGl.onLoop = function(){
        fps.update();
        fpsEl.innerText = 'FPS: ' + fps.fps;
        rotateNum++;
        rotateNum %= 360;

        let rotateMatrix = Mat4.rotate(rotateNum, new Vec3(0, 1, 0)).data;
        let translateMatrix = Mat4.translate(new Vec3(0, 2, 0)).data;

        let depthTexture = liteGl.createTexture(new Texture2D(null, {
            format: liteGl.DEPTH_COMPONENT,
            type: liteGl.UNSIGNED_SHORT,
            generateMipmaps: false,
            width: 1024,
            height: 1024
        }));

        // 在灯光视图渲染到深度纹理
        // {
        //     liteGl.renderTo(liteGl.RenderMode.DEPTH, depthTexture);
        //     liteGl.useShader(vertDepthShader, fragDepthShader);
        //     liteGl.clearColor(new Color(255, 255, 255, 1));
        //     liteGl.clear(liteGl.COLOR_BUFFER_BIT | liteGl.DEPTH_BUFFER_BIT);
        //
        //     liteGl.viewport(0, 0, depthTexture.width, depthTexture.height);
        //
        //     camera.aspect = depthTexture.width / depthTexture.height;
        //     camera.setPosition(lightPos);
        //     camera.setUp(new Vec3(1, 0, 0));
        //     liteGl.useCamera(camera, 'camera');
        //
        //     liteGl.setAttribute(monkeyModel.vertexBuffer, 'coordinates');
        //     liteGl.setUniformMatrix(rotateMatrix, 'model');
        //     liteGl.render(monkeyModel, liteGl.TRIANGLES);

            // liteGl.setUniformMatrix(translateMatrix, 'model');
            // liteGl.setAttribute(plane.vertexBuffer, 'coordinates');
            // liteGl.render(plane, liteGl.TRIANGLES);
        // }

        // 正常渲染
        {
            liteGl.renderTo(liteGl.RenderMode.SCREEN);

            //liteGl.cullFace(liteGl.BACK);
            liteGl.useShader(vertShader, fragShader);
            liteGl.viewport(0, 0, liteGl.width, liteGl.height);
            liteGl.clearColor(new Color(0, 0, 0, 1));
            liteGl.clear(liteGl.COLOR_BUFFER_BIT | liteGl.DEPTH_BUFFER_BIT);
            // liteGl.setUniformf(depthTexture.width, 'depthTexSize');
            // liteGl.useCamera(camera, 'lightSpaceMatrix'); // 灯光视觉矩阵

            camera.aspect = liteGl.width / liteGl.height;
            // camera.setPosition(cameraPos);
            // camera.setUp(new Vec3(0, 1, 0));
            liteGl.useCamera(camera, 'camera');
            liteGl.useLight(ambientLight, 'ambient');
            liteGl.useLight(directionalLight, 'lightColor');
            // liteGl.useTexture(depthTexture, 'depthTex');
            liteGl.setUniformf([directionalLight.position.x, directionalLight.position.y, directionalLight.position.z], 'lightPos');

            liteGl.setUniformMatrix(rotateMatrix, 'model');
            liteGl.setAttribute(monkeyModel.vertexBuffer, 'coordinates');
            //liteGl.setAttribute(cube.colorBuffer, 'color');
            liteGl.setAttribute(monkeyModel.normalBuffer, 'normals');
            liteGl.setAttribute(monkeyModel.textureBuffer, 'textureCoord');
            liteGl.useTexture(texture1, 'uSampler');
            liteGl.render(monkeyModel, liteGl.TRIANGLES);

            // liteGl.setUniformMatrix(translateMatrix, 'model');
            // liteGl.setAttribute(plane.vertexBuffer, 'coordinates');
            // liteGl.setAttribute(plane.colorBuffer, 'color');
            // liteGl.setAttribute(plane.textureBuffer, 'textureCoord');
            // liteGl.setAttribute(plane.normalBuffer, 'normals');
            // liteGl.useTexture(texture1, 'uSampler');
            // liteGl.render(plane, liteGl.TRIANGLES);
        }

        liteGl.deleteTexture(depthTexture); // 记得删除纹理，不然内存会爆炸
    };

    OBJ.downloadMeshes({
        'monkey': './models/g.obj' // located in the models folder on the server
    }, function(meshes){
        monkeyModel = liteGl.createModel(new Model({
            vertexBuffer: new Buffer(new Float32Array(meshes.monkey.vertices), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 3),
            indexBuffer: new Buffer(new Uint16Array(meshes.monkey.indices), liteGl.ELEMENT_ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.UNSIGNED_SHORT, 1),
            normalBuffer: new Buffer(new Float32Array(meshes.monkey.vertexNormals), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 3),
            textureBuffer: new Buffer(new Float32Array(meshes.monkey.textures), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 2)
        }));
        liteGl.start();
    });
}());