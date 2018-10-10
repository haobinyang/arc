import Tools from './tools.js';

export class ObjLoader{
    constructor(){
        this.vertices = [];
        this.normals = [];
        this.uvs = [];
        this.colors = [];

        this._vertices = [];
        this._normals = [];
        this._uvs = [];
        this._colors = [];
    }

    static async Load(path){
        let text = await Tools.readFile(path);

        let obj = new ObjLoader();

        if(text.indexOf('\r\n') !== - 1){
            // This is faster than String.split with regex that splits on both
            text = text.replace(/\r\n/g, '\n');
        }

        if(text.indexOf('\\\n') !== - 1) {
            // join lines separated by a line continuation character (\)
            text = text.replace(/\\\n/g, '');
        }

        let lines = text.split('\n');
        let line = '', lineFirstChar = '';
        let lineLength = 0;

        // Faster to just trim left side of the line. Use if available.
        let trimLeft = (typeof ''.trimLeft === 'function');

        for(let i = 0, l = lines.length; i < l; i++){
            line = lines[i];
            line = trimLeft ? line.trimLeft() : line.trim();
            lineLength = line.length;

            if(lineLength === 0){
                continue;
            }

            lineFirstChar = line.charAt(0);

            if(lineFirstChar === '#'){
                continue;
            }

            if(lineFirstChar === 'v'){
                let data = line.split(/\s+/);

                switch(data[0]){
                    case 'v': // 顶点
                        obj._vertices.push(
                            parseFloat(data[1]),
                            parseFloat(data[2]),
                            parseFloat(data[3])
                       );
                        if(data.length === 8){
                            obj._colors.push(
                                parseFloat(data[4]),
                                parseFloat(data[5]),
                                parseFloat(data[6])
                           );
                        }
                        break;
                    case 'vn': // 法线
                        obj._normals.push(
                            parseFloat(data[1]),
                            parseFloat(data[2]),
                            parseFloat(data[3])
                       );
                        break;
                    case 'vt': // 纹理坐标
                        obj._uvs.push(
                            parseFloat(data[1]),
                            parseFloat(data[2])
                       );
                        break;
                }
            }else if(lineFirstChar === 'f'){ // face
                let lineData = line.substr(1).trim();
                let vertexData = lineData.split(/\s+/);
                let faceVertices = [];

                for(let j = 0, jl = vertexData.length; j < jl; j++) {
                    let vertex = vertexData[j];

                    if(vertex.length > 0){
                        let vertexParts = vertex.split('/');
                        faceVertices.push(vertexParts);
                    }
                }

                let v1 = faceVertices[0];
                for(let j = 1, jl = faceVertices.length - 1; j < jl; j++){
                    let v2 = faceVertices[j];
                    let v3 = faceVertices[j + 1];

                    obj.addFace(
                        v1[0], v2[0], v3[0],
                        v1[1], v2[1], v3[1],
                        v1[2], v2[2], v3[2]
                    );
                }
            }
        }

        return obj;
    }

    addFace(a, b, c, ua, ub, uc, na, nb, nc){
        let vLen = this._vertices.length;

        let ia = this.parseVertexIndex(a, vLen);
        let ib = this.parseVertexIndex(b, vLen);
        let ic = this.parseVertexIndex(c, vLen);

        this.addVertex(ia, ib, ic);

        if(ua !== undefined && ua !== ''){
            let uvLen = this._uvs.length;
            ia = this.parseUVIndex(ua, uvLen);
            ib = this.parseUVIndex(ub, uvLen);
            ic = this.parseUVIndex(uc, uvLen);
            this.addUV(ia, ib, ic);
        }

        if(na !== undefined && na !== ''){
            // Normals are many times the same. If so, skip function call and parseInt.
            let nLen = this._normals.length;
            ia = this.parseNormalIndex(na, nLen);

            ib = na === nb ? ia : this.parseNormalIndex(nb, nLen);
            ic = na === nc ? ia : this.parseNormalIndex(nc, nLen);

            this.addNormal(ia, ib, ic);
        }

        if(this._colors.length > 0){
            this.addColor(ia, ib, ic);
        }
    }

    parseVertexIndex(value, len){
        let index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;
    }

    parseNormalIndex(value, len){
        let index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 3) * 3;
    }

    parseUVIndex(value, len){
        let index = parseInt(value, 10);
        return (index >= 0 ? index - 1 : index + len / 2) * 2;
    }

    addVertex(a, b, c){
        let src = this._vertices;
        let dst = this.vertices;

        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        dst.push(src[b + 0], src[b + 1], src[b + 2]);
        dst.push(src[c + 0], src[c + 1], src[c + 2]);
    }

    addNormal(a, b, c){
        let src = this._normals;
        let dst = this.normals;

        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        dst.push(src[b + 0], src[b + 1], src[b + 2]);
        dst.push(src[c + 0], src[c + 1], src[c + 2]);
    }

    addColor(a, b, c){
        let src = this._colors;
        let dst = this.colors;

        dst.push(src[a + 0], src[a + 1], src[a + 2]);
        dst.push(src[b + 0], src[b + 1], src[b + 2]);
        dst.push(src[c + 0], src[c + 1], src[c + 2]);
    }

    addUV(a, b, c){
        let src = this._uvs;
        let dst = this.uvs;

        dst.push(src[a + 0], src[a + 1]);
        dst.push(src[b + 0], src[b + 1]);
        dst.push(src[c + 0], src[c + 1]);
    }
}