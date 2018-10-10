import {Vec2, Vec3, Vec4} from './vector.js';

export class Mat4{
    constructor(data){
        this.data = data || new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
    }

    multiply(mat){
        if(mat instanceof Vec4 && mat.isTranspose){ // 向量的话需要转置才能相乘
            return new Vec4(
                // todo
            );
        }

        if(mat instanceof Mat4){ // OpenGL矩阵采用列优先存储
            let a = this.data, b = mat.data, out = (new Mat4()).data;

            let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
                a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
                a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
                a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

            // Cache only the current line of the second matrix
            let b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
            out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
            out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
            out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
            out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            return new Mat4(new Float32Array(out));
        }

        throw 'parameter 1 is not a valid value';
    }

    static lookAt(position, center, up){
        let x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
            eyex = position.x,
            eyey = position.y,
            eyez = position.z,
            upx = up.x,
            upy = up.y,
            upz = up.z,
            centerx = center.x,
            centery = center.y,
            centerz = center.z;

        if(Math.abs(eyex - centerx) < 10e-6 &&
            Math.abs(eyey - centery) < 10e-6 &&
            Math.abs(eyez - centerz) < 10e-6){
            return new Mat4();
        }

        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;

        len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;

        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if(!len){
            x0 = 0;
            x1 = 0;
            x2 = 0;
        }else{
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if(!len){
            y0 = 0;
            y1 = 0;
            y2 = 0;
        }else{
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        return new Mat4(new Float32Array([
            x0, y0, z0, 0,
            x1, y1, z1, 0,
            x2, y2, z2, 0,
            -(x0 * eyex + x1 * eyey + x2 * eyez), -(y0 * eyex + y1 * eyey + y2 * eyez), -(z0 * eyex + z1 * eyey + z2 * eyez), 1
        ]));
    }

    static translate(vec3){
        return new Mat4(new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            vec3.x, vec3.y, vec3.z, 1
        ]));
    }

    static rotate(angle, vec3){
        // 向量的单位化
        let x = vec3.x, y = vec3.y, z = vec3.z;

        let length = Math.sqrt(x * x + y * y + z * z);
        x /= length;
        y /= length;
        z /= length;

        let alpha = angle * 0.017453293;// 角度转换为弧度制
        let s = Math.sin(alpha);
        let c = Math.cos(alpha);
        let t = 1.0 - c;

        return new Mat4(new Float32Array([
            t * x * x + c,t * x * y - s * z,t * x * z + s * y,0,
            t * x * y + s * z,t * y * y + c,t * y * z - s * x,0,
            t * x * z - s * y,t * y * z + s * x,t * z * z + c,0,
            0,0,0,1
        ]));
    }

    static scale(vec3){
        return new Mat4(new Float32Array([
            vec3.x, 0, 0, 0,
            0, vec3.y, 0, 0,
            0, 0, vec3.z, 0,
            0, 0, 0, 1
        ]));
    }
}