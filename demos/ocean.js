import {LiteGL} from '../classes/lite_gl.js';
import {Model} from '../classes/model.js';
import {Color} from '../classes/color.js';
import {Mat4} from '../classes/matrix.js';
import Tools from '../classes/tools.js';
import CubeModel from '../models/cube.js';
import PlaneModel from '../models/plane.js';
import {PerspectiveCamera, OrthographicCamera} from '../classes/camera.js';
import {Vec2, Vec3, Vec4} from '../classes/vector.js';
import {AmbientLight, DirectionalLight} from '../classes/light.js';
import {ObjLoader} from '../classes/obj_loader.js';
import {CanvasFont} from '../classes/font.js';

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

    let img = await Tools.readImage('./textures/water-texture.jpg');
    let dl = await Tools.readImage('./textures/dl.png');
    let texture = liteGl.createTexture(img, {
        format: liteGl.RGB,
        type: liteGl.UNSIGNED_BYTE,
        generateMipmaps: false
    });

    let video = await Tools.getVideo('./textures/Firefox.mp4', {loop: true});
    let videoTexture = liteGl.createTexture(video, {
        format: liteGl.RGB,
        type: liteGl.UNSIGNED_BYTE,
        generateMipmaps: false
    });

    let vertexShaderCode = await Tools.readFile('./shaders/ocean.vs');
    let fragmentShaderCode = await Tools.readFile('./shaders/ocean.fs');
    let vertShader = liteGl.createShader(vertexShaderCode, liteGl.VERTEX_SHADER);
    let fragShader = liteGl.createShader(fragmentShaderCode, liteGl.FRAGMENT_SHADER);

    let camera = new PerspectiveCamera(40, liteGl.width / liteGl.height, 1, 100);
    camera.setPosition(new Vec3(4, 3, 4));
    // camera.setUp(new Vec3(0, 0, 1));

    let ambientLight = new AmbientLight(new Color(255, 255, 255), 1.0);
    let directionalLight = new DirectionalLight(new Color(255, 255, 255), 1.0);
    let lightPos = new Vec3(0, 2, 2);
    directionalLight.setPosition(lightPos);

    let mesh = Tools.mesh(4, 4, [-2, 2], [-2, 2]);

    let vertices = mesh.vertices;
    let waveSurface = new Model({
        vertexBuffer: liteGl.createBuffer(new Float32Array(mesh.vertices), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 3),
        indexBuffer: liteGl.createBuffer(new Uint16Array(mesh.indices), liteGl.ELEMENT_ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.UNSIGNED_SHORT, 1),
        normalBuffer: liteGl.createBuffer(new Float32Array(mesh.normals), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 3),
        textureBuffer: liteGl.createBuffer(new Float32Array(mesh.textures), liteGl.ARRAY_BUFFER, liteGl.STATIC_DRAW, liteGl.FLOAT, 2)
    });

    function singleSine(x, z, A, L, S, D, t){
        let w = 2 / L; // frequency
        let phase = S * w;
        return A * Math.sin((D[0] * x + D[1] * z) * w + t * phase);
    }

    function SumSines(data, time){
        let A = [0.06, 0.1, 0.06, 0.08]; // amplitude
        let L = [0.3, 0.3, 0.2, 0.16]; // wavelength
        let S = [0.1, 0.2, 0.15, 0.2]; // speed
        let D = [[0, 1], [1, 1], [0, 1], [0.3, 0.8]]; // direction

        for(let i = 0; i < data.length; i += 3){
            let x = data[i], z = data[i + 2];

            data[i + 1] = 0;

            for(let j = 0; j < A.length; j++){
                data[i + 1] += singleSine(x, z, A[j], L[j], S[j], D[j], time / 1000);
            }
        }

        return data;
    }
    
    function singleGerstnerWave(x, y, A, L, S, D, t, waveNum){
        let w = 2 / L; // frequency
        let phi = S * w;
        let Q = Math.min(1, Math.max(0, 1 / (w * A * waveNum)));

        let theta = (D[0] * x + D[1] * y) * w + t * phi;

        return {
            x: Q * A * D[0] * Math.cos(theta),
            y: Q * A * D[1] * Math.cos(theta),
            z: A * Math.sin(theta)
        };
    }
    
    function GerstnerNormal(x, y, A, L, S, D, t, waveNum) {
        let w = 2 / L; // frequency
        let phi = S * w;
        let Q = Math.min(1, Math.max(0, 1 / (w * A * waveNum)));

        let DP = D[0] * x + D[1] * y; // ??????
        let psi = w * DP + phi * t;
        let C = Math.cos(psi);

        return {
            x: D[0] * w * A * C,
            y: D[1] * w * A * C,
            z: Q * w * A * Math.sin(psi)
        };
    }
    
    function GerstnerWaves(data, time){
        let A = [0.015, 0.02, 0.02, 0.015]; // amplitude
        let L = [0.1, 0.3, 0.2, 0.16]; // wavelength
        let S = [0.1, 0.2, 0.15, 0.1]; // speed
        let D = [[0, 1], [0.5, 1], [1, 0], [0.3, 0.8]]; // direction

        let vertices = [], normals = [];

        for(let i = 0; i < data.length; i += 3){
            // 顶点计算
            let x = data[i], z = data[i + 2], y = data[i + 1];
            {
                for(let j = 0; j < A.length; j++){
                    let newPosition = singleGerstnerWave(x, z, A[j], L[j], S[j], D[j], time / 1000, A.length);

                    x += newPosition.x;
                    z += newPosition.y;
                    y += newPosition.z;
                }
                vertices.push(x, y, z);
            }

            // 法向量计算
            {
                let nX = 0, nY = 0, nZ = 0;
                for(let j = 0; j < A.length; j++){
                    let newNormal = GerstnerNormal(x, z, A[j], L[j], S[j], D[j], time / 1000, A.length);

                    nX += newNormal.x;
                    nY += newNormal.y;
                    nZ += newNormal.z;
                }
                normals.push(-nX, 1 - nZ, -nY);
            }
        }

        return {vertexBuffer: vertices, normalBuffer: normals};
    }

    liteGl.onStart = function(timestamp){
        liteGl.enable(liteGl.DEPTH_TEST);
        // liteGl.useShader(vertShader, fragShader);

        liteGl.viewport(0, 0, liteGl.width, liteGl.height);
        liteGl.clearColor(new Color(0, 0, 0, 1));
        liteGl.clear(liteGl.COLOR_BUFFER_BIT | liteGl.DEPTH_BUFFER_BIT);

        let font = liteGl.createFont(new CanvasFont('hello, 世界'));
        font.renderToScreen();
    };

    // liteGl.onLoop = function(timestamp){
        // liteGl.viewport(0, 0, liteGl.width, liteGl.height);
        // liteGl.clearColor(new Color(0, 0, 0, 1));
        // liteGl.clear(liteGl.COLOR_BUFFER_BIT | liteGl.DEPTH_BUFFER_BIT);

        // liteGl.useCamera(camera, 'camera');
        // liteGl.setUniformf([camera.position.x, camera.position.y, camera.position.z], 'viewPos');
        //
        // liteGl.useLight(ambientLight, 'ambient');
        // liteGl.useLight(directionalLight, 'lightColor');
        // liteGl.setUniformf([directionalLight.position.x, directionalLight.position.y, directionalLight.position.z], 'lightPos');

        // cpu计算
        // let {vertexBuffer, normalBuffer} = GerstnerWaves(vertices, timestamp);
        // waveSurface.normalBuffer.update(new Float32Array(normalBuffer), 0);
        // waveSurface.vertexBuffer.update(new Float32Array(vertexBuffer), 0);

        // liteGl.setAttribute(waveSurface.vertexBuffer, 'coordinates');
        // liteGl.setAttribute(waveSurface.normalBuffer, 'normals');
        // liteGl.setAttribute(waveSurface.textureBuffer, 'textureCoord');
        //
        // liteGl.useTexture(videoTexture, 'uSampler');
        // liteGl.render(waveSurface, liteGl.TRIANGLES);

        // liteGl.render(waveSurface, liteGl.LINES);
    // };

    liteGl.start();
}());