import {LiteGL} from '../classes/lite_gl.js';
import {Model} from '../classes/model.js';
import {Shader} from '../classes/shader.js';
import {Color} from '../classes/color.js';
import {Buffer} from '../classes/buffer.js';
import Tools from '../classes/tools.js';
import CubeModel from '../models/cube.js';
import PlaneModel from '../models/plane.js';
import {PerspectiveCamera, OrthographicCamera} from '../classes/camera.js';
import {Vec2, Vec3, Vec4} from '../classes/vector.js';
import {Texture2D} from '../classes/texture.js';
import {AmbientLight, DirectionalLight} from '../classes/light.js';

export default (async function(){
    let canvas = document.querySelector('#canvas');
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
    let cameraPos = new Vec3(8, 8, 15);
    camera.setPosition(cameraPos);

    let img = await Tools.readImage('./textures/wood.jpg');
    let texture1 = liteGl.createTexture(new Texture2D(img, {
        format: liteGl.RGB,
        type: liteGl.UNSIGNED_BYTE
    }));

    let img2 = await Tools.readImage('./textures/container.png');
    let texture2 = liteGl.createTexture(new Texture2D(img2, {
        format: liteGl.RGBA,
        type: liteGl.UNSIGNED_BYTE
    }));

    let ambientLight = new AmbientLight(new Color(255, 255, 255), 0.5);
    let directionalLight = new DirectionalLight(new Color(255, 255, 255), 1.5);
    let lightPos = new Vec3(0, 10, -3);
    directionalLight.setPosition(lightPos);

    liteGl.onStart = function(){
        liteGl.enable(liteGl.DEPTH_TEST);
        //liteGl.enable(liteGl.CULL_FACE);
    };

    liteGl.onLoop = function(){
        let depthTexture = liteGl.createTexture(new Texture2D(null, {
            format: liteGl.DEPTH_COMPONENT,
            type: liteGl.UNSIGNED_SHORT,
            generateMipmaps: false,
            width: 1024,
            height: 1024
        }));

        // 在灯光视图渲染到深度纹理
        {
            liteGl.renderTo(liteGl.RenderMode.DEPTH, depthTexture);
            //liteGl.cullFace(liteGl.FRONT);
            liteGl.useShader(vertDepthShader, fragDepthShader);
            liteGl.clearColor(new Color(255, 255, 255, 1));
            liteGl.clear(liteGl.COLOR_BUFFER_BIT | liteGl.DEPTH_BUFFER_BIT);

            liteGl.viewport(0, 0, depthTexture.width, depthTexture.height);

            camera.aspect = depthTexture.width / depthTexture.height;
            camera.setPosition(lightPos);
            camera.setUp(new Vec3(1, 0, 0));
            liteGl.useCamera(camera, 'camera');

            liteGl.setAttribute(cube.vertexBuffer, 'coordinates');
            liteGl.render(cube, liteGl.TRIANGLES);

            liteGl.setAttribute(plane.vertexBuffer, 'coordinates');
            liteGl.render(plane, liteGl.TRIANGLES);
        }

        // 正常渲染
        {
            liteGl.renderTo(liteGl.RenderMode.SCREEN);

            //liteGl.cullFace(liteGl.BACK);
            liteGl.useShader(vertShader, fragShader);
            liteGl.viewport(0, 0, liteGl.width, liteGl.height);
            liteGl.clear(liteGl.COLOR_BUFFER_BIT | liteGl.DEPTH_BUFFER_BIT);
            liteGl.setUniformf(depthTexture.width, 'depthTexSize');
            liteGl.useCamera(camera, 'lightSpaceMatrix'); // 灯光视觉矩阵

            camera.aspect = liteGl.width / liteGl.height;
            camera.setPosition(cameraPos);
            camera.setUp(new Vec3(0, 1, 0));
            liteGl.useCamera(camera, 'camera');
            liteGl.useLight(ambientLight, 'ambient');
            liteGl.useLight(directionalLight, 'lightColor');
            liteGl.useTexture(depthTexture, 'depthTex');
            liteGl.setUniformf([directionalLight.position.x, directionalLight.position.y, directionalLight.position.z], 'lightPos');

            liteGl.setAttribute(cube.vertexBuffer, 'coordinates');
            liteGl.setAttribute(cube.colorBuffer, 'color');
            liteGl.setAttribute(cube.textureBuffer, 'textureCoord');
            liteGl.setAttribute(cube.normalBuffer, 'normals');
            liteGl.useTexture(texture2, 'uSampler');
            liteGl.render(cube, liteGl.TRIANGLES);

            liteGl.setAttribute(plane.vertexBuffer, 'coordinates');
            liteGl.setAttribute(plane.colorBuffer, 'color');
            liteGl.setAttribute(plane.textureBuffer, 'textureCoord');
            liteGl.setAttribute(plane.normalBuffer, 'normals');
            liteGl.useTexture(texture1, 'uSampler');
            liteGl.render(plane, liteGl.TRIANGLES);
        }

        liteGl.deleteTexture(depthTexture); // 记得删除纹理，不然内存会爆炸
    };

    liteGl.start();
}());