import {Model} from '../classes/model.js';
import {Buffer} from '../classes/buffer.js';

export default function(gl){
    return gl.createModel(new Model({
        vertexBuffer: new Buffer(new Float32Array([
            -6,-4,-6, 6,-4,-6, 6,-4,6, -6,-4,6
        ]), gl.ARRAY_BUFFER, gl.STATIC_DRAW, gl.FLOAT, 3),
        indexBuffer: new Buffer(new Uint16Array([
            0,1,2, 0,2,3
        ]), gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW, gl.UNSIGNED_SHORT, 1),
        normalBuffer: new Buffer(new Float32Array([
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0,
             0.0,  1.0,  0.0
        ]), gl.ARRAY_BUFFER, gl.STATIC_DRAW, gl.FLOAT, 3),
        colorBuffer: new Buffer(new Float32Array([
            5,3,7, 5,3,7, 5,3,7, 5,3,7
        ]), gl.ARRAY_BUFFER, gl.STATIC_DRAW, gl.FLOAT, 3),
        textureBuffer: new Buffer(new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]), gl.ARRAY_BUFFER, gl.STATIC_DRAW, gl.FLOAT, 2)
    }));
};